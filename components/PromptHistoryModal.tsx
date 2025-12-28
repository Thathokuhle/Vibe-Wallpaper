
import React from 'react';
import { Icon } from './Icon';

interface PromptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: string[];
  onSelectPrompt: (prompt: string) => void;
  onNewChat: () => void;
  onClearHistory: () => void;
}

export const PromptHistoryModal: React.FC<PromptHistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelectPrompt, 
  onNewChat,
  onClearHistory
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-[#171717] text-[#ECECEC] flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        {/* Top Section: New Chat & Close */}
        <div className="p-3 flex items-center gap-2">
          <button
             onClick={onNewChat}
             className="flex-1 flex items-center gap-2 px-3 py-3 border border-white/20 hover:bg-[#2A2B32] rounded-md transition-colors duration-200 text-sm text-white"
           >
             <Icon icon="plus" className="w-4 h-4" />
             <span>New creation</span>
           </button>
           
           <button 
             onClick={onClose}
             className="p-3 border border-transparent hover:bg-[#2A2B32] text-gray-400 hover:text-white rounded-md transition-colors"
             aria-label="Close sidebar"
             title="Close Sidebar"
           >
             <Icon icon="sidebar" className="w-5 h-5" />
           </button>
        </div>

        {/* History List Section */}
        <div className="flex-1 overflow-y-auto px-3 pb-2 custom-scrollbar">
           <div className="py-2">
              <h3 className="px-3 text-xs font-medium text-gray-500 mb-2">Recent</h3>
              <div className="flex flex-col gap-1">
                {history.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 italic">
                    No recent history
                  </div>
                ) : (
                  history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => onSelectPrompt(item)}
                      className="group flex items-center gap-3 w-full px-3 py-3 text-sm rounded-lg hover:bg-[#2A2B32] transition-colors duration-200 overflow-hidden text-left relative"
                    >
                      <Icon icon="message" className="w-4 h-4 text-gray-400 group-hover:text-white flex-shrink-0" />
                      <span className="truncate flex-1 text-gray-100 opacity-90 group-hover:opacity-100">{item}</span>
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#171717] to-transparent group-hover:from-[#2A2B32]"></div>
                    </button>
                  ))
                )}
              </div>
           </div>
           
           {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="mt-4 flex items-center gap-3 w-full px-3 py-3 text-sm text-gray-400 hover:text-white hover:bg-[#2A2B32] rounded-lg transition-colors"
              >
                <Icon icon="trash" className="w-4 h-4" />
                <span>Clear history</span>
              </button>
           )}
        </div>

        {/* Footer: User Profile */}
        <div className="p-3 border-t border-white/10">
          <button className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-[#2A2B32] transition-colors duration-200 text-left">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
               <Icon icon="user" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
               <div className="text-sm font-medium text-white truncate">Guest User</div>
               <div className="text-xs text-gray-400 truncate">Sign in to save</div>
            </div>
          </button>
        </div>

      </div>
    </>
  );
};
