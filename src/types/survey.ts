export type Language = 'en' | 'hi';

export type SurveyStatus = 'not_started' | 'draft' | 'submitted' | 'approved' | 'escalated';

export interface CSOProfile {
  id: string;
  // Core required fields from Admin Excel upload
  districtName: string;
  csoName: string;
  registeredMobile: string; // Unique Login ID
  dutyCentreName: string;
  centreSeatingCapacity: number;

  // Compatibility & administrative extensions
  name: string;
  mobile: string;
  district: string;
  centreName: string;
  candidateCapacity: number;
  centreCode: string;
  tehsil?: string;
  designation?: string;
  department?: string;
  address?: string;
  totalRooms?: number;
  centreSuperintendent?: {
    name: string;
    mobile: string;
    institution: string;
  };
  staticMagistrate?: {
    name: string;
    mobile: string;
    designation: string;
  };
  nodalOfficer?: {
    name: string;
    mobile: string;
    office: string;
  };
}

export interface SurveyQuestion {
  id: string;
  sequence: number;
  textEn: string;
  textHi: string;
  categoryEn: string;
  categoryHi: string;
  helperEn?: string;
  helperHi?: string;
  optionsType?: 'YES_NO' | 'STAFF_DETAILS';
  isActive: boolean;
  assessmentId?: string; // Optional link to specific assessment
  createdAt?: string;
  updatedAt?: string;
}

export type AssessmentType = 'mock_day' | 'exam_day' | 'dry_run' | 'shift_audit' | 'custom';

export interface Assessment {
  id: string;
  title: string;
  titleHi?: string;
  type: AssessmentType;
  description?: string;
  descriptionHi?: string;
  examName: string;
  scheduledDate: string;
  shifts?: string;
  isActive: boolean;
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface PhotoEvidenceItem {
  id: string;
  slotKey: 'main_gate' | 'strong_room' | 'cctv_control' | 'exam_hall' | 'generator_set';
  labelEn: string;
  labelHi: string;
  descriptionEn: string;
  descriptionHi: string;
  required: boolean;
  imageData?: string; // base64 or object URL
  capturedAt?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  verified: boolean;
  notes?: string;
}

export interface DeficiencyItem {
  id: string;
  section: string;
  title: string;
  description: string;
  severity: 'critical' | 'moderate' | 'minor';
  reportedAt: string;
  rectificationDeadline: string; // e.g., '17:00 IST'
  responsiblePerson: string;
  status: 'pending' | 'resolved' | 'escalated_to_dm';
}

export interface SurveyFormData {
  // Step 1: Centre Verification
  centreCodeVerified: boolean;
  centreNameVerified: boolean;
  candidateCapacityConfirmed: number;
  totalRoomsReady: number;
  drinkingWaterReady: boolean;
  separateWashroomsClean: boolean;
  barrierFreeRampAvailable: boolean;
  wallClocksSynced: boolean;
  seatingPlanSanitized: boolean;

  // Step 2: Perimeter & Security Frisking
  boundaryWallIntact: boolean;
  policeGuardDeployed: boolean;
  policeArmedConstableCount: number;
  separateFemaleFriskingEnclosure: boolean;
  hhmdWorkingCount: number;
  dfmdFunctional: boolean;
  mobileJammerTested: boolean;
  jammersDropSignalConfirmed: boolean;
  cloakroomTokenSystemActive: boolean;

  // Step 3: CCTV Surveillance & Command Feed
  totalCCTVCount: number;
  allCCTVFunctional: boolean;
  nvrRecordingCapacityDays: number;
  cctvUninterruptedStrongRoomView: boolean;
  primaryISPProvider: string;
  primaryISPSpeedMbps: number;
  redundantBackupInternetReady: boolean;
  stateControlRoomHandshakeSuccess: boolean;
  controlRoomStreamFps: number;

  // Step 4: Strong Room & Paper Custody
  strongRoomDoubleLockVaultReady: boolean;
  dualKeyCustodyAgreed: boolean; // CSO + CS
  armedGuardAtStrongRoomDoor: boolean;
  fireExtinguisherInspected: boolean;
  strongRoomWindowSealed: boolean;
  strongRoomLogbookInitiated: boolean;

  // Step 5: Biometric & Attendence Drill
  biometricDevicesReceived: boolean;
  biometricDeviceCount: number;
  mockBiometricDrillConducted: boolean;
  sparePowerBanksCount: number;
  qrCodeDirectionPostersPasted: boolean;

  // Step 6: Power Backup & Technical Redundancy
  dgSetAvailable: boolean;
  dgCapacityKVA: number;
  dgTrialRunMinutes: number;
  dgFullLoadTestedWithoutTrip: boolean;
  dieselReserveLitres: number;
  inverterConnectedToCCTVAndServer: boolean;
  standbyElectricianName: string;
  standbyElectricianMobile: string;

  // Step 7: Staff Briefing & SOP Compliance
  invigilatorsBriefed: boolean;
  invigilatorDutyRosterGenerated: boolean;
  reserveStaffAssignedCount: number;
  emergencyHelplinesDisplayed: boolean;
  prohibitedItemsBannerDisplayed: boolean;

  // Step 8: CSO Final Assessment
  overallReadiness: 'fully_ready' | 'minor_defects_rectifying' | 'non_compliant';
  csoRemarks: string;
  csoSignatureName: string;
  csoDeclarationConfirmed: boolean;
  submissionTimestamp?: string;
  verificationHash?: string;
}

export interface SubmittedSurveyData {
  assessmentId?: string;
  assessmentTitle?: string;
  csoName: string;
  mobileNumber: string;
  district: string;
  centreName: string;
  seatingCapacity: number;
  examName: string;
  examDate: string;
  allQuestions: Array<{
    id: string;
    sequence: number;
    textEn: string;
    textHi: string;
    categoryEn: string;
  }>;
  responses: Record<string, 'YES' | 'NO'>;
  remarks: string;
  submissionDateTime: string;
  submissionTimestampIso: string;
}

export interface StaffEntry {
  name: string;
  mobile: string;
}

export interface SurveyRecord {
  id: string;
  assessmentId?: string;
  assessmentTitle?: string;
  csoProfile: CSOProfile;
  formData: SurveyFormData;
  // Dynamic question responses (Question ID -> 'YES' | 'NO')
  questionResponses: Record<string, 'YES' | 'NO'>;
  questionRemarks: Record<string, string>;
  // Staff details responses (Question ID -> StaffEntry[])
  staffResponses?: Record<string, StaffEntry[]>;
  photos: PhotoEvidenceItem[];
  deficiencies: DeficiencyItem[];
  status: SurveyStatus;
  updatedAt: string;
  submittedAt?: string;
  certificateId?: string;
  submissionData?: SubmittedSurveyData;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
}
