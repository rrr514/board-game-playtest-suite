import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getRelativeSector, getAdjacentSectors } from '../utils/defaultConfig';
import { Compass, Sword, Shield, Zap, Flame, ChevronRight, AlertOctagon, Undo2 } from 'lucide-react';

export default function ActionControls() {
  const {
    activeHero,
    heroes,
    boss,
    turnPhase,
    gameStatus,
    config,
    handleMovementChoice,
    performAction,
    endHeroTurn,
    setHeroStartingSector,
    startBattle,
    getActionCost,
    canUndo,
    undoTurn
  } = useGame();

  const validAdjacentSectors = activeHero ? getAdjacentSectors(activeHero.sector) : [1, 3];
  const [userSelectedSector, setUserSelectedSector] = useState(null);
  const targetMoveSector = userSelectedSector !== null && validAdjacentSectors.includes(userSelectedSector)
    ? userSelectedSector
    : validAdjacentSectors[0];

  if (!activeHero || gameStatus !== 'playing') {
    return (
      <div className="action-card disabled-card">
        <p className="text-center text-muted">Game inactive or game over.</p>
      </div>
    );
  }

  const moveCost = config.gameRules.movementStaminaCost;

  const heroRelativeSector = getRelativeSector(activeHero.sector, boss.facingSector);
  const currentSectorMod = config.sectorModifiers[heroRelativeSector] || { damageMultiplier: 1.0, type: "EXPOSED" };
  const isExposed = currentSectorMod.type === "EXPOSED";

  return (
    <div className="action-controls-card">
      <div className="action-header">
        <h3>
          ⚡ Action Deck — {activeHero.name}
        </h3>
        <div className="action-header-right">
          <span className="stamina-badge">
            Stamina Available: <strong>{activeHero.stamina} / {activeHero.maxStamina}{activeHero.bonusStamina > 0 ? ` (+${activeHero.bonusStamina} Bonus)` : ''}</strong>
          </span>
        </div>
      </div>

      {/* Sector Position Indicator */}
      <div className="sector-vulnerability-banner">
        <span>Current Sector: <strong>Sector {activeHero.sector} ({config.sectors[activeHero.sector]?.name}) — {heroRelativeSector.toUpperCase()}</strong></span>
        <span className={`vulnerability-pill ${isExposed ? 'pill-exposed' : 'pill-protected'}`}>
          {isExposed ? '🎯 EXPOSED SECTOR (100% Damage Dealt)' : '🛡️ PROTECTED SECTOR (INVULNERABLE - 0% Damage)'}
        </span>
      </div>

      {/* KO'd Hero Notice & Skip Turn */}
      {activeHero.isKo ? (
        <div className="phase-box ko-phase-box">
          <div className="alert-box alert-danger">
            <AlertOctagon size={24} />
            <div>
              <h4>💀 {activeHero.name} is KNOCKED OUT!</h4>
              <p className="mb-0">
                This hero reached 0 HP and loses their turn. They will revive in the Recovery Phase at the end of the round with 50% HP (+1 stamina cost penalty).
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary w-full mt-3"
            onClick={() => endHeroTurn()}
          >
            Skip KO'd Turn <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        <>
          {/* PHASE 0: SETUP PHASE CONTROLS */}
          {turnPhase === 'setup' && (
            <div className="phase-box setup-box">
              <h4>
                <Compass size={18} /> Game Setup: Choose Starting Sectors
              </h4>
              <p className="phase-desc">
                Before battle begins, each player chooses their hero's starting sector on the arena board. Click a sector on the board or select below:
              </p>

              <div className="setup-heroes-grid">
                {heroes.map((hero) => (
                  <div key={hero.id} className="setup-hero-item">
                    <div className="flex-row items-center gap-2 mb-1">
                      <span className="hero-avatar">{hero.name[0]}</span>
                      <strong>{hero.name}</strong>
                    </div>
                    <select
                      value={hero.sector}
                      onChange={(e) => setHeroStartingSector(hero.id, parseInt(e.target.value, 10))}
                      className="custom-select"
                    >
                      {config.sectors.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          Sector {sec.id} ({sec.name}) — {sec.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-primary w-full mt-3"
                onClick={startBattle}
              >
                ⚔️ Confirm Starting Sectors & Start Round 1 <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* PHASE 1: MOVEMENT PHASE CONTROLS */}
          {turnPhase === 'movement' && (
            <div className="phase-box movement-box">
              <h4>
                <Compass size={18} /> Phase 1: Movement Phase
              </h4>
              <p className="phase-desc">
                Choose whether to spend stamina to move to an <strong>adjacent sector</strong> (1 stamina), or stay in place and become <strong>THREATENED</strong>.
              </p>

              <div className="movement-options-grid">
                {/* Option A: Move to Adjacent Sector */}
                <div className="movement-option-card">
                  <h5>Option A: Move to Adjacent Sector</h5>
                  <p className="option-subtext">
                    Cost: {config.gameRules.movementStaminaCost} Stamina
                  </p>
                  <div className="sector-select-row mb-2">
                    <select
                      value={targetMoveSector}
                      onChange={(e) => setUserSelectedSector(parseInt(e.target.value, 10))}
                      className="custom-select"
                    >
                      {validAdjacentSectors.map((secId) => (
                        <option key={secId} value={secId}>
                          Sector {secId} ({config.sectors[secId]?.name}) — Adjacent
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn-primary w-full"
                    disabled={(activeHero.stamina + (activeHero.bonusStamina || 0)) < moveCost}
                    onClick={() => {
                      handleMovementChoice('move', targetMoveSector);
                      setUserSelectedSector(null);
                    }}
                  >
                    <Zap size={16} /> Move to Sector {targetMoveSector} ({config.sectors[targetMoveSector]?.name}) ({moveCost} Stamina)
                  </button>
                </div>

                {/* Option B: Stay (Become Threatened) */}
                <div className="movement-option-card stay-option">
                  <h5>Option B: Stay in Place</h5>
                  <p className="option-subtext">Cost: 0 Stamina. Status: <strong>Become Threatened</strong>.</p>
                  <button
                    type="button"
                    className="btn-warning w-full"
                    onClick={() => handleMovementChoice('stay', activeHero.sector)}
                  >
                    <Flame size={16} /> Stay in Sector {activeHero.sector} (Become Threatened)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 2: ACTION PHASE CONTROLS */}

          {turnPhase === 'action' && (
            <div className="phase-box action-box">
              <h4>
                <Sword size={18} /> Phase 2: Action Phase
              </h4>
              <p className="phase-desc">
                Spend Stamina to execute Universal Actions or Relic abilities.
              </p>

              {activeHero.isBurned && (
                <div className="alert-box alert-danger mb-3">
                  <Flame size={18} />
                  <span><strong>BURNED STATUS:</strong> You are burned! Cannot use Attack actions this turn.</span>
                </div>
              )}

              {(() => {
                const canAttackProtected = activeHero.relicAction?.effectType === 'passive' && activeHero.relicAction?.canAttackProtected;
                if (!isExposed && !canAttackProtected) {
                  return (
                    <div className="alert-box alert-warning mb-3">
                      <span><strong>PROTECTED SECTOR (FLANK):</strong> You cannot take attack actions from a protected sector! Move to Front or Rear to attack.</span>
                    </div>
                  );
                } else if (!isExposed && canAttackProtected) {
                  return (
                    <div className="alert-box alert-success mb-3">
                      <span><strong>✨ CREATIVITY PASSIVE:</strong> You possess Creativity! Protected sector restrictions are bypassed. You can attack from any sector.</span>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="actions-grid">
                {/* Universal Actions */}
                {config.universalActions.map((action) => {
                  const cost = getActionCost(activeHero, action.staminaCost);
                  const canAttackProtected = activeHero.relicAction?.effectType === 'passive' && activeHero.relicAction?.canAttackProtected;
                  const isAttackDisabled = action.type === 'attack' && ((!isExposed && !canAttackProtected) || activeHero.isBurned);
                  const disabled = (activeHero.stamina + (activeHero.bonusStamina || 0)) < cost || isAttackDisabled;
                  const calculatedDmg = action.damage > 0 ? (isExposed || canAttackProtected ? action.damage : 0) : 0;

                  return (
                    <div key={action.id} className="action-button-card">
                      <div className="action-title-row">
                        <strong>{action.type === 'attack' ? '⚔️' : '🛡️'} {action.name}</strong>
                        <span className="cost-tag">{cost} Stamina</span>
                      </div>
                      <p className="action-desc">
                        {action.description}
                        {action.type === 'attack' && (
                          <span className="sector-preview-text">
                            <br />Yields: <strong>{calculatedDmg} Dmg</strong> ({isExposed ? '100% Exposed' : (canAttackProtected ? 'Creativity Passive' : 'Protected — Cannot Attack')})
                          </span>
                        )}
                      </p>
                      {action.drawsAggro && <span className="aggro-pill">🎯 Draws Aggro</span>}
                      <button
                        className={`btn-action ${action.type === 'attack' ? 'btn-attack' : 'btn-defend'}`}
                        disabled={disabled}
                        onClick={() => performAction(action)}
                      >
                        Execute {action.name} ({action.type === 'attack' ? (isExposed || canAttackProtected ? `${calculatedDmg} Dmg` : 'Cannot Attack from Flank') : `+${action.block} Block`})
                      </button>
                    </div>
                  );
                })}

                {/* Relic Action */}
                {activeHero.relicAction && (
                  <div className="action-button-card relic-card">
                    {(() => {
                      const relic = activeHero.relicAction;
                      const relicCost = getActionCost(activeHero, relic.staminaCost);
                      const isRelicAttack = relic.type === 'attack' || relic.damage > 0;
                      const canAttackProtected = relic.effectType === 'passive' && relic.canAttackProtected;
                      const isRelicDisabled = isRelicAttack && ((!isExposed && !canAttackProtected) || activeHero.isBurned);
                      const relicDmg = relic.damage > 0 ? (isExposed || canAttackProtected ? relic.damage : 0) : 0;

                      // 1. Passive Relic (Creativity)
                      if (relic.effectType === 'passive') {
                        return (
                          <>
                            <div className="action-title-row">
                              <strong>✨ {relic.name} ({activeHero.relicName})</strong>
                              <span className="cost-tag badge-passive">PASSIVE</span>
                            </div>
                            <p className="action-desc">
                              {relic.description}
                            </p>
                            <div className="passive-status-box">
                              <span>🌟 Always Active: No stamina penalty on 1st KO & Unlimited Attack Angles.</span>
                            </div>
                          </>
                        );
                      }

                      // 2. Targeted Relic (Wisdom: grant_hero_stamina, Unity: heal_hero)
                      const isTargeted = relic.effectType === 'grant_hero_stamina' || relic.effectType === 'heal_hero';
                      const availableTargets = relic.effectType === 'grant_hero_stamina'
                        ? heroes.filter((h) => h.id !== activeHero.id && !h.isKo)
                        : heroes.filter((h) => !h.isKo);

                      const targetIdToUse = userSelectedSector !== null && availableTargets.some(h => h.id === userSelectedSector)
                        ? userSelectedSector
                        : (availableTargets[0]?.id || activeHero.id);

                      return (
                        <>
                          <div className="action-title-row">
                            <strong>✨ {relic.name} ({activeHero.relicName})</strong>
                            <span className="cost-tag">{relicCost} Stamina</span>
                          </div>
                          <p className="action-desc">
                            {relic.description}
                            {isRelicAttack && (
                              <span className="sector-preview-text">
                                <br />Yields: <strong>{relicDmg} Dmg</strong> ({isExposed ? '100% Exposed' : (canAttackProtected ? 'Creativity Passive' : 'Protected — Cannot Attack')})
                              </span>
                            )}
                          </p>
                          {relic.drawsAggro && <span className="aggro-pill">🎯 Draws Aggro</span>}

                          {isTargeted && availableTargets.length > 0 && (
                            <div className="target-select-row mb-2">
                              <label className="target-label">Select Target Hero:</label>
                              <select
                                value={targetIdToUse}
                                onChange={(e) => setUserSelectedSector(e.target.value)}
                                className="custom-select"
                              >
                                {availableTargets.map((h) => (
                                  <option key={h.id} value={h.id}>
                                    {h.name} {h.id === activeHero.id ? '(Self)' : ''} — {relic.effectType === 'grant_hero_stamina' ? `${h.stamina}/${h.maxStamina} Stamina (${(h.bonusStamina || 0)}/2 Bonus)` : `${h.hp}/${h.maxHp} HP`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <button
                            className="btn-relic"
                            disabled={(activeHero.stamina + (activeHero.bonusStamina || 0)) < relicCost || isRelicDisabled}
                            onClick={() => performAction(relic, isTargeted ? targetIdToUse : null)}
                          >
                            Use Relic Ability ({isRelicAttack ? (isExposed || canAttackProtected ? `${relicDmg} Dmg` : 'Cannot Attack from Flank') : (relic.block > 0 ? `+${relic.block} Block` : (relic.effectType === 'grant_party_shield' ? '+2 Party Shield' : (relic.effectType === 'grant_hero_stamina' ? '+2 Stamina' : (relic.effectType === 'heal_hero' ? '+2 HP' : 'Execute'))))})
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="end-turn-row flex-row gap-2">
                <button className="btn-secondary flex-1" onClick={() => endHeroTurn()}>
                  Pass / End Action Turn <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

