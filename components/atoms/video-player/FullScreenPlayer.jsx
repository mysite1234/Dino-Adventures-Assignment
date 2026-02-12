'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Clock,
  Captions,
  ThumbsUp,
  ThumbsDown,
  Minimize,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Import or define your videoData
import { videoData } from '@/app/data/VideoData';
// Global YouTube API state
let youTubeAPILoaded = false;
let youTubeAPILoading = false;
let youTubeAPIReadyCallbacks = [];

// Storage key for minimized player state
const MINIMIZED_PLAYER_KEY = 'minimized_player_state';

export default function FullScreenPlayer({ video, category }) {
  const router = useRouter();
  const controlsTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const containerRef = useRef(null);
  const suggestionsPanelRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const mouseLeaveTimeoutRef = useRef(null);
  const isMouseInPanelRef = useRef(false);
  
  // Use a single ref for the YouTube player instance
  const youTubePlayerRef = useRef(null);
  const playerInitializationAttempted = useRef(false);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [likeStatus, setLikeStatus] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  
  // New state for suggestions panel
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(video);
  const [isHoveringEdge, setIsHoveringEdge] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCategoryInfo, setShowCategoryInfo] = useState(true); // Always show category info by default on mobile

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  

  // Auto-fullscreen when coming from minimized player
useEffect(() => {
  // Check if we should enter fullscreen mode
  const shouldEnterFullscreen = localStorage.getItem('request_fullscreen') === 'true';
  
  if (shouldEnterFullscreen) {
    // Clear the flag immediately
    localStorage.removeItem('request_fullscreen');
    
    // Small delay to ensure player is ready
    const fullscreenTimer = setTimeout(() => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('Error entering fullscreen:', err);
        });
      }
    }, 1500); // Slightly longer delay to ensure player is ready
    
    return () => clearTimeout(fullscreenTimer);
  }
}, []); // Run once on component mount

  // Extract YouTube ID from URL
  const getYouTubeId = useCallback((url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  }, []);

  const youtubeId = getYouTubeId(currentVideo?.mediaUrl || '');

  // Format time
  const formatTime = useCallback((time) => {
    if (!time || isNaN(time) || time === Infinity) return "0:00";
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  // Reset controls hide timeout
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setShowControls(true);
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isMobile) { // Keep controls visible on mobile by default
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, isMobile]);

  // Handle mouse move for cursor detection (desktop only)
  const handleMouseMove = useCallback((e) => {
    if (isMobile) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    
    // Check if cursor is near right edge (within 50px)
    const isNearRightEdge = mouseX > rect.width - 50;
    
    // Clear any existing hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    if (isNearRightEdge && !showSuggestions && !isMouseInPanelRef.current) {
      // Show suggestions after a short delay (200ms)
      hoverTimeoutRef.current = setTimeout(() => {
        if (!showSuggestions && !isMouseInPanelRef.current) {
          setShowSuggestions(true);
          setIsHoveringEdge(true);
        }
      }, 200);
    }
    
    // Reset controls timeout
    resetControlsTimeout();
  }, [showSuggestions, resetControlsTimeout, isMobile]);

  // Handle touch for mobile to show suggestions
  const handleTouchEnd = useCallback((e) => {
    if (!isMobile) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = e.changedTouches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    // Check if touch is near top (for category info toggle)
    const isNearTop = touchY < 100;
    
    if (isNearTop) {
      // Toggle category info
      setShowCategoryInfo(prev => !prev);
      resetControlsTimeout();
      return;
    }
    
    // Show suggestions when tapping on right 25% of screen
    const isOnRightSide = touchX > rect.width * 0.75;
    
    if (isOnRightSide && !showSuggestions) {
      setShowSuggestions(true);
      setIsHoveringEdge(true);
      isMouseInPanelRef.current = true;
      resetControlsTimeout();
    }
  }, [isMobile, showSuggestions, resetControlsTimeout]);

  // Handle mouse leaving the panel (desktop only)
  const handlePanelMouseLeave = useCallback((e) => {
    if (isMobile) return;
    
    if (!suggestionsPanelRef.current) return;
    
    const panelRect = suggestionsPanelRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    
    // Check if mouse is actually leaving the panel (moving left)
    if (mouseX < panelRect.left) {
      isMouseInPanelRef.current = false;
      
      // Set timeout to hide panel after delay
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
      }
      
      mouseLeaveTimeoutRef.current = setTimeout(() => {
        if (!isMouseInPanelRef.current) {
          setShowSuggestions(false);
          setIsHoveringEdge(false);
        }
      }, 500);
    }
  }, [isMobile]);

  // Handle mouse entering the panel (desktop only)
  const handlePanelMouseEnter = useCallback(() => {
    if (isMobile) return;
    
    isMouseInPanelRef.current = true;
    
    // Clear any pending hide timeout
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
    }
    
    // Clear hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, [isMobile]);

  // Load related videos based on current category
  const loadRelatedVideos = useCallback(() => {
    if (!category?.slug || !youtubeId) return;
    
    try {
      // Use videoData to get related videos
      const relatedVideos = videoData.getRelatedVideos(youtubeId, category.slug);
      setSuggestions(relatedVideos.slice(0, 10)); // Show max 10 suggestions
    } catch (error) {
      console.error('Error loading related videos:', error);
      setSuggestions([]);
    }
  }, [category?.slug, youtubeId]);

  const savePlayerState = useCallback(() => {
    if (!youTubePlayerRef.current) return;
    
    const playerState = {
      youtubeId,
      video: {
        title: currentVideo.title,
        mediaUrl: currentVideo.mediaUrl,
      },
      category: category,
      isPlaying: isPlaying,
      currentTime: currentTime,
      volume: volume,
      isMuted: isMuted,
      duration: duration,
      progress: progress,
      likeStatus: likeStatus,
      timestamp: Date.now()
    };
    
    localStorage.setItem(MINIMIZED_PLAYER_KEY, JSON.stringify(playerState));
    console.log('Player state saved:', playerState);
  }, [youtubeId, currentVideo, category, isPlaying, currentTime, volume, isMuted, duration, progress, likeStatus]);

  // Clear player state from localStorage
  const clearPlayerState = useCallback(() => {
    localStorage.removeItem(MINIMIZED_PLAYER_KEY);
    console.log('Player state cleared');
  }, []);

  // Load YouTube API
  const loadYouTubeAPI = useCallback(() => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      if (youTubeAPILoaded) {
        resolve();
        return;
      }

      if (youTubeAPILoading) {
        youTubeAPIReadyCallbacks.push(resolve);
        return;
      }

      youTubeAPILoading = true;
      
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Store original callback if exists
      const originalOnYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady;
      
      window.onYouTubeIframeAPIReady = () => {
        youTubeAPILoaded = true;
        youTubeAPILoading = false;
        
        // Call original callback if exists
        if (typeof originalOnYouTubeIframeAPIReady === 'function') {
          originalOnYouTubeIframeAPIReady();
        }
        
        // Call all waiting callbacks
        youTubeAPIReadyCallbacks.forEach(callback => callback());
        youTubeAPIReadyCallbacks = [];
        
        resolve();
      };

      // Fallback in case API is already loaded
      setTimeout(() => {
        if (window.YT && window.YT.Player && !youTubeAPILoaded) {
          youTubeAPILoaded = true;
          youTubeAPILoading = false;
          resolve();
        }
      }, 3000);
    });
  }, []);

  // Clean up player
  const cleanupPlayer = useCallback(() => {
    console.log('Cleaning up player...');
    
    // Clear intervals and timeouts
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
      mouseLeaveTimeoutRef.current = null;
    }
    
    // Clean up YouTube player
    if (youTubePlayerRef.current) {
      try {
        console.log('Destroying YouTube player...');
        if (youTubePlayerRef.current.destroy) {
          youTubePlayerRef.current.destroy();
        }
      } catch (error) {
        console.log('Error destroying player:', error);
      } finally {
        youTubePlayerRef.current = null;
      }
    }
    
    setPlayerReady(false);
    setIsPlaying(false);
  }, []);

  // Initialize player with a specific video
  const initializePlayer = useCallback(async (videoToPlay = currentVideo) => {
    const newYoutubeId = getYouTubeId(videoToPlay?.mediaUrl || '');
    
    if (!newYoutubeId) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    console.log('Initializing player for video:', newYoutubeId);
    
    // Set loading state
    setIsLoading(true);
    setHasError(false);
    setCurrentTime(0);
    setProgress(0);
    setDuration(0);
    setRemainingTime(0);
    setCurrentVideo(videoToPlay);

    try {
      // Load YouTube API if not loaded
      await loadYouTubeAPI();

      // Wait for API to be ready
      await new Promise(resolve => {
        if (window.YT && window.YT.Player) {
          resolve();
        } else {
          const checkInterval = setInterval(() => {
            if (window.YT && window.YT.Player) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        }
      });

      // Get or create player container
      let playerContainer = document.getElementById('youtube-player-container');
      if (!playerContainer) {
        playerContainer = document.createElement('div');
        playerContainer.id = 'youtube-player-container';
        playerContainer.className = 'absolute inset-0 w-full h-full pointer-events-none';
        const mainContainer = containerRef.current?.querySelector('.relative.w-full.h-full.bg-black');
        if (mainContainer) {
          mainContainer.insertBefore(playerContainer, mainContainer.firstChild);
        }
      }
      
      // Clear container
      playerContainer.innerHTML = '';
      
      // Create player div
      const playerDiv = document.createElement('div');
      playerDiv.id = `youtube-player-${Date.now()}`;
      playerDiv.className = 'w-full h-full pointer-events-none';
      playerContainer.appendChild(playerDiv);

      // Create new player
      new window.YT.Player(playerDiv.id, {
        videoId: newYoutubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          fs: 1,
          iv_load_policy: 3
        },
        events: {
          onReady: (event) => {
            console.log('YouTube Player Ready for video:', newYoutubeId);
            youTubePlayerRef.current = event.target;
            const dur = event.target.getDuration();
            setDuration(dur || 0);
            setRemainingTime(dur || 0);
            event.target.setVolume(volume);
            setIsLoading(false);
            setHasError(false);
            setPlayerReady(true);
            setIsPlaying(true);
            resetControlsTimeout();
            
            // Start progress tracking
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            
            progressIntervalRef.current = setInterval(() => {
              if (youTubePlayerRef.current && typeof youTubePlayerRef.current.getCurrentTime === 'function') {
                try {
                  const time = youTubePlayerRef.current.getCurrentTime();
                  const dur = youTubePlayerRef.current.getDuration();
                  const buff = youTubePlayerRef.current.getVideoLoadedFraction ? 
                    youTubePlayerRef.current.getVideoLoadedFraction() : 0;
                  
                  setCurrentTime(time);
                  setBuffered(buff * 100);
                  
                  if (dur > 0 && !isNaN(dur)) {
                    setProgress((time / dur) * 100);
                    setRemainingTime(dur - time);
                  }
                } catch (error) {
                  console.error('Progress tracking error:', error);
                }
              }
            }, 500);
          },
          onStateChange: (event) => {
            const YT = window.YT;
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              console.log('Video is playing');
            } else if (event.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
            } else if (event.data === YT.PlayerState.BUFFERING) {
              console.log('Video is buffering');
            }
          },
          onError: (event) => {
            console.error('YouTube Player Error:', event.data);
            setHasError(true);
            setIsLoading(false);
            setPlayerReady(false);
          }
        }
      });
      
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error);
      setHasError(true);
      setIsLoading(false);
      setPlayerReady(false);
    }
  }, [currentVideo, volume, resetControlsTimeout, loadYouTubeAPI, getYouTubeId]);

  // Load a new video
  const loadNewVideo = useCallback((videoToPlay) => {
    const newYoutubeId = getYouTubeId(videoToPlay?.mediaUrl || '');
    
    if (!newYoutubeId) {
      setHasError(true);
      return;
    }

    console.log('Loading new video:', newYoutubeId);
    
    // Clean up existing player
    cleanupPlayer();
    
    // Initialize new player with the selected video
    initializePlayer(videoToPlay);
    
    // Reset like status for new video
    setLikeStatus(null);
    
    // Reset controls timeout
    resetControlsTimeout();
    
    // Load new suggestions based on the new video
    if (newYoutubeId && category?.slug) {
      try {
        const relatedVideos = videoData.getRelatedVideos(newYoutubeId, category.slug);
        setSuggestions(relatedVideos.slice(0, 10));
      } catch (error) {
        console.error('Error loading new suggestions:', error);
      }
    }
  }, [getYouTubeId, cleanupPlayer, initializePlayer, category?.slug, resetControlsTimeout]);

  // Minimize player and navigate to main page
  const minimizePlayer = useCallback((e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    console.log('Minimizing player...');
    
    // Save current player state before navigating
    savePlayerState();
    
    // Clean up player
    cleanupPlayer();
    
    // Navigate to main page
    router.push('/');
  }, [savePlayerState, router, cleanupPlayer]);

  // Player controls
  const togglePlay = useCallback((e) => {
    if (e) e.stopPropagation();
    if (youTubePlayerRef.current) {
      if (isPlaying) {
        youTubePlayerRef.current.pauseVideo();
      } else {
        youTubePlayerRef.current.playVideo();
      }
    }
    resetControlsTimeout();
  }, [isPlaying, resetControlsTimeout]);

  const skipForward = useCallback((e) => {
    if (e) e.stopPropagation();
    if (youTubePlayerRef.current) {
      const current = youTubePlayerRef.current.getCurrentTime();
      youTubePlayerRef.current.seekTo(current + 10, true);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const skipBackward = useCallback((e) => {
    if (e) e.stopPropagation();
    if (youTubePlayerRef.current) {
      const current = youTubePlayerRef.current.getCurrentTime();
      youTubePlayerRef.current.seekTo(Math.max(0, current - 10), true);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleVolumeChange = useCallback((e) => {
    e.stopPropagation();
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    if (youTubePlayerRef.current) {
      youTubePlayerRef.current.setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const toggleMute = useCallback((e) => {
    if (e) e.stopPropagation();
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
    resetControlsTimeout();
  }, [isMuted, volume, resetControlsTimeout]);

  const handleProgressClick = useCallback((e) => {
    e.stopPropagation();
    if (!youTubePlayerRef.current || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    youTubePlayerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    setProgress(percent * 100);
    resetControlsTimeout();
  }, [duration, resetControlsTimeout]);

  const toggleSubtitles = useCallback((e) => {
    if (e) e.stopPropagation();
    setSubtitlesEnabled(!subtitlesEnabled);
    resetControlsTimeout();
  }, [subtitlesEnabled, resetControlsTimeout]);

  const toggleFullscreen = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleLike = useCallback((e) => {
    if (e) e.stopPropagation();
    setLikeStatus(likeStatus === 'like' ? null : 'like');
    resetControlsTimeout();
  }, [likeStatus, resetControlsTimeout]);

  const handleDislike = useCallback((e) => {
    if (e) e.stopPropagation();
    setLikeStatus(likeStatus === 'dislike' ? null : 'dislike');
    resetControlsTimeout();
  }, [likeStatus, resetControlsTimeout]);

  // Handle video selection from suggestions
  const handleSelectSuggestion = useCallback((selectedVideo) => {
    console.log('Selected new video:', selectedVideo.title);
    
    // Load and play the selected video immediately
    loadNewVideo(selectedVideo);
    
    // Close suggestions panel on mobile after selection
    if (isMobile) {
      setShowSuggestions(false);
      setIsHoveringEdge(false);
      isMouseInPanelRef.current = false;
    } else {
      // Keep suggestions panel open on desktop
      setShowSuggestions(true);
      isMouseInPanelRef.current = true;
    }
    
    resetControlsTimeout();
  }, [loadNewVideo, isMobile, resetControlsTimeout]);

  const handleRetry = useCallback(() => {
    initializePlayer();
  }, [initializePlayer]);

  // Handle back navigation
  const handleBack = useCallback((e) => {
    if (e) e.stopPropagation();
    // Clean up before navigating
    cleanupPlayer();
    clearPlayerState();
    router.back();
  }, [router, cleanupPlayer, clearPlayerState]);

  // Close suggestions panel
  const closeSuggestionsPanel = useCallback(() => {
    setShowSuggestions(false);
    setIsHoveringEdge(false);
    isMouseInPanelRef.current = false;
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Toggle category info - with proper event handling
  const toggleCategoryInfo = useCallback(() => {
    setShowCategoryInfo(prev => !prev);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Close category info - stops event propagation
  const closeCategoryInfo = useCallback((e) => {
    if (e) {
      e.stopPropagation(); // Prevent event from bubbling up
      e.preventDefault(); // Prevent default behavior
    }
    setShowCategoryInfo(false);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Initialize player when component mounts
  useEffect(() => {
    if (youtubeId && !playerInitializationAttempted.current) {
      playerInitializationAttempted.current = true;
      initializePlayer();
    }

    return () => {
      console.log('Component unmounting, cleaning up...');
      cleanupPlayer();
    };
  }, []);

  // Add mouse movement detection for desktop
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMoveGlobal = (e) => {
      handleMouseMove(e);
    };

    document.addEventListener('mousemove', handleMouseMoveGlobal);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
    };
  }, [handleMouseMove, isMobile]);

  // Add touch event listeners for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleTouchEndWrapper = (e) => handleTouchEnd(e);
    
    container.addEventListener('touchend', handleTouchEndWrapper);
    
    return () => {
      container.removeEventListener('touchend', handleTouchEndWrapper);
    };
  }, [handleTouchEnd]);

  // Load related videos when component mounts or category changes
  useEffect(() => {
    if (category?.slug && youtubeId) {
      loadRelatedVideos();
    }
  }, [category?.slug, youtubeId, loadRelatedVideos]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
      }
    };
  }, []);

  // If no video data
  if (!currentVideo) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">No video data available</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black"
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onClick={resetControlsTimeout}
    >
      {/* Header - Responsive with improved category info - FIXED LAYOUT */}
      <div className={`absolute top-0 left-0 right-0 z-50 p-3 md:p-4 flex items-center justify-between transition-all duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } bg-gradient-to-b from-black/90 via-black/70 to-transparent`}>
        {/* Left side buttons - Fixed width to prevent overlap */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <button 
            onClick={handleBack}
            className="p-1.5 md:p-2 bg-black/70 rounded-full hover:bg-black/90 transition-colors z-50 pointer-events-auto"
            title="Go back"
          >
            <ChevronLeft size={isMobile ? 20 : 24} className="text-white" />
          </button>
          <button 
            onClick={minimizePlayer}
            className="p-1.5 md:p-2 bg-black/70 rounded-full hover:bg-black/90 transition-colors pointer-events-auto"
            title="Minimize to continue browsing"
          >
            <Minimize size={isMobile ? 16 : 20} className="text-white" />
          </button>
        </div>
        
        {/* Center title with collapsible category info - FIXED FOR MOBILE */}
        <div 
          className="text-center flex-1 px-2 md:px-4 max-w-2xl mx-auto min-w-0"
          onClick={(e) => {
            // Only handle clicks on the title area, not on the category close button
            if (!e.target.closest('.category-close-btn')) {
              resetControlsTimeout();
            }
          }}
        >
          <h1 className="text-xs md:text-sm font-medium line-clamp-1 text-white">{currentVideo.title || 'Untitled Video'}</h1>
          
          {/* Category info section - Always visible on mobile, collapsible on desktop */}
          <div className={`mt-1 transition-all duration-300 overflow-hidden ${
            showCategoryInfo ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] md:text-xs text-gray-300 px-2 py-1 bg-white/10 rounded-full">
                {category?.name || 'Unknown Category'}
              </span>
              {/* Close button for category info - Only on mobile */}
              {isMobile && (
                <button
                  onClick={closeCategoryInfo}
                  className="category-close-btn p-0.5 md:p-1 hover:bg-white/10 rounded-full transition-colors"
                  title="Hide category"
                >
                  <X size={isMobile ? 12 : 14} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
          
          {/* Toggle button for category info - Only on desktop (mobile has close button above) */}
          {!isMobile && !showCategoryInfo && (
            <button
              onClick={toggleCategoryInfo}
              className="mt-1 text-[10px] md:text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <span>Show category</span>
              <ChevronDown size={10} />
            </button>
          )}
          
          {/* On mobile, show "Show category" button when hidden */}
          {isMobile && !showCategoryInfo && (
            <button
              onClick={toggleCategoryInfo}
              className="mt-1 text-[10px] text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <span>Show category</span>
              <ChevronDown size={10} />
            </button>
          )}
        </div>
        
        {/* Right side controls - Fixed layout with proper spacing */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Volume controls - Mobile with icon only */}
          {isMobile && (
            <button 
              onClick={toggleMute}
              disabled={!playerReady}
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? 
                <VolumeX size={isMobile ? 16 : 20} className="text-white" /> : 
                <Volume2 size={isMobile ? 16 : 20} className="text-white" />
              }
            </button>
          )}
          
          {/* Fullscreen toggle - Moved to separate container to prevent overlap */}
          <div className="relative">
            <button 
              onClick={toggleFullscreen}
              className="p-1.5 md:p-2 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
              title="Fullscreen"
            >
              {document.fullscreenElement ? 
                <Minimize2 size={isMobile ? 16 : 20} className="text-white" /> : 
                <Maximize2 size={isMobile ? 16 : 20} className="text-white" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative w-full h-full bg-black">
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full p-4 md:p-8">
            <p className="text-red-400 mb-4 text-center text-sm md:text-base">Failed to load video</p>
            <p className="text-gray-300 text-xs md:text-sm mb-6 text-center">
              {youtubeId ? `YouTube ID: ${youtubeId}` : 'Invalid YouTube URL'}
            </p>
            <div className="flex gap-2 md:gap-4 flex-wrap justify-center">
              <button 
                onClick={handleRetry}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 md:gap-2 text-white text-sm"
              >
                <RefreshCw size={14} className="text-white" />
                Retry
              </button>
              <button 
                onClick={handleBack}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-white text-sm"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* YouTube Player Container */}
            <div 
              id="youtube-player-container"
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10"
            />

            {/* Loading Overlay */}
            {(isLoading || !playerReady) && !hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
                <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-gray-300 border-t-white rounded-full animate-spin mb-2 md:mb-4"></div>
                <p className="text-gray-300 text-sm md:text-base">Loading video...</p>
                {youtubeId && (
                  <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">{currentVideo.title}</p>
                )}
              </div>
            )}

            {/* Video Suggestions Panel - Improved responsive design */}
            <div 
              ref={suggestionsPanelRef}
              className={`fixed md:absolute inset-y-0 right-0 w-full md:w-80 lg:w-96 transition-all duration-300 transform scrollbar-thin ${
                showSuggestions && suggestions.length > 0 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-full opacity-0 pointer-events-none'
              } z-40 overflow-y-auto bg-black/95 md:bg-gradient-to-l md:from-black/95 md:via-black/90 md:to-transparent backdrop-blur-sm`}
              onMouseEnter={isMobile ? undefined : handlePanelMouseEnter}
              onMouseLeave={isMobile ? undefined : handlePanelMouseLeave}
            >
              <div className="p-4 h-full flex flex-col">
                {/* Header with close button - Improved for mobile */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-white">Related Videos</h3>
                    <p className="text-xs md:text-sm text-gray-300">{category?.name}</p>
                  </div>
                  <button 
                    onClick={closeSuggestionsPanel}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Close"
                  >
                    <X size={isMobile ? 18 : 20} className="text-white" />
                  </button>
                </div>
                
                {/* Video list - Improved responsive grid */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-3">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.slug || index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full flex items-start gap-3 p-2 md:p-3 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors group"
                      >
                        <div className="relative flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-md overflow-hidden">
                          <img 
                            src={suggestion.thumbnailUrl} 
                            alt={suggestion.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={isMobile ? 16 : 20} className="text-white" />
                          </div>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-xs md:text-sm font-medium text-white line-clamp-2">
                            {suggestion.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] md:text-xs text-gray-300 px-1.5 py-0.5 bg-white/10 rounded-full">
                              {suggestion.mediaType === 'YOUTUBE' ? 'YouTube' : 'Video'}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {suggestions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">No related videos found</p>
                    </div>
                  )}
                </div>
                
                {/* Mobile-only close hint */}
                {isMobile && (
                  <div className="mt-4 pt-4 border-t border-white/20 text-center">
                    <p className="text-xs text-gray-400">Tap outside to close</p>
                  </div>
                )}
              </div>
              
              {/* Overlay background that closes panel when clicked (mobile only) */}
              {isMobile && showSuggestions && (
                <div 
                  className="absolute inset-0 -z-10"
                  onClick={closeSuggestionsPanel}
                />
              )}
            </div>

            {/* Custom Controls Overlay - Responsive */}
            <div 
              className={`absolute inset-0 flex flex-col justify-end transition-all duration-300 ${
                showControls || isMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Center Play/Pause Button - Responsive */}
              {!isPlaying && playerReady && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <button
                    onClick={togglePlay}
                    className="p-4 md:p-6 lg:p-8 bg-black/60 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
                  >
                    <Play size={isMobile ? 36 : 48} className="text-white" />
                  </button>
                </div>
              )}

              {/* Bottom Controls Area - Responsive */}
              <div className="w-full bg-gradient-to-t from-black/90 via-black/80 to-transparent z-30">
                {/* Progress Bar - Responsive */}
                <div className="relative px-2 md:px-4 pt-1 md:pt-2">
                  <div 
                    className="relative h-1.5 md:h-1.5 lg:h-2 mb-0.5 md:mb-1 cursor-pointer group"
                    onClick={handleProgressClick}
                  >
                    {/* Buffer bar */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-gray-600/30 rounded-full"
                      style={{ width: `${buffered}%` }}
                    />
                    {/* Progress bar */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                    {/* Progress thumb - Responsive */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-3.5 md:h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${progress}%` }}
                    />
                  </div>
                  {/* Time labels - Responsive */}
                  <div className="flex justify-between text-[10px] md:text-xs text-gray-300 mb-0.5 md:mb-1 px-1">
                    <span className="text-white">{formatTime(currentTime)}</span>
                    <span className="flex items-center gap-0.5 md:gap-1 text-white">
                      <Clock size={isMobile ? 10 : 12} className="text-white" />
                      -{formatTime(remainingTime)}
                    </span>
                    <span className="text-white">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Controls Bar - Responsive layout */}
                <div className="px-2 md:px-4 py-1.5 md:py-3 flex items-center justify-between">
                  {/* Left Controls Group - Responsive */}
                  <div className="flex items-center gap-1.5 md:gap-3">
                    <button 
                      onClick={togglePlay}
                      disabled={!playerReady}
                      className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? 
                        <Pause size={isMobile ? 18 : 22} className="text-white" /> : 
                        <Play size={isMobile ? 18 : 22} className="text-white" />
                      }
                    </button>
                    
                    <button 
                      onClick={skipBackward}
                      disabled={!playerReady}
                      className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                      title="Rewind 10 seconds"
                    >
                      <SkipBack size={isMobile ? 18 : 22} className="text-white" />
                    </button>
                    
                    <button 
                      onClick={skipForward}
                      disabled={!playerReady}
                      className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                      title="Forward 10 seconds"
                    >
                      <SkipForward size={isMobile ? 18 : 22} className="text-white" />
                    </button>

                    {/* Volume Control - Desktop only (mobile has it in header) */}
                    {!isMobile && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={toggleMute}
                          disabled={!playerReady}
                          className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                          title={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted || volume === 0 ? 
                            <VolumeX size={isMobile ? 16 : 20} className="text-white" /> : 
                            <Volume2 size={isMobile ? 16 : 20} className="text-white" />
                          }
                        </button>
                        
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          disabled={!playerReady}
                          className="w-16 md:w-20 lg:w-24 accent-white cursor-pointer disabled:opacity-50"
                        />
                        <span className="text-xs text-gray-300 min-w-[30px] md:min-w-[35px]">
                          {volume}%
                        </span>
                      </div>
                    )}

                    {/* Time Display - Desktop only */}
                    {!isMobile && (
                      <div className="text-sm font-mono text-white ml-2 hidden md:block">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    )}
                  </div>

                  {/* Center Controls Group - Desktop only */}
                  {!isMobile && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={toggleSubtitles}
                        disabled={!playerReady}
                        className={`p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 ${subtitlesEnabled ? 'text-white' : ''}`}
                        title="Subtitles"
                      >
                        <Captions size={isMobile ? 16 : 20} className="text-white" />
                      </button>
                      
                      {/* Show suggestions toggle button - Desktop only */}
                      <button 
                        onClick={() => {
                          if (showSuggestions) {
                            closeSuggestionsPanel();
                          } else {
                            setShowSuggestions(true);
                            isMouseInPanelRef.current = true;
                          }
                        }}
                        className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors text-xs font-medium text-white bg-white/5 px-2 md:px-3 py-1 md:py-1.5 rounded-md"
                        title={showSuggestions ? "Hide suggestions" : "Show suggestions"}
                      >
                        {showSuggestions ? "Hide" : "More"}
                      </button>
                    </div>
                  )}

                  {/* Right Controls Group - Responsive */}
                  <div className="flex items-center gap-1.5 md:gap-3">
                    {/* Like/Dislike - Compact on mobile */}
                    <div className="flex items-center bg-white/10 rounded-full overflow-hidden">
                      <button 
                        onClick={handleLike}
                        className={`p-1.5 md:p-2 hover:bg-white/20 transition-colors ${likeStatus === 'like' ? 'text-white bg-white/30' : ''}`}
                        title="Like"
                      >
                        <ThumbsUp size={isMobile ? 14 : 18} className="text-white" />
                      </button>
                      <div className="h-3 md:h-4 w-px bg-white/20"></div>
                      <button 
                        onClick={handleDislike}
                        className={`p-1.5 md:p-2 hover:bg-white/20 transition-colors ${likeStatus === 'dislike' ? 'text-white bg-white/30' : ''}`}
                        title="Dislike"
                      >
                        <ThumbsDown size={isMobile ? 14 : 18} className="text-white" />
                      </button>
                    </div>
                    
                    {/* Subtitles button - Mobile only */}
                    {isMobile && (
                      <button 
                        onClick={toggleSubtitles}
                        disabled={!playerReady}
                        className={`p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 ${subtitlesEnabled ? 'text-white' : ''}`}
                        title="Subtitles"
                      >
                        <Captions size={16} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Edge hover indicator (desktop only) */}
            {!isMobile && !showSuggestions && isHoveringEdge && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-6 md:w-8 h-20 md:h-24 bg-gradient-to-l from-white/10 to-transparent flex items-center justify-center rounded-l-lg z-40 animate-pulse pointer-events-none">
                <ChevronLeft size={isMobile ? 16 : 20} className="text-white rotate-180" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}