import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Stage, CivilizationStats, ChoiceResult, ApiResponse } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stagesDataPath = path.join(__dirname, '../data/stages.json');

let stagesCache: Stage[] | null = null;

function loadStages(): Stage[] {
  if (stagesCache) {
    return stagesCache;
  }
  const rawData = fs.readFileSync(stagesDataPath, 'utf-8');
  stagesCache = JSON.parse(rawData) as Stage[];
  return stagesCache;
}

export function getAllStages(): ApiResponse<Stage[]> {
  try {
    const stages = loadStages();
    return { success: true, data: stages };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load stages',
    };
  }
}

export function getStageById(id: string): ApiResponse<Stage> {
  try {
    const stages = loadStages();
    const stage = stages.find((s) => s.id === id);
    if (!stage) {
      return { success: false, error: `Stage with id ${id} not found` };
    }
    return { success: true, data: stage };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load stage',
    };
  }
}

export function getInitialStats(): CivilizationStats {
  return {
    population: 10,
    technology: 5,
    culture: 5,
    military: 5,
    agriculture: 0,
  };
}

export function processChoice(
  stageId: string,
  choiceId: string,
  currentStats: CivilizationStats
): ApiResponse<ChoiceResult> {
  try {
    const stages = loadStages();
    const currentStage = stages.find((s) => s.id === stageId);

    if (!currentStage) {
      return { success: false, error: `Stage with id ${stageId} not found` };
    }

    const choice = currentStage.choices.find((c) => c.id === choiceId);

    if (!choice) {
      return { success: false, error: `Choice with id ${choiceId} not found` };
    }

    const newStats: CivilizationStats = { ...currentStats };

    Object.entries(choice.effects).forEach(([key, value]) => {
      if (value !== undefined) {
        const statKey = key as keyof CivilizationStats;
        newStats[statKey] = Math.max(0, newStats[statKey] + value);
      }
    });

    let nextStage: Stage | null = null;
    if (choice.nextStageId !== 'complete') {
      nextStage = stages.find((s) => s.id === choice.nextStageId) || null;
      if (nextStage) {
        Object.entries(nextStage.startingStats).forEach(([key, value]) => {
          if (value !== undefined) {
            const statKey = key as keyof CivilizationStats;
            newStats[statKey] = Math.max(0, newStats[statKey] + value);
          }
        });
      }
    }

    return {
      success: true,
      data: {
        nextStage,
        newStats,
        flavorText: choice.flavorText,
        effects: choice.effects,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process choice',
    };
  }
}

export function resetCivilization(): ApiResponse<{
  currentStage: Stage;
  initialStats: CivilizationStats;
}> {
  try {
    const stages = loadStages();
    const firstStage = stages[0];
    const initialStats = getInitialStats();

    return {
      success: true,
      data: {
        currentStage: firstStage,
        initialStats,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset civilization',
    };
  }
}
