
import React from 'react';
import { GeneratedImage } from '../types';

interface ImageGridProps {
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {images.map((image, index) => (
        <div
          key={index}
          className="aspect-[9/16] bg-white/80 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer group relative transform hover:-translate-y-1 transition-transform duration-300 shadow-lg hover:shadow-[0_12px_30px_rgba(49,139,162,0.25)]"
          onClick={() => onImageClick(image)}
        >
          <img
            src={`data:image/jpeg;base64,${image.base64}`}
            alt={image.prompt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <p className="text-white text-lg font-bold">View</p>
          </div>
        </div>
      ))}
    </div>
  );
};
