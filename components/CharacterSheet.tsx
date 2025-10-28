
import React from 'react';
import { PlayerCharacter } from '../types';
import { calculateModifier, formatModifier } from '../services/gameLogic';

interface CharacterSheetProps {
  character: PlayerCharacter;
}

const StatBlock: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const modifier = calculateModifier(score);
  return (
    <div className="flex flex-col items-center bg-slate-700/50 p-2 rounded-lg border border-slate-600">
      <div className="text-xs font-bold text-amber-300">{label}</div>
      <div className="text-2xl font-bold">{score}</div>
      <div className="text-sm bg-slate-800 px-2 py-0.5 rounded-full">{formatModifier(modifier)}</div>
    </div>
  );
};

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character }) => {
  if (!character) return null;

  const hpPercentage = (character.hit_points.current / character.hit_points.max) * 100;

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-slate-700 shadow-lg h-full flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-amber-400">{character.name}</h2>
        <p className="text-sm text-slate-400">Level {character.level} {character.race} {character.class}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div className="bg-slate-700/50 p-2 rounded-lg">
          <div className="text-xs text-slate-400">AC</div>
          <div className="text-xl font-bold">{character.armor_class}</div>
        </div>
        <div className="bg-slate-700/50 p-2 rounded-lg">
          <div className="text-xs text-slate-400">Speed</div>
          <div className="text-xl font-bold">{character.speed} ft</div>
        </div>
        <div className="bg-slate-700/50 p-2 rounded-lg">
          <div className="text-xs text-slate-400">Prof. Bonus</div>
          <div className="text-xl font-bold">+{character.proficiency_bonus}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm font-bold text-slate-300 mb-1">Hit Points</div>
        <div className="w-full bg-red-900/50 rounded-full h-6 border border-red-700">
          <div
            className="bg-red-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${hpPercentage}%` }}
          ></div>
           <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {character.hit_points.current} / {character.hit_points.max}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatBlock label="STR" score={character.abilities.str} />
        <StatBlock label="DEX" score={character.abilities.dex} />
        <StatBlock label="CON" score={character.abilities.con} />
        <StatBlock label="INT" score={character.abilities.int} />
        <StatBlock label="WIS" score={character.abilities.wis} />
        <StatBlock label="CHA" score={character.abilities.cha} />
      </div>

      <div className="flex-grow">
        <h3 className="text-lg font-bold text-amber-300 mb-2">Inventory</h3>
        <ul className="space-y-1 text-sm bg-slate-900/70 p-2 rounded-md h-32 overflow-y-auto">
          {character.inventory.map((item, index) => (
            <li key={index} className="p-1 rounded bg-slate-800/50">{item.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
