import type {
  Stage,
  CivilizationStats,
  ChoiceResult,
  ResetResult,
  ApiResponse,
  HistoricalEvent,
  EventTriggerResponse,
  EventResolveResponse,
  KnowledgeNode,
  Tag,
  QuizQuestion,
  QuizSubmission,
  QuizResult,
  UserFavorite,
  KnowledgeGraph,
  EncyclopediaListResponse,
  EncyclopediaNodeResponse,
  TagsResponse,
  QuizResponse,
  QuizSubmitResponse,
  FavoritesResponse,
  GraphResponse,
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

export async function fetchAllKnowledgeNodes(tagFilter?: string): Promise<EncyclopediaListResponse> {
  const url = tagFilter ? `/encyclopedia/nodes?tag=${encodeURIComponent(tagFilter)}` : '/encyclopedia/nodes';
  return fetchJson<EncyclopediaListResponse>(url);
}

export async function fetchKnowledgeNodeById(id: string): Promise<EncyclopediaNodeResponse> {
  return fetchJson<EncyclopediaNodeResponse>(`/encyclopedia/nodes/${id}`);
}

export async function fetchAllTags(): Promise<TagsResponse> {
  return fetchJson<TagsResponse>('/encyclopedia/tags');
}

export async function fetchQuizzesByNodeId(nodeId: string): Promise<QuizResponse> {
  return fetchJson<QuizResponse>(`/encyclopedia/quizzes/${nodeId}`);
}

export async function submitQuizAnswers(submissions: QuizSubmission[]): Promise<QuizSubmitResponse> {
  return fetchJson<QuizSubmitResponse>('/encyclopedia/quizzes/submit', {
    method: 'POST',
    body: JSON.stringify({ submissions }),
  });
}

export async function fetchUserFavorites(): Promise<FavoritesResponse> {
  return fetchJson<FavoritesResponse>('/encyclopedia/favorites');
}

export async function addFavorite(nodeId: string): Promise<FavoritesResponse> {
  return fetchJson<FavoritesResponse>(`/encyclopedia/favorites/${nodeId}`, {
    method: 'POST',
  });
}

export async function removeFavorite(nodeId: string): Promise<FavoritesResponse> {
  return fetchJson<FavoritesResponse>(`/encyclopedia/favorites/${nodeId}`, {
    method: 'DELETE',
  });
}

export async function fetchKnowledgeGraph(): Promise<GraphResponse> {
  return fetchJson<GraphResponse>('/encyclopedia/graph');
}
