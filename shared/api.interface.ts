export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserProfile {
  id: string;
  nickname: string;
  gender: string;
  age: number;
  occupation: string;
  workCity: string;
  settleCity: string;
  hometown: string;
  familyCity: string;
  height: number;
  weight: number;
  annualIncome: string;
  workNature: string;
  maritalStatus: string;
  loveExperience: string;
  mbti: string;
  zodiac: string;
  selfTags: string[];
  hobbies: string[];
  targetGender: string;
  targetAgeMin: number;
  targetAgeMax: number;
  targetHeightMin: number;
  targetHeightMax: number;
  minEducation: string;
  undergradSchoolPref: string;
  masterSchoolPref: string;
  overseasPref: string;
  regionMode: string;
  incomeRequirement: string;
  marriagePlan: string;
  stylePreference: string;
  highestEducation: string;
  undergradSchool: string;
  undergradSchoolTier: string;
  undergradMajor: string;
  masterSchool: string;
  masterSchoolTier: string;
  masterMajor: string;
  phdSchool: string;
  phdSchoolTier: string;
  phdResearch: string;
}

export interface InterviewRecord {
  id: string;
  userProfileId: string;
  fullTranscript: string;
  audioUrl: string;
  status: string;
  createdAt: string;
}

export interface InterviewAnswer {
  id: string;
  interviewRecordId: string;
  moduleIndex: number;
  questionIndex: number;
  questionText: string;
  answerText: string;
  status: 'answered' | 'skipped' | 'pending_followup' | 'unanswered';
}

export interface EvidenceItem {
  id: string;
  interviewRecordId: string;
  factorName: string;
  evidenceMeaning: string;
  evidenceStrength: number;
  isHardConstraint: boolean;
  isHighPriority: boolean;
  isTradeoffEvidence: boolean;
  originalQuotes: string[];
  tags: string[];
  followupQuestions: string[];
}

export interface EvidenceStats {
  factorCount: number;
  evidenceCount: number;
  hardConstraintCount: number;
  tradeoffCount: number;
}

export interface PreferenceFactor {
  id: string;
  userProfileId: string;
  factorName: string;
  weight: number;
  isHardConstraint: boolean;
  isCustom: boolean;
}

export interface IdealPortrait {
  id: string;
  userProfileId: string;
  title: string;
  summary: string;
  tags: string[];
  heartScoreMin: number;
  heartScoreMax: number;
  stabilityScoreMin: number;
  stabilityScoreMax: number;
  reachabilityScoreMin: number;
  reachabilityScoreMax: number;
  userRating: number;
  userFeedback: string;
}

export interface Candidate {
  id: string;
  rank: number;
  name: string;
  age: number;
  height: number;
  city: string;
  occupation: string;
  undergradSchool: string;
  undergradTier: string;
  masterSchool: string;
  masterTier: string;
  hasOverseasExperience: boolean;
  income: string;
  style: string;
  mbti: string;
  incomeRange: string;
  matchScore: number;
  evidenceConfidence: number;
  matchReason: string;
  keyAdvantages: string[];
  majorTradeoffs: string[];
}

export interface CandidateResult {
  id: string;
  userProfileId: string;
  poolSize: number;
  resultsJson: string;
  selectedCandidateId: string;
}

export interface TeamSelection {
  id: string;
  userProfileId: string;
  role: string;
  staffName: string;
  staffInfo: string;
}

export interface StaffMember {
  id: string;
  name: string;
  education: string;
  experience: string;
  specialties: string[];
  trackRecord: string;
  role: string;
}

export interface WizardProgress {
  profileCompleted: boolean;
  interviewCompleted: boolean;
  modelCompleted: boolean;
  portraitCompleted: boolean;
  candidatesCompleted: boolean;
  teamCompleted: boolean;
  currentStep: number;
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    nickname: string;
  };
}
