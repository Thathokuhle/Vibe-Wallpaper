
import React from 'react';
import { AspectRatio, ASPECT_RATIOS } from '../types';
import { Icon } from './Icon';

interface PromptFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  onSubmit: (prompt: string, aspectRatio: AspectRatio) => void;
  isLoading: boolean;
}

export const PromptForm: React.FC<PromptFormProps> = ({ prompt, setPrompt, aspectRatio, setAspectRatio, onSubmit, isLoading }) => {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt, aspectRatio);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-t border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-grow w-full">
           <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'rainy cyberpunk lo-fi street'"
            rows={1}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 pl-4 pr-12 resize-none text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
            disabled={isLoading}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                }
            }}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-shrink-0">
            <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="appearance-none w-full sm:w-auto bg-gray-800 border border-gray-600 rounded-lg py-3 pl-4 pr-10 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
                disabled={isLoading}
            >
                {ASPECT_RATIOS.map(ratio => (
                    <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <Icon icon="chevronDown" className="w-5 h-5" />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-purple-600 text-white rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-purple-700 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200"
          >
            {isLoading ? 
                <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> :
                <Icon icon="send" className="w-6 h-6" />
            }
          </button>
        </div>
      </form>
    </div>
  );
};
