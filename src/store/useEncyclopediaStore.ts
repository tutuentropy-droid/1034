import { create } from 'zustand';
import type {
  KnowledgeNode,
  Tag,
  QuizQuestion,
  QuizResult,
  UserFavorite,
  KnowledgeGraph,
  QuizSubmission,
} from '../types';
import {
  fetchAllKnowledgeNodes,
  fetchKnowledgeNodeById,
  fetchAllTags,
  fetchQuizzesByNodeId,
  submitQuizAnswers,
  fetchUserFavorites,
  addFavorite,
  removeFavorite,
  fetchKnowledgeGraph,
} from '../utils/api';

interface EncyclopediaStore {
  nodes: KnowledgeNode[];
  tags: Tag[];
  currentNode: KnowledgeNode | null;
  quizzes: QuizQuestion[];
  quizResults: QuizResult[];
  favorites: UserFavorite[];
  graph: KnowledgeGraph | null;
  selectedTag: string | null;
  isLoading: boolean;
  error: string | null;
  currentView: 'home' | 'node' | 'graph' | 'favorites';
  selectedNodeId: string | null;
  showQuiz: boolean;

  init: () => Promise<void>;
  loadNodes: (tagFilter?: string) => Promise<void>;
  loadNode: (id: string) => Promise<void>;
  loadTags: () => Promise<void>;
  loadQuizzes: (nodeId: string) => Promise<void>;
  submitQuiz: (submissions: QuizSubmission[]) => Promise<void>;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (nodeId: string) => Promise<void>;
  isFavorite: (nodeId: string) => boolean;
  loadGraph: () => Promise<void>;
  setSelectedTag: (tagId: string | null) => void;
  setCurrentView: (view: 'home' | 'node' | 'graph' | 'favorites') => void;
  setSelectedNodeId: (id: string | null) => void;
  setShowQuiz: (show: boolean) => void;
  clearQuizResults: () => void;
  goBack: () => void;
}

export const useEncyclopediaStore = create<EncyclopediaStore>((set, get) => ({
  nodes: [],
  tags: [],
  currentNode: null,
  quizzes: [],
  quizResults: [],
  favorites: [],
  graph: null,
  selectedTag: null,
  isLoading: false,
  error: null,
  currentView: 'home',
  selectedNodeId: null,
  showQuiz: false,

  init: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([get().loadNodes(), get().loadTags(), get().loadFavorites()]);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadNodes: async (tagFilter?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchAllKnowledgeNodes(tagFilter);
      if (response.success && response.data) {
        set({ nodes: response.data, selectedTag: tagFilter || null });
      } else {
        throw new Error(response.error || 'Failed to load nodes');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load nodes',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadNode: async (id: string) => {
    set({ isLoading: true, error: null, showQuiz: false, quizResults: [] });
    try {
      const response = await fetchKnowledgeNodeById(id);
      if (response.success && response.data) {
        set({
          currentNode: response.data,
          selectedNodeId: id,
          currentView: 'node',
        });
        await get().loadQuizzes(id);
      } else {
        throw new Error(response.error || 'Failed to load node');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load node',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadTags: async () => {
    try {
      const response = await fetchAllTags();
      if (response.success && response.data) {
        set({ tags: response.data });
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  },

  loadQuizzes: async (nodeId: string) => {
    try {
      const response = await fetchQuizzesByNodeId(nodeId);
      if (response.success && response.data) {
        set({ quizzes: response.data });
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    }
  },

  submitQuiz: async (submissions: QuizSubmission[]) => {
    set({ isLoading: true });
    try {
      const response = await submitQuizAnswers(submissions);
      if (response.success && response.data) {
        set({ quizResults: response.data });
      } else {
        throw new Error(response.error || 'Failed to submit quiz');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit quiz',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadFavorites: async () => {
    try {
      const response = await fetchUserFavorites();
      if (response.success && response.data) {
        set({ favorites: response.data });
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  },

  toggleFavorite: async (nodeId: string) => {
    try {
      const isFav = get().isFavorite(nodeId);
      const response = isFav
        ? await removeFavorite(nodeId)
        : await addFavorite(nodeId);
      if (response.success && response.data) {
        set({ favorites: response.data });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  },

  isFavorite: (nodeId: string) => {
    return get().favorites.some(f => f.knowledgeNodeId === nodeId);
  },

  loadGraph: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchKnowledgeGraph();
      if (response.success && response.data) {
        set({ graph: response.data, currentView: 'graph' });
      } else {
        throw new Error(response.error || 'Failed to load graph');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load graph',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedTag: (tagId: string | null) => {
    set({ selectedTag: tagId });
    get().loadNodes(tagId || undefined);
  },

  setCurrentView: (view: 'home' | 'node' | 'graph' | 'favorites') => {
    set({ currentView: view, showQuiz: false, quizResults: [] });
    if (view === 'home') {
      set({ selectedNodeId: null, currentNode: null });
    }
  },

  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  setShowQuiz: (show: boolean) => {
    if (!show) {
      set({ showQuiz: false, quizResults: [] });
    } else {
      set({ showQuiz: true });
    }
  },

  clearQuizResults: () => {
    set({ quizResults: [] });
  },

  goBack: () => {
    const { currentView } = get();
    if (currentView === 'node') {
      set({
        currentView: 'home',
        currentNode: null,
        selectedNodeId: null,
        showQuiz: false,
        quizResults: [],
      });
    } else if (currentView === 'graph' || currentView === 'favorites') {
      set({ currentView: 'home' });
    }
  },
}));
