import React, { useState, useCallback, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { ImageGrid } from './components/ImageGrid';
import { FullScreenView } from './components/FullScreenView';
import { LoadingState } from './components/LoadingState';
import { PromptHistoryModal } from './components/PromptHistoryModal';
import { generateWallpapers } from './services/geminiService';
import { GeneratedImage, AspectRatio } from './types';
import { Icon } from './components/Icon';
import { Background3D } from './components/Background3D';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  
  // Sidebar & History State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [history, setHistory] = useState<string[]>([]);

  // Initialize
  useEffect(() => {
    // Default to closed on mobile, open on desktop
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    // Load history
    try {
      const saved = localStorage.getItem('prompt_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.warn("Failed to load history", e);
    }
  }, []);

  const handleGenerate = useCallback(async (currentPrompt: string, currentAspectRatio: AspectRatio) => {
    if (!currentPrompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImages([]); 
    
    // Save to history
    try {
      const newHistory = [currentPrompt, ...history.filter((p: string) => p !== currentPrompt)].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('prompt_history', JSON.stringify(newHistory));
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
  }, [isLoading, history]);

  const handleRemix = useCallback(() => {
    if (selectedImage) {
      const originalPrompt = selectedImage.prompt;
      setSelectedImage(null);
      setPrompt(originalPrompt);
      setTimeout(() => {
         handleGenerate(originalPrompt, aspectRatio);
      }, 300); 
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
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('prompt_history');
  };

  const InitialState = () => (
    <div className="flex flex-col items-center justify-center text-center text-gray-400 p-8 max-w-2xl mx-auto mt-20">
      <div className="w-16 h-16 bg-gray-800/50 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-gray-700">
          <Icon icon="sparkles" className="w-8 h-8 text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 text-shadow-sm">VibeWallpapers AI</h2>
      <p className="text-gray-300 max-w-md drop-shadow-md">Describe a scene, feeling, or aesthetic. We'll craft four unique wallpapers for you.</p>
    </div>
  );

  return (
    <div className="flex h-[100dvh] bg-transparent text-gray-100 overflow-hidden relative">
      
      <Background3D />

      <PromptHistoryModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        history={history}
        onSelectPrompt={(selected) => {
          setPrompt(selected);
          if (window.innerWidth < 768) setIsSidebarOpen(false);
        }}
        onNewChat={startNewChat}
        onClearHistory={clearHistory}
      />

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col h-full relative z-10 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-[260px]' : ''}`}>
        
        {/* Header / Toggle */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center pointer-events-none">
            <div className="pointer-events-auto">
              {/* Show toggle if sidebar is closed */}
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
                  title="Open Sidebar"
                >
                  <Icon icon="sidebar" className="w-6 h-6" />
                </button>
              )}
            </div>
            
            <span className={`text-gray-300 font-medium text-sm tracking-wider opacity-80 ml-4 pointer-events-auto drop-shadow-md ${isSidebarOpen ? 'hidden md:inline-block' : ''}`}>
              Phumlanitech AI
            </span>
        </div>

        <main className="flex-grow overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth relative z-10">
            {isLoading ? (
            <LoadingState />
            ) : error ? (
            <div className="flex flex-col items-center justify-center text-center text-red-400 p-8 mt-20 animate-fade-in bg-black/30 backdrop-blur-sm rounded-xl max-w-lg mx-auto">
                <Icon icon="error" className="w-12 h-12 mb-4 opacity-80" />
                <h2 className="text-xl font-semibold text-red-300 mb-2">Generation Failed</h2>
                <p className="text-sm opacity-80">{error}</p>
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
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
        />
      </div>

      {selectedImage && (
        <FullScreenView
          image={selectedImage}
          onClose={handleCloseFullScreen}
          onRemix={handleRemix}
        />
      )}
    </div>
  );
};

export default App;