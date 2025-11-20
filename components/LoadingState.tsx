
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
    <div className="flex flex-col items-center justify-center text-center text-gray-400 p-8 h-full animate-fade-in">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-purple-500 border-l-purple-500 border-b-transparent border-r-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <Icon icon="sparkles" className="w-10 h-10 text-purple-400 animate-pulse" />
        </div>
      </div>
      <p className="text-lg text-white font-semibold transition-opacity duration-500">{message}</p>
    </div>
  );
};
