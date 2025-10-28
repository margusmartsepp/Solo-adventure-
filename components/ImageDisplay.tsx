
import React from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading }) => {
  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
      {isLoading && (
        <div className="text-slate-400 animate-pulse">Generating image...</div>
      )}
      {!isLoading && imageUrl && (
        <img src={imageUrl} alt="Generated Scene" className="w-full h-full object-cover" />
      )}
      {!isLoading && !imageUrl && (
        <div className="text-slate-500 text-center p-4">
            <p>The world is veiled in mist.</p>
            <p className="text-xs">Click "Visualize Scene" to reveal it.</p>
        </div>
      )}
    </div>
  );
};
