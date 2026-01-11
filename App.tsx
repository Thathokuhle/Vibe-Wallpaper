import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PromptForm } from './components/PromptForm';
import { ImageGrid } from './components/ImageGrid';
import { FullScreenView } from './components/FullScreenView';
import { LoadingState } from './components/LoadingState';
import { PromptHistoryModal } from './components/PromptHistoryModal';
import { AuthModal } from './components/AuthModal';
import { generateWallpapers } from './services/geminiService';
import { GeneratedImage, AspectRatio } from './types';
import { Icon } from './components/Icon';
import { Background3D } from './components/Background3D';
import { supabase } from './services/supabaseClient';
import type { User } from '@supabase/supabase-js';

type ThemeMode = 'light' | 'dark';

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch (e) {
    console.warn("Failed to load theme preference", e);
  }
  return 'light';
};

const loadLocalHistory = (): string[] => {
  try {
    const saved = localStorage.getItem('prompt_history');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Failed to load history", e);
  }
  return [];
};

const saveLocalHistory = (items: string[]) => {
  try {
    localStorage.setItem('prompt_history', JSON.stringify(items));
  } catch (e) {
    console.warn("Failed to save prompt history", e);
  }
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const migratedUserIdRef = useRef<string | null>(null);
  
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
    setHistory(loadLocalHistory());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn("Failed to save theme preference", e);
    }
  }, [theme]);

  const fetchHistoryFromDb = useCallback(async (currentUser: User) => {
    const { data, error: dbError } = await supabase
      .from('prompt_history')
      .select('prompt, created_at')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (dbError) {
      console.warn('Failed to load history from database', dbError);
      return;
    }

    const prompts = (data || []).map((row) => row.prompt).filter(Boolean);
    setHistory(prompts);
  }, []);

  const migrateLocalHistory = useCallback(async (currentUser: User) => {
    const localHistory = loadLocalHistory();
    if (localHistory.length === 0) return;

    const now = Date.now();
    const payload = localHistory.map((prompt, index) => ({
      user_id: currentUser.id,
      prompt,
      created_at: new Date(now - index * 1000).toISOString(),
    }));

    const { error: dbError } = await supabase
      .from('prompt_history')
      .upsert(payload, { onConflict: 'user_id,prompt' });

    if (dbError) {
      console.warn('Failed to migrate history to database', dbError);
      return;
    }

    localStorage.removeItem('prompt_history');
  }, []);

  const savePromptToDb = useCallback(async (currentUser: User, promptText: string) => {
    const { error: dbError } = await supabase
      .from('prompt_history')
      .upsert(
        {
          user_id: currentUser.id,
          prompt: promptText,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,prompt' }
      );

    if (dbError) {
      console.warn('Failed to save prompt history', dbError);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) return;
      if (sessionError) {
        console.warn('Failed to get auth session', sessionError);
      }
      setUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setHistory(loadLocalHistory());
      return;
    }

    const hydrateHistory = async () => {
      if (migratedUserIdRef.current !== user.id) {
        await migrateLocalHistory(user);
        migratedUserIdRef.current = user.id;
      }
      await fetchHistoryFromDb(user);
    };

    void hydrateHistory();
  }, [user, fetchHistoryFromDb, migrateLocalHistory]);

  const updateHistory = useCallback((currentPrompt: string) => {
    setHistory((prev) => {
      const nextHistory = [currentPrompt, ...prev.filter((p) => p !== currentPrompt)].slice(0, 20);
      if (!user) {
        saveLocalHistory(nextHistory);
      }
      return nextHistory;
    });

    if (user) {
      void savePromptToDb(user, currentPrompt);
    }
  }, [user, savePromptToDb]);

  const handleGenerate = useCallback(async (currentPrompt: string, currentAspectRatio: AspectRatio) => {
    if (!currentPrompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImages([]); 
    
    updateHistory(currentPrompt);

    try {
      const generatedImages = await generateWallpapers(currentPrompt, currentAspectRatio);
      setImages(generatedImages);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, updateHistory]);

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

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (user) {
      void supabase
        .from('prompt_history')
        .delete()
        .eq('user_id', user.id)
        .then(({ error: dbError }) => {
          if (dbError) {
            console.warn('Failed to clear prompt history', dbError);
          }
        });
    } else {
      localStorage.removeItem('prompt_history');
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleSignOut = useCallback(() => {
    void supabase.auth.signOut();
  }, []);

  const InitialState = () => (
    <div className="flex flex-col items-center justify-center text-center text-slate-500 dark:text-gray-400 p-8 max-w-2xl mx-auto mt-20">
      <div className="w-16 h-16 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-[#318ba2]/40">
          <Icon icon="sparkles" className="w-8 h-8 text-[#318ba2]" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-shadow-sm">VibeWallpapers AI</h2>
      <p className="text-slate-600 dark:text-gray-300 max-w-md drop-shadow-md">Describe a scene, feeling, or aesthetic. We'll craft four unique wallpapers for you.</p>
    </div>
  );

  return (
    <div className="flex h-[100dvh] bg-transparent text-slate-900 dark:text-gray-100 overflow-hidden relative">
      
      <Background3D theme={theme} />

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
        isDark={theme === 'dark'}
        onToggleTheme={toggleTheme}
        userEmail={user?.email}
        isAuthenticated={Boolean(user)}
        onOpenAuth={openAuthModal}
        onSignOut={handleSignOut}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
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
                  className="p-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-200/70 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
                  title="Open Sidebar"
                >
                  <Icon icon="sidebar" className="w-6 h-6" />
                </button>
              )}
            </div>
            
            <span className={`text-[#318ba2] font-medium text-sm tracking-wider opacity-90 ml-4 pointer-events-auto drop-shadow-md ${isSidebarOpen ? 'hidden md:inline-block' : ''}`}>
              Phumlanitech AI
            </span>
        </div>

        <main className="flex-grow overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth relative z-10">
            {isLoading ? (
            <LoadingState />
            ) : error ? (
            <div className="flex flex-col items-center justify-center text-center text-red-500 dark:text-red-400 p-8 mt-20 animate-fade-in bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-xl max-w-lg mx-auto">
                <Icon icon="error" className="w-12 h-12 mb-4 opacity-80" />
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-300 mb-2">Generation Failed</h2>
                <p className="text-sm opacity-80 text-slate-600 dark:text-gray-300">{error}</p>
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
