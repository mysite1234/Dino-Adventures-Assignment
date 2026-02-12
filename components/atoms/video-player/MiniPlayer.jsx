'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, Maximize2, X, Move } from 'lucide-react';

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
  
  const youTubePlayerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const minimizedPlayerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const playerInitializationAttempted = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTouchRef = useRef({ x: 0, y: 0, time: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);

  // Format time
  const formatTime = (time) => {
    if (!time || isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Load player state and position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem(MINIMIZED_PLAYER_POSITION_KEY);
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        setPosition(pos);
      } catch (error) {
        console.error('Error parsing saved position:', error);
      }
    }

    const savedState = localStorage.getItem(MINIMIZED_PLAYER_KEY);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (Date.now() - state.timestamp < 3600000) {
          setPlayerState(state);
          setIsPlaying(state.isPlaying || false);
          setIsMuted(state.isMuted || false);
          setVolume(state.volume || 80);
          setCurrentTime(state.currentTime || 0);
          setDuration(state.duration || 0);
          setProgress(state.progress || 0);
        } else {
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
      await loadYouTubeAPI();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const playerDiv = document.createElement('div');
      playerDiv.id = `minimized-youtube-player-${Date.now()}`;
      playerDiv.className = 'w-full h-full';
      
      playerContainerRef.current.innerHTML = '';
      playerContainerRef.current.appendChild(playerDiv);

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
            youTubePlayerRef.current = event.target;
            event.target.setVolume(volume);
            if (isMuted) event.target.mute();
            if (playerState.currentTime > 0) {
              event.target.seekTo(playerState.currentTime, true);
            }
            setIsLoading(false);
            setPlayerInitialized(true);
            
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

  // Smooth snap to corner
  const snapToCorner = useCallback(() => {
    if (!minimizedPlayerRef.current) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const playerWidth = 320;
    const playerHeight = 244; // Total height
    
    let targetX = position.x;
    let targetY = position.y;
    
    // Snap to nearest edge
    const margin = 20;
    
    if (position.x < windowWidth / 2) {
      targetX = margin;
    } else {
      targetX = windowWidth - playerWidth - margin;
    }
    
    if (position.y < windowHeight / 2) {
      targetY = margin;
    } else {
      targetY = windowHeight - playerHeight - margin;
    }
    
    // Animate to position
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const startX = position.x;
    const startY = position.y;
    const startTime = performance.now();
    const duration = 300;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const newX = startX + (targetX - startX) * easeOutCubic;
      const newY = startY + (targetY - startY) * easeOutCubic;
      
      setPosition({ x: newX, y: newY });
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setPosition({ x: targetX, y: targetY });
        savePosition({ x: targetX, y: targetY });
        animationRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [position, savePosition]);

  // Desktop drag handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    if (!minimizedPlayerRef.current) return;
    
    const rect = minimizedPlayerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !minimizedPlayerRef.current) return;
    e.preventDefault();
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const playerWidth = 320;
    const playerHeight = 244;
    
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
    
    // Constrain to window bounds
    newX = Math.max(0, Math.min(newX, windowWidth - playerWidth));
    newY = Math.max(0, Math.min(newY, windowHeight - playerHeight));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      snapToCorner();
    }
  }, [isDragging, snapToCorner]);

  // Mobile touch handlers - YouTube style
  const handleTouchStart = useCallback((e) => {
    if (!minimizedPlayerRef.current) return;
    
    const touch = e.touches[0];
    const rect = minimizedPlayerRef.current.getBoundingClientRect();
    
    // Only allow drag from header area
    if (touch.clientY - rect.top <= 48) {
      e.preventDefault();
      
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      
      lastTouchRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      
      velocityRef.current = { x: 0, y: 0 };
      setIsDragging(true);
      setShowControls(false);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !minimizedPlayerRef.current) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const now = Date.now();
    const dt = now - lastTouchRef.current.time;
    
    // Calculate velocity
    if (dt > 0) {
      velocityRef.current = {
        x: (touch.clientX - lastTouchRef.current.x) / dt,
        y: (touch.clientY - lastTouchRef.current.y) / dt
      };
    }
    
    lastTouchRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    };
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const playerWidth = 320;
    const playerHeight = 244;
    
    let newX = touch.clientX - dragOffset.x;
    let newY = touch.clientY - dragOffset.y;
    
    // Rubber band effect when dragging beyond bounds
    const overdragX = 30;
    const overdrɑgY = 30;
    
    if (newX < 0) {
      newX = -Math.min(Math.abs(newX), overdrɑgY);
    }
    if (newX > windowWidth - playerWidth) {
      newX = windowWidth - playerWidth + Math.min(newX - (windowWidth - playerWidth), overdrɑgY);
    }
    if (newY < 0) {
      newY = -Math.min(Math.abs(newY), overdrɑgY);
    }
    if (newY > windowHeight - playerHeight) {
      newY = windowHeight - playerHeight + Math.min(newY - (windowHeight - playerHeight), overdrɑgY);
    }
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragOffset]);

  const handleTouchEnd = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const touchEndTime = Date.now();
    const dragDuration = touchEndTime - dragStartRef.current.time;
    
    setIsDragging(false);
    
    // Apply fling if fast enough
    if (dragDuration < 300 && 
        (Math.abs(velocityRef.current.x) > 0.3 || Math.abs(velocityRef.current.y) > 0.3)) {
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const playerWidth = 320;
      const playerHeight = 244;
      
      // Calculate fling trajectory
      let flingX = position.x + velocityRef.current.x * 500;
      let flingY = position.y + velocityRef.current.y * 500;
      
      // Constrain with rubber band
      flingX = Math.max(-30, Math.min(flingX, windowWidth - playerWidth + 30));
      flingY = Math.max(-30, Math.min(flingY, windowHeight - playerHeight + 30));
      
      setPosition({ x: flingX, y: flingY });
      
      // Short delay before snapping
      setTimeout(() => {
        snapToCorner();
      }, 50);
    } else {
      snapToCorner();
    }
  }, [isDragging, position, snapToCorner]);

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
    
    localStorage.setItem('request_fullscreen', 'true');
    
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

  // Add event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!playerState) return null;

  return (
    <div 
      ref={minimizedPlayerRef}
      className="fixed z-50 bg-black rounded-2xl shadow-2xl overflow-hidden border border-white/20 w-80 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
        boxShadow: isDragging ? '0 20px 40px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.3)',
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Header - Draggable area */}
      <div 
        className="w-full h-12 md:h-8 bg-black/90 flex items-center justify-between px-4 md:px-3"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Move size={14} className="text-white/60 hidden md:block" />
          <span className="text-xs md:text-xs text-white/80 font-medium truncate max-w-[200px] md:max-w-[180px]">
            {playerState.video?.title || 'Playing Video'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={restorePlayer}
            className="p-2 md:p-1.5 hover:bg-white/10 rounded-lg active:bg-white/20 transition-colors"
            aria-label="Restore to full screen"
          >
            <Maximize2 size={16} className="text-white" />
          </button>
          <button
            onClick={closePlayer}
            className="p-2 md:p-1.5 hover:bg-white/10 rounded-lg active:bg-white/20 transition-colors"
            aria-label="Close player"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>
      
      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black">
        <div 
          ref={playerContainerRef}
          className="w-full h-full"
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-8 h-8 border-3 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        
        {!isLoading && !playerInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-gray-600 border-t-white rounded-full animate-spin mb-3 mx-auto"></div>
              <p className="text-sm text-gray-300 font-medium">Loading video...</p>
            </div>
          </div>
        )}
        
        {/* Overlay Controls */}
        {playerInitialized && (
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              showControls ? 'opacity-100 bg-black/30' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={togglePlay}
              className="p-5 md:p-4 bg-black/70 rounded-full hover:bg-black/90 active:scale-95 transition-all backdrop-blur-md"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? 
                <Pause size={28} className="text-white" /> : 
                <Play size={28} className="text-white ml-1" />
              }
            </button>
          </div>
        )}
      </div>
      
      {/* Progress and Volume Controls */}
      <div className="px-4 py-3 bg-black/90 backdrop-blur-sm">
        {/* Progress Bar */}
        <div className="relative h-1 mb-3 bg-gray-700/50 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-red-600 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={!playerInitialized}
              className="p-2 md:p-1.5 hover:bg-white/10 rounded-lg active:bg-white/20 disabled:opacity-50 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? 
                <Pause size={16} className="text-white" /> : 
                <Play size={16} className="text-white" />
              }
            </button>
            
            <span className="text-xs text-white/90 font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              disabled={!playerInitialized}
              className="p-2 md:p-1.5 hover:bg-white/10 rounded-lg active:bg-white/20 disabled:opacity-50 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? 
                <VolumeX size={16} className="text-white" /> : 
                <Volume2 size={16} className="text-white" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}