'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, Maximize2, X, Move } from 'lucide-react';
import FullScreenPlayer from './FullScreenPlayer';

const MINIMIZED_PLAYER_KEY = 'minimized_player_state';
const MINIMIZED_PLAYER_POSITION_KEY = 'minimized_player_position';

export default function MinimizedPlayer() {
  const router = useRouter();
  const [playerState, setPlayerState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [playerInitialized, setPlayerInitialized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialTouchDistance, setInitialTouchDistance] = useState(null);
  const [isPullingDown, setIsPullingDown] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  
  const youTubePlayerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const minimizedPlayerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const playerInitializationAttempted = useRef(false);
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);

  // Format time
  const formatTime = (time) => {
    if (!time || isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Load player state and position from localStorage
  useEffect(() => {
    // Load saved position
    const savedPosition = localStorage.getItem(MINIMIZED_PLAYER_POSITION_KEY);
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        setPosition(pos);
      } catch (error) {
        console.error('Error parsing saved position:', error);
      }
    }

    // Load player state
    const savedState = localStorage.getItem(MINIMIZED_PLAYER_KEY);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        // Check if state is less than 1 hour old
        if (Date.now() - state.timestamp < 3600000) {
          setPlayerState(state);
          setIsPlaying(state.isPlaying || false);
          setIsMuted(state.isMuted || false);
          setVolume(state.volume || 80);
          setCurrentTime(state.currentTime || 0);
          setDuration(state.duration || 0);
          setProgress(state.progress || 0);
        } else {
          // Clear old state
          localStorage.removeItem(MINIMIZED_PLAYER_KEY);
        }
      } catch (error) {
        console.error('Error parsing saved player state:', error);
        localStorage.removeItem(MINIMIZED_PLAYER_KEY);
      }
    }
  }, []);

  // Save position to localStorage
  const savePosition = useCallback((pos) => {
    localStorage.setItem(MINIMIZED_PLAYER_POSITION_KEY, JSON.stringify(pos));
  }, []);

  // Load YouTube API
  const loadYouTubeAPI = useCallback(() => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = resolve;
    });
  }, []);

  // Initialize YouTube player
  const initializePlayer = useCallback(async () => {
    if (!playerState || !playerContainerRef.current || playerInitializationAttempted.current) return;

    playerInitializationAttempted.current = true;
    setIsLoading(true);

    try {
      // Load YouTube API
      await loadYouTubeAPI();

      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create player div
      const playerDiv = document.createElement('div');
      playerDiv.id = `minimized-youtube-player-${Date.now()}`;
      playerDiv.className = 'w-full h-full';
      
      // Clear container and add player div
      playerContainerRef.current.innerHTML = '';
      playerContainerRef.current.appendChild(playerDiv);

      // Create YouTube player
      const player = new window.YT.Player(playerDiv.id, {
        videoId: playerState.youtubeId,
        playerVars: {
          autoplay: playerState.isPlaying ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            console.log('Minimized YouTube Player Ready');
            youTubePlayerRef.current = event.target;
            
            // Set volume
            event.target.setVolume(volume);
            if (isMuted) {
              event.target.mute();
            }
            
            // Seek to saved time
            if (playerState.currentTime > 0) {
              event.target.seekTo(playerState.currentTime, true);
            }
            
            setIsLoading(false);
            setPlayerInitialized(true);
            
            // Start progress tracking
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            
            progressIntervalRef.current = setInterval(() => {
              if (youTubePlayerRef.current && typeof youTubePlayerRef.current.getCurrentTime === 'function') {
                try {
                  const time = youTubePlayerRef.current.getCurrentTime();
                  const dur = youTubePlayerRef.current.getDuration();
                  setCurrentTime(time);
                  if (dur > 0) {
                    setProgress((time / dur) * 100);
                    setDuration(dur);
                  }
                } catch (error) {
                  console.error('Progress tracking error:', error);
                }
              }
            }, 1000);
          },
          onStateChange: (event) => {
            console.log('Minimized Player State:', event.data);
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
          onError: (event) => {
            console.error('Minimized YouTube Player Error:', event.data);
            setIsLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize minimized player:', error);
      setIsLoading(false);
      playerInitializationAttempted.current = false;
    }
  }, [playerState, volume, isMuted, loadYouTubeAPI]);

  // Initialize player when state is loaded
  useEffect(() => {
    if (playerState && playerContainerRef.current) {
      initializePlayer();
    }

    return () => {
      // Cleanup
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (youTubePlayerRef.current) {
        try {
          youTubePlayerRef.current.destroy();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, [playerState, initializePlayer]);

  // Handle controls timeout
  useEffect(() => {
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Desktop drag handlers
  const handleDragStart = useCallback((e) => {
    if (!minimizedPlayerRef.current) return;
    
    const rect = minimizedPlayerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleDrag = useCallback((e) => {
    if (!isDragging || !minimizedPlayerRef.current) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within window bounds
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const playerWidth = 320;
    const playerHeight = 180 + 8 + 28 + 32;
    
    const boundedX = Math.max(0, Math.min(newX, windowWidth - playerWidth));
    const boundedY = Math.max(0, Math.min(newY, windowHeight - playerHeight));
    
    setPosition({ x: boundedX, y: boundedY });
  }, [isDragging, dragOffset]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setIsPullingDown(false);
    setPullProgress(0);
    savePosition(position);
  }, [position, savePosition]);

  // Mobile touch handlers (YouTube-style)
  const handleTouchStart = useCallback((e) => {
    if (!minimizedPlayerRef.current) return;
    
    const touch = e.touches[0];
    const rect = minimizedPlayerRef.current.getBoundingClientRect();
    
    // Check if touching the header area (draggable area)
    const isHeaderArea = touch.clientY - rect.top <= 32; // 32px is header height
    
    if (isHeaderArea) {
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;
      
      setDragOffset({ x: offsetX, y: offsetY });
      setIsDragging(true);
      setShowControls(false);
      touchStartYRef.current = touch.clientY;
      touchStartTimeRef.current = Date.now();
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !minimizedPlayerRef.current) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - touchStartYRef.current;
    
    // Check for pull-down-to-close gesture
    if (deltaY > 50 && Math.abs(e.touches[0].clientX - (dragOffset.x + position.x)) < 50) {
      setIsPullingDown(true);
      const pullDistance = Math.min(deltaY, 150);
      setPullProgress(pullDistance / 150);
      
      // Visual feedback - scale down and increase opacity
      if (minimizedPlayerRef.current) {
        const scale = 1 - (pullDistance * 0.002);
        const opacity = 1 - (pullDistance * 0.005);
        minimizedPlayerRef.current.style.transform = `scale(${Math.max(0.8, scale)})`;
        minimizedPlayerRef.current.style.opacity = Math.max(0.5, opacity);
      }
    } else {
      setIsPullingDown(false);
      setPullProgress(0);
      
      // Normal dragging
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const playerWidth = 320;
      const playerHeight = 180 + 8 + 28 + 32;
      
      const boundedX = Math.max(0, Math.min(newX, windowWidth - playerWidth));
      const boundedY = Math.max(0, Math.min(newY, windowHeight - playerHeight));
      
      setPosition({ x: boundedX, y: boundedY });
    }
    
    // Handle pinch to dismiss (optional)
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (!initialTouchDistance) {
        setInitialTouchDistance(distance);
      } else {
        const scale = distance / initialTouchDistance;
        if (scale < 0.7) {
          // Pinch to close
          closePlayer();
        }
      }
    }
  }, [isDragging, dragOffset, position, initialTouchDistance]);

  const handleTouchEnd = useCallback((e) => {
    if (isDragging) {
      const touchDuration = Date.now() - touchStartTimeRef.current;
      
      // Check if this was a pull-down-to-close gesture
      if (isPullingDown && pullProgress > 0.7) {
        closePlayer();
      } else {
        // Snap to edge for mobile (like YouTube)
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const playerWidth = 320;
        const playerHeight = 180 + 8 + 28 + 32;
        
        let newX = position.x;
        let newY = position.y;
        
        // Snap to left or right edge
        if (position.x < windowWidth / 2) {
          newX = 10; // Snap to left
        } else {
          newX = windowWidth - playerWidth - 10; // Snap to right
        }
        
        // Snap to top or bottom edge
        if (position.y < windowHeight / 2) {
          newY = 10; // Snap to top
        } else {
          newY = windowHeight - playerHeight - 10; // Snap to bottom
        }
        
        setPosition({ x: newX, y: newY });
        savePosition({ x: newX, y: newY });
      }
      
      // Reset styles
      if (minimizedPlayerRef.current) {
        minimizedPlayerRef.current.style.transform = '';
        minimizedPlayerRef.current.style.opacity = '';
      }
      
      setIsDragging(false);
      setIsPullingDown(false);
      setPullProgress(0);
      setInitialTouchDistance(null);
    }
  }, [isDragging, isPullingDown, pullProgress, position, savePosition]);

  // Add event listeners
  useEffect(() => {
    // Desktop events
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleDrag(e);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    // Mobile events
    const element = minimizedPlayerRef.current;
    
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd);
      element.addEventListener('touchcancel', handleTouchEnd);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchcancel', handleTouchEnd);
      }
    };
  }, [isDragging, handleDrag, handleDragEnd, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const togglePlay = () => {
    if (youTubePlayerRef.current) {
      if (isPlaying) {
        youTubePlayerRef.current.pauseVideo();
      } else {
        youTubePlayerRef.current.playVideo();
      }
    }
    setShowControls(true);
  };

  const toggleMute = () => {
    if (youTubePlayerRef.current) {
      if (isMuted) {
        youTubePlayerRef.current.unMute();
        youTubePlayerRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        youTubePlayerRef.current.mute();
        setIsMuted(true);
      }
    }
    setShowControls(true);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (youTubePlayerRef.current && !isMuted) {
      youTubePlayerRef.current.setVolume(newVolume);
    }
    setShowControls(true);
  };

  const restorePlayer = () => {
    // Save current state before navigating
    if (playerState && youTubePlayerRef.current) {
      const updatedState = {
        ...playerState,
        video: {
          ...playerState.video,
          slug: playerState.youtubeId
        },
        isPlaying: isPlaying,
        currentTime: currentTime,
        volume: volume,
        isMuted: isMuted,
        progress: progress,
        timestamp: Date.now()
      };
      localStorage.setItem(MINIMIZED_PLAYER_KEY, JSON.stringify(updatedState));
    }
    
    // Set flag for fullscreen
    localStorage.setItem('request_fullscreen', 'true');
    
    // Pass currentTime in URL as well for redundancy
    if (playerState?.youtubeId) {
      router.push(`/video/${playerState.youtubeId}?t=${Math.floor(currentTime)}`);
    }
  };

  const closePlayer = () => {
    if (youTubePlayerRef.current) {
      try {
        youTubePlayerRef.current.stopVideo();
        youTubePlayerRef.current.destroy();
      } catch (e) {}
    }
    localStorage.removeItem(MINIMIZED_PLAYER_KEY);
    localStorage.removeItem(MINIMIZED_PLAYER_POSITION_KEY);
    setPlayerState(null);
    setPlayerInitialized(false);
    playerInitializationAttempted.current = false;
  };

  if (!playerState) return null;

  return (
    <div 
      ref={minimizedPlayerRef}
      className={`fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden border border-white/20 w-80 select-none transition-shadow ${
        isDragging ? 'shadow-2xl ring-2 ring-white/30' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        touchAction: 'none' // Prevent scrolling while dragging
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Header - Draggable area */}
      <div 
        className="w-full h-10 md:h-8 bg-black/90 flex items-center justify-between px-3 cursor-move touch-action-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <Move size={12} className="text-white/60 hidden md:block" />
          <span className="text-xs text-white/80 truncate max-w-[180px]">
            {playerState.video?.title || 'Playing Video'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={restorePlayer}
            className="p-2 md:p-1 hover:bg-white/10 rounded"
            title="Restore to full screen"
          >
            <Maximize2 size={14} className="text-white" />
          </button>
          <button
            onClick={closePlayer}
            className="p-2 md:p-1 hover:bg-white/10 rounded ml-1"
            title="Close player"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      </div>
      
      {/* Video Player */}
      <div className="relative w-full h-44 bg-black">
        <div 
          ref={playerContainerRef}
          className="w-full h-full"
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        
        {!isLoading && !playerInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-white rounded-full animate-spin mb-2 mx-auto"></div>
              <p className="text-xs text-gray-300">Loading video...</p>
            </div>
          </div>
        )}
        
        {/* Overlay Controls */}
        {playerInitialized && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={togglePlay}
              className="p-4 md:p-3 bg-black/60 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
            >
              {isPlaying ? 
                <Pause size={24} className="text-white" /> : 
                <Play size={24} className="text-white" />
              }
            </button>
          </div>
        )}
      </div>
      
      {/* Progress and Volume Controls */}
      <div className="px-3 py-2 bg-black/80">
        {/* Progress Bar */}
        <div className="relative h-1 mb-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              disabled={!playerInitialized}
              className="p-2 md:p-1 hover:bg-white/10 rounded disabled:opacity-50"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? 
                <Pause size={14} className="text-white" /> : 
                <Play size={14} className="text-white" />
              }
            </button>
            
            <span className="text-xs text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              disabled={!playerInitialized}
              className="p-2 md:p-1 hover:bg-white/10 rounded disabled:opacity-50"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? 
                <VolumeX size={14} className="text-white" /> : 
                <Volume2 size={14} className="text-white" />
              }
            </button>
            
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={!playerInitialized}
              className="w-16 accent-white cursor-pointer disabled:opacity-50 hidden md:block"
              title="Volume"
            />
          </div>
        </div>
      </div>

      {/* Drag indicator (only shown while dragging) */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-white/30 pointer-events-none"></div>
      )}
      
      {/* Pull down indicator (mobile) */}
      {isPullingDown && (
        <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none">
          <div 
            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mt-2"
            style={{ opacity: pullProgress }}
          >
            <span className="text-xs text-white">Release to close</span>
          </div>
        </div>
      )}
    </div>
  );
}