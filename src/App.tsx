import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import { EncyclopediaHome } from '@/components/EncyclopediaHome';
import { KnowledgeNodeDetail } from '@/components/KnowledgeNodeDetail';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { MultiCivGame } from '@/components/MultiCivGame';
import { WhatIfSandbox } from '@/components/WhatIfSandbox';
import { useEncyclopediaStore } from '@/store/useEncyclopediaStore';

function EncyclopediaMode({ onExit }: { onExit: () => void }) {
  const { currentView, loadGraph, graph, isLoading } = useEncyclopediaStore();

  if (currentView === 'graph') {
    if (!graph && !isLoading) {
      loadGraph();
    }
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <KnowledgeGraph />
        </div>
      </div>
    );
  }

  if (currentView === 'node') {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <KnowledgeNodeDetail />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <EncyclopediaHome onExit={onExit} />
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<'game' | 'encyclopedia' | 'multiCiv' | 'whatIf'>('game');

  const handleEnterEncyclopedia = () => {
    useEncyclopediaStore.getState().setCurrentView('home');
    setMode('encyclopedia');
  };

  const handleEnterMultiCiv = () => {
    setMode('multiCiv');
  };

  const handleEnterWhatIf = () => {
    setMode('whatIf');
  };

  const handleExitEncyclopedia = () => {
    setMode('game');
  };

  const handleExitMultiCiv = () => {
    setMode('game');
  };

  const handleExitWhatIf = () => {
    setMode('game');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            mode === 'encyclopedia' ? (
              <EncyclopediaMode onExit={handleExitEncyclopedia} />
            ) : mode === 'multiCiv' ? (
              <MultiCivGame onExit={handleExitMultiCiv} />
            ) : mode === 'whatIf' ? (
              <WhatIfSandbox onExit={handleExitWhatIf} />
            ) : (
              <Home onEnterEncyclopedia={handleEnterEncyclopedia} onEnterMultiCiv={handleEnterMultiCiv} onEnterWhatIf={handleEnterWhatIf} />
            )
          }
        />
      </Routes>
    </Router>
  );
}
