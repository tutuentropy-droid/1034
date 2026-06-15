import express from 'express';
import {
  getAllKnowledgeNodes,
  getKnowledgeNodeById,
  getAllTags,
  getQuizzesByNodeId,
  submitQuizAnswers,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  getKnowledgeGraph,
  getUserId,
} from '../services/encyclopediaService.js';
import type { QuizSubmission } from '../../shared/types.js';

const router = express.Router();

router.get('/nodes', (req, res) => {
  const tagFilter = req.query.tag as string | undefined;
  const result = getAllKnowledgeNodes(tagFilter);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

router.get('/nodes/:id', (req, res) => {
  const result = getKnowledgeNodeById(req.params.id);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/tags', (_req, res) => {
  const result = getAllTags();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

router.get('/quizzes/:nodeId', (req, res) => {
  const result = getQuizzesByNodeId(req.params.nodeId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

router.post('/quizzes/submit', (req, res) => {
  const { submissions } = req.body as { submissions: QuizSubmission[] };
  if (!submissions || !Array.isArray(submissions)) {
    res.status(400).json({
      success: false,
      error: 'Missing required field: submissions (array)',
    });
    return;
  }
  const result = submitQuizAnswers(submissions);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.get('/favorites', (req, res) => {
  const userId = getUserId(req);
  const result = getUserFavorites(userId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

router.post('/favorites/:nodeId', (req, res) => {
  const userId = getUserId(req);
  const result = addFavorite(userId, req.params.nodeId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.delete('/favorites/:nodeId', (req, res) => {
  const userId = getUserId(req);
  const result = removeFavorite(userId, req.params.nodeId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.get('/graph', (_req, res) => {
  const result = getKnowledgeGraph();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

export default router;
