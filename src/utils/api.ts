import type {
  Stage,
  CivilizationStats,
  ChoiceResult,
  ResetResult,
  ApiResponse,
  HistoricalEvent,
  EventTriggerResponse,
  EventResolveResponse,
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

export async function triggerEvent(
  stats: CivilizationStats,
  currentEra: string
): Promise<EventTriggerResponse> {
  return fetchJson<EventTriggerResponse>('/events/trigger', {
    method: 'POST',
    body: JSON.stringify({ stats, currentEra }),
  });
}

export async function resolveEvent(
  eventId: string,
  choiceId: string,
  currentStats: CivilizationStats
): Promise<EventResolveResponse> {
  return fetchJson<EventResolveResponse>('/events/resolve', {
    method: 'POST',
    body: JSON.stringify({ eventId, choiceId, currentStats }),
  });
}

export async function checkEventTrigger(
  stats: CivilizationStats,
  currentEra: string
): Promise<ApiResponse<{ shouldTrigger: boolean; event?: HistoricalEvent; probability?: number }>> {
  return fetchJson<ApiResponse<{ shouldTrigger: boolean; event?: HistoricalEvent; probability?: number }>>('/events/check', {
    method: 'POST',
    body: JSON.stringify({ stats, currentEra }),
  });
}
