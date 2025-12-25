"use client"

import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, ShoppingBag } from "lucide-react";
import { VideoContext } from "./instagramReels";

interface TestimonialVideoCardProps {
  id: number;
  name?: string;
  type?: string;
  profilePic?: string;
  video: string;
  link: string;
  productLink?: string;
  productName?: string;
  onVideoRef?: (id: number, video: HTMLVideoElement | null) => void;
  isActive?: boolean;
}

const TestimonialVideoCard: React.FC<TestimonialVideoCardProps> = ({
  id,
  video,
  link,
  productLink,
  productName,
  onVideoRef,
  isActive = true,
}) => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("TestimonialVideoCard must be used within VideoContext");
  }

  const {
    currentPlayingVideo,
    setCurrentPlayingVideo,
    globalMuted,
    setGlobalMuted,
  } = context;

  const videoId = `reel-${id}`;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlaying = currentPlayingVideo === videoId;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const playVideo = useCallback(() => {
    if (videoRef.current) {
      setCurrentPlayingVideo(videoId);
      videoRef.current.play().catch(console.error);
      setIsManuallyPaused(false);
    }
  }, [videoId, setCurrentPlayingVideo]);

  const pauseVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setCurrentPlayingVideo(null);
    }
  }, [setCurrentPlayingVideo]);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      pauseVideo();
      setIsManuallyPaused(true);
    } else {
      playVideo();
    }
  }, [isPlaying, playVideo, pauseVideo]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setGlobalMuted(!globalMuted);
  }, [globalMuted, setGlobalMuted]);

  const handleVideoLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Handle click anywhere on the video card to toggle play/pause
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't toggle if clicking on controls or Instagram link
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('a') ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'A'
    ) {
      return;
    }
    if (isPlaying) {
      pauseVideo();
      setIsManuallyPaused(true);
    } else {
      playVideo();
    }
  }, [isPlaying, playVideo, pauseVideo]);

  // Handle hover - play on hover for desktop (only if not manually paused)
  const handleMouseEnter = useCallback(() => {
    if (isMobile || isManuallyPaused) return;
    
    setIsHovering(true);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Play video after a short delay on hover
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isPlaying && !isManuallyPaused) {
        playVideo();
      }
    }, 300);
  }, [isMobile, isPlaying, playVideo, isManuallyPaused]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile || isManuallyPaused) return;
    
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Pause video when mouse leaves (only if not manually controlled)
    if (isPlaying && !isManuallyPaused) {
      pauseVideo();
    }
  }, [isMobile, isPlaying, pauseVideo, isManuallyPaused]);

  // Reset manual pause state when hovering away completely
  useEffect(() => {
    if (!isHovering && !isPlaying) {
      setIsManuallyPaused(false);
    }
  }, [isHovering, isPlaying]);

  // Pause video when another video starts playing
  useEffect(() => {
    if (currentPlayingVideo !== videoId && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsManuallyPaused(false);
    }
  }, [currentPlayingVideo, videoId]);

  // Register video ref
  useEffect(() => {
    if (videoRef.current && onVideoRef) {
      onVideoRef(id, videoRef.current);
      return () => {
        onVideoRef(id, null);
      };
    }
  }, [id, onVideoRef]);

  // Handle playing state - let parent component control playback on mobile
  useEffect(() => {
    if (videoRef.current && !isMobile) {
      // Desktop behavior
      if (isPlaying && isActive) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
    // Mobile playback is controlled by parent component (instagramReels)
  }, [isPlaying, isActive, isMobile]);

  // Handle global mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = globalMuted;
    }
  }, [globalMuted]);

  // Cleanup
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="group cursor-pointer relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      {/* Video Container - Instagram Reels Style */}
      <div className="relative rounded-xl overflow-hidden aspect-[9/16] bg-card border border-border shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-full">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={video}
          className="w-full h-full object-cover"
          loop={!isMobile}
          muted={globalMuted}
          playsInline
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoLoad}
          preload="metadata"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

        {/* Top Section - Instagram Link and Controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between">
          {/* Instagram Link */}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-2.5 rounded-xl hover:scale-110 transition-transform duration-200 shadow-lg"
              title="View on Instagram"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}

          {/* Controls */}
          <div className="flex flex-col gap-2">
            <button
              onClick={togglePlay}
              className="bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full p-2.5 transition-all duration-200 shadow-lg"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" fill="white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full p-2.5 transition-all duration-200 shadow-lg"
              aria-label={globalMuted ? "Unmute" : "Mute"}
            >
              {globalMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom - Creator Info and Product Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {/* Product Button - Show if productLink exists */}
          {productLink && (
            <div className="mb-1 pointer-events-auto">
              <a
                href={productLink}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-hover text-primary-foreground px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                title={productName || "View Product"}
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Shop Dress</span>
              </a>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-card flex items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TestimonialVideoCard;

