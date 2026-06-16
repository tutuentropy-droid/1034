import type { WorldState, TurnEvent } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { ScrollText, Swords, Handshake, TrendingUp, Sparkles, MapPin, Shield, FlaskConical, BookOpen, Wheat, Sword } from 'lucide-react';

interface TurnEventsPanelProps {
  worldState: WorldState;
}

const EVENT_ICONS: Record<string, any> = {
  expand_territory: MapPin,
  build_military: Sword,
  develop_technology: FlaskConical,
  develop_culture: BookOpen,
  develop_agriculture: Wheat,
  trade: TrendingUp,
  declare_war: Swords,
  battle: Swords,
  propose_alliance: Handshake,
  diplomacy: Handshake,
  spread_culture: Sparkles,
  culture_spread: Sparkles,
  defense: Shield,
};

const EVENT_COLORS: Record<string, string> = {
  expand_territory: 'text-emerald-600 bg-emerald-50',
  build_military: 'text-red-600 bg-red-50',
  develop_technology: 'text-blue-600 bg-blue-50',
  develop_culture: 'text-purple-600 bg-purple-50',
  develop_agriculture: 'text-amber-600 bg-amber-50',
  trade: 'text-yellow-600 bg-yellow-50',
  declare_war: 'text-orange-600 bg-orange-50',
  battle: 'text-red-700 bg-red-100',
  propose_alliance: 'text-green-600 bg-green-50',
  diplomacy: 'text-green-600 bg-green-50',
  spread_culture: 'text-pink-600 bg-pink-50',
  culture_spread: 'text-pink-600 bg-pink-50',
  defense: 'text-slate-600 bg-slate-50',
};

export function TurnEventsPanel({ worldState }: TurnEventsPanelProps) {
  const { selectCivilization, worldState: currentState } = useWorldStore();

  const currentTurn = worldState.turn - 1;
  const turnEvents = worldState.turnEvents.filter((e) => e.turn === currentTurn);
  const recentEvents = [...worldState.turnEvents].reverse().slice(0, 30);

  const getCivColor = (civId: string): string => {
    const civ = worldState.civilizations.find((c) => c.id === civId);
    return civ?.color || '#64748B';
  };

  const getCivName = (civId: string): string => {
    const civ = worldState.civilizations.find((c) => c.id === civId);
    return civ?.name || civId;
  };

  const handleCivClick = (civId: string) => {
    const civ = currentState?.civilizations.find((c) => c.id === civId);
    if (civ) {
      selectCivilization(civ);
    }
  };

  const formatEvent = (event: TurnEvent) => {
    const Icon = EVENT_ICONS[event.type] || ScrollText;
    const colorClass = EVENT_COLORS[event.type] || 'text-slate-600 bg-slate-50';

    const parts = event.description.split(/(向|与|和)/);
    if (parts.length > 1) {
      return (
        <span>
          {parts[0]}
          {parts[1]}
          {event.targetId && (
            <button
              onClick={() => handleCivClick(event.targetId!)}
              className="font-semibold hover:underline cursor-pointer"
              style={{ color: getCivColor(event.targetId) }}
            >
              {getCivName(event.targetId)}
            </button>
          )}
          {parts.slice(2).join('')}
        </span>
      );
    }

    return (
      <span>
        <button
          onClick={() => handleCivClick(event.actorId)}
          className="font-semibold hover:underline cursor-pointer"
          style={{ color: getCivColor(event.actorId) }}
        >
          {getCivName(event.actorId)}
        </button>
        {event.description.replace(getCivName(event.actorId), '')}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-indigo-500" />
          历史记录
        </h3>
        <div className="text-sm text-slate-600">
          共 <span className="font-bold">{worldState.turnEvents.length}</span> 条记录
        </div>
      </div>

      {turnEvents.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            本回合事件 (第 {currentTurn} 回合)
          </h4>
          <div className="space-y-2">
            {turnEvents.map((event) => {
              const Icon = EVENT_ICONS[event.type] || ScrollText;
              const colorClass = EVENT_COLORS[event.type] || 'text-slate-600 bg-slate-50';
              return (
                <div
                  key={event.id}
                  className={`p-3 rounded-xl ${colorClass.split(' ')[1]} border border-slate-100`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${colorClass.split(' ')[0]} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {formatEvent(event)}
                      </p>
                      {event.effects.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {event.effects.map((effect, idx) => (
                            <div key={idx} className="text-xs bg-white/60 px-2 py-1 rounded-md">
                              <span style={{ color: getCivColor(effect.civilizationId) }} className="font-medium">
                                {getCivName(effect.civilizationId)}
                              </span>
                              <span className="text-slate-500 ml-1">
                                {Object.entries(effect.stats)
                                  .map(([key, value]) => `${value > 0 ? '+' : ''}${value}`)
                                  .join(', ')}
                              </span>
                              {effect.territoryGained && effect.territoryGained.length > 0 && (
                                <span className="text-green-600 ml-1">
                                  +{effect.territoryGained.length}领土
                                </span>
                              )}
                              {effect.territoryLost && effect.territoryLost.length > 0 && (
                                <span className="text-red-600 ml-1">
                                  -{effect.territoryLost.length}领土
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">近期历史</h4>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
          {recentEvents.map((event) => {
            const Icon = EVENT_ICONS[event.type] || ScrollText;
            return (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-sm group"
              >
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3 h-3 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 truncate">{formatEvent(event)}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  第{event.turn}回合
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
