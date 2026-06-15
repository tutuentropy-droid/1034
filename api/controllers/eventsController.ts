import express from 'express';
import { triggerRandomEvent, resolveEventChoice, checkEventTrigger } from '../services/eventsService.js';
import type { CivilizationStats } from '../../shared/types.js';

const router = express.Router();

router.post('/trigger', (req, res) => {
  const { stats, currentEra } = req.body as {
    stats: CivilizationStats;
    currentEra: string;
  };

  if (!stats || !currentEra) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: stats, currentEra',
    });
    return;
  }

  const result = triggerRandomEvent(stats, currentEra);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.post('/resolve', (req, res) => {
  const { eventId, choiceId, currentStats } = req.body as {
    eventId: string;
    choiceId: string;
    currentStats: CivilizationStats;
  };

  if (!eventId || !choiceId || !currentStats) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: eventId, choiceId, currentStats',
    });
    return;
  }

  const result = resolveEventChoice(eventId, choiceId, currentStats);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.post('/check', (req, res) => {
  const { stats, currentEra } = req.body as {
    stats: CivilizationStats;
    currentEra: string;
  };

  if (!stats || !currentEra) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: stats, currentEra',
    });
    return;
  }

  const result = checkEventTrigger(stats, currentEra);
  res.json({
    success: true,
    data: result,
  });
});

export default router;
