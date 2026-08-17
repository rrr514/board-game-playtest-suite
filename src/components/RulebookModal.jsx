import React, { useState } from 'react';
import { BookOpen, X, ShieldAlert, Zap, Flame, Compass, Sword, Shield, RotateCcw, AlertTriangle } from 'lucide-react';

export default function RulebookModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'phases' | 'dragon' | 'statuses'

  return (
    <div className="modal-overlay">
      <div className="modal-card rulebook-modal-card">
        <div className="modal-header">
          <div className="header-title">
            <BookOpen size={22} className="text-amber" />
            <h3>Lakehouse '26 Official Rulebook & Quick Reference</h3>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            📜 General Rules
          </button>
          <button
            className={`tab-btn ${activeTab === 'phases' ? 'active' : ''}`}
            onClick={() => setActiveTab('phases')}
          >
            🔄 Turn Phases
          </button>
          <button
            className={`tab-btn ${activeTab === 'dragon' ? 'active' : ''}`}
            onClick={() => setActiveTab('dragon')}
          >
            🐉 First Boss (Dragon)
          </button>
          <button
            className={`tab-btn ${activeTab === 'statuses' ? 'active' : ''}`}
            onClick={() => setActiveTab('statuses')}
          >
            🔥 Statuses & KO
          </button>
        </div>

        <div className="modal-body rulebook-body">
          {/* TAB 1: GENERAL RULES */}
          {activeTab === 'general' && (
            <div className="rule-section">
              <h4>Objective & Defeat Conditions</h4>
              <ul>
                <li><strong>Win Condition:</strong> Defeat the boss by reducing its HP to 0 within the allotted round limit.</li>
                <li><strong>Defeat Condition:</strong> Lose if the boss is still alive after the allotted time expires, or if all heroes are knocked out (KO'd) simultaneously.</li>
                <li><strong>Stamina:</strong> Stamina is the currency used to execute actions and movement.</li>
              </ul>

              <h4>Boss Positioning & Sector Vulnerability</h4>
              <ul>
                <li>The Boss sits at the center of the battlefield arena and rotates to face players.</li>
                <li><strong>Exposed Sectors (Front & Rear):</strong> Heroes in exposed sectors deal 100% damage to the boss.</li>
                <li><strong>Protected Sectors (Flanks):</strong> Boss flanks are protected. You <em>cannot</em> take an attack action on a boss's protected side.</li>
              </ul>

              <h4>Aggro Token Mechanics</h4>
              <ul>
                <li>There is <strong>one Aggro Token</strong> passed among heroes.</li>
                <li>When a hero takes an action that draws aggro (e.g. Basic Attack or certain Relics), they immediately claim the Aggro Token.</li>
                <li><strong>End of Round Rotation:</strong> After all heroes take their action, the boss will rotate to face the hero currently holding the Aggro Token.</li>
                <li><strong>Round Initiative & Play Order:</strong> The player holding the Aggro Token goes first each round, followed by the remaining heroes in turn order. The Fortitude hero starts Round 1 with the Aggro Token, and the initial play order is: <strong>Fortitude ➔ Wisdom ➔ Courage ➔ Unity ➔ Creativity</strong>.</li>
              </ul>

              <h4>Block Mechanics</h4>
              <ul>
                <li>Certain actions (such as Defend or Fortitude) grant <strong>Block</strong>.</li>
                <li>Block reduces incoming damage taken from the boss point-for-point.</li>
                <li><strong>Block Expiration Rule:</strong> All block gained will last until the <strong>end of the hero’s next turn</strong>.</li>
                <li><em>Step-by-Step Example from Rulebook:</em>
                  <ul className="mt-1">
                    <li>Player 1 gains 2 block on Turn 1.</li>
                    <li>Player 2 uses Fortitude, giving Player 1 2 block. (Player 1 now has 4 block).</li>
                    <li>End-of-round Boss Struggle deals 2 damage. Player 1 absorbs it (leaving 2 block).</li>
                    <li>Start of Player 1's next turn (Turn 2): Boss reaction deals 1 damage. Player 1 absorbs it (leaving 1 block).</li>
                    <li>Player 1 gains 3 block on Turn 2 (now has 1 old block + 3 new block = 4 block).</li>
                    <li>At the <strong>end of Player 1's turn (Turn 2)</strong>, the 1 block carried over from Round 1 expires, leaving Player 1 with <strong>3 block</strong>.</li>
                  </ul>
                </li>
              </ul>
            </div>
          )}

          {/* TAB 2: TURN PHASES */}
          {activeTab === 'phases' && (
            <div className="rule-section">
              <div className="rule-phase-card">
                <h5>0. Setup Phase 🎮</h5>
                <p>Before Round 1 begins, each hero chooses their starting sector on the battlefield circular arena.</p>
              </div>

              <p className="phase-desc">Each hero's turn consists of 2 sequential phases:</p>

              <div className="rule-phase-card">
                <h5>1. Movement Phase 🏃</h5>
                <ul>
                  <li>Choose whether to spend <strong>1 Stamina</strong> to move to an <strong>adjacent sector</strong> (e.g., North sector hero can move to East or West sector).</li>
                  <li>If you choose not to move, you will become <strong>THREATENED</strong>.</li>
                </ul>
              </div>

              <div className="rule-phase-card">
                <h5>2. Action Phase ⚔️</h5>
                <h6 className="mt-3 text-amber">Universal Set of Actions</h6>
                <table className="rule-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Stamina Cost</th>
                      <th>Effect</th>
                      <th>Draws Aggro?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Attack</strong></td>
                      <td>1</td>
                      <td>Deal 1 damage to boss (if Exposed)</td>
                      <td>Yes 🎯</td>
                    </tr>
                    <tr>
                      <td><strong>Defend</strong></td>
                      <td>1</td>
                      <td>Gain 1 block</td>
                      <td>No</td>
                    </tr>
                  </tbody>
                </table>

                <h6 className="mt-4 text-amber">Hero-Specific Relic Actions</h6>
                <table className="rule-table">
                  <thead>
                    <tr>
                      <th>Relic</th>
                      <th>Cost (Stamina)</th>
                      <th>Effect</th>
                      <th>Draw Aggro?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Fortitude</strong></td>
                      <td>2</td>
                      <td>Give every other hero 2 shield</td>
                      <td>Yes 🎯</td>
                    </tr>
                    <tr>
                      <td><strong>Wisdom</strong></td>
                      <td>2</td>
                      <td>Give another hero 2 bonus stamina*</td>
                      <td>No</td>
                    </tr>
                    <tr>
                      <td><strong>Courage</strong></td>
                      <td>3</td>
                      <td>Deal 5 damage</td>
                      <td>Yes 🎯</td>
                    </tr>
                    <tr>
                      <td><strong>Unity</strong></td>
                      <td>2</td>
                      <td>Heal a hero for 2 hp</td>
                      <td>No</td>
                    </tr>
                    <tr>
                      <td><strong>Creativity</strong></td>
                      <td>N/A (Passive)</td>
                      <td>On 1st KO: No stamina penalty & Can attack in protected sectors</td>
                      <td>N/A</td>
                    </tr>
                  </tbody>
                </table>
                <p className="hint-text text-muted mt-2">
                  * Note: Bonus stamina does not expire and does not reset at turn end, but does not stack (capped at 2 bonus stamina). If a hero action causes boss HP to reach 0, immediately resolve victory without triggering boss reactions!
                </p>
              </div>

              <div className="rule-phase-card">
                <h5>3. End of Round & Recovery Phase ✨</h5>
                <p>Occurs after all heroes have completed their turn and all reactions resolve:</p>
                <ul>
                  <li><strong>Boss Struggle & Rotation:</strong> Boss rotates to face Aggro holder. Struggle triggers at 3 struggle. (Shields absorb struggle damage!).</li>
                  <li><strong>Block Persistence:</strong> Block (Shield) does <em>not</em> expire at turn or round end; it persists until absorbed by incoming damage.</li>
                  <li><strong>Recover Stamina:</strong> All heroes recover stamina back to max. (Bonus stamina persists!).</li>
                  <li><strong>Revive KO'd Heroes:</strong> Revive KO'd heroes with 50% HP (Max stamina reduced by -1 per KO).</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: FIRST BOSS (FIRE-BREATHING DRAGON) */}
          {activeTab === 'dragon' && (
            <div className="rule-section">
              <div className="boss-rule-header">
                <h4>🐉 First Boss: Inferno Dragon</h4>
                <p>Concept: Fire-breathing dragon with devastating directional reactions.</p>
              </div>

              <div className="rule-grid-2col">
                <div className="rule-box-card">
                  <h5>Sectors</h5>
                  <p><strong>Exposed:</strong> Front & Rear (100% damage)</p>
                  <p><strong>Protected:</strong> Flanks (0% damage)</p>
                </div>
                <div className="rule-box-card">
                  <h5>Struggle Mechanic</h5>
                  <p>After every hero has taken their turn at round end, boss gains <strong>+1 Struggle</strong>.</p>
                </div>
              </div>

              <h4>Boss Reaction Triggers</h4>
              <div className="reaction-rule-list">
                <div className="reaction-rule-item">
                  <span className="reaction-tag">Movement Start</span>
                  <p>If a hero starts their movement phase in the <strong>Front Sector</strong>, take <strong>5 damage</strong>.</p>
                </div>
                <div className="reaction-rule-item">
                  <span className="reaction-tag">Threatened Front</span>
                  <p>If a <strong>Threatened</strong> hero starts their movement phase in the <strong>Front Sector</strong>, take <strong>3 additional damage (8 total damage)</strong>, and become <strong>BURNED</strong>.</p>
                </div>
                <div className="reaction-rule-item">
                  <span className="reaction-tag">Struggle Unleashed (3 Struggle)</span>
                  <p>When the boss reaches <strong>3 Struggle</strong>, all heroes take <strong>3 damage</strong>. All <strong>Threatened</strong> heroes take <strong>2 additional damage</strong> (5 total) and become <strong>BURNED</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATUSES & KO */}
          {activeTab === 'statuses' && (
            <div className="rule-section">
              <h4>Status Effects</h4>
              <div className="status-rule-card">
                <h5>🔥 THREATENED</h5>
                <p>Applied when a hero chooses <strong>not to move</strong> during their Movement Phase.</p>
                <ul>
                  <li>Increases damage taken from boss front sector reactions and struggle.</li>
                  <li>Causes hero to become Burned when caught in front sector reactions or boss struggle.</li>
                  <li>Cleared upon spending stamina to move in a subsequent movement phase.</li>
                </ul>
              </div>

              <div className="status-rule-card">
                <h5>🌋 BURNED</h5>
                <p>Applied by dragon fire reactions or struggle on threatened heroes.</p>
                <ul>
                  <li><strong>Effect:</strong> On your next turn, you <strong>cannot attack</strong> and lose <strong>1 HP</strong> at the start of your movement phase.</li>
                  <li>Clears at the end of your turn / recovery phase.</li>
                </ul>
              </div>

              <div className="status-rule-card">
                <h5>💀 KNOCKED OUT (KO'd)</h5>
                <p>Occurs when hero HP drops to 0.</p>
                <ul>
                  <li><strong>Turn Penalty:</strong> Instantly end your turn while KO'd. On next turn, revive with half HP, lose 1 max stamina, and end turn.</li>
                  <li><strong>Revival:</strong> Revive at the end of the round in Recovery Phase with <strong>50% Max HP</strong>.</li>
                  <li><strong>Max Stamina Reduction:</strong> <em>Lose 1 Max Stamina per KO (stacks: 1st KO = 2 max stamina, 2nd KO = 1 max stamina)</em>.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-primary w-full" onClick={onClose}>Close Rulebook</button>
        </div>
      </div>
    </div>
  );
}
