import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { DEFAULT_CONFIG, RELIC_PRESETS } from '../utils/defaultConfig';
import { Settings, Save, RotateCcw, Download, Upload, X, UserPlus, Trash2 } from 'lucide-react';

export default function ConfigEditor({ onClose }) {
  const { config, resetGame } = useGame();
  const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(config)));
  const [activeTab, setActiveTab] = useState('boss'); // 'boss' | 'heroes' | 'rules' | 'json'
  const [jsonText, setJsonText] = useState(() => JSON.stringify(config, null, 2));

  // Boss field handlers
  const handleBossChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      boss: { ...prev.boss, [field]: val }
    }));
  };

  // Game rules field handlers
  const handleRulesChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      gameRules: { ...prev.gameRules, [field]: val }
    }));
  };

  // Hero field handlers
  const handleHeroChange = (heroIndex, field, val) => {
    setFormData((prev) => {
      const updatedHeroes = [...prev.heroes];
      updatedHeroes[heroIndex] = { ...updatedHeroes[heroIndex], [field]: val };
      return { ...prev, heroes: updatedHeroes };
    });
  };

  // Add & Remove hero handlers
  const handleAddHero = () => {
    setFormData((prev) => {
      const newIdx = prev.heroes.length + 1;
      const newId = `hero_${Date.now()}`;
      const newHero = {
        id: newId,
        name: `Hero ${newIdx}`,
        maxHp: 12,
        maxStamina: 3,
        sector: (newIdx - 1) % 4,
        relicName: "Mystic Relic",
        relicAction: {
          id: `relic_${newId}`,
          name: "Power Strike",
          staminaCost: 2,
          damage: 2,
          block: 0,
          drawsAggro: true,
          description: "Deal 2 damage to the boss. Draws Aggro.",
          type: "attack"
        }
      };
      return { ...prev, heroes: [...prev.heroes, newHero] };
    });
  };

  const handleRemoveHero = (index) => {
    setFormData((prev) => {
      if (prev.heroes.length <= 1) {
        alert("At least 1 hero is required!");
        return prev;
      }
      return { ...prev, heroes: prev.heroes.filter((_, i) => i !== index) };
    });
  };

  // Hero Relic action handlers
  const handleRelicActionChange = (heroIndex, field, val) => {
    setFormData((prev) => {
      const updatedHeroes = [...prev.heroes];
      const relic = { ...updatedHeroes[heroIndex].relicAction, [field]: val };
      updatedHeroes[heroIndex] = { ...updatedHeroes[heroIndex], relicAction: relic };
      return { ...prev, heroes: updatedHeroes };
    });
  };

  // Save changes & restart game with new config
  const handleSave = () => {
    resetGame(formData);
    onClose();
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lakehouse26_game_config_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON text
  const handleApplyJsonText = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setFormData(parsed);
      resetGame(parsed);
      onClose();
    } catch (err) {
      alert("Invalid JSON format: " + err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card config-editor-modal">
        <div className="modal-header">
          <div className="header-title">
            <Settings size={22} className="text-amber" />
            <h3>Game Rules & Stats Customizer</h3>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Editor Nav Tabs */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'boss' ? 'active' : ''}`}
            onClick={() => setActiveTab('boss')}
          >
            🐲 Boss Stats
          </button>
          <button
            className={`tab-btn ${activeTab === 'heroes' ? 'active' : ''}`}
            onClick={() => setActiveTab('heroes')}
          >
            🛡️ Hero Roster
          </button>
          <button
            className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            📜 Game Rules
          </button>
          <button
            className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => {
              setJsonText(JSON.stringify(formData, null, 2));
              setActiveTab('json');
            }}
          >
            📄 JSON Import/Export
          </button>
        </div>

        <div className="modal-body editor-body">
          {/* TAB 1: BOSS STATS */}
          {activeTab === 'boss' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group">
                  <label>Boss Name</label>
                  <input
                    type="text"
                    value={formData.boss.name}
                    onChange={(e) => handleBossChange('name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Max HP</label>
                  <input
                    type="number"
                    value={formData.boss.maxHp}
                    onChange={(e) => handleBossChange('maxHp', parseInt(e.target.value, 10) || 1)}
                  />
                </div>
                <div className="form-group">
                  <label>Struggle Threshold (Max Pips)</label>
                  <input
                    type="number"
                    value={formData.boss.struggleThreshold}
                    onChange={(e) => handleBossChange('struggleThreshold', parseInt(e.target.value, 10) || 1)}
                  />
                </div>
                <div className="form-group">
                  <label>Struggle Base Damage</label>
                  <input
                    type="number"
                    value={formData.boss.struggleDamage}
                    onChange={(e) => handleBossChange('struggleDamage', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Struggle Threatened Extra Damage</label>
                  <input
                    type="number"
                    value={formData.boss.struggleThreatenedBonusDamage}
                    onChange={(e) => handleBossChange('struggleThreatenedBonusDamage', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Front Sector Start Damage</label>
                  <input
                    type="number"
                    value={formData.boss.frontSectorDamage}
                    onChange={(e) => handleBossChange('frontSectorDamage', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Threatened Front Damage (+Burn)</label>
                  <input
                    type="number"
                    value={formData.boss.threatenedFrontDamage}
                    onChange={(e) => handleBossChange('threatenedFrontDamage', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HERO ROSTER & RELICS */}
          {activeTab === 'heroes' && (
            <div className="form-section">
              <div className="tab-section-header">
                <p className="phase-desc">Manage party size, initial stats, and relic abilities ({formData.heroes.length} Heroes):</p>
                <button className="btn-secondary btn-sm" onClick={handleAddHero}>
                  <UserPlus size={15} /> Add Player
                </button>
              </div>

              <div className="hero-editor-list">
                {formData.heroes.map((hero, idx) => (
                  <div key={hero.id} className="hero-editor-card">
                    <div className="editor-card-header">
                      <h4>Hero #{idx + 1}: {hero.name}</h4>
                      {formData.heroes.length > 1 && (
                        <button
                          className="btn-icon-danger"
                          onClick={() => handleRemoveHero(idx)}
                          title={`Remove ${hero.name}`}
                        >
                          <Trash2 size={15} /> Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={hero.name}
                          onChange={(e) => handleHeroChange(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Max HP</label>
                        <input
                          type="number"
                          value={hero.maxHp}
                          onChange={(e) => handleHeroChange(idx, 'maxHp', parseInt(e.target.value, 10) || 1)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Max Stamina</label>
                        <input
                          type="number"
                          value={hero.maxStamina}
                          onChange={(e) => handleHeroChange(idx, 'maxStamina', parseInt(e.target.value, 10) || 1)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Relic Preset</label>
                        <select
                          className="custom-select"
                          value={hero.relicAction?.id || ''}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const preset = RELIC_PRESETS.find((r) => r.id === selectedId);
                            if (preset) {
                              handleHeroChange(idx, 'relicName', preset.relicName);
                              setFormData((prev) => {
                                const updatedHeroes = [...prev.heroes];
                                updatedHeroes[idx] = {
                                  ...updatedHeroes[idx],
                                  relicName: preset.relicName,
                                  relicAction: { ...preset }
                                };
                                return { ...prev, heroes: updatedHeroes };
                              });
                            }
                          }}
                        >
                          <option value="">Custom Relic</option>
                          {RELIC_PRESETS.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                              {preset.relicName} — {preset.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Relic Name</label>
                        <input
                          type="text"
                          value={hero.relicName}
                          onChange={(e) => handleHeroChange(idx, 'relicName', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="relic-editor-box">
                      <h5>Relic Ability Settings</h5>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Ability Name</label>
                          <input
                            type="text"
                            value={hero.relicAction.name}
                            onChange={(e) => handleRelicActionChange(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Stamina Cost</label>
                          <input
                            type="number"
                            value={hero.relicAction.staminaCost}
                            onChange={(e) => handleRelicActionChange(idx, 'staminaCost', parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Damage</label>
                          <input
                            type="number"
                            value={hero.relicAction.damage}
                            onChange={(e) => handleRelicActionChange(idx, 'damage', parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Block</label>
                          <input
                            type="number"
                            value={hero.relicAction.block}
                            onChange={(e) => handleRelicActionChange(idx, 'block', parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                        <div className="form-group checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={hero.relicAction.drawsAggro}
                              onChange={(e) => handleRelicActionChange(idx, 'drawsAggro', e.target.checked)}
                            />
                            Draws Aggro?
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GAME RULES */}
          {activeTab === 'rules' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group">
                  <label>Max Rounds (Allotted Time)</label>
                  <input
                    type="number"
                    value={formData.gameRules.maxRounds}
                    onChange={(e) => handleRulesChange('maxRounds', parseInt(e.target.value, 10) || 1)}
                  />
                </div>
                <div className="form-group">
                  <label>Movement Base Stamina Cost</label>
                  <input
                    type="number"
                    value={formData.gameRules.movementStaminaCost}
                    onChange={(e) => handleRulesChange('movementStaminaCost', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>KO Revive HP Ratio (e.g. 0.5 = 50%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.gameRules.koReviveHpPercent}
                    onChange={(e) => handleRulesChange('koReviveHpPercent', parseFloat(e.target.value) || 0.5)}
                  />
                </div>
                <div className="form-group">
                  <label>Stamina Cost Penalty per KO</label>
                  <input
                    type="number"
                    value={formData.gameRules.koStaminaPenaltyPerCount}
                    onChange={(e) => handleRulesChange('koStaminaPenaltyPerCount', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: JSON IMPORT / EXPORT */}
          {activeTab === 'json' && (
            <div className="form-section">
              <p className="phase-desc">Edit or paste complete game rule configurations in JSON format:</p>
              <textarea
                className="json-textarea"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={14}
              />
              <div className="json-action-row">
                <button className="btn-secondary" onClick={handleExportJson}>
                  <Download size={16} /> Download JSON File
                </button>
                <button className="btn-primary" onClick={handleApplyJsonText}>
                  <Upload size={16} /> Load & Apply JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setFormData(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))}>
            <RotateCcw size={16} /> Reset to PDF Defaults
          </button>
          <div className="flex-right">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>
              <Save size={16} /> Apply & Restart Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
