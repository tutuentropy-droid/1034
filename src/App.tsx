import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import { EncyclopediaHome } from '@/components/EncyclopediaHome';
import { KnowledgeNodeDetail } from '@/components/KnowledgeNodeDetail';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
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
  const [mode, setMode] = useState<'game' | 'encyclopedia'>('game');

  const handleEnterEncyclopedia = () => {
    useEncyclopediaStore.getState().setCurrentView('home');
    setMode('encyclopedia');
  };

  const handleExitEncyclopedia = () => {
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
            ) : (
              <Home onEnterEncyclopedia={handleEnterEncyclopedia} />
            )
          }
        />
      </Routes>
    </Router>
  );
}
