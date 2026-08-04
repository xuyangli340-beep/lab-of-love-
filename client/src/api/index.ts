import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  UserProfile,
  InterviewRecord,
  InterviewAnswer,
  EvidenceItem,
  EvidenceStats,
  PreferenceFactor,
  IdealPortrait,
  CandidateResult,
  TeamSelection,
  WizardProgress,
  AuthRegisterRequest,
  AuthLoginRequest,
  AuthResponse,
} from '@shared/api.interface';

const request = async <T>(url: string, method: string, data?: unknown): Promise<T> => {
  try {
    const response = await axiosForBackend({ url, method, data });
    return response.data as T;
  } catch (error) {
    logger.error(`API request failed: ${url}`, String(error));
    throw error;
  }
};

export const authApi = {
  register: (data: AuthRegisterRequest) =>
    request<AuthResponse>('/api/auth/register', 'POST', data),
  login: (data: AuthLoginRequest) =>
    request<AuthResponse>('/api/auth/login', 'POST', data),
  logout: () => request<{ success: boolean }>('/api/auth/logout', 'POST'),
  resetPasswordRequest: (email: string) =>
    request<{ success: boolean }>('/api/auth/reset-password/request', 'POST', { email }),
  resetPasswordConfirm: (token: string, newPassword: string) =>
    request<{ success: boolean }>('/api/auth/reset-password/confirm', 'POST', { token, newPassword }),
};

export const userProfileApi = {
  get: () => request<UserProfile>('/api/user-profile', 'GET'),
  update: (data: Partial<UserProfile>) =>
    request<{ success: boolean; profile: UserProfile }>('/api/user-profile', 'PATCH', data),
};

export const interviewApi = {
  getCurrent: () => request<InterviewRecord>('/api/interview/current', 'GET'),
  create: () => request<{ id: string; status: string }>('/api/interview', 'POST'),
  getAnswers: () =>
    request<{ items: InterviewAnswer[] }>('/api/interview/answers', 'GET'),
  updateAnswer: (id: string, data: Partial<InterviewAnswer>) =>
    request<{ success: boolean; answer: InterviewAnswer }>(
      `/api/interview/answers/${id}`,
      'PATCH',
      data,
    ),
};

export const evidenceApi = {
  getList: () => request<{ items: EvidenceItem[] }>('/api/evidence', 'GET'),
  create: (data: Omit<EvidenceItem, 'id' | 'interviewRecordId'>) =>
    request<{ id: string; success: boolean }>('/api/evidence', 'POST', data),
  batchCreate: (items: Omit<EvidenceItem, 'id' | 'interviewRecordId'>[]) =>
    request<{ success: boolean; count: number }>('/api/evidence/batch', 'POST', { items }),
  getStats: () => request<EvidenceStats>('/api/evidence/stats', 'GET'),
};

export const preferenceApi = {
  getList: () => request<{ items: PreferenceFactor[] }>('/api/preference-factors', 'GET'),
  update: (id: string, data: Partial<PreferenceFactor>) =>
    request<{ success: boolean; factor: PreferenceFactor }>(
      `/api/preference-factors/${id}`,
      'PATCH',
      data,
    ),
  create: (data: Omit<PreferenceFactor, 'id' | 'userProfileId'>) =>
    request<{ id: string; success: boolean }>('/api/preference-factors', 'POST', data),
  remove: (id: string) =>
    request<{ success: boolean }>(`/api/preference-factors/${id}`, 'DELETE'),
};

export const portraitApi = {
  get: () => request<IdealPortrait>('/api/ideal-portrait', 'GET'),
  generate: () =>
    request<{ id: string; portrait: IdealPortrait }>('/api/ideal-portrait/generate', 'POST'),
  submitRating: (rating: number) =>
    request<{ success: boolean }>('/api/ideal-portrait/rating', 'PATCH', { rating }),
  submitFeedback: (feedback: string) =>
    request<{ success: boolean }>('/api/ideal-portrait/feedback', 'PATCH', { feedback }),
};

export const candidateApi = {
  get: () => request<CandidateResult>('/api/candidate-results', 'GET'),
  save: (poolSize: number, resultsJson: string) =>
    request<{ id: string; success: boolean }>('/api/candidate-results', 'POST', {
      poolSize,
      resultsJson,
    }),
  select: (candidateId: string) =>
    request<{ success: boolean }>('/api/candidate-results/select', 'PATCH', { candidateId }),
};

export const teamApi = {
  getSelections: () =>
    request<{ items: TeamSelection[] }>('/api/team-selections', 'GET'),
  save: (role: string, staffName: string, staffInfo: string) =>
    request<{ id: string; success: boolean }>('/api/team-selections', 'POST', {
      role,
      staffName,
      staffInfo,
    }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/api/team-selections/${id}`, 'DELETE'),
};

export const wizardApi = {
  getProgress: () => request<WizardProgress>('/api/wizard/progress', 'GET'),
};
