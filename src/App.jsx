import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import TurnTracker from './components/TurnTracker';
import Board from './components/Board';
import HeroPanel from './components/HeroPanel';
import ActionControls from './components/ActionControls';
import BossCard from './components/BossCard';
import ReactionModal from './components/ReactionModal';
import ConfigEditor from './components/ConfigEditor';
import DmControlsModal from './components/DmControlsModal';
import RulebookModal from './components/RulebookModal';
import GameLog from './components/GameLog';

function GameContent() {
  const [showConfig, setShowConfig] = useState(false);
  const [showDm, setShowDm] = useState(false);
  const [showRulebook, setShowRulebook] = useState(false);

  return (
    <div className="app-shell">
      {/* Top Bar & Turn Tracker */}
      <TurnTracker
        onOpenConfig={() => setShowConfig(true)}
        onOpenDm={() => setShowDm(true)}
        onOpenRulebook={() => setShowRulebook(true)}
      />

      {/* Main Playtest Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Battlefield Arena & Action Deck */}
        <div className="dash-col main-play-col">
          <Board />
          <ActionControls />
        </div>

        {/* Right Column: Boss Card, Hero Roster & Game Log */}
        <div className="dash-col side-info-col">
          <BossCard />
          <HeroPanel />
          <GameLog />
        </div>
      </div>

      {/* Popups & Modals */}
      <ReactionModal />

      {showConfig && (
        <ConfigEditor onClose={() => setShowConfig(false)} />
      )}

      {showDm && (
        <DmControlsModal onClose={() => setShowDm(false)} />
      )}

      {showRulebook && (
        <RulebookModal onClose={() => setShowRulebook(false)} />
      )}
    </div>
  );
}


export default function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
