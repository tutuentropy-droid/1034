import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  KnowledgeNode,
  Tag,
  QuizQuestion,
  QuizSubmission,
  QuizResult,
  UserFavorite,
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  ApiResponse,
} from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodesDataPath = path.join(__dirname, '../data/knowledgeNodes.json');
const tagsDataPath = path.join(__dirname, '../data/tags.json');
const quizzesDataPath = path.join(__dirname, '../data/quizzes.json');

let nodesCache: KnowledgeNode[] | null = null;
let tagsCache: Tag[] | null = null;
let quizzesCache: QuizQuestion[] | null = null;
const favoritesStore: Map<string, UserFavorite[]> = new Map();

function loadKnowledgeNodes(): KnowledgeNode[] {
  if (nodesCache) return nodesCache;
  const rawData = fs.readFileSync(nodesDataPath, 'utf-8');
  nodesCache = JSON.parse(rawData) as KnowledgeNode[];
  return nodesCache;
}

function loadTags(): Tag[] {
  if (tagsCache) return tagsCache;
  const rawData = fs.readFileSync(tagsDataPath, 'utf-8');
  tagsCache = JSON.parse(rawData) as Tag[];
  return tagsCache;
}

function loadQuizzes(): QuizQuestion[] {
  if (quizzesCache) return quizzesCache;
  const rawData = fs.readFileSync(quizzesDataPath, 'utf-8');
  quizzesCache = JSON.parse(rawData) as QuizQuestion[];
  return quizzesCache;
}

function getUserId(req: { headers?: Record<string, string | string[] | undefined> }): string {
  const headerValue = req.headers?.['x-user-id'];
  if (Array.isArray(headerValue)) {
    return headerValue[0] || 'anonymous';
  }
  return headerValue || 'anonymous';
}

export function getAllKnowledgeNodes(tagFilter?: string): ApiResponse<KnowledgeNode[]> {
  try {
    const nodes = loadKnowledgeNodes();
    const filtered = tagFilter ? nodes.filter(n => n.tags.includes(tagFilter)) : nodes;
    return { success: true, data: filtered };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load knowledge nodes',
    };
  }
}

export function getKnowledgeNodeById(id: string): ApiResponse<KnowledgeNode> {
  try {
    const nodes = loadKnowledgeNodes();
    const node = nodes.find(n => n.id === id);
    if (!node) {
      return { success: false, error: `Knowledge node with id ${id} not found` };
    }
    return { success: true, data: node };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load knowledge node',
    };
  }
}

export function getAllTags(): ApiResponse<Tag[]> {
  try {
    const tags = loadTags();
    return { success: true, data: tags };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load tags',
    };
  }
}

export function getQuizzesByNodeId(nodeId: string): ApiResponse<QuizQuestion[]> {
  try {
    const quizzes = loadQuizzes();
    const filtered = quizzes.filter(q => q.knowledgeNodeId === nodeId);
    return { success: true, data: filtered };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load quizzes',
    };
  }
}

export function submitQuizAnswers(submissions: QuizSubmission[]): ApiResponse<QuizResult[]> {
  try {
    const quizzes = loadQuizzes();
    const quizMap = new Map(quizzes.map(q => [q.id, q]));

    const results: QuizResult[] = submissions.map(submission => {
      const quiz = quizMap.get(submission.questionId);
      if (!quiz) {
        return {
          questionId: submission.questionId,
          isCorrect: false,
          correctAnswerIndex: -1,
          explanation: '题目不存在',
        };
      }
      return {
        questionId: submission.questionId,
        isCorrect: submission.selectedAnswerIndex === quiz.correctAnswerIndex,
        correctAnswerIndex: quiz.correctAnswerIndex,
        explanation: quiz.explanation,
      };
    });

    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process quiz',
    };
  }
}

export function getUserFavorites(userId: string): ApiResponse<UserFavorite[]> {
  try {
    const favorites = favoritesStore.get(userId) || [];
    return { success: true, data: favorites };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load favorites',
    };
  }
}

export function addFavorite(userId: string, nodeId: string): ApiResponse<UserFavorite[]> {
  try {
    const favorites = favoritesStore.get(userId) || [];
    if (!favorites.find(f => f.knowledgeNodeId === nodeId)) {
      favorites.push({ knowledgeNodeId: nodeId, timestamp: Date.now() });
      favoritesStore.set(userId, favorites);
    }
    return { success: true, data: favorites };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add favorite',
    };
  }
}

export function removeFavorite(userId: string, nodeId: string): ApiResponse<UserFavorite[]> {
  try {
    const favorites = (favoritesStore.get(userId) || []).filter(
      f => f.knowledgeNodeId !== nodeId
    );
    favoritesStore.set(userId, favorites);
    return { success: true, data: favorites };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove favorite',
    };
  }
}

export function getKnowledgeGraph(): ApiResponse<KnowledgeGraph> {
  try {
    const nodes = loadKnowledgeNodes();
    const tags = loadTags();
    const tagMap = new Map(tags.map(t => [t.id, t]));

    const eraColors: Record<string, string> = {
      stoneAge: '#757575',
      agricultural: '#558B2F',
      imperial: '#4A148C',
      scientific: '#0D47A1',
    };

    const positions: Record<string, { x: number; y: number }> = {};
    const eras = ['stoneAge', 'agricultural', 'imperial', 'scientific'];
    const eraNodes: Record<string, KnowledgeNode[]> = {
      stoneAge: [],
      agricultural: [],
      imperial: [],
      scientific: [],
    };

    nodes.forEach(node => {
      if (eraNodes[node.eraColor]) {
        eraNodes[node.eraColor].push(node);
      }
    });

    eras.forEach((era, eraIndex) => {
      const nodesInEra = eraNodes[era];
      nodesInEra.forEach((node, nodeIndex) => {
        const total = nodesInEra.length;
        const angle = total > 1 ? (nodeIndex / total) * Math.PI * 2 : 0;
        const radius = 120;
        positions[node.id] = {
          x: 200 + eraIndex * 200 + Math.cos(angle) * radius,
          y: 250 + Math.sin(angle) * radius,
        };
      });
    });

    const graphNodes: GraphNode[] = nodes.map(node => {
      const pos = positions[node.id] || { x: 400, y: 250 };
      const primaryTag = node.tags[0] ? tagMap.get(node.tags[0]) : undefined;
      return {
        id: node.id,
        label: node.title.length > 8 ? node.title.slice(0, 8) + '…' : node.title,
        x: pos.x,
        y: pos.y,
        color: primaryTag?.color || eraColors[node.eraColor] || '#8B4513',
        size: 20 + (node.relatedNodes.length * 2),
        era: node.era,
      };
    });

    const edges: GraphEdge[] = [];
    const edgeSet = new Set<string>();

    nodes.forEach(node => {
      node.relatedNodes.forEach(relatedId => {
        const edgeKey = [node.id, relatedId].sort().join('-');
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          const relatedNode = nodes.find(n => n.id === relatedId);
          edges.push({
            source: node.id,
            target: relatedId,
            label: relatedNode ? '相关' : '',
          });
        }
      });
    });

    return {
      success: true,
      data: {
        nodes: graphNodes,
        edges,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate knowledge graph',
    };
  }
}

export { getUserId };
