import { CSOProfile, PhotoEvidenceItem, SurveyFormData } from '../types/survey';

export const REGISTERED_CSO_PROFILES: CSOProfile[] = [
  {
    id: 'CSO-UP-04201',
    districtName: 'Lucknow',
    csoName: 'Dr. Rajeshwar Singh (PCS)',
    registeredMobile: '9839012345',
    dutyCentreName: 'St. John Inter College, Hazratganj',
    centreSeatingCapacity: 480,
    name: 'Dr. Rajeshwar Singh (PCS)',
    designation: 'Special Secretary / CSO',
    department: 'Department of Higher Education, Govt. of UP',
    mobile: '9839012345',
    centreCode: '04201',
    centreName: 'St. John Inter College, Hazratganj',
    district: 'Lucknow',
    tehsil: 'Sadar',
    address: 'Near Capitol Cinema, Mahatma Gandhi Marg, Hazratganj, Lucknow, UP - 226001',
    candidateCapacity: 480,
    totalRooms: 20,
    centreSuperintendent: {
      name: 'Fr. Anthony D’Souza / Principal',
      mobile: '9415019876',
      institution: 'St. John Inter College'
    },
    staticMagistrate: {
      name: 'Sri Anand Vikram Singh (SDM)',
      mobile: '9454412301',
      designation: 'Sub-Divisional Magistrate, Sadar Lucknow'
    },
    nodalOfficer: {
      name: 'Sri Rakesh Kumar (ADM City)',
      mobile: '9454412300',
      office: 'District Administrative Complex, Kesarbagh, Lucknow'
    }
  },
  {
    id: 'CSO-UP-02105',
    districtName: 'Kanpur Nagar',
    csoName: 'Smt. Anamika Verma',
    registeredMobile: '9415123456',
    dutyCentreName: 'Government Polytechnic Institute',
    centreSeatingCapacity: 600,
    name: 'Smt. Anamika Verma',
    designation: 'Deputy Commissioner / CSO',
    department: 'Commercial Tax Department, Uttar Pradesh',
    mobile: '9415123456',
    centreCode: '02105',
    centreName: 'Government Polytechnic Institute',
    district: 'Kanpur Nagar',
    tehsil: 'Kanpur Sadar',
    address: 'Vikas Nagar, GT Road, Near Rawatpur, Kanpur Nagar, UP - 208024',
    candidateCapacity: 600,
    totalRooms: 24,
    centreSuperintendent: {
      name: 'Prof. K. N. Shukla (Principal)',
      mobile: '9450123488',
      institution: 'Govt. Polytechnic Kanpur'
    },
    staticMagistrate: {
      name: 'Sri Pradeep Kumar (Tehsildar)',
      mobile: '9454412511',
      designation: 'Executive Magistrate, Kanpur Nagar'
    },
    nodalOfficer: {
      name: 'Sri Vivek Srivastava (City Magistrate)',
      mobile: '9454412500',
      office: 'Collectorate Compound, Kanpur'
    }
  },
  {
    id: 'CSO-UP-08402',
    districtName: 'Varanasi',
    csoName: 'Sri Anand Kumar Srivastava',
    registeredMobile: '9794123456',
    dutyCentreName: 'Harish Chandra PG College',
    centreSeatingCapacity: 520,
    name: 'Sri Anand Kumar Srivastava',
    designation: 'Executive Officer / CSO',
    department: 'Urban Development Department, UP',
    mobile: '9794123456',
    centreCode: '08402',
    centreName: 'Harish Chandra PG College',
    district: 'Varanasi',
    tehsil: 'Varanasi Cantt',
    address: 'Maidagin Crossing, Kotwali Ward, Varanasi, UP - 221001',
    candidateCapacity: 520,
    totalRooms: 22,
    centreSuperintendent: {
      name: 'Dr. O. P. Singh (Principal)',
      mobile: '9415201299',
      institution: 'Harish Chandra PG College'
    },
    staticMagistrate: {
      name: 'Sri Ashish Tripathi (Nayab Tehsildar)',
      mobile: '9454413204',
      designation: 'Sector Magistrate, Zone-4 Varanasi'
    },
    nodalOfficer: {
      name: 'Dr. Sanjay Mishra (ADM Protocol)',
      mobile: '9454413200',
      office: 'Collectorate, Kutchery, Varanasi'
    }
  },
  {
    id: 'CSO-UP-01308',
    districtName: 'Prayagraj',
    csoName: 'Sri Birendra Pratap Yadav',
    registeredMobile: '9450098765',
    dutyCentreName: 'Ewing Christian College (Autonomous)',
    centreSeatingCapacity: 560,
    name: 'Sri Birendra Pratap Yadav',
    designation: 'Assistant Commissioner / CSO',
    department: 'State Tax Department, UP',
    mobile: '9450098765',
    centreCode: '01308',
    centreName: 'Ewing Christian College (Autonomous)',
    district: 'Prayagraj',
    tehsil: 'Sadar',
    address: '711 Gaughat, Mutthiganj, Prayagraj, UP - 211003',
    candidateCapacity: 560,
    totalRooms: 24,
    centreSuperintendent: {
      name: 'Dr. A. S. Moses (Principal)',
      mobile: '9415214587',
      institution: 'Ewing Christian College'
    },
    staticMagistrate: {
      name: 'Sri Sunil Dutt (SDM Phulpur)',
      mobile: '9454411802',
      designation: 'Static Magistrate, Prayagraj'
    },
    nodalOfficer: {
      name: 'Sri Madan Kumar (ADM Supply)',
      mobile: '9454411800',
      office: 'District Magistrate Office, Prayagraj'
    }
  }
];

export const INITIAL_PHOTO_SLOTS: PhotoEvidenceItem[] = [
  {
    id: 'p1',
    slotKey: 'main_gate',
    labelEn: 'Main Gate & Frisking Enclosure',
    labelHi: 'मुख्य प्रवेश द्वार एवं तलाशी बूथ',
    descriptionEn: 'Photo showing boundary gate, police stationing, and separate male/female frisking canopies.',
    descriptionHi: 'मुख्य गेट, पुलिस बल एवं महिला/पुरुष अलग-अलग तलाशी बूथ का स्पष्ट फोटो।',
    required: true,
    verified: false
  },
  {
    id: 'p2',
    slotKey: 'strong_room',
    labelEn: 'Strong Room & Steel Almirah Vault',
    labelHi: 'स्ट्रांग रूम एवं गोपनीय डबल-लॉक अलमारी',
    descriptionEn: 'Photo showing double-lock steel cupboard, door sealing, fire extinguisher and guard position.',
    descriptionHi: 'डबल-लॉक अलमारी, सीलिंग, अग्निशामक यंत्र तथा सुरक्षा गार्ड की तैनाती।',
    required: true,
    verified: false
  },
  {
    id: 'p3',
    slotKey: 'cctv_control',
    labelEn: 'CCTV Control Room & Live Feed Screen',
    labelHi: 'सीसीटीवी नियंत्रण कक्ष एवं लाइव फीड मॉनिटर',
    descriptionEn: 'Photo showing DVR/NVR screens displaying all classroom feeds connected to UPSSSC Command Center.',
    descriptionHi: 'सभी कक्षों के सीसीटीवी मॉनिटर एवं लखनऊ राज्य नियंत्रण कक्ष से लाइव कनेक्ट का दृश्य।',
    required: true,
    verified: false
  },
  {
    id: 'p4',
    slotKey: 'exam_hall',
    labelEn: 'Sample Exam Hall & Seating Arrangement',
    labelHi: 'नमूना परीक्षा कक्ष एवं बैठक व्यवस्था',
    descriptionEn: 'Photo showing clean single-bench seating, working wall clock, light and proper ventilation.',
    descriptionHi: 'साफ-सुथरे डेस्क, दीवार घड़ी (सिंक्रोनाइज़्ड), प्रकाश व पंखों की व्यवस्था।',
    required: true,
    verified: false
  },
  {
    id: 'p5',
    slotKey: 'generator_set',
    labelEn: 'Diesel Generator (DG Set) & Power Backup',
    labelHi: 'डीजल जनरेटर (डीजी सेट) एवं बैकअप व्यवस्था',
    descriptionEn: 'Photo showing DG set with fuel stock and standby electrician at the power changeover panel.',
    descriptionHi: 'डीजी सेट, डीजल रिजर्व स्टॉक एवं विद्युत पैनल पर तैनात इलेक्ट्रीशियन।',
    required: true,
    verified: false
  }
];

export const DEFAULT_FORM_DATA: SurveyFormData = {
  // Step 1: Centre Verification
  centreCodeVerified: true,
  centreNameVerified: true,
  candidateCapacityConfirmed: 480,
  totalRoomsReady: 20,
  drinkingWaterReady: true,
  separateWashroomsClean: true,
  barrierFreeRampAvailable: true,
  wallClocksSynced: true,
  seatingPlanSanitized: true,

  // Step 2: Security & Frisking
  boundaryWallIntact: true,
  policeGuardDeployed: true,
  policeArmedConstableCount: 6,
  separateFemaleFriskingEnclosure: true,
  hhmdWorkingCount: 5,
  dfmdFunctional: true,
  mobileJammerTested: true,
  jammersDropSignalConfirmed: true,
  cloakroomTokenSystemActive: true,

  // Step 3: CCTV
  totalCCTVCount: 28,
  allCCTVFunctional: true,
  nvrRecordingCapacityDays: 30,
  cctvUninterruptedStrongRoomView: true,
  primaryISPProvider: 'BSNL Bharat Fiber (100 Mbps)',
  primaryISPSpeedMbps: 100,
  redundantBackupInternetReady: true,
  stateControlRoomHandshakeSuccess: true,
  controlRoomStreamFps: 25,

  // Step 4: Strong Room
  strongRoomDoubleLockVaultReady: true,
  dualKeyCustodyAgreed: true,
  armedGuardAtStrongRoomDoor: true,
  fireExtinguisherInspected: true,
  strongRoomWindowSealed: true,
  strongRoomLogbookInitiated: true,

  // Step 5: Biometrics
  biometricDevicesReceived: true,
  biometricDeviceCount: 8,
  mockBiometricDrillConducted: true,
  sparePowerBanksCount: 4,
  qrCodeDirectionPostersPasted: true,

  // Step 6: Power Backup
  dgSetAvailable: true,
  dgCapacityKVA: 25,
  dgTrialRunMinutes: 20,
  dgFullLoadTestedWithoutTrip: true,
  dieselReserveLitres: 35,
  inverterConnectedToCCTVAndServer: true,
  standbyElectricianName: 'Rameshwar Prasad',
  standbyElectricianMobile: '9452098711',

  // Step 7: Staff Briefing
  invigilatorsBriefed: true,
  invigilatorDutyRosterGenerated: true,
  reserveStaffAssignedCount: 6,
  emergencyHelplinesDisplayed: true,
  prohibitedItemsBannerDisplayed: true,

  // Step 8: Final Declaration
  overallReadiness: 'fully_ready',
  csoRemarks: 'Mock Day physical inspection completed. All 20 rooms sanitized, CCTV live streaming tested with Picup Bhawan Lucknow Control Room, DG trial run successful for 20 mins on full load. Centre is 100% compliant for UPSSSC PET 2026.',
  csoSignatureName: 'Dr. Rajeshwar Singh',
  csoDeclarationConfirmed: true
};

export const EMERGENCY_CONTACTS = [
  {
    roleEn: 'UPSSSC Commission Control Room (Lucknow)',
    roleHi: 'यूपीएसएसएससी राज्य नियंत्रण कक्ष (लखनऊ)',
    phone: '0522-2720814',
    tollFree: '1800-180-8777',
    contactPerson: 'Controller of Examination, UPSSSC'
  },
  {
    roleEn: 'UP Police STF Anti-Cheating Task Force',
    roleHi: 'यूपी पुलिस एसटीएफ विशेष कार्य बल',
    phone: '0522-2436892',
    tollFree: '112 / STF Control',
    contactPerson: 'Superintendent of Police, STF UP'
  },
  {
    roleEn: 'District Emergency Operations Center (DEOC)',
    roleHi: 'जिला आपातकालीन संचालन केंद्र (कलक्ट्रेट)',
    phone: '0522-2611119',
    tollFree: '1077',
    contactPerson: 'District Magistrate Control Room'
  },
  {
    roleEn: 'Technical Vendor Helpdesk (CCTV & Biometric)',
    roleHi: 'तकनीकी एजेंसी हेल्पडेस्क (सीसीटीवी व बायोमेट्रिक)',
    phone: '1800-209-6688',
    tollFree: '0120-6895200',
    contactPerson: 'Lead Systems Engineer'
  }
];

export const MOCK_DAY_SOP_RULES = [
  {
    titleEn: '1. Biometric & Iris Verification Drill',
    titleHi: '1. बायोमेट्रिक एवं आइरिस सत्यापन अभ्यास',
    descEn: 'Test all biometric scanners with invigilator sample fingerprints. Ensure spare battery packs are fully charged to 100%.',
    descHi: 'सभी बायोमेट्रिक मशीनों की जांच कक्ष निरीक्षकों के फिंगरप्रिंट से करें। सभी बैकअप बैटरियों को 100% चार्ज रखें।'
  },
  {
    titleEn: '2. CCTV Command Streaming to Lucknow',
    titleHi: '2. लखनऊ कंट्रोल रूम को सीसीटीवी लाइव स्ट्रीमिंग',
    descEn: 'Connect static IP feed to UPSSSC headquarters server. Verify frame rate is at least 25 FPS with zero blind spots on paper unpacking table.',
    descHi: 'स्टैटिक आईपी फीड को आयोग के सर्वर से जोड़ें। प्रश्नपत्र खोलने की मेज पर कोई ब्लाइंड स्पॉट न हो, 25 FPS स्ट्रीमिंग सुनिश्चित करें।'
  },
  {
    titleEn: '3. Mobile Jammer Signal Radius Test',
    titleHi: '3. मोबाइल जैमर सिग्नल ड्रॉप जांच',
    descEn: 'Walk through all exam halls with a test 4G/5G handset. Confirmation of zero signal bars / "No Service" in each hall is mandatory.',
    descHi: 'मोबाइल हैंडसेट लेकर सभी कक्षों में घूमें। सभी कक्षों में "No Service" या शून्य नेटवर्क सिग्नल की पुष्टि अनिवार्य है।'
  },
  {
    titleEn: '4. 15-Minute DG Full Load Trial',
    titleHi: '4. जनरेटर का 15 मिनट फुल लोड ट्रायल',
    descEn: 'Turn off main grid electricity. Run complete centre lighting, fans, CCTV, and servers on generator power continuously for 15 minutes.',
    descHi: 'मुख्य ग्रिड बिजली बंद करके पूरे केंद्र की लाइट, पंखे, सीसीटीवी व सर्वर को लगातार 15 मिनट तक जनरेटर पर चलाकर जांचें।'
  },
  {
    titleEn: '5. Double Lock Strong Room Sealing',
    titleHi: '5. डबल लॉक स्ट्रांग रूम सुरक्षा प्रोटोकॉल',
    descEn: 'Key 1 stays with Center Superintendent; Key 2 stays with Static Magistrate / CSO. Armed guard must remain stationed 24x7 with active CCTV.',
    descHi: 'प्रथम चाबी केंद्र व्यवस्थापक एवं दूसरी चाबी स्टैटिक मजिस्ट्रेट/सीएसओ के पास रहेगी। 24 घंटे सशस्त्र गार्ड व सीसीटीवी निगरानी अनिवार्य है।'
  }
];
