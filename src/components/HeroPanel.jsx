import React from 'react';
import { useGame } from '../context/GameContext';
import { Heart, Zap, Shield, Flame, Skull, AlertCircle, UserPlus, Trash2 } from 'lucide-react';

export default function HeroPanel() {
  const { heroes, currentHeroIndex, activeHero, config, getActionCost, addHero, removeHero, aggroHeroId } = useGame();

  return (
    <div className="hero-panel-container">
      <div className="panel-header-row">
        <h3 className="panel-title">
          🛡️ Party Roster ({heroes.length} Heroes)
        </h3>
        <button
          className="btn-secondary btn-sm"
          onClick={() => addHero()}
          title="Add a new hero to party"
        >
          <UserPlus size={15} /> Add Player
        </button>
      </div>

      <div className="hero-cards-grid">
        {heroes.map((hero, index) => {
          const isActive = activeHero && activeHero.id === hero.id;
          const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
          const hasAggro = hero.id === aggroHeroId;

          return (
            <div
              key={hero.id}
              className={`hero-card ${isActive ? 'active-card' : ''} ${hero.isKo ? 'ko-card' : ''}`}
            >
              <div className="hero-card-header">
                <div className="hero-identity">
                  <span className="hero-badge-avatar">{hero.name[0]}</span>
                  <div>
                    <h4 className="hero-name">{hero.name}</h4>
                    <span className="relic-name">✨ {hero.relicName}</span>
                  </div>
                </div>

                <div className="hero-header-actions">
                  {hasAggro && <span className="aggro-token-pill" title="Holds the Aggro Token">🎯 Aggro</span>}
                  {isActive && <span className="active-turn-pill">Active Turn</span>}
                  {heroes.length > 1 && (
                    <button
                      className="btn-icon-danger"
                      onClick={() => removeHero(hero.id)}
                      title={`Remove ${hero.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Badges */}
              <div className="status-badges">
                {hasAggro && (
                  <span className="status-badge badge-aggro">
                    🎯 Holds Aggro Token
                  </span>
                )}
                {hero.isKo && (
                  <span className="status-badge badge-ko">
                    <Skull size={12} /> KO'd (Skipping Turn)
                  </span>
                )}
                {hero.isBurned && !hero.isKo && (
                  <span className="status-badge badge-burn">
                    <Flame size={12} /> Burned (No Attacks)
                  </span>
                )}
                {hero.isThreatened && !hero.isKo && (
                  <span className="status-badge badge-threat">
                    <AlertCircle size={12} /> Threatened
                  </span>
                )}
                {hero.block > 0 && !hero.isKo && (
                  <span className="status-badge badge-block" title={`Total Block: ${hero.block} (${hero.currentRoundBlock || 0} Current Round / ${hero.previousRoundBlock || 0} Previous Round)`}>
                    <Shield size={12} /> +{hero.block} Block ({hero.currentRoundBlock || 0} Curr / {hero.previousRoundBlock || 0} Prev)
                  </span>
                )}
              </div>

              {/* HP Bar */}
              <div className="stat-group">
                <div className="stat-label">
                  <span><Heart size={14} className="text-red" /> HP</span>
                  <strong>{hero.hp} / {hero.maxHp}</strong>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill fill-hp"
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
              </div>

              {/* Block Stat Group (Current vs Previous Round Breakdown) */}
              {((hero.block > 0) || (hero.currentRoundBlock > 0) || (hero.previousRoundBlock > 0)) && !hero.isKo && (
                <div className="stat-group block-stat-box mt-1">
                  <div className="stat-label">
                    <span><Shield size={14} className="text-blue" /> Block</span>
                    <strong>{hero.block} Total Block</strong>
                  </div>
                  <div className="block-breakdown-row">
                    <span className="block-chip chip-current">
                      Current Round: <strong>+{hero.currentRoundBlock || 0}</strong>
                    </span>
                    <span className="block-chip chip-prev">
                      Prev Round: <strong>+{hero.previousRoundBlock || 0}</strong> {hero.previousRoundBlock > 0 && <em className="expire-tag">(Expires end of turn)</em>}
                    </span>
                  </div>
                </div>
              )}

              {/* Stamina Dots & KO Penalty Info */}
              <div className="stat-group">
                <div className="stat-label">
                  <span><Zap size={14} className="text-amber" /> Stamina</span>
                  <strong>
                    {hero.stamina} / {hero.maxStamina}
                    {hero.bonusStamina > 0 && <span className="bonus-stamina-text"> (+{hero.bonusStamina} Bonus)</span>}
                  </strong>
                </div>
                <div className="stamina-dots">
                  {Array.from({ length: hero.maxStamina }).map((_, i) => (
                    <span
                      key={`base_${i}`}
                      className={`stamina-dot ${i < hero.stamina ? 'filled' : 'empty'}`}
                    />
                  ))}
                  {hero.bonusStamina > 0 && Array.from({ length: hero.bonusStamina }).map((_, i) => (
                    <span
                      key={`bonus_${i}`}
                      className="stamina-dot bonus-filled"
                      title="Bonus Stamina (Wisdom — Prioritized after regular stamina)"
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                {hero.koCount > 0 && (
                  <span className="ko-penalty-text">
                    ⚠️ KO Penalty: -{(hero.relicAction?.effectType === 'passive' && hero.relicAction?.ignoreFirstKoPenalty && hero.koCount <= 1) ? 0 : ((hero.relicAction?.effectType === 'passive' && hero.relicAction?.ignoreFirstKoPenalty) ? hero.koCount - 1 : hero.koCount)} Max Stamina (Reduced to {hero.maxStamina} Max Stamina)
                  </span>
                )}
              </div>

              {/* Sector Position */}
              <div className="sector-footer">
                <span>Location:</span>
                <strong>Sector {hero.sector} ({config.sectors[hero.sector]?.name})</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
