import React from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import GreatPersonCard from './GreatPersonCard';
import { X } from 'lucide-react';

const GreatPersonModal: React.FC = () => {
  const {
    showGreatPersonModal,
    activeGreatPerson,
    closeGreatPersonModal,
    makeGreatPersonChoice,
  } = useCivilizationStore();

  if (!showGreatPersonModal || !activeGreatPerson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeGreatPersonModal}
      />

      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeGreatPersonModal}
          className="absolute -top-2 -right-2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-ochre-600 hover:text-ochre-800 hover:scale-110 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="animate-bounce-in">
          <GreatPersonCard
            greatPerson={activeGreatPerson}
            onAction={(action) => makeGreatPersonChoice(action)}
          />
        </div>
      </div>
    </div>
  );
};

export default GreatPersonModal;
