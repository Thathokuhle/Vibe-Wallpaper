
import React from 'react';
import { Icon } from './Icon';

interface PromptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: string[];
  onSelectPrompt: (prompt: string) => void;
  onNewChat: () => void;
  onClearHistory: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const PromptHistoryModal: React.FC<PromptHistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelectPrompt, 
  onNewChat,
  onClearHistory,
  isDark,
  onToggleTheme
}) => {

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-white dark:bg-[#171717] text-slate-800 dark:text-[#ECECEC] flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        {/* Top Section: New Chat & Close */}
        <div className="p-3 flex items-center gap-2">
          <button
             onClick={onNewChat}
             className="flex-1 flex items-center gap-2 px-3 py-3 border border-[#318ba2]/60 hover:bg-[#318ba2]/15 rounded-md transition-colors duration-200 text-sm text-slate-700 dark:text-[#e6f7fb]"
           >
             <Icon icon="plus" className="w-4 h-4" />
             <span>New creation</span>
           </button>
           
           <button 
             onClick={onClose}
             className="p-3 border border-transparent hover:bg-slate-200/70 dark:hover:bg-[#2A2B32] text-[#4a99ae] dark:text-[#6fbdd0] hover:text-[#1a2c32] dark:hover:text-[#e6f7fb] rounded-md transition-colors"
             aria-label="Close sidebar"
             title="Close Sidebar"
           >
             <Icon icon="sidebar" className="w-5 h-5" />
           </button>
        </div>

        {/* History List Section */}
        <div className="flex-1 overflow-y-auto px-3 pb-2 custom-scrollbar">
           <div className="py-2">
              <h3 className="px-3 text-xs font-medium text-[#4faec4] mb-2">Recent</h3>
              <div className="flex flex-col gap-1">
                {history.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-slate-500 dark:text-gray-500 italic">
                    No recent history
                  </div>
                ) : (
                  history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => onSelectPrompt(item)}
                      className="group flex items-center gap-3 w-full px-3 py-3 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-[#2A2B32] transition-colors duration-200 overflow-hidden text-left relative"
                    >
                      <Icon icon="message" className="w-4 h-4 text-[#5fb3c6] group-hover:text-[#2c6e7f] dark:group-hover:text-[#c9f0f8] flex-shrink-0" />
                      <span className="truncate flex-1 text-slate-700 dark:text-gray-100 opacity-90 group-hover:opacity-100">{item}</span>
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-[#171717] to-transparent group-hover:from-slate-100 dark:group-hover:from-[#2A2B32]"></div>
                    </button>
                  ))
                )}
              </div>
           </div>
           
           {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="mt-4 flex items-center gap-3 w-full px-3 py-3 text-sm text-[#4a99ae] dark:text-[#6fbdd0] hover:text-[#1a2c32] dark:hover:text-[#d9f6fb] hover:bg-slate-100 dark:hover:bg-[#2A2B32] rounded-lg transition-colors"
              >
                <Icon icon="trash" className="w-4 h-4" />
                <span>Clear history</span>
              </button>
           )}
        </div>

        {/* Footer: User Profile */}
        <div className="p-3 border-t border-slate-200/70 dark:border-white/10">
          <button className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2A2B32] transition-colors duration-200 text-left">
            <div className="w-8 h-8 rounded-full bg-[#318ba2] flex items-center justify-center text-white text-xs font-bold">
               <Icon icon="user" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
               <div className="text-sm font-medium text-slate-800 dark:text-white truncate">Guest User</div>
               <div className="text-xs text-slate-500 dark:text-gray-400 truncate">Sign in to save</div>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-pressed={isDark}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-[#318ba2]/40 text-[#318ba2] hover:bg-[#318ba2]/10 transition-colors"
              title="Toggle theme"
            >
              <Icon icon={isDark ? 'sun' : 'moon'} className="w-4 h-4" />
            </button>
          </button>
        </div>

      </div>
    </>
  );
};
