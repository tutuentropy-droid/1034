import express from 'express';
import { processChoice, resetCivilization } from '../services/stagesService.js';
import type { CivilizationStats } from '../../shared/types.js';

const router = express.Router();

router.post('/choice', (req, res) => {
  const { stageId, choiceId, currentStats } = req.body as {
    stageId: string;
    choiceId: string;
    currentStats: CivilizationStats;
  };

  if (!stageId || !choiceId || !currentStats) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: stageId, choiceId, currentStats',
    });
    return;
  }

  const result = processChoice(stageId, choiceId, currentStats);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.get('/reset', (_req, res) => {
  const result = resetCivilization();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

export default router;
