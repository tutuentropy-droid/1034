import React from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import GreatPersonCard from './GreatPersonCard';
import {
  GREAT_PERSON_TYPE_COLORS,
  GREAT_PERSON_TYPE_LABELS,
  GREAT_PERSON_ACTION_LABELS,
} from '../types';
import { Brain, Sword, FlaskConical, Church, Star, Clock, Crown, UserX, Skull, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import type { GreatPersonTimelineEvent, GreatPersonStatus } from '../../shared/types';

const GREAT_PERSON_ICONS: Record<string, React.ReactNode> = {
  thinker: <Brain className="w-5 h-5" />,
  conqueror: <Sword className="w-5 h-5" />,
  scientist: <FlaskConical className="w-5 h-5" />,
  religious_leader: <Church className="w-5 h-5" />,
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  arrival: <Star className="w-4 h-4" />,
  support: <Crown className="w-4 h-4" />,
  exile: <UserX className="w-4 h-4" />,
  assassinate: <Skull className="w-4 h-4" />,
  ignore: <Eye className="w-4 h-4" />,
  death: <Clock className="w-4 h-4" />,
};

const STATUS_COLORS: Record<GreatPersonStatus, string> = {
  active: 'bg-green-100 text-green-700',
  exiled: 'bg-amber-100 text-amber-700',
  assassinated: 'bg-red-100 text-red-700',
  ignored: 'bg-gray-100 text-gray-700',
  deceased: 'bg-purple-100 text-purple-700',
};

const STATUS_LABELS: Record<GreatPersonStatus, string> = {
  active: '活跃',
  exiled: '已流放',
  assassinated: '已遇刺',
  ignored: '被忽视',
  deceased: '已逝世',
};

interface GreatPersonTimelineProps {
  className?: string;
}

const GreatPersonTimeline: React.FC<GreatPersonTimelineProps> = ({ className = '' }) => {
  const { greatPersonHistory, timelineEvents, activeGreatPerson } = useCivilizationStore();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (greatPersonHistory.length === 0 && !activeGreatPerson) {
    return null;
  }

  const getEventsForPerson = (personId: string): GreatPersonTimelineEvent[] => {
    return timelineEvents.filter((e) => e.greatPersonId === personId).sort((a, b) => a.turn - b.turn);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-parchment-300 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
        <h2 className="font-serif font-bold text-xl text-white flex items-center gap-2">
          <Crown className="w-6 h-6" />
          伟人殿堂
        </h2>
        <p className="text-white/80 text-sm mt-1">影响文明发展的重要人物</p>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {activeGreatPerson && (
          <div className="border-2 border-gold-400 rounded-xl overflow-hidden bg-gold-50">
            <button
              onClick={() => toggleExpand('active')}
              className="w-full p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${GREAT_PERSON_TYPE_COLORS[activeGreatPerson.type]} flex items-center justify-center text-white`}
                  >
                    {GREAT_PERSON_ICONS[activeGreatPerson.type]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-ochre-800">
                        {activeGreatPerson.name}
                      </h3>
                      <span className="animate-pulse text-gold-600 text-xs font-medium">
                        ● 当前
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-gold-100 text-gold-700`}>
                        {GREAT_PERSON_TYPE_LABELS[activeGreatPerson.type]}
                      </span>
                      <span className="text-xs text-ochre-500">
                        {activeGreatPerson.title}
                      </span>
                    </div>
                  </div>
                </div>
                {expandedId === 'active' ? (
                  <ChevronUp className="w-5 h-5 text-ochre-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-ochre-400" />
                )}
              </div>
            </button>

            {expandedId === 'active' && (
              <div className="px-4 pb-4">
                <GreatPersonCard greatPerson={activeGreatPerson} showActions={false} compact />
              </div>
            )}
          </div>
        )}

        {greatPersonHistory
          .slice()
          .reverse()
          .map((person) => (
            <div
              key={person.id}
              className="border border-parchment-200 rounded-xl overflow-hidden bg-white hover:bg-parchment-50 transition-colors"
            >
              <button
                onClick={() => toggleExpand(person.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${GREAT_PERSON_TYPE_COLORS[person.type]} flex items-center justify-center text-white opacity-80`}
                    >
                      {GREAT_PERSON_ICONS[person.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-ochre-800">
                          {person.name}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[person.status]}`}>
                          {STATUS_LABELS[person.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-parchment-100 text-ochre-600">
                          {GREAT_PERSON_TYPE_LABELS[person.type]}
                        </span>
                        {person.actionTaken && (
                          <span className="text-xs text-ochre-500">
                            选择：{GREAT_PERSON_ACTION_LABELS[person.actionTaken]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedId === person.id ? (
                    <ChevronUp className="w-5 h-5 text-ochre-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-ochre-400" />
                  )}
                </div>
              </button>

              {expandedId === person.id && (
                <div className="px-4 pb-4 space-y-4">
                  <GreatPersonCard greatPerson={person} showActions={false} compact />

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-ochre-600 mb-2">历史事件</h4>
                    <div className="relative pl-6 space-y-2">
                      {getEventsForPerson(person.id).map((event) => (
                        <div key={event.id} className="relative">
                          <div className="absolute -left-6 top-1 w-4 h-4 bg-parchment-200 rounded-full flex items-center justify-center text-ochre-500">
                            {ACTION_ICONS[event.action] || <Star className="w-3 h-3" />}
                          </div>
                          <div className="bg-parchment-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-ochre-700">
                                {event.description}
                              </span>
                            </div>
                            <span className="text-xs text-ochre-400">
                              回合 {event.turn}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default GreatPersonTimeline;
