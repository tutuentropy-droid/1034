import type {
  Stage,
  CivilizationStats,
  ChoiceResult,
  ResetResult,
  ApiResponse,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function fetchAllStages(): Promise<ApiResponse<Stage[]>> {
  return fetchJson<ApiResponse<Stage[]>>('/stages');
}

export async function fetchStageById(id: string): Promise<ApiResponse<Stage>> {
  return fetchJson<ApiResponse<Stage>>(`/stages/${id}`);
}

export async function submitChoice(
  stageId: string,
  choiceId: string,
  currentStats: CivilizationStats
): Promise<ApiResponse<ChoiceResult>> {
  return fetchJson<ApiResponse<ChoiceResult>>('/civilization/choice', {
    method: 'POST',
    body: JSON.stringify({ stageId, choiceId, currentStats }),
  });
}

export async function resetCivilization(): Promise<ApiResponse<ResetResult>> {
  return fetchJson<ApiResponse<ResetResult>>('/civilization/reset');
}
