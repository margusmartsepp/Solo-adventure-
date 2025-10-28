
import React, { useState } from 'react';

interface ActionBarProps {
  onAction: (action: string, targetId?: string) => void;
  isPlayerTurn: boolean;
  enemyIds: string[];
}

export const ActionBar: React.FC<ActionBarProps> = ({ onAction, isPlayerTurn, enemyIds }) => {
  const [targetId, setTargetId] = useState<string>(enemyIds[0] || '');

  const handleAttack = () => {
    if (targetId) {
      onAction('attack', targetId);
    }
  };

  const commonButtonClasses = "px-4 py-2 rounded-md font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryButtonClasses = `bg-amber-600 hover:bg-amber-500 text-white shadow-md disabled:bg-slate-600 ${commonButtonClasses}`;
  const secondaryButtonClasses = `bg-slate-700 hover:bg-slate-600 text-slate-200 ${commonButtonClasses}`;

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border-t-2 border-slate-700 p-4 flex items-center justify-between gap-4">
      <div className="flex gap-2 items-center">
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          disabled={!isPlayerTurn || enemyIds.length === 0}
          className="bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          {enemyIds.map(id => <option key={id} value={id}>{id.replace('enemy_', '').replace('_', ' ')}</option>)}
        </select>
        <button onClick={handleAttack} disabled={!isPlayerTurn || enemyIds.length === 0} className={primaryButtonClasses}>
          Attack
        </button>
        <button onClick={() => onAction('search')} disabled={!isPlayerTurn} className={secondaryButtonClasses}>
          Search
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onAction('save')} className={secondaryButtonClasses}>Save</button>
        <button onClick={() => onAction('load')} className={secondaryButtonClasses}>Load</button>
        <button onClick={() => onAction('image')} className={secondaryButtonClasses}>Visualize Scene</button>
      </div>
    </div>
  );
};
