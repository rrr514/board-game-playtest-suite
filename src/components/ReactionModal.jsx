import React from 'react';
import { useGame } from '../context/GameContext';
import { ShieldAlert, Check } from 'lucide-react';

export default function ReactionModal() {
  const { pendingReaction, pendingReactions, resolveReaction, dismissReactionModal } = useGame();

  const rxList = pendingReactions && pendingReactions.length > 0 ? pendingReactions : (pendingReaction ? [pendingReaction] : []);

  if (rxList.length === 0) return null;

  const isMultiple = rxList.length > 1;

  return (
    <div className="modal-overlay">
      <div className="modal-card reaction-modal-card">
        <div className="modal-header header-reaction">
          <ShieldAlert size={28} className="text-amber icon-pulse" />
          <h3>
            {isMultiple
              ? `🐲 Multiple Boss Reactions Triggered! (${rxList.length} Pending)`
              : rxList[0].title}
          </h3>
        </div>

        <div className="modal-body">
          {isMultiple ? (
            <div>
              <p className="phase-desc text-amber mb-3">
                Multiple reactions occurred! Choose which reaction to resolve first:
              </p>
              <div className="reactions-queue-list">
                {rxList.map((rx, idx) => (
                  <div key={rx.id || idx} className="reaction-queue-card">
                    <div className="rx-card-top">
                      <span className="reaction-badge">Reaction #{idx + 1}</span>
                      <h4>{rx.title}</h4>
                    </div>
                    <p className="reaction-body-text">{rx.description}</p>
                    <button
                      className="btn-primary btn-sm mt-2 w-full"
                      onClick={() => resolveReaction(rx.id)}
                    >
                      <Check size={15} /> Resolve This Reaction First
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="reaction-body-text">{rxList[0].description}</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-primary w-full" onClick={() => resolveReaction(rxList[0].id || rxList[0].title)}>
            <Check size={18} /> {isMultiple ? 'Resolve Next Reaction' : 'Resolve Reaction & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
