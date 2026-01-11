
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

const loadingMessages = [
  "Generating your vibe...",
  "Mixing digital paints...",
  "Consulting the AI muse...",
  "Warming up the pixels...",
  "This might take a moment...",
  "Crafting your masterpiece...",
];

export const LoadingState: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center text-slate-500 dark:text-gray-400 p-8 h-full animate-fade-in">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-[#318ba2]/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-[#318ba2] border-l-[#318ba2] border-b-transparent border-r-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <Icon icon="sparkles" className="w-10 h-10 text-[#318ba2] animate-pulse" />
        </div>
      </div>
      <p className="text-lg text-slate-900 dark:text-white font-semibold transition-opacity duration-500">{message}</p>
    </div>
  );
};
