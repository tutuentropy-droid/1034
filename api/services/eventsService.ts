import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  HistoricalEvent,
  CivilizationStats,
  EventCondition,
  EventResult,
  EventTriggerResponse,
  EventResolveResponse,
} from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsDataPath = path.join(__dirname, '../data/events.json');

let eventsCache: HistoricalEvent[] | null = null;

function loadEvents(): HistoricalEvent[] {
  if (eventsCache) {
    return eventsCache;
  }
  const rawData = fs.readFileSync(eventsDataPath, 'utf-8');
  eventsCache = JSON.parse(rawData) as HistoricalEvent[];
  return eventsCache;
}

export function evaluateCondition(
  condition: EventCondition,
  stats: CivilizationStats,
  currentEra: string
): boolean {
  switch (condition.type) {
    case 'stat_above':
      if (!condition.stat || condition.value === undefined) return false;
      return stats[condition.stat] > condition.value;
    case 'stat_below':
      if (!condition.stat || condition.value === undefined) return false;
      return stats[condition.stat] < condition.value;
    case 'stat_between':
      if (!condition.stat || condition.min === undefined || condition.max === undefined) return false;
      return stats[condition.stat] >= condition.min && stats[condition.stat] <= condition.max;
    case 'era_is':
      if (!condition.era) return false;
      return currentEra === condition.era;
    case 'era_not':
      if (!condition.era) return false;
      return currentEra !== condition.era;
    case 'random_chance':
      if (!condition.chance) return false;
      return Math.random() < condition.chance;
    default:
      return false;
  }
}

export function evaluateAllConditions(
  conditions: EventCondition[],
  stats: CivilizationStats,
  currentEra: string
): boolean {
  return conditions.every((condition) => evaluateCondition(condition, stats, currentEra));
}

export function calculateEventProbability(
  event: HistoricalEvent,
  stats: CivilizationStats
): number {
  let probability = event.baseProbability;

  event.conditions.forEach((condition) => {
    if (condition.type === 'stat_below' && condition.stat && condition.value !== undefined) {
      const diff = condition.value - stats[condition.stat];
      if (diff > 0) {
        probability += diff * 0.01;
      }
    }
    if (condition.type === 'stat_above' && condition.stat && condition.value !== undefined) {
      const diff = stats[condition.stat] - condition.value;
      if (diff > 0) {
        probability += diff * 0.005;
      }
    }
  });

  return Math.min(0.9, Math.max(0.05, probability));
}

export function getEligibleEvents(
  stats: CivilizationStats,
  currentEra: string
): { event: HistoricalEvent; probability: number }[] {
  const events = loadEvents();
  
  return events
    .filter((event) => {
      if (!event.era.includes(currentEra)) return false;
      return evaluateAllConditions(event.conditions, stats, currentEra);
    })
    .map((event) => ({
      event,
      probability: calculateEventProbability(event, stats),
    }));
}

export function triggerRandomEvent(
  stats: CivilizationStats,
  currentEra: string
): EventTriggerResponse {
  try {
    const eligibleEvents = getEligibleEvents(stats, currentEra);

    if (eligibleEvents.length === 0) {
      return {
        success: false,
        error: 'No eligible events available',
      };
    }

    const totalWeight = eligibleEvents.reduce((sum, ep) => sum + ep.probability, 0);
    let random = Math.random() * totalWeight;

    for (const ep of eligibleEvents) {
      random -= ep.probability;
      if (random <= 0) {
        return {
          success: true,
          data: {
            event: ep.event,
            probability: ep.probability,
          },
        };
      }
    }

    const firstEvent = eligibleEvents[0];
    return {
      success: true,
      data: {
        event: firstEvent.event,
        probability: firstEvent.probability,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger event',
    };
  }
}

export function resolveEventChoice(
  eventId: string,
  choiceId: string,
  currentStats: CivilizationStats
): EventResolveResponse {
  try {
    const events = loadEvents();
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      return { success: false, error: `Event with id ${eventId} not found` };
    }

    const choice = event.choices.find((c) => c.id === choiceId);

    if (!choice) {
      return { success: false, error: `Choice with id ${choiceId} not found` };
    }

    if (choice.requirements && !evaluateAllConditions(choice.requirements, currentStats, '')) {
      return { success: false, error: 'Choice requirements not met' };
    }

    const newStats: CivilizationStats = { ...currentStats };

    Object.entries(choice.effects).forEach(([key, value]) => {
      if (value !== undefined) {
        const statKey = key as keyof CivilizationStats;
        newStats[statKey] = Math.max(0, newStats[statKey] + value);
      }
    });

    const result: EventResult = {
      event,
      choice,
      newStats,
      effects: choice.effects,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resolve event choice',
    };
  }
}

export function checkEventTrigger(
  stats: CivilizationStats,
  currentEra: string
): { shouldTrigger: boolean; event?: HistoricalEvent; probability?: number } {
  const eligibleEvents = getEligibleEvents(stats, currentEra);

  if (eligibleEvents.length === 0) {
    return { shouldTrigger: false };
  }

  for (const ep of eligibleEvents) {
    if (Math.random() < ep.probability) {
      return {
        shouldTrigger: true,
        event: ep.event,
        probability: ep.probability,
      };
    }
  }

  return { shouldTrigger: false };
}
