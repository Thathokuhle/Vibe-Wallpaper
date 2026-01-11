
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
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const PromptForm: React.FC<PromptFormProps> = ({ 
  prompt, 
  setPrompt, 
  aspectRatio, 
  setAspectRatio, 
  onSubmit, 
  isLoading, 
  onToggleSidebar,
  isSidebarOpen 
}) => {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt, aspectRatio);
  };

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-[#318ba2]/30 p-4 transition-all duration-300 ease-in-out"
    >
      <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-grow w-full">
            <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'rainy cyberpunk lo-fi street'"
            rows={1}
            className="w-full bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg py-3 pl-4 pr-12 resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#318ba2] focus:border-[#318ba2] transition-shadow duration-200"
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
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 text-slate-500 dark:text-gray-300 rounded-lg hover:bg-slate-200/70 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white focus:ring-2 focus:ring-[#318ba2] transition-colors duration-200 ${isSidebarOpen ? 'hidden md:hidden' : ''}`}
            title="Show History"
          >
            <Icon icon="history" className="w-5 h-5" />
          </button>

          <div className="relative flex-shrink-0">
            <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="appearance-none w-full sm:w-auto bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg py-3 pl-4 pr-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#318ba2] focus:border-[#318ba2] transition-shadow duration-200"
                disabled={isLoading}
            >
                {ASPECT_RATIOS.map(ratio => (
                    <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 dark:text-gray-400">
                <Icon icon="chevronDown" className="w-5 h-5" />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#318ba2] text-white rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-[#2a7a8f] focus:ring-4 focus:ring-[#318ba2] focus:ring-opacity-50 transition-all duration-200"
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
