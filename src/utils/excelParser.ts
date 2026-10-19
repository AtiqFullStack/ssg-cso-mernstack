import * as XLSX from 'xlsx';
import { CSOProfile, ManpowerEntry } from '../types/survey';

export interface ExcelImportResult {
  success: boolean;
  importedCount: number;
  updatedCount: number;
  profiles: CSOProfile[];
  errors: string[];
}

/**
 * Normalizes string keys for flexible header matching
 */
function normalizeHeader(key: string): string {
  if (!key) return '';
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Robustly parses phone numbers from various Excel formats:
 * numbers, strings, scientific notation, +91 prefixes, spaces, etc.
 */
function extractTenDigitMobile(raw: any): string {
  if (raw === null || raw === undefined) return '';

  let str = '';
  if (typeof raw === 'number') {
    str = Math.floor(raw).toString();
  } else {
    str = String(raw).trim();
  }

  // Remove scientific notation if present (e.g., 9.83901E+09)
  if (str.toLowerCase().includes('e+')) {
    const num = Number(str);
    if (!isNaN(num)) {
      str = Math.floor(num).toString();
    }
  }

  // Extract digits
  const digits = str.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

interface ColumnMap {
  district?: number;
  centreCode?: number;
  centreName?: number;
  csoName?: number;
  mobile?: number;
  capacity?: number;
  address?: number;
  tehsil?: number;
  totalRooms?: number;
}

/**
 * Parses uploaded Excel (.xlsx, .xls, .csv) file
 * Supports flexible column headers and handles multi-column ambiguity
 */
export async function parseCSOExcelFile(
  file: File,
  existingRoster: CSOProfile[] = [],
  replaceExisting: boolean = true
): Promise<ExcelImportResult> {
  const errors: string[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Read first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return {
        success: false,
        importedCount: 0,
        updatedCount: 0,
        profiles: existingRoster,
        errors: ['Excel file has no sheets.']
      };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    // Convert to array of arrays to find header row flexibly
    const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });

    if (!rows || rows.length === 0) {
      return {
        success: false,
        importedCount: 0,
        updatedCount: 0,
        profiles: existingRoster,
        errors: ['The uploaded sheet contains no data.']
      };
    }

    // Find the header row (search first 10 rows)
    let headerRowIdx = -1;
    let colIndices: ColumnMap = {};

    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;

      const tempMap: ColumnMap = {};

      row.forEach((cell, idx) => {
        const norm = normalizeHeader(String(cell || ''));
        if (!norm) return;

        // 1. Mobile Number (strictly prioritized)
        if (
          norm.includes('mobile') ||
          norm.includes('phone') ||
          norm.includes('contact') ||
          norm.includes('cell') ||
          norm.includes('मोबाइल') ||
          norm.includes('दूरभाष') ||
          norm.includes('संपर्क')
        ) {
          tempMap.mobile = idx;
        }
        // 2. Seating Capacity (prioritized BEFORE generic 'centre' so 'Centre Capacity' doesn't become Centre Name!)
        else if (
          norm.includes('capacity') ||
          norm.includes('seating') ||
          norm.includes('candidate') ||
          norm.includes('intake') ||
          norm.includes('allot') ||
          norm.includes('seat') ||
          norm.includes('क्षमता')
        ) {
          tempMap.capacity = idx;
        }
        // 3. Centre Code
        else if (
          norm.includes('centrecode') ||
          norm.includes('centercode') ||
          norm.includes('centrecodeno') ||
          norm === 'code' ||
          norm === 'centre_code' ||
          norm.includes('केंद्रकोड') ||
          norm.includes('केन्द्रकोड')
        ) {
          tempMap.centreCode = idx;
        }
        // 4. District
        else if (
          norm.includes('district') ||
          norm === 'dist' ||
          norm.includes('distname') ||
          norm.includes('जिला') ||
          norm.includes('जनपद') ||
          norm.includes('मण्डल')
        ) {
          tempMap.district = idx;
        }
        // 5. CSO Name / Officer Name
        else if (
          norm.includes('csoname') ||
          (norm.includes('cso') && !norm.includes('mobile')) ||
          norm.includes('officer') ||
          norm === 'cso' ||
          norm === 'name' ||
          norm.includes('अधिकारी') ||
          norm.includes('पर्यवेक्षक')
        ) {
          tempMap.csoName = idx;
        }
        // 6. Duty Centre Name (ensure capacity, code, mobile, officer are not in header)
        else if (
          !norm.includes('capacity') &&
          !norm.includes('code') &&
          (norm.includes('dutycentre') ||
            norm.includes('dutycenter') ||
            norm.includes('centrename') ||
            norm.includes('centername') ||
            norm.includes('examinationcentre') ||
            norm.includes('examcentre') ||
            norm.includes('centre') ||
            norm.includes('center') ||
            norm.includes('college') ||
            norm.includes('school') ||
            norm.includes('venue') ||
            norm.includes('institution') ||
            norm.includes('परीक्षाकेन्द्र') ||
            norm.includes('केन्द्रकानाम') ||
            norm.includes('केंद्र') ||
            norm.includes('केन्द्र'))
        ) {
          tempMap.centreName = idx;
        }
        // 7. Address
        else if (norm.includes('address') || norm.includes('location') || norm.includes('पता') || norm.includes('स्थान')) {
          tempMap.address = idx;
        }
        // 8. Tehsil
        else if (norm.includes('tehsil') || norm.includes('tahsil') || norm.includes('तहसील')) {
          tempMap.tehsil = idx;
        }
        // 9. Total Rooms
        else if (norm.includes('room') || norm.includes('कमरे')) {
          tempMap.totalRooms = idx;
        }
      });

      // If at least 2 key columns match (e.g. mobile + name or district), consider it the header row!
      const matches = Object.keys(tempMap).length;
      if (matches >= 2 && (tempMap.mobile !== undefined || tempMap.centreName !== undefined || tempMap.csoName !== undefined)) {
        headerRowIdx = r;
        colIndices = tempMap;
        break;
      }
    }

    // Fallback: If no header found, assume standard 5-column layout:
    // [0: District, 1: CSO Name, 2: Mobile, 3: Centre Name, 4: Capacity]
    if (headerRowIdx === -1) {
      // Check first data row to see if column 2 looks like a 10-digit phone
      const sampleRow = rows[0] || [];
      const mobCol = sampleRow.findIndex((cell: any) => extractTenDigitMobile(cell).length === 10);
      if (mobCol >= 0) {
        headerRowIdx = -1; // start from 0
        colIndices = {
          district: 0,
          csoName: mobCol === 2 ? 1 : 0,
          mobile: mobCol,
          centreName: mobCol + 1 < sampleRow.length ? mobCol + 1 : undefined,
          capacity: mobCol + 2 < sampleRow.length ? mobCol + 2 : undefined
        };
      } else {
        return {
          success: false,
          importedCount: 0,
          updatedCount: 0,
          profiles: existingRoster,
          errors: [
            'Could not find required column headers in the file. Please ensure columns include: District Name, CSO Name, Registered Mobile Number, Duty Centre Name, Centre Seating Capacity.'
          ]
        };
      }
    }

    // Build roster map
    const rosterMap = new Map<string, CSOProfile>();

    if (!replaceExisting) {
      existingRoster.forEach((p) => {
        const cleanMob = (p.registeredMobile || p.mobile).replace(/\D/g, '').slice(-10);
        if (cleanMob) rosterMap.set(cleanMob, p);
      });
    }

    let importedCount = 0;
    let updatedCount = 0;

    const startRow = headerRowIdx === -1 ? 0 : headerRowIdx + 1;

    // Iterate through data rows
    for (let r = startRow; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.every((c) => c === '' || c === null || c === undefined)) {
        continue;
      }

      // Extract mobile
      let cleanMobile = '';
      if (colIndices.mobile !== undefined) {
        cleanMobile = extractTenDigitMobile(row[colIndices.mobile]);
      }

      // If mobile wasn't in that exact index, scan the row for any 10-digit number
      if (cleanMobile.length !== 10) {
        for (let c = 0; c < row.length; c++) {
          const testMob = extractTenDigitMobile(row[c]);
          if (testMob.length === 10) {
            cleanMobile = testMob;
            break;
          }
        }
      }

      if (cleanMobile.length !== 10) {
        // Skip rows without valid mobile (might be footer/note rows)
        continue;
      }

      // Extract District
      const rawDistrict = colIndices.district !== undefined ? String(row[colIndices.district] || '').trim() : '';

      // Extract CSO Name
      const rawCsoName = colIndices.csoName !== undefined ? String(row[colIndices.csoName] || '').trim() : '';

      // Extract Centre Code
      let rawCentreCode = colIndices.centreCode !== undefined ? String(row[colIndices.centreCode] || '').trim() : '';

      // Extract Centre Name
      let rawCentreName = colIndices.centreName !== undefined ? String(row[colIndices.centreName] || '').trim() : '';

      // Extract Capacity
      const rawCap = colIndices.capacity !== undefined ? row[colIndices.capacity] : '';

      // Extract Address & Tehsil
      const rawAddress = colIndices.address !== undefined ? String(row[colIndices.address] || '').trim() : '';
      const rawTehsil = colIndices.tehsil !== undefined ? String(row[colIndices.tehsil] || '').trim() : 'Sadar';
      const rawRooms = colIndices.totalRooms !== undefined ? parseInt(String(row[colIndices.totalRooms]).replace(/\D/g, ''), 10) : 0;

      // Smart correction: If rawCentreName is purely numeric (like "480", "600"), it was mistakenly matched as capacity!
      let seatingCapacity = 480;
      if (typeof rawCap === 'number' && rawCap > 0) {
        seatingCapacity = Math.floor(rawCap);
      } else if (typeof rawCap === 'string' && rawCap.trim()) {
        const parsedCap = parseInt(rawCap.replace(/\D/g, ''), 10);
        if (!isNaN(parsedCap) && parsedCap > 0) seatingCapacity = parsedCap;
      }

      // If rawCentreName looks like a number (e.g. "480"), use that for capacity if capacity was default, and find a real string in the row
      if (/^\d{2,4}$/.test(rawCentreName)) {
        const numCap = parseInt(rawCentreName, 10);
        if (numCap >= 50 && numCap <= 5000) {
          seatingCapacity = numCap;
        }
        // Search other cells in this row for a proper centre name (text string > 3 chars that isn't district, csoName, or mobile)
        let foundCentre = '';
        row.forEach((cell, idx) => {
          if (idx !== colIndices.mobile && idx !== colIndices.district && idx !== colIndices.csoName) {
            const str = String(cell || '').trim();
            if (str && !/^\d+$/.test(str) && str.length > 3 && str !== rawDistrict && str !== rawCsoName) {
              foundCentre = str;
            }
          }
        });
        rawCentreName = foundCentre;
      }

      const districtName = rawDistrict || 'UTTAR PRADESH';
      const csoName = rawCsoName || `CSO (${cleanMobile.slice(-4)})`;
      const dutyCentreName = rawCentreName || `Examination Centre ${districtName} (${cleanMobile.slice(-4)})`;

      if (!rawCentreCode) {
        rawCentreCode = `0${(2000 + (parseInt(cleanMobile.slice(-3)) || 101)) % 9000 + 1000}`;
      }

      const isExisting = rosterMap.has(cleanMobile);
      const totalRooms = rawRooms > 0 ? rawRooms : Math.ceil(seatingCapacity / 24);

      const profile: CSOProfile = {
        id: `CSO-UP-${rawCentreCode}`,
        districtName,
        csoName,
        registeredMobile: cleanMobile,
        dutyCentreName,
        centreSeatingCapacity: seatingCapacity,

        // Backwards compatibility & complete official fields
        name: csoName,
        designation: 'Centre Special Officer (CSO)',
        department: 'Government of Uttar Pradesh',
        mobile: cleanMobile,
        centreCode: rawCentreCode,
        centreName: dutyCentreName,
        district: districtName,
        tehsil: rawTehsil || 'Sadar',
        address: rawAddress || `${dutyCentreName}, District ${districtName}, Uttar Pradesh`,
        candidateCapacity: seatingCapacity,
        totalRooms,
        centreSuperintendent: {
          name: `Centre Superintendent, ${dutyCentreName}`,
          mobile: `94150${cleanMobile.slice(-5)}`,
          institution: dutyCentreName
        },
        staticMagistrate: {
          name: `Static Magistrate, Sector-${cleanMobile.slice(-2)}`,
          mobile: `94544${cleanMobile.slice(-5)}`,
          designation: `Executive Magistrate, ${districtName}`
        },
        nodalOfficer: {
          name: `ADM (Executive) / District Nodal Officer`,
          mobile: `9454410000`,
          office: `Collectorate, ${districtName}`
        }
      };

      if (isExisting) {
        updatedCount++;
      } else {
        importedCount++;
      }

      rosterMap.set(cleanMobile, profile);
    }

    const finalProfiles = Array.from(rosterMap.values());

    return {
      success: finalProfiles.length > 0,
      importedCount,
      updatedCount,
      profiles: finalProfiles,
      errors: finalProfiles.length === 0 ? ['No valid CSO rows found in the uploaded file.', ...errors] : errors
    };
  } catch (err: any) {
    console.error('Error parsing Excel file', err);
    return {
      success: false,
      importedCount: 0,
      updatedCount: 0,
      profiles: existingRoster,
      errors: [`Failed to parse Excel file: ${err.message || 'Unknown format'}`]
    };
  }
}

/**
 * Downloads a clean sample Excel template formatted for SSSG SOLUTIONS
 */
export function downloadSampleExcelRoster(): void {
  const sampleData = [
    {
      'District Name': 'Bareilly',
      'Centre Code': '03953',
      'Duty Centre Name': 'Bareilly Inter College, Civil Lines',
      'CSO Name': 'Ashish Kumar (PCS)',
      'Registered Mobile Number': '9530000953',
      'Centre Seating Capacity': 480,
      'Centre Address': 'Station Road, Civil Lines, Bareilly, UP'
    },
    {
      'District Name': 'Bareilly',
      'Centre Code': '03352',
      'Duty Centre Name': 'Government Polytechnic Institute, Bareilly',
      'CSO Name': 'Nitin Rai',
      'Registered Mobile Number': '9854126352',
      'Centre Seating Capacity': 600,
      'Centre Address': 'C.B. Ganj, Rampur Road, Bareilly, UP'
    },
    {
      'District Name': 'Aligarh',
      'Centre Code': '03510',
      'Duty Centre Name': 'Dharam Samaj PG College, Aligarh',
      'CSO Name': 'Abhishek Sharma',
      'Registered Mobile Number': '8754632510',
      'Centre Seating Capacity': 520,
      'Centre Address': 'GT Road, Near Company Bagh, Aligarh, UP'
    },
    {
      'District Name': 'Aligarh',
      'Centre Code': '03659',
      'Duty Centre Name': 'Government Girls Inter College (GGIC), Aligarh',
      'CSO Name': 'Pankaj Verma',
      'Registered Mobile Number': '8651248659',
      'Centre Seating Capacity': 560,
      'Centre Address': 'Marris Road, Aligarh, UP'
    },
    {
      'District Name': 'Amroha',
      'Centre Code': '03147',
      'Duty Centre Name': 'JS Hindu PG College, Amroha',
      'CSO Name': 'Puneet Saxena',
      'Registered Mobile Number': '8452365147',
      'Centre Seating Capacity': 480,
      'Centre Address': 'Station Road, Amroha, UP'
    },
    {
      'District Name': 'Budaun',
      'Centre Code': '03875',
      'Duty Centre Name': 'Government Degree College, Budaun',
      'CSO Name': 'Prince Rana',
      'Registered Mobile Number': '8562145875',
      'Centre Seating Capacity': 384,
      'Centre Address': 'Civil Lines, Near Collectorate, Budaun, UP'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  worksheet['!cols'] = [
    { wch: 18 }, // District Name
    { wch: 14 }, // Centre Code
    { wch: 45 }, // Duty Centre Name
    { wch: 28 }, // CSO Name
    { wch: 26 }, // Registered Mobile Number
    { wch: 24 }, // Centre Seating Capacity
    { wch: 40 }  // Centre Address
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SSSG_CSO_Roster');

  XLSX.writeFile(workbook, 'UPSSSC_CSO_Deputation_Roster_Template.xlsx');
}

// ==================== MANPOWER EXCEL FUNCTIONS ====================

export interface ManpowerImportResult {
  success: boolean;
  entries: ManpowerEntry[];
  count: number;
  errors: string[];
}

/**
 * Parses an uploaded Excel/CSV file for manpower roster data.
 * Flexible header matching – same normalizeHeader logic as parseCSOExcelFile.
 */
export async function parseManpowerExcelFile(file: File): Promise<ManpowerImportResult> {
  const errors: string[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { success: false, entries: [], count: 0, errors: ['Excel file has no sheets.'] };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });

    if (!rows || rows.length === 0) {
      return { success: false, entries: [], count: 0, errors: ['The uploaded sheet contains no data.'] };
    }

    // Column index map
    interface ManpowerColMap {
      centreCode?: number;
      district?: number;
      serviceName?: number;
      designation?: number;
      staffCount?: number;
      contactName?: number;
      contactPhone?: number;
      status?: number;
      confirmationStatus?: number;
      notes?: number;
    }

    let headerRowIdx = -1;
    let colMap: ManpowerColMap = {};

    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;

      const tempMap: ManpowerColMap = {};

      row.forEach((cell, idx) => {
        const norm = normalizeHeader(String(cell || ''));
        if (!norm) return;

        if (norm === 'centrecode' || norm === 'code' || norm === 'centrecodeno' || norm.includes('centrecode')) {
          tempMap.centreCode = idx;
        } else if (norm === 'district' || norm === 'dist') {
          tempMap.district = idx;
        } else if (norm === 'servicename' || norm === 'service' || norm.includes('servicename')) {
          tempMap.serviceName = idx;
        } else if (norm === 'designation' || norm === 'post' || norm === 'role') {
          tempMap.designation = idx;
        } else if (norm === 'staffcount' || norm === 'count' || norm === 'strength') {
          tempMap.staffCount = idx;
        } else if (norm === 'confirmationstatus' || norm === 'confirmationstatus' || norm === 'confirmed') {
          tempMap.confirmationStatus = idx;
        } else if (norm.includes('contactname') || norm === 'name') {
          tempMap.contactName = idx;
        } else if (
          norm.includes('contactphone') ||
          norm === 'phone' ||
          norm === 'mobile' ||
          norm === 'contact'
        ) {
          tempMap.contactPhone = idx;
        } else if (norm === 'status' || norm === 'deploymentstatus') {
          tempMap.status = idx;
        } else if (norm === 'notes' || norm === 'remarks' || norm === 'comment') {
          tempMap.notes = idx;
        }
      });

      const matches = Object.keys(tempMap).length;
      if (matches >= 2) {
        headerRowIdx = r;
        colMap = tempMap;
        break;
      }
    }

    if (headerRowIdx === -1) {
      return {
        success: false,
        entries: [],
        count: 0,
        errors: [
          'Could not detect column headers. Ensure the sheet has headers like: Centre Code, District, Service Name, Designation, Staff Count, Contact Name, Contact Phone, Status, Confirmation Status.'
        ]
      };
    }

    const entries: ManpowerEntry[] = [];

    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.every((c) => c === '' || c === null || c === undefined)) {
        continue;
      }

      const centreCode = colMap.centreCode !== undefined ? String(row[colMap.centreCode] || '').trim() : '';
      if (!centreCode) continue; // skip rows without centre code

      const entry: ManpowerEntry = {
        centreCode,
        district: colMap.district !== undefined ? String(row[colMap.district] || '').trim() : '',
        serviceName: colMap.serviceName !== undefined ? String(row[colMap.serviceName] || '').trim() : '',
        designation: colMap.designation !== undefined ? String(row[colMap.designation] || '').trim() : '',
        staffCount: colMap.staffCount !== undefined ? (parseInt(String(row[colMap.staffCount]).replace(/\D/g, ''), 10) || 0) : 0,
        contactName: colMap.contactName !== undefined ? String(row[colMap.contactName] || '').trim() : '',
        contactPhone: colMap.contactPhone !== undefined ? extractTenDigitMobile(row[colMap.contactPhone]) : '',
        status: colMap.status !== undefined ? String(row[colMap.status] || '').trim() : '',
        confirmationStatus: colMap.confirmationStatus !== undefined ? String(row[colMap.confirmationStatus] || '').trim() : '',
        notes: colMap.notes !== undefined ? String(row[colMap.notes] || '').trim() : ''
      };

      entries.push(entry);
    }

    return {
      success: entries.length > 0,
      entries,
      count: entries.length,
      errors: entries.length === 0 ? ['No valid manpower rows found in the uploaded file.', ...errors] : errors
    };
  } catch (err: any) {
    console.error('Error parsing manpower Excel file', err);
    return {
      success: false,
      entries: [],
      count: 0,
      errors: [`Failed to parse file: ${err.message || 'Unknown format'}`]
    };
  }
}

/**
 * Downloads a sample Manpower Roster Template Excel file
 */
export function downloadManpowerTemplate(): void {
  const sampleData = [
    {
      'Centre Code': 'LKO-101',
      'District': 'Lucknow',
      'Service Name': 'Biometric & Attendance',
      'Designation': 'Biometric Operator',
      'Staff Count': 3,
      'Contact Name': 'Ramesh Kumar',
      'Contact Phone': '9876543210',
      'Status': 'Assigned',
      'Confirmation Status': 'Confirmed',
      'Notes': ''
    },
    {
      'Centre Code': 'LKO-101',
      'District': 'Lucknow',
      'Service Name': 'Frisking & Metal Detection',
      'Designation': 'Frisking Officer',
      'Staff Count': 4,
      'Contact Name': 'Suresh Singh',
      'Contact Phone': '9876543211',
      'Status': 'Assigned',
      'Confirmation Status': 'Pending',
      'Notes': 'Female staff required'
    },
    {
      'Centre Code': 'AGR-205',
      'District': 'Agra',
      'Service Name': 'CCTV Surveillance',
      'Designation': 'CCTV Operator',
      'Staff Count': 2,
      'Contact Name': 'Priya Sharma',
      'Contact Phone': '9876543212',
      'Status': 'Assigned',
      'Confirmation Status': 'Confirmed',
      'Notes': ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Manpower_Template');
  XLSX.writeFile(workbook, 'Manpower_Roster_Template.xlsx');
}
