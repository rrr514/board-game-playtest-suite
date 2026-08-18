import React from 'react';
import { useGame } from '../context/GameContext';
import { Play, RotateCcw, Award, AlertTriangle, ChevronRight, Settings, Wrench, Undo2, BookOpen } from 'lucide-react';

export default function TurnTracker({ onOpenConfig, onOpenDm, onOpenRulebook }) {
  const { round, config, turnPhase, activeHero, gameStatus, resetGame, heroes, canUndo, undoTurn } = useGame();

  const phaseSteps = [
    { id: 'movement', label: '1. Movement Phase', icon: '🏃' },
    { id: 'action', label: '2. Action Phase', icon: '⚔️' },
    { id: 'recovery', label: 'End of Round / Recovery', icon: '✨' }
  ];

  return (
    <div className="turn-tracker-card">
      <div className="tracker-top">
        <div className="tracker-brand">
          <h2>LAKEHOUSE '26</h2>
          <span className="subtitle">Board Game Playtest Suite</span>
        </div>

        <div className="round-badge">
          <span className="round-title">ROUND</span>
          <span className="round-number">{round} / {config.gameRules.maxRounds}</span>
        </div>

        <div className="tracker-actions">
          <button
            className="btn-warning btn-sm"
            onClick={undoTurn}
            disabled={!canUndo}
            title="Undo last action or turn"
          >
            <Undo2 size={16} /> Undo Turn
          </button>
          <button className="btn-secondary btn-sm" onClick={onOpenRulebook} title="Open PDF Rulebook Reference">
            <BookOpen size={16} /> Rulebook
          </button>
          <button className="btn-secondary btn-sm" onClick={onOpenDm} title="DM Manual Overrides">
            <Wrench size={16} /> DM Overrides
          </button>
          <button className="btn-secondary btn-sm" onClick={onOpenConfig} title="Customize Rules & Stats">
            <Settings size={16} /> Rule Customizer
          </button>
          <button className="btn-danger btn-sm" onClick={() => resetGame()} title="Reset Game Session">
            <RotateCcw size={16} /> Restart
          </button>
        </div>
      </div>


      {/* Phase Steps Indicator */}
      <div className="phase-stepper">
        {phaseSteps.map((step) => {
          const isActive = turnPhase === step.id;
          return (
            <div key={step.id} className={`step-item ${isActive ? 'active' : ''}`}>
              <span className="step-icon">{step.icon}</span>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Active Turn Status Banner */}
      <div className="turn-status-banner">
        {gameStatus === 'victory' && (
          <div className="banner-alert banner-success">
            <Award size={24} />
            <div>
              <h4>VICTORY! The Dragon has been slain!</h4>
              <p>The heroes successfully defeated the boss within {round} rounds.</p>
            </div>
          </div>
        )}

        {gameStatus === 'defeat' && (
          <div className="banner-alert banner-danger">
            <AlertTriangle size={24} />
            <div>
              <h4>DEFEAT! Allotted time expired or all heroes were wiped out.</h4>
              <p>Try tweaking hero relics or stamina costs in the Rule Customizer!</p>
            </div>
          </div>
        )}

        {gameStatus === 'playing' && turnPhase === 'setup' && (
          <div className="active-hero-banner">
            <span className="turn-label">GAME SETUP:</span>
            <div className="hero-name-chip">
              <strong>Select Starting Sectors</strong>
            </div>
            <span className="phase-tag">
              Phase: Setup (Each player chooses their starting sector before Round 1)
            </span>
          </div>
        )}

        {gameStatus === 'playing' && turnPhase !== 'setup' && activeHero && (
          <div className="active-hero-banner">
            <span className="turn-label">CURRENT TURN:</span>
            <div className="hero-name-chip">
              <span className="hero-avatar">{activeHero.name[0]}</span>
              <strong>{activeHero.name}</strong>
              <span className="sector-tag">
                Sector {activeHero.sector} ({config.sectors[activeHero.sector]?.name})
              </span>
              {activeHero.id === aggroHeroId && (
                <span className="aggro-token-badge" title="Holds the Aggro Token (Boss targets & starts next round first)">
                  🎯 Aggro Token
                </span>
              )}
            </div>
            <div className="round-starter-chip" title="Holds Aggro Token and started this round">
              👑 Round Starter: <strong>{heroes.find((h) => h.id === aggroHeroId)?.name || activeHero.name}</strong>
            </div>
            <span className="phase-tag">
              Phase: {turnPhase === 'movement' ? 'Movement Phase (Move / Stay)' : 'Action Phase (Attack / Defend / Relic)'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
