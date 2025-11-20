
import React, { useState, useCallback } from 'react';
import { PromptForm } from './components/PromptForm';
import { ImageGrid } from './components/ImageGrid';
import { FullScreenView } from './components/FullScreenView';
import { LoadingState } from './components/LoadingState';
import { PromptHistoryModal } from './components/PromptHistoryModal';
import { generateWallpapers } from './services/geminiService';
import { GeneratedImage, AspectRatio } from './types';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleGenerate = useCallback(async (currentPrompt: string, currentAspectRatio: AspectRatio) => {
    if (!currentPrompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImages([]); // Clear previous images for a fresh look
    
    // Save to history
    try {
      const history = JSON.parse(localStorage.getItem('prompt_history') || '[]');
      // Remove duplicates of current prompt and keep max 20
      const updatedHistory = [currentPrompt, ...history.filter((p: string) => p !== currentPrompt)].slice(0, 20);
      localStorage.setItem('prompt_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn("Failed to save prompt history", e);
    }

    try {
      const generatedImages = await generateWallpapers(currentPrompt, currentAspectRatio);
      setImages(generatedImages);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleRemix = useCallback(() => {
    if (selectedImage) {
      const originalPrompt = selectedImage.prompt;
      setSelectedImage(null);
      setPrompt(originalPrompt);
      setTimeout(() => {
         handleGenerate(originalPrompt, aspectRatio);
      }, 300); // Allow modal to animate out
    }
  }, [selectedImage, aspectRatio, handleGenerate]);

  const handleSelectImage = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const handleCloseFullScreen = () => {
    setSelectedImage(null);
  };

  const startNewChat = () => {
    setPrompt('');
    setImages([]);
    setError(null);
    setIsHistoryOpen(false);
  };

  const InitialState = () => (
    <div className="flex flex-col items-center justify-center text-center text-gray-400 p-8 max-w-2xl mx-auto">
      <Icon icon="sparkles" className="w-16 h-16 mb-4 text-purple-400" />
      <h2 className="text-2xl font-bold text-white mb-2">Welcome to VibeWallpapers AI</h2>
      <p className="text-gray-400">Describe your desired vibe, scene, or style in the box below to generate unique wallpapers.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-900 relative">
      {/* Sidebar Toggle */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          title="Open Sidebar"
        >
          <Icon icon="sidebar" className="w-6 h-6" />
        </button>
      </div>

      {/* Header title for mobile/desktop */}
      <div className="absolute top-4 w-full text-center pointer-events-none z-20">
         <span className="text-gray-500 font-medium text-sm tracking-wider opacity-80 hidden sm:inline-block">Phumlanitech AI 1.0</span>
      </div>

      <main className="flex-grow overflow-y-auto p-4 md:p-6 pb-28 md:pb-32 pt-16">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center text-red-400 p-8">
             <Icon icon="error" className="w-16 h-16 mb-4" />
             <h2 className="text-2xl font-bold text-red-300 mb-2">Generation Failed</h2>
             <p>{error}</p>
          </div>
        ) : images.length > 0 ? (
          <ImageGrid images={images} onImageClick={handleSelectImage} />
        ) : (
          <InitialState />
        )}
      </main>

      <PromptForm
        prompt={prompt}
        setPrompt={setPrompt}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        onSubmit={handleGenerate}
        isLoading={isLoading}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />
      
      {selectedImage && (
        <FullScreenView
          image={selectedImage}
          onClose={handleCloseFullScreen}
          onRemix={handleRemix}
        />
      )}

      {isHistoryOpen && (
        <PromptHistoryModal
          onClose={() => setIsHistoryOpen(false)}
          onSelectPrompt={(selected) => setPrompt(selected)}
          onNewChat={startNewChat}
        />
      )}
    </div>
  );
};

export default App;
