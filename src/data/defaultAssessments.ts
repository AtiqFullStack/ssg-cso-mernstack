import { Assessment, SurveyQuestion } from '../types/survey';

export const MOCK_DAY_TEMPLATE_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'mock_q_01',
    sequence: 1,
    textHi: '1. सीसीटीवी इंस्टालेशन: क्या बैगेज काउंटर, फ्रिस्किंग एरिया, कंट्रोल रूम व सभी परीक्षा कक्षों में सीसीटीवी कैमरे पूरी तरह क्रियाशील व रिकॉर्डिंग मोड में हैं?',
    textEn: '1. CCTV Installation: Are CCTV cameras fully operational and recording at baggage counter, frisking area, control room, and all exam halls?',
    categoryEn: 'CCTV Installation',
    categoryHi: 'सीसीटीवी इंस्टालेशन',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'mock_q_02',
    sequence: 2,
    textHi: '2. फ्रिस्किंग सामान डिलीवरी: क्या DFMD (डोर फ्रेम मेटल डिटेक्टर), HHMD, टोकन एवं अन्य जांच सामग्री परीक्षा केंद्र पर समय से प्राप्त हो चुकी है?',
    textEn: '2. Frisking Material Delivery: Have DFMD, HHMD metal detectors, tokens, and verification kits been delivered on time?',
    categoryEn: 'Frisking Material',
    categoryHi: 'फ्रिस्किंग सामान डिलीवरी',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'mock_q_03',
    sequence: 3,
    textHi: '3. एसओपी व ट्रेनिंग वीडियो स्टडी: क्या आयोग द्वारा जारी मानक संचालन प्रक्रिया (SOP) व प्रशिक्षण वीडियो का अध्ययन सभी स्टाफ द्वारा पूर्ण कर लिया गया है?',
    textEn: '3. SOP & Training Video Study: Has the examination SOP and official training video been thoroughly studied by all deployed staff?',
    categoryEn: 'SOP & Training',
    categoryHi: 'एसओपी व ट्रेनिंग वीडियो',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'mock_q_04',
    sequence: 4,
    textHi: '4. कंट्रोल रूम व स्टाफ नंबर्स: क्या केंद्र कंट्रोल रूम व सभी प्रमुख अधिकारियों (CSO, CS, स्टेटिक मजिस्ट्रेट) के आपातकालीन संपर्क नंबर सूची प्रदर्शित व उपलब्ध है?',
    textEn: '4. Control Room & Staff Numbers: Are the emergency contact mobile numbers of Control Room, CSO, Centre Head, and Static Magistrate verified and displayed?',
    categoryEn: 'Control Room & Contacts',
    categoryHi: 'कंट्रोल रूम व स्टाफ नंबर्स',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'mock_q_05',
    sequence: 5,
    textHi: '5. मूलभूत व्यवस्था व बैठक: क्या सभी कमरों में पर्याप्त रोशनी, पंखे, पेयजल एवं रोल नंबर मार्किंग सहित बैठक व्यवस्था (डेस्क-बेंच) पूर्णतः तैयार है?',
    textEn: '5. Infrastructure & Seating: Is lighting, ventilation, sanitized drinking water, and numbered desk seating fully arranged?',
    categoryEn: 'Infrastructure',
    categoryHi: 'मूलभूत व्यवस्था',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'mock_q_06',
    sequence: 6,
    textHi: '6. स्ट्रांग रूम व विद्युत बैकअप: क्या स्ट्रांग रूम में डबल-लॉक वॉल्ट, नाइट विजन CCTV एवं जनरेटर सेट (DG Set) का ट्रायल रन 30 मिनट सफलतापूर्वक संपन्न हुआ?',
    textEn: '6. Strong Room & DG Set: Is strong room double lock secured with night vision CCTV and was 30-min generator load trial successful?',
    categoryEn: 'Strong Room & Power',
    categoryHi: 'स्ट्रांग रूम व विद्युत बैकअप',
    optionsType: 'YES_NO',
    isActive: true
  }
];

export const EXAM_DAY_TEMPLATE_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'exam_q_01',
    sequence: 1,
    textHi: '1. बायोमेट्रिक एवं फ्रिस्किंग स्टाफ उपस्थिति: क्या बायोमेट्रिक स्टाफ (Biometric Staff) एवं फ्रिस्किंग स्टाफ (Frisking Staff) निर्धारित समय पर केंद्र पर उपस्थित हैं?',
    textEn: '1. Biometric & Frisking Staff Presence: Are Biometric Staff and Frisking Staff present on time at the examination centre?',
    categoryEn: 'Staff Attendance',
    categoryHi: 'स्टाफ उपस्थिति',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'exam_q_02',
    sequence: 2,
    textHi: '2. बायोमेट्रिक हेड व सेंटर हेड सत्यापन: क्या बायोमेट्रिक हेड (Biometric Head) एवं केंद्र व्यवस्थापक (Centre Head) के नाम, संपर्क नंबर व पहचान पत्र सत्यापित हैं?',
    textEn: '2. Biometric Head & Centre Head Verification: Are the names, verified ID cards, and contact numbers of Biometric Head and Centre Head recorded?',
    categoryEn: 'Head Verification',
    categoryHi: 'अधिकारी सत्यापन',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'exam_q_03',
    sequence: 3,
    textHi: '3. प्रथम पाली (Morning Shift) उपस्थिति व परीक्षा: क्या प्रथम पाली में अभ्यर्थियों की सघन फ्रिस्किंग, बायोमेट्रिक कैप्चरिंग व उपस्थिति बिना किसी व्यवधान के संपन्न हुई?',
    textEn: '3. Morning Shift Presence & Attendance: Did Morning Shift candidate entry, frisking, and biometric verification proceed smoothly without disturbance?',
    categoryEn: 'Morning Shift',
    categoryHi: 'प्रथम पाली (Morning Shift)',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'exam_q_04',
    sequence: 4,
    textHi: '4. द्वितीय पाली (Evening Shift) उपस्थिति व परीक्षा: क्या द्वितीय पाली में सभी अभ्यर्थियों की गहन जांच, बायोमेट्रिक सत्यापन एवं परीक्षा शांतिपूर्ण संपन्न हुई?',
    textEn: '4. 2nd (Evening) Shift Attendance & Audit: Was candidate frisking, biometric verification, and exam conduct in 2nd Shift completed peacefully?',
    categoryEn: 'Evening Shift',
    categoryHi: 'द्वितीय पाली (Evening Shift)',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'exam_q_05',
    sequence: 5,
    textHi: '5. इलेक्ट्रॉनिक सुरक्षा व मोबाइल जैमर्स: क्या मोबाइल जैमर्स (Mobile Jammers) एवं CCTV लाइव स्ट्रीमिंग सभी पालियों में निरंतर क्रियाशील रहे?',
    textEn: '5. Electronic Security: Were mobile jammers and CCTV streaming functioning continuously throughout all shifts?',
    categoryEn: 'Electronic Security',
    categoryHi: 'इलेक्ट्रॉनिक सुरक्षा',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'exam_q_06',
    sequence: 6,
    textHi: '6. प्रश्न-पुस्तिका अभिरक्षा व सीलिंग: क्या प्रश्न-पुस्तिका बक्सों की सील CSO, CS व स्टेटिक मजिस्ट्रेट के समक्ष वीडियोग्राफी में खोली गई व ओएमआर शीट्स सुरक्षित सील हुईं?',
    textEn: '6. Paper Custody & OMR Sealing: Were question box seals opened and OMR bags sealed under videography before CSO, CS, and Magistrate?',
    categoryEn: 'Confidential Material',
    categoryHi: 'गोपनीय सामग्री अभिरक्षा',
    optionsType: 'YES_NO',
    isActive: true
  },
  {
    id: 'exam_q_07',
    sequence: 7,
    textHi: '7. परीक्षा शुचिता व अंतिम रिमार्क्स: क्या परीक्षा पूर्णतः शांतिपूर्ण व शुचितापूर्ण ढंग से बिना किसी अनुचित साधन (UFM) के संपन्न हुई?',
    textEn: '7. Fair Conduct & Final Remarks: Did the examination conclude peacefully and transparently with zero unfair means cases reported?',
    categoryEn: 'Exam Conclusion',
    categoryHi: 'परीक्षा समापन व रिमार्क्स',
    optionsType: 'YES_NO',
    isActive: true
  }
];

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'assessment_mock_day',
    title: '01. MOCK TEST DAY (24 अक्टूबर 2026)',
    titleHi: '01. MOCK TEST DAY (24 अक्टूबर 2026)',
    type: 'mock_day',
    description: '1. सीसीटीवी इंस्टालेशन (बैगेज, फ्रिस्किंग, कंट्रोल रूम) · 2. फ्रिस्किंग सामान डिलीवरी · 3. एसओपी व ट्रेनिंग वीडियो स्टडी · 4. कंट्रोल रूम व स्टाफ नंबर्स।',
    descriptionHi: '1. सीसीटीवी इंस्टालेशन (बैगेज, फ्रिस्किंग, कंट्रोल रूम) · 2. फ्रिस्किंग सामान डिलीवरी · 3. एसओपी व ट्रेनिंग वीडियो स्टडी · 4. कंट्रोल रूम व स्टाफ नंबर्स।',
    examName: 'UPSSSC PET 2026',
    scheduledDate: '24 अक्टूबर 2026',
    shifts: 'Full Day Mock Drill',
    isActive: true,
    questions: MOCK_DAY_TEMPLATE_QUESTIONS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'assessment_exam_day',
    title: '02. EXAM DAY Questionnaire & Attendance',
    titleHi: '02. EXAM DAY Questionnaire & Attendance',
    type: 'exam_day',
    description: 'Biometric Staff & Frisking Staff Present Count + Names & Contact Nos., Biometric Head, Centre Head, Morning Shift & 2nd (Evening) Shift Present Count & Remarks.',
    descriptionHi: 'Biometric Staff & Frisking Staff Present Count + Names & Contact Nos., Biometric Head, Centre Head, Morning Shift & 2nd (Evening) Shift Present Count & Remarks.',
    examName: 'UPSSSC PET 2026',
    scheduledDate: '25 OCT 2026 & 26 OCT 2026',
    shifts: 'Shift 1 (Morning) & Shift 2 (Evening)',
    isActive: true,
    questions: EXAM_DAY_TEMPLATE_QUESTIONS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
