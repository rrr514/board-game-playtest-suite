import React from 'react';
import { useGame } from '../context/GameContext';
import { Wrench, X, Shield, Heart, Zap, Flame, Compass, UserPlus, Trash2 } from 'lucide-react';

export default function DmControlsModal({ onClose }) {
  const { heroes, boss, updateHeroStat, updateBossStat, config, addHero, removeHero } = useGame();

  return (
    <div className="modal-overlay">
      <div className="modal-card dm-modal-card">
        <div className="modal-header">
          <div className="header-title">
            <Wrench size={22} className="text-amber" />
            <h3>Dungeon Master / Playtester Manual Overrides</h3>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="tab-section-header">
            <p className="phase-desc">
              Manually override unit HP, stamina, sector positions, or status during an active playtest session.
            </p>
            <button className="btn-secondary btn-sm" onClick={() => addHero()}>
              <UserPlus size={15} /> Add Player
            </button>
          </div>

          {/* Boss Controls */}
          <div className="dm-unit-box">
            <h4>🐉 Boss: {boss.name}</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Current HP</label>
                <input
                  type="number"
                  value={boss.hp}
                  onChange={(e) => updateBossStat('hp', parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Facing Sector</label>
                <select
                  value={boss.facingSector}
                  onChange={(e) => updateBossStat('facingSector', parseInt(e.target.value, 10))}
                  className="custom-select"
                >
                  {config.sectors.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      Sector {sec.id} ({sec.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Struggle Pips</label>
                <input
                  type="number"
                  value={boss.struggle}
                  onChange={(e) => updateBossStat('struggle', parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Heroes Controls */}
          {heroes.map((hero) => (
            <div key={hero.id} className="dm-unit-box">
              <div className="editor-card-header mb-2">
                <h4>🛡️ {hero.name}</h4>
                {heroes.length > 1 && (
                  <button
                    className="btn-icon-danger"
                    onClick={() => removeHero(hero.id)}
                    title={`Remove ${hero.name}`}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Current HP</label>
                  <input
                    type="number"
                    value={hero.hp}
                    onChange={(e) => updateHeroStat(hero.id, 'hp', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Current Stamina (Max: {hero.maxStamina})</label>
                  <input
                    type="number"
                    value={hero.stamina}
                    onChange={(e) => updateHeroStat(hero.id, 'stamina', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>KO Count (Penalty)</label>
                  <input
                    type="number"
                    min="0"
                    value={hero.koCount || 0}
                    onChange={(e) => updateHeroStat(hero.id, 'koCount', Math.max(0, parseInt(e.target.value, 10) || 0))}
                  />
                </div>
                <div className="form-group">
                  <label>Block</label>
                  <input
                    type="number"
                    value={hero.block}
                    onChange={(e) => updateHeroStat(hero.id, 'block', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Sector</label>
                  <select
                    value={hero.sector}
                    onChange={(e) => updateHeroStat(hero.id, 'sector', parseInt(e.target.value, 10))}
                    className="custom-select"
                  >
                    {config.sectors.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Sector {sec.id} ({sec.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={hero.isThreatened}
                      onChange={(e) => updateHeroStat(hero.id, 'isThreatened', e.target.checked)}
                    />
                    Threatened?
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={hero.isBurned}
                      onChange={(e) => updateHeroStat(hero.id, 'isBurned', e.target.checked)}
                    />
                    Burned?
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={hero.isKo}
                      onChange={(e) => updateHeroStat(hero.id, 'isKo', e.target.checked)}
                    />
                    KO'd?
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn-primary w-full" onClick={onClose}>Close DM Overrides</button>
        </div>
      </div>
    </div>
  );
}
