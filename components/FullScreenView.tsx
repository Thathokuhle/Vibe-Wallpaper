
import React from 'react';
import { GeneratedImage } from '../types';
import { Icon } from './Icon';

interface FullScreenViewProps {
  image: GeneratedImage;
  onClose: () => void;
  onRemix: () => void;
}

export const FullScreenView: React.FC<FullScreenViewProps> = ({ image, onClose, onRemix }) => {
  const downloadUrl = `data:image/jpeg;base64,${image.base64}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md md:max-w-lg lg:max-w-xl h-full flex flex-col items-center justify-center p-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the content
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
          aria-label="Close"
        >
          <Icon icon="close" className="w-6 h-6" />
        </button>

        <div className="relative w-full aspect-[9/16] max-h-[80vh] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
           <img
            src={`data:image/jpeg;base64,${image.base64}`}
            alt={image.prompt}
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex items-center gap-4 mt-6">
          <a
            href={downloadUrl}
            download={`VibeWallpaper-${Date.now()}.jpg`}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Icon icon="download" className="w-5 h-5" />
            <span>Download</span>
          </a>
          <button
            onClick={onRemix}
            className="flex items-center gap-2 px-6 py-3 bg-[#318ba2] text-white font-semibold rounded-lg hover:bg-[#2a7a8f] transition-colors shadow-lg"
          >
            <Icon icon="remix" className="w-5 h-5" />
            <span>Remix</span>
          </button>
        </div>
      </div>
    </div>
  );
};
