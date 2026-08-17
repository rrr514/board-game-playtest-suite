import React from 'react';
import { useGame } from '../context/GameContext';
import { Flame, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';

export default function BossCard() {
  const { boss, config } = useGame();
  const hpPercent = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));

  return (
    <div className="boss-card-container">
      <div className="boss-card-header">
        <div className="boss-title-group">
          <span className="boss-icon">🐉</span>
          <div>
            <h3>{boss.name}</h3>
            <span className="boss-sub">First Boss (Fire Dragon)</span>
          </div>
        </div>

        <div className="facing-badge">
          <span>FACING</span>
          <strong>Sector {boss.facingSector} ({config.sectors[boss.facingSector]?.name})</strong>
        </div>
      </div>

      {/* Boss Health Bar */}
      <div className="stat-group">
        <div className="stat-label">
          <span>HP</span>
          <strong>{boss.hp} / {boss.maxHp}</strong>
        </div>
        <div className="progress-bar-bg boss-hp-bg">
          <div
            className="progress-bar-fill fill-boss-hp"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Struggle Meter */}
      <div className="struggle-box">
        <div className="stat-label">
          <span>⚡ Struggle Meter</span>
          <strong>{boss.struggle} / {config.boss.struggleThreshold}</strong>
        </div>
        <div className="struggle-dots">
          {Array.from({ length: config.boss.struggleThreshold }).map((_, i) => (
            <div
              key={i}
              className={`struggle-pip ${i < boss.struggle ? 'filled' : 'empty'}`}
            />
          ))}
        </div>
        <p className="struggle-hint">
          At {config.boss.struggleThreshold} Struggle: Unleashes {config.boss.struggleDamage} dmg to all heroes (+{config.boss.struggleThreatenedBonusDamage} to threatened)!
        </p>
      </div>

      {/* Boss Vulnerability & Sectors Rule */}
      <div className="vulnerability-rule-box">
        <h4>🎯 Sector Vulnerabilities</h4>
        <div className="vulnerability-grid">
          <div className="vuln-badge vuln-exposed">
            <strong>Exposed Sectors:</strong> Front & Rear (100% Dmg)
          </div>
          <div className="vuln-badge vuln-protected">
            <strong>Protected Sectors:</strong> Flanks (Cannot Attack)
          </div>
        </div>
      </div>

      {/* Boss Reactions Rule Cheat Sheet */}
      <div className="reactions-cheat-sheet">
        <h4><ShieldAlert size={14} /> Boss Reaction Triggers (v4 Rules)</h4>
        <ul>
          <li>
            <strong>Movement Phase Start (Front Sector):</strong> Hero starting movement phase in Front Sector takes <strong>{config.boss.frontSectorDamage} damage</strong>.
          </li>
          <li>
            <strong>Threatened in Front:</strong> Threatened hero starting movement phase in Front Sector takes <strong>{config.boss.threatenedFrontDamage} damage + Burned</strong> (cannot attack next turn & loses 1 HP).
          </li>
          <li>
            <strong>End of Round Aggro Rotation:</strong> Boss rotates to face the hero holding the <strong>🎯 Aggro Token</strong> after all heroes have taken their turn.
          </li>
          <li>
            <strong>Struggle Threshold (3 Struggle):</strong> At end of round (+1 Struggle/round), deals <strong>{config.boss.struggleDamage} damage to ALL heroes</strong> (+<strong>{config.boss.struggleThreatenedBonusDamage} bonus damage & Burned</strong> for threatened heroes).
          </li>
        </ul>
      </div>
    </div>
  );
}
