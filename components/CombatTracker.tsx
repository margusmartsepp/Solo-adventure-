
import React from 'react';
import { PlayerCharacter, Enemy } from '../types';

type Combatant = (PlayerCharacter | Enemy) & { initiative?: number };

interface CombatTrackerProps {
  combatants: Combatant[];
  currentTurnId: string | null;
}

export const CombatTracker: React.FC<CombatTrackerProps> = ({ combatants, currentTurnId }) => {
  if (combatants.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-slate-700 shadow-lg">
      <h2 className="text-xl font-bold text-amber-400 mb-3 text-center border-b-2 border-amber-500/30 pb-2">Initiative</h2>
      <ul className="space-y-2">
        {combatants.map((c) => {
          const isCurrent = c.id === currentTurnId;
          const isPC = 'class' in c;
          const hpPercentage = (c.hit_points.current / c.hit_points.max) * 100;

          return (
            <li
              key={c.id}
              className={`p-3 rounded-md transition-all duration-300 ${isCurrent ? 'bg-amber-500/20 ring-2 ring-amber-400 scale-105' : 'bg-slate-700/50'}`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-bold ${isPC ? 'text-cyan-300' : 'text-red-400'}`}>{c.name}</span>
                <span className="text-sm text-slate-400">
                  HP: {c.hit_points.current}/{c.hit_points.max}
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2">
                <div
                  className={`${isPC ? 'bg-cyan-500' : 'bg-red-600'} h-1.5 rounded-full`}
                  style={{ width: `${hpPercentage}%` }}
                ></div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
