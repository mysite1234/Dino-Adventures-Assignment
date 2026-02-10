'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import MiniPlayer from './MiniPlayer';

const MiniPlayerContext = createContext();

export function useMiniPlayer() {
  return useContext(MiniPlayerContext);
}

export function GlobalMiniPlayerProvider({ children }) {
  const [miniPlayerState, setMiniPlayerState] = useState({
    isVisible: false,
    video: null,
    category: null,
    isPlaying: false
  });
  const pathname = usePathname();

  // Load mini player state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('miniPlayerState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState.isVisible && parsedState.video) {
        setMiniPlayerState(parsedState);
      }
    }
  }, []);

  // Save mini player state to localStorage
  useEffect(() => {
    if (miniPlayerState.isVisible) {
      localStorage.setItem('miniPlayerState', JSON.stringify(miniPlayerState));
    } else {
      localStorage.removeItem('miniPlayerState');
    }
  }, [miniPlayerState]);

  // Don't show mini player on video pages
  const shouldShowMiniPlayer = miniPlayerState.isVisible && 
                              miniPlayerState.video && 
                              !pathname.includes('/video/');

  const togglePlay = () => {
    setMiniPlayerState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const closeMiniPlayer = () => {
    setMiniPlayerState({
      isVisible: false,
      video: null,
      category: null,
      isPlaying: false
    });
  };

  const expandMiniPlayer = () => {
    if (miniPlayerState.video) {
      window.location.href = `/video/${miniPlayerState.video.slug}`;
    }
  };

  const setMiniPlayer = (video, category, isPlaying = true) => {
    setMiniPlayerState({
      isVisible: true,
      video,
      category,
      isPlaying
    });
  };

  return (
    <MiniPlayerContext.Provider value={{ setMiniPlayer, closeMiniPlayer }}>
      {children}
      
      {shouldShowMiniPlayer && (
        <MiniPlayer
          video={miniPlayerState.video}
          category={miniPlayerState.category}
          isPlaying={miniPlayerState.isPlaying}
          onTogglePlay={togglePlay}
          onClose={closeMiniPlayer}
          onExpand={expandMiniPlayer}
        />
      )}
    </MiniPlayerContext.Provider>
  );
}