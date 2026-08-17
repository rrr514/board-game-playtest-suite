import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ScrollText, Filter, Trash2 } from 'lucide-react';

export default function GameLog() {
  const { gameLog } = useGame();
  const [filter, setFilter] = useState('all'); // 'all' | 'action' | 'reaction' | 'phase'

  const filteredLogs = gameLog.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  return (
    <div className="game-log-card">
      <div className="log-header">
        <h3>
          <ScrollText size={18} /> Step-by-Step Playtest Log
        </h3>

        <div className="log-filters">
          <button
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-chip ${filter === 'action' ? 'active' : ''}`}
            onClick={() => setFilter('action')}
          >
            Actions
          </button>
          <button
            className={`filter-chip ${filter === 'reaction' ? 'active' : ''}`}
            onClick={() => setFilter('reaction')}
          >
            Reactions
          </button>
          <button
            className={`filter-chip ${filter === 'phase' ? 'active' : ''}`}
            onClick={() => setFilter('phase')}
          >
            Phases
          </button>
        </div>
      </div>

      <div className="log-list-container">
        {filteredLogs.length === 0 ? (
          <p className="log-empty">No events logged yet.</p>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className={`log-item log-type-${log.type}`}>
              <span className="log-timestamp">[{log.timestamp}]</span>
              <span className="log-text">{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
