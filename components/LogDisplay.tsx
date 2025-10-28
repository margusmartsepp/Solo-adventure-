
import React, { useRef, useEffect } from 'react';
import { LogEntry, LogEntryType } from '../types';

interface LogDisplayProps {
  log: LogEntry[];
  isLoading: boolean;
}

const getIconForType = (type: LogEntryType) => {
  switch (type) {
    case 'narrative': return '📖';
    case 'combat': return '⚔️';
    case 'dice_roll': return '🎲';
    case 'system': return '⚙️';
    case 'dialogue': return '💬';
    default: return '➡️';
  }
};

const getStyleForType = (type: LogEntryType) => {
    switch(type) {
        case 'narrative': return 'text-slate-300 italic';
        case 'combat': return 'text-red-400 font-semibold';
        case 'dice_roll': return 'text-amber-400 bg-slate-800/50 p-2 rounded-md my-1 font-mono text-sm';
        case 'system': return 'text-cyan-400 text-xs text-center my-2';
        case 'dialogue': return 'text-green-300';
        default: return 'text-gray-400';
    }
}

export const LogDisplay: React.FC<LogDisplayProps> = ({ log, isLoading }) => {
  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm p-4 rounded-lg border border-slate-700 shadow-inner h-full flex flex-col">
      <div className="flex-grow overflow-y-auto pr-2">
        <ul className="space-y-3">
          {log.map((entry) => (
            <li key={entry.id} className={`flex items-start gap-3 ${getStyleForType(entry.type)}`}>
              <span className="mt-0.5">{getIconForType(entry.type)}</span>
              <p className="flex-1">{entry.content}</p>
            </li>
          ))}
        </ul>
        {isLoading && (
             <div className="flex items-center gap-3 text-slate-400 animate-pulse mt-4">
                <span>🧠</span>
                <p>The DM is thinking...</p>
            </div>
        )}
        <div ref={endOfLogRef} />
      </div>
    </div>
  );
};
