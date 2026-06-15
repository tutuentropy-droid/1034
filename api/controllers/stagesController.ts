import express from 'express';
import { getAllStages, getStageById } from '../services/stagesService.js';

const router = express.Router();

router.get('/', (_req, res) => {
  const result = getAllStages();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

router.get('/:id', (req, res) => {
  const result = getStageById(req.params.id);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

export default router;
