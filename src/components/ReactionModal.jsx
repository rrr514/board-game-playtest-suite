import React from 'react';
import { useGame } from '../context/GameContext';
import { ShieldAlert, Check } from 'lucide-react';

export default function ReactionModal() {
  const { pendingReaction, dismissReactionModal } = useGame();

  if (!pendingReaction) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card reaction-modal-card">
        <div className="modal-header header-reaction">
          <ShieldAlert size={28} className="text-amber icon-pulse" />
          <h3>{pendingReaction.title}</h3>
        </div>

        <div className="modal-body">
          <p className="reaction-body-text">{pendingReaction.description}</p>
        </div>

        <div className="modal-footer">
          <button className="btn-primary w-full" onClick={dismissReactionModal}>
            <Check size={18} /> Resolve Reaction & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
