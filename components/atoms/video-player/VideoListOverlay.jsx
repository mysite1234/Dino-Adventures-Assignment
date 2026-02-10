'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronUp, Play } from 'lucide-react';
import { videoData } from '@/app/data/VideoData';

export default function VideoListOverlay({ 
  currentVideo, 
  currentCategory,
  onSelectVideo,
  isVisible,
  onClose 
}) {
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [touchStartY, setTouchStartY] = useState(0);
  const [overlayOffset, setOverlayOffset] = useState(0);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const scrollContainerRef = useRef(null);
  const overlayRef = useRef(null);

  // Get related videos from same category
  useEffect(() => {
    if (currentVideo && currentCategory) {
      const videos = videoData.getRelatedVideos(
        currentVideo.slug, 
        currentCategory.slug
      );
      setRelatedVideos(videos.slice(0, 15)); // Increased to 15 for better scrolling
    }
  }, [currentVideo, currentCategory]);

  // Handle overlay drag to close
  const handleOverlayTouchStart = (e) => {
    if (scrollContainerRef.current.scrollTop > 0) return;
    
    setTouchStartY(e.touches[0].clientY);
    setIsDraggingOverlay(true);
    setOverlayOffset(0);
  };

  const handleOverlayTouchMove = (e) => {
    if (!isDraggingOverlay) return;
    
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY;
    
    if (deltaY > 0) { // Dragging down
      setOverlayOffset(deltaY);
      e.preventDefault();
    }
  };

  const handleOverlayTouchEnd = () => {
    if (!isDraggingOverlay) return;
    
    if (overlayOffset > 100) {
      onClose();
    } else {
      // Reset position with animation
      setOverlayOffset(0);
    }
    
    setIsDraggingOverlay(false);
    setTouchStartY(0);
  };

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop } = scrollContainerRef.current;
      if (scrollTop > 50) {
        setShowScrollHint(false);
      } else {
        setShowScrollHint(true);
      }
    }
  }, []);

  // Handle video selection
  const handleVideoSelect = (video) => {
    // Add selection animation
    const element = document.querySelector(`[data-video="${video.slug}"]`);
    if (element) {
      element.style.transform = 'scale(0.98)';
      setTimeout(() => {
        element.style.transform = '';
        onSelectVideo(video);
      }, 150);
    } else {
      onSelectVideo(video);
    }
  };

  // Prevent body scroll when overlay is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      // Reset scroll hint when overlay opens
      setShowScrollHint(true);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = '';
      setOverlayOffset(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Add scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100]"
      style={{
        transform: `translateY(${overlayOffset}px)`,
        opacity: 1 - Math.min(overlayOffset / 300, 0.5)
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Overlay Content */}
      <div 
        className="absolute inset-0"
        onTouchStart={handleOverlayTouchStart}
        onTouchMove={handleOverlayTouchMove}
        onTouchEnd={handleOverlayTouchEnd}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 bg-gradient-to-b from-black to-transparent">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors active:scale-95"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold">
              More from {currentCategory?.name}
            </h2>
            <div className="w-10"></div>
          </div>
          
          {/* Drag Handle */}
          <div className="flex justify-center mt-2">
            <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
          </div>
          
          {/* Close hint */}
          <p className="text-center text-xs text-gray-400 mt-2">
            Drag down or tap X to close
          </p>
        </div>

        {/* Video List with Scroll */}
        <div 
          ref={scrollContainerRef}
          className="h-full overflow-y-auto px-4 pb-32"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y'
          }}
        >
          <div className="space-y-3 py-4">
            {relatedVideos.map((video) => (
              <button
                key={video.slug}
                data-video={video.slug}
                onClick={() => handleVideoSelect(video)}
                className="w-full text-left flex items-center gap-4 p-3 bg-gray-900/80 backdrop-blur-sm rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 hover:shadow-lg"
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-28 h-16 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                      <Play size={16} className="text-black ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/80 text-xs px-1.5 py-0.5 rounded">
                    5:30
                  </div>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2 text-sm">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentCategory?.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          {/* Scroll hint */}
          {showScrollHint && relatedVideos.length > 3 && (
            <div className="flex justify-center py-6">
              <div className="text-center animate-bounce">
                <ChevronUp size={20} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-400">Scroll for more videos</p>
              </div>
            </div>
          )}
          
          {/* Bottom padding */}
          <div className="h-32"></div>
        </div>

        {/* Touch area for closing */}
        <div 
          onClick={onClose}
          className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-6 active:bg-black/30"
        >
          <div className="text-center">
            <div className="w-24 h-1 bg-gray-500 rounded-full mb-2 mx-auto"></div>
            <p className="text-xs text-gray-400">Tap here to close</p>
          </div>
        </div>
      </div>
    </div>
  );
}