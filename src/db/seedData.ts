/**
 * Initial Seed Data for MongoDB
 * Run this to populate default questions and assessments
 */

import { SurveyQuestionDoc, AssessmentDoc, CSOProfileDoc } from './schemas';

// ==================== DEFAULT QUESTIONS ====================
export const SEED_QUESTIONS: SurveyQuestionDoc[] = [
  {
    id: 'q_infra_01',
    sequence: 1,
    textEn: 'Is the seating arrangement sanitized with minimum 3-foot distance between candidates?',
    textHi: 'क्या बैठक व्यवस्था में अभ्यर्थियों के मध्य न्यूनतम 3-फीट की दूरी व स्वच्छता सुनिश्चित है?',
    categoryEn: 'Infrastructure & Seating',
    categoryHi: 'कक्ष एवं बैठक व्यवस्था',
    helperEn: 'Single bench per candidate or 2 candidates on a 6-foot dual desk.',
    helperHi: 'प्रत्येक अभ्यर्थी हेतु एकल डेस्क अथवा 6 फीट डेस्क पर दो अभ्यर्थी।',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q_infra_02',
    sequence: 2,
    textEn: 'Are wall clocks in all examination halls functional and synchronized with Indian Standard Time (IST)?',
    textHi: 'क्या सभी परीक्षा कक्षों की दीवार घड़ियां कार्यशील हैं तथा मानक समय (IST) से सिंक्रोनाइज़ हैं?',
    categoryEn: 'Infrastructure & Seating',
    categoryHi: 'कक्ष एवं बैठक व्यवस्था',
    helperEn: 'Wall clock must be clearly visible to all candidates from their desks.',
    helperHi: 'घड़ी कक्ष के सभी अभ्यर्थियों को अपने डेस्क से स्पष्ट दिखाई देनी चाहिए।',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q_infra_03',
    sequence: 3,
    textEn: 'Are clean drinking water arrangements and sanitized separate washrooms available for candidates?',
    textHi: 'क्या अभ्यर्थियों हेतु स्वच्छ पेयजल एवं छात्र-छात्राओं हेतु पृथक साफ-सुथरे शौचालय उपलब्ध हैं?',
    categoryEn: 'Infrastructure & Facilities',
    categoryHi: 'मूलभूत सुविधाएं',
    helperEn: 'Running water, soap, and clean water campers on each floor.',
    helperHi: 'नल में पानी, साबुन व प्रत्येक तल पर स्वच्छ पानी के कैम्पर।',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q_sec_01',
    sequence: 4,
    textEn: 'Is the campus boundary wall intact and all unauthorized rear gates locked and sealed?',
    textHi: 'क्या विद्यालय परिसर की चारदीवारी सुरक्षित है एवं सभी पिछले अनधिकृत गेट बंद व सील हैं?',
    categoryEn: 'Perimeter & Security',
    categoryHi: 'सुरक्षा एवं घेराबंदी',
    helperEn: 'Inspect perimeter for vulnerable gaps or broken sections.',
    helperHi: 'टूटी दीवारों अथवा असुरक्षित रास्तों की सघन जांच करें।',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q_sec_02',
    sequence: 5,
    textEn: 'Is armed police guard force deployed and reported for duty on Mock Day?',
    textHi: 'क्या मॉक डे पर सशस्त्र पुलिस बल व आरक्षी ड्यूटी हेतु उपस्थित हो चुके हैं?',
    categoryEn: 'Perimeter & Security',
    categoryHi: 'सुरक्षा एवं घेराबंदी',
    helperEn: 'Verify police departure register and presence on-site.',
    helperHi: 'रवानगी रजिस्टर एवं स्थल पर उपस्थिति का मिलान करें।',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q_cctv_01',
    sequence: 6,
    textEn: 'Are all CCTV cameras operational with high-definition video in classrooms and corridors?',
    textHi: 'क्या सभी परीक्षा कक्षों, गलियारों व मुख्य गेट के सीसीटीवी कैमरे चालू व स्पष्ट हैं?',
    categoryEn: 'CCTV Surveillance',
    categoryHi: 'सीसीटीवी निगरानी',
    helperEn: 'Zero blank channels or disconnected cameras on NVR screen.',
    helperHi: 'मॉनिटर स्क्रीन पर कोई भी कैमरा ऑफलाइन या ब्लैंक नहीं होना चाहिए।',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q_cctv_02',
    sequence: 7,
    textEn: 'Is live video stream connected and verified with UPSSSC State Command Center?',
    textHi: 'क्या राज्य कमांड सेंटर (पिकप भवन, लखनऊ) से सीसीटीवी लाइव फीड का सफल परीक्षण पूर्ण हुआ?',
    categoryEn: 'CCTV Surveillance',
    categoryHi: 'सीसीटीवी निगरानी',
    helperEn: 'Verify streaming handshake code and minimum 25 FPS stream.',
    helperHi: 'आयोग के कंट्रोल रूम से लाइव प्रसारण की पुष्टि संख्या प्राप्त करें।',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q_sr_01',
    sequence: 8,
    textEn: 'Is double-lock heavy steel almirah / vault installed inside the Strong Room?',
    textHi: 'क्या स्ट्रांग रूम में दो तालों वाली मजबूत स्टील की अलमारी/तिजोरी स्थापित है?',
    categoryEn: 'Strong Room & Confidential Custody',
    categoryHi: 'स्ट्रांग रूम एवं गोपनीयता',
    helperEn: 'Anchored double-lock vault for sealed question paper trunks.',
    helperHi: 'गोपनीय प्रश्नपत्र बक्सों को सुरक्षित रखने हेतु दो तालों की व्यवस्था।',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q_pwr_01',
    sequence: 9,
    textEn: 'Is dedicated Diesel Generator (DG Set) of minimum 15-25 kVA capacity available on site?',
    textHi: 'क्या न्यूनतम 15-25 kVA क्षमता का डीजल जनरेटर (DG Set) केंद्र पर स्थापित है?',
    categoryEn: 'Power Backup & Redundancy',
    categoryHi: 'विद्युत बैकअप एवं जनरेटर',
    helperEn: 'Adequate capacity to power entire lighting, fans, and CCTV servers.',
    helperHi: 'सम्पूर्ण भवन की लाइट, पंखे व सीसीटीवी सर्वर लोड उठाने में सक्षम।',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q_pwr_02',
    sequence: 10,
    textEn: 'Was a 15-minute continuous full-load trial run completed on generator power without tripping?',
    textHi: 'क्या मुख्य बिजली ग्रिड बंद करके जनरेटर पर 15 मिनट लगातार फुल-लोड ट्रायल सफल रहा?',
    categoryEn: 'Power Backup & Redundancy',
    categoryHi: 'विद्युत बैकअप एवं जनरेटर',
    helperEn: 'Disconnect main grid power; verify all classroom lights and CCTV remain on without trip.',
    helperHi: 'मुख्य बिजली काटकर सभी कमरों एवं सीसीटीवी का निर्वाध संचालन सत्यापित करें।',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ==================== DEFAULT ASSESSMENTS ====================
export const SEED_ASSESSMENTS: AssessmentDoc[] = [
  {
    id: 'assessment_mock_day',
    title: '01. MOCK TEST DAY (24 अक्टूबर 2026)',
    titleHi: '01. MOCK TEST DAY (24 अक्टूबर 2026)',
    type: 'mock_day',
    description: 'Mock test day assessment - CCTV, frisking materials, SOP training, staff contacts',
    descriptionHi: 'CCTV स्थापना, फ्रिस्किंग सामान, एसओपी प्रशिक्षण, स्टाफ नंबर सत्यापन',
    examName: 'UPSSSC PET 2026',
    scheduledDate: '24 अक्टूबर 2026',
    shifts: 'Full Day Mock Drill',
    isActive: true,
    questionIds: ['q_infra_01', 'q_infra_02', 'q_infra_03', 'q_sec_01', 'q_sec_02'], // ← IDs only!
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'assessment_exam_day',
    title: '02. EXAM DAY (25-26 अक्टूबर 2026)',
    titleHi: '02. EXAM DAY (25-26 अक्टूबर 2026)',
    type: 'exam_day',
    description: 'Exam day questionnaire - biometric staff, frisking setup, morning & evening shifts',
    descriptionHi: 'परीक्षा दिन प्रश्नावली - बायोमेट्रिक स्टाफ, फ्रिस्किंग सेटअप, सुबह और शाम की पाली',
    examName: 'UPSSSC PET 2026',
    scheduledDate: '25 OCT 2026 & 26 OCT 2026',
    shifts: 'Shift 1 (08:00-12:00 IST) & Shift 2 (14:00-18:00 IST)',
    isActive: true,
    questionIds: ['q_cctv_01', 'q_cctv_02', 'q_sr_01', 'q_sr_02', 'q_pwr_01'], // ← IDs only!
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'assessment_dry_run',
    title: '03. DRY RUN (Before Mock Day)',
    titleHi: '03. DRY RUN (Mock Day से पहले)',
    type: 'dry_run',
    description: 'Dry run assessment for infrastructure and staff readiness check',
    descriptionHi: 'ढांचे और कर्मचारी तैयारी की जांच',
    examName: 'UPSSSC PET 2026',
    scheduledDate: '15-20 अक्टूबर 2026',
    shifts: 'Full Day Dry Run',
    isActive: true,
    questionIds: ['q_infra_01', 'q_infra_02', 'q_sec_01', 'q_cctv_01', 'q_sr_01', 'q_pwr_01', 'q_pwr_02'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ==================== SAMPLE CSO ROSTERS ====================
export const SEED_ROSTERS: CSOProfileDoc[] = [
  {
    id: 'cso_001',
    districtName: 'Lucknow',
    csoName: 'राज कुमार सिंह',
    registeredMobile: '9876543210',
    dutyCentreName: 'DAV Sr. Sec. School, Aliganj',
    centreSeatingCapacity: 120,
    centreCode: '04201',
    name: 'राज कुमार सिंह',
    mobile: '9876543210',
    district: 'Lucknow',
    centreName: 'DAV Sr. Sec. School, Aliganj',
    candidateCapacity: 120,
    tehsil: 'Lucknow City',
    designation: 'CSO',
    department: 'Education',
    address: 'Aliganj, Lucknow',
    totalRooms: 6,
    centreSuperintendent: {
      name: 'प्रो. अजय शर्मा',
      mobile: '9876543211',
      institution: 'DAV Sr. Sec. School'
    },
    staticMagistrate: {
      name: 'श्री विजय कुमार',
      mobile: '9876543212',
      designation: 'Additional District Magistrate'
    },
    nodalOfficer: {
      name: 'डॉ. राजेश वर्मा',
      mobile: '9876543213',
      office: 'UPSSSC, Lucknow'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cso_002',
    districtName: 'Lucknow',
    csoName: 'अमित कुमार वर्मा',
    registeredMobile: '9876543220',
    dutyCentreName: 'St. Thomas School, Gomti Nagar',
    centreSeatingCapacity: 150,
    centreCode: '04202',
    name: 'अमित कुमार वर्मा',
    mobile: '9876543220',
    district: 'Lucknow',
    centreName: 'St. Thomas School, Gomti Nagar',
    candidateCapacity: 150,
    tehsil: 'Lucknow City',
    designation: 'CSO',
    department: 'Education',
    address: 'Gomti Nagar, Lucknow',
    totalRooms: 8,
    centreSuperintendent: {
      name: 'डॉ. प्रिया शर्मा',
      mobile: '9876543221',
      institution: 'St. Thomas School'
    },
    staticMagistrate: {
      name: 'श्रीमती प्रिया सिंह',
      mobile: '9876543222',
      designation: 'District Magistrate'
    },
    nodalOfficer: {
      name: 'श्री राहुल गुप्ता',
      mobile: '9876543223',
      office: 'UPSSSC, Lucknow'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
