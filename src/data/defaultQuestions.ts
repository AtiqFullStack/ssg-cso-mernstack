import { SurveyQuestion } from '../types/survey';

export const DEFAULT_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q_infra_01',
    sequence: 1,
    textEn: 'Is the seating arrangement sanitized with minimum 3-foot distance between candidates?',
    textHi: 'क्या बैठक व्यवस्था में अभ्यर्थियों के मध्य न्यूनतम 3-फीट की दूरी व स्वच्छता सुनिश्चित है?',
    categoryEn: 'Infrastructure & Seating',
    categoryHi: 'कक्ष एवं बैठक व्यवस्था',
    helperEn: 'Single bench per candidate or 2 candidates on a 6-foot dual desk.',
    helperHi: 'प्रत्येक अभ्यर्थी हेतु एकल डेस्क अथवा 6 फीट डेस्क पर दो अभ्यर्थी।',
    isActive: true
  },
  {
    id: 'q_infra_02',
    sequence: 2,
    textEn: 'Are wall clocks in all examination halls functional and synchronized with Indian Standard Time (IST)?',
    textHi: 'क्या सभी परीक्षा कक्षों की दीवार घड़ियां कार्यशील हैं तथा मानक समय (IST) से सिंक्रोनाइज़ हैं?',
    categoryEn: 'Infrastructure & Seating',
    categoryHi: 'कक्ष एवं बैठक व्यवस्था',
    helperEn: 'Wall clock must be clearly visible to all candidates from their desks.',
    helperHi: 'घड़ी कक्ष के सभी अभ्यर्थियों को अपने डेस्क से स्पष्ट दिखाई देनी चाहिए।',
    isActive: true
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
    isActive: true
  },
  {
    id: 'q_infra_04',
    sequence: 4,
    textEn: 'Is ground floor hall or barrier-free ramp available for Divyangjan (PwD) candidates?',
    textHi: 'क्या दिव्यांग अभ्यर्थियों हेतु भूतल पर कक्ष अथवा बाधामुक्त रैंप की सुविधा उपलब्ध है?',
    categoryEn: 'Infrastructure & Facilities',
    categoryHi: 'मूलभूत सुविधाएं',
    helperEn: 'Accessible entrance and dedicated assistance on exam day.',
    helperHi: 'सुगम प्रवेश द्वार एवं परीक्षा दिवस पर समर्पित सहायक।',
    isActive: true
  },
  {
    id: 'q_sec_01',
    sequence: 5,
    textEn: 'Is the campus boundary wall intact and all unauthorized rear gates locked and sealed?',
    textHi: 'क्या विद्यालय परिसर की चारदीवारी सुरक्षित है एवं सभी पिछले अनधिकृत गेट बंद व सील हैं?',
    categoryEn: 'Perimeter & Security',
    categoryHi: 'सुरक्षा एवं घेराबंदी',
    helperEn: 'Inspect perimeter for vulnerable gaps or broken sections.',
    helperHi: 'टूटी दीवारों अथवा असुरक्षित रास्तों की सघन जांच करें।',
    isActive: true
  },
  {
    id: 'q_sec_02',
    sequence: 6,
    textEn: 'Is armed police guard force deployed and reported for duty on Mock Day?',
    textHi: 'क्या मॉक डे पर सशस्त्र पुलिस बल व आरक्षी ड्यूटी हेतु उपस्थित हो चुके हैं?',
    categoryEn: 'Perimeter & Security',
    categoryHi: 'सुरक्षा एवं घेराबंदी',
    helperEn: 'Verify police departure register and presence on-site.',
    helperHi: 'रवानगी रजिस्टर एवं स्थल पर उपस्थिति का मिलान करें।',
    isActive: true
  },
  {
    id: 'q_sec_03',
    sequence: 7,
    textEn: 'Is dedicated separate frisking enclosure with curtain/tent established for female candidates?',
    textHi: 'क्या महिला अभ्यर्थियों हेतु पर्दे/कनात युक्त पृथक तलाशी कक्ष तैयार है?',
    categoryEn: 'Perimeter & Security',
    categoryHi: 'सुरक्षा एवं घेराबंदी',
    helperEn: 'Female police personnel / women teachers assigned for frisking.',
    helperHi: 'महिला पुलिसकर्मियों अथवा शिक्षिकाओं द्वारा तलाशी की व्यवस्था।',
    isActive: true
  },
  {
    id: 'q_sec_04',
    sequence: 8,
    textEn: 'Are working Handheld Metal Detectors (HHMD) available and tested with batteries?',
    textHi: 'क्या कार्यशील हैंडहेल्ड मेटल डिटेक्टर (HHMD) पर्याप्त संख्या में चालू व जांचे हुए हैं?',
    categoryEn: 'Perimeter & Security',
    categoryHi: 'सुरक्षा एवं घेराबंदी',
    helperEn: 'Test beep sound and sensitivity on metal objects.',
    helperHi: 'मेटल वस्तुओं पर बीप साउंड एवं सेंसिटिविटी की जांच करें।',
    isActive: true
  },
  {
    id: 'q_sec_05',
    sequence: 9,
    textEn: 'Are mobile jammers installed and is mobile signal completely dropped ("No Service") in all halls?',
    textHi: 'क्या मोबाइल जैमर स्थापित हैं तथा सभी कमरों में मोबाइल सिग्नल शून्य ("No Service") पाया गया?',
    categoryEn: 'Electronic Security & Jammers',
    categoryHi: 'इलेक्ट्रॉनिक सुरक्षा व जैमर',
    helperEn: 'Walk through every corner of exam halls with a test 4G/5G mobile handset.',
    helperHi: 'परीक्षण हैंडसेट लेकर प्रत्येक कमरे के कोनों में नेटवर्क जांचें।',
    isActive: true
  },
  {
    id: 'q_sec_06',
    sequence: 10,
    textEn: 'Is candidate cloakroom / token deposit system active outside main gate for bags and mobiles?',
    textHi: 'क्या मुख्य गेट के बाहर अभ्यर्थियों के बैग व मोबाइल सुरक्षित जमा हेतु टोकन काउंटर तैयार है?',
    categoryEn: 'Perimeter & Security',
    categoryHi: 'सुरक्षा एवं घेराबंदी',
    helperEn: 'Token counter prevents unauthorized devices inside premises.',
    helperHi: 'परिसर के भीतर अनधिकृत गैजेट्स का प्रवेश रोकने हेतु टोकन व्यवस्था।',
    isActive: true
  },
  {
    id: 'q_cctv_01',
    sequence: 11,
    textEn: 'Are all CCTV cameras operational with high-definition video in classrooms and corridors?',
    textHi: 'क्या सभी परीक्षा कक्षों, गलियारों व मुख्य गेट के सीसीटीवी कैमरे चालू व स्पष्ट हैं?',
    categoryEn: 'CCTV Surveillance',
    categoryHi: 'सीसीटीवी निगरानी',
    helperEn: 'Zero blank channels or disconnected cameras on NVR screen.',
    helperHi: 'मॉनिटर स्क्रीन पर कोई भी कैमरा ऑफलाइन या ब्लैंक नहीं होना चाहिए।',
    isActive: true
  },
  {
    id: 'q_cctv_02',
    sequence: 12,
    textEn: 'Is live video stream connected and verified with UPSSSC State Command Center (Picup Bhawan, Lucknow)?',
    textHi: 'क्या राज्य कमांड सेंटर (पिकप भवन, लखनऊ) से सीसीटीवी लाइव फीड का सफल परीक्षण पूर्ण हुआ?',
    categoryEn: 'CCTV Surveillance',
    categoryHi: 'सीसीटीवी निगरानी',
    helperEn: 'Verify streaming handshake code and minimum 25 FPS stream.',
    helperHi: 'आयोग के कंट्रोल रूम से लाइव प्रसारण की पुष्टि संख्या प्राप्त करें।',
    isActive: true
  },
  {
    id: 'q_cctv_03',
    sequence: 13,
    textEn: 'Is dedicated CCTV camera focused on Question Paper unsealing & OMR packing table without blind spots?',
    textHi: 'क्या प्रश्नपत्र खोलने एवं ओएमआर पैकिंग मेज पर समर्पित कैमरा बिना किसी ब्लाइंड स्पॉट के है?',
    categoryEn: 'CCTV Surveillance',
    categoryHi: 'सीसीटीवी निगरानी',
    helperEn: 'Direct unobstructed overhead/angle view of confidential table.',
    helperHi: 'गोपनीय कार्य की मेज पर स्पष्ट व सीधा वीडियो कवरेज।',
    isActive: true
  },
  {
    id: 'q_sr_01',
    sequence: 14,
    textEn: 'Is double-lock heavy steel almirah / vault installed inside the Strong Room?',
    textHi: 'क्या स्ट्रांग रूम में दो तालों वाली मजबूत स्टील की अलमारी/तिजोरी स्थापित है?',
    categoryEn: 'Strong Room & Confidential Custody',
    categoryHi: 'स्ट्रांग रूम एवं गोपनीयता',
    helperEn: 'Anchored double-lock vault for sealed question paper trunks.',
    helperHi: 'गोपनीय प्रश्नपत्र बक्सों को सुरक्षित रखने हेतु दो तालों की व्यवस्था।',
    isActive: true
  },
  {
    id: 'q_sr_02',
    sequence: 15,
    textEn: 'Is dual key custody established: Key 1 with Centre Superintendent and Key 2 with CSO / Magistrate?',
    textHi: 'क्या दोहरी चाबी व्यवस्था सुनिश्चित है: चाबी 1 केन्द्र व्यवस्थापक एवं चाबी 2 CSO / मजिस्ट्रेट के पास?',
    categoryEn: 'Strong Room & Confidential Custody',
    categoryHi: 'स्ट्रांग रूम एवं गोपनीयता',
    helperEn: 'Both keys required simultaneously to open confidential safe.',
    helperHi: 'दोनों अधिकारियों की भौतिक उपस्थिति के बिना तिजोरी नहीं खोली जा सकेगी।',
    isActive: true
  },
  {
    id: 'q_sr_03',
    sequence: 16,
    textEn: 'Is 24x7 armed police sentry posted directly at the Strong Room entrance door?',
    textHi: 'क्या स्ट्रांग रूम के मुख्य द्वार पर 24 घंटे सशस्त्र पुलिस संतरी तैनात है?',
    categoryEn: 'Strong Room & Confidential Custody',
    categoryHi: 'स्ट्रांग रूम एवं गोपनीयता',
    helperEn: 'Sentry post with visitor log register outside strong room.',
    helperHi: 'द्वार पर आगंतुक रजिस्टर एवं बैरिकेड सुरक्षा।',
    isActive: true
  },
  {
    id: 'q_sr_04',
    sequence: 17,
    textEn: 'Is Fire Extinguisher inspected with valid refill tag and are room windows sealed and grilled?',
    textHi: 'क्या अग्निशामक यंत्र (Fire Extinguisher) चालू व वैध है तथा खिड़कियां सील व ग्रिल युक्त हैं?',
    categoryEn: 'Strong Room & Confidential Custody',
    categoryHi: 'स्ट्रांग रूम एवं गोपनीयता',
    helperEn: 'CO2 / ABC extinguisher pressure gauge in green operational band.',
    helperHi: 'दबाव मीटर हरे निशान में एवं खिड़कियों की पूर्ण सुरक्षा।',
    isActive: true
  },
  {
    id: 'q_bio_01',
    sequence: 18,
    textEn: 'Have biometric / facial recognition devices been received from authorized agency and tested?',
    textHi: 'क्या अधिकृत एजेंसी से बायोमेट्रिक/फेस सत्यापन मशीनें प्राप्त कर परीक्षण कर ली गई हैं?',
    categoryEn: 'Biometric & Attendance',
    categoryHi: 'बायोमेट्रिक व उपस्थिति',
    helperEn: 'Hardware handover verified against commission delivery receipt.',
    helperHi: 'डिवाइस चालान एवं सीरियल नंबर का मिलान पूर्ण।',
    isActive: true
  },
  {
    id: 'q_bio_02',
    sequence: 19,
    textEn: 'Was mock biometric attendance drill successfully completed with sample invigilation staff?',
    textHi: 'क्या उपस्थित निरीक्षकों के साथ बायोमेट्रिक मॉक उपस्थिति परीक्षण सफलतापूर्वक पूर्ण हुआ?',
    categoryEn: 'Biometric & Attendance',
    categoryHi: 'बायोमेट्रिक व उपस्थिति',
    helperEn: 'Candidate verification time under 5 seconds per match confirmed.',
    helperHi: 'प्रति अभ्यर्थी 5 सेकंड से कम का औसत समय सुनिश्चित।',
    isActive: true
  },
  {
    id: 'q_pwr_01',
    sequence: 20,
    textEn: 'Is dedicated Diesel Generator (DG Set) of minimum 15-25 kVA capacity available on site?',
    textHi: 'क्या न्यूनतम 15-25 kVA क्षमता का डीजल जनरेटर (DG Set) केंद्र पर स्थापित है?',
    categoryEn: 'Power Backup & Redundancy',
    categoryHi: 'विद्युत बैकअप एवं जनरेटर',
    helperEn: 'Adequate capacity to power entire lighting, fans, and CCTV servers.',
    helperHi: 'सम्पूर्ण भवन की लाइट, पंखे व सीसीटीवी सर्वर लोड उठाने में सक्षम।',
    isActive: true
  },
  {
    id: 'q_pwr_02',
    sequence: 21,
    textEn: 'Was a 15-minute continuous full-load trial run completed on generator power without tripping?',
    textHi: 'क्या मुख्य बिजली ग्रिड बंद करके जनरेटर पर 15 मिनट लगातार फुल-लोड ट्रायल सफल रहा?',
    categoryEn: 'Power Backup & Redundancy',
    categoryHi: 'विद्युत बैकअप एवं जनरेटर',
    helperEn: 'Disconnect main grid power; verify all classroom lights and CCTV remain on without trip.',
    helperHi: 'मुख्य बिजली काटकर सभी कमरों एवं सीसीटीवी का निर्वाध संचालन सत्यापित करें।',
    isActive: true
  },
  {
    id: 'q_pwr_03',
    sequence: 22,
    textEn: 'Is minimum 20-30 Litres diesel fuel reserve stock physically verified and available in cans?',
    textHi: 'क्या न्यूनतम 20-30 लीटर डीजल का सुरक्षित रिजर्व स्टॉक केंद्र पर भौतिक रूप से मौजूद है?',
    categoryEn: 'Power Backup & Redundancy',
    categoryHi: 'विद्युत बैकअप एवं जनरेटर',
    helperEn: 'Dedicated fuel stock for exam day power emergencies.',
    helperHi: 'आपातकालीन निर्बाध विद्युत आपूर्ति हेतु सुरक्षित ईंधन।',
    isActive: true
  },
  {
    id: 'q_pwr_04',
    sequence: 23,
    textEn: 'Is designated standby electrician present on site with functional contact number?',
    textHi: 'क्या नामित इलेक्ट्रीशियन कार्यस्थल पर उपस्थित हैं एवं उनका मोबाइल नंबर दर्ज है?',
    categoryEn: 'Power Backup & Redundancy',
    categoryHi: 'विद्युत बैकअप एवं जनरेटर',
    helperEn: 'Electrician stationed at the main changeover switchboard.',
    helperHi: 'विद्युत पैनल पर तैनात कर्मचारी की उपलब्धता।',
    isActive: true
  },
  {
    id: 'q_sop_01',
    sequence: 24,
    textEn: 'Have invigilators been briefed on UPSSSC PET SOP and duty roster assigned (2 per 24 candidates)?',
    textHi: 'क्या कक्ष निरीक्षकों को आयोग की एसओपी ब्रीफ की गई तथा ड्यूटी रोस्टर तैयार कर लिया गया है?',
    categoryEn: 'Staff Briefing & SOP',
    categoryHi: 'स्टाफ ब्रीफिंग व रोस्टर',
    helperEn: 'Standard invigilator to candidate ratio 2:24.',
    helperHi: 'प्रति 24 अभ्यर्थियों पर 2 कक्ष निरीक्षकों का मानक अनुपात।',
    isActive: true
  },
  {
    id: 'q_sop_02',
    sequence: 25,
    textEn: 'Are statutory warning notices (UP Public Examination Anti-Cheating Act) displayed at entry gate?',
    textHi: 'क्या मुख्य प्रवेश द्वार पर उ०प्र० सार्वजनिक परीक्षा (अनुचित साधन निवारण) अधिनियम के चेतावनी बोर्ड प्रदर्शित हैं?',
    categoryEn: 'Staff Briefing & SOP',
    categoryHi: 'स्टाफ ब्रीफिंग व रोस्टर',
    helperEn: 'Anti-cheating penalty banners detailing non-bailable clauses.',
    helperHi: 'कदाचार मुक्त परीक्षा हेतु दंडात्मक प्राविधानों का स्पष्ट प्रदर्शन।',
    isActive: true
  }
];
