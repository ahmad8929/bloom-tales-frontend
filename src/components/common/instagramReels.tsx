"use client"

import React, { useState, createContext, useEffect, useRef, useCallback } from "react";
import TestimonialVideoCard from "./testimonialVideoCard";

interface Reel {
  id: number;
  video: string;
  link: string;
  productLink?: string;
  name?: string;
  type?: string;
  profilePic?: string;
  productName?: string;
}

const reels: Reel[] = [
  { 
    id: 1,
    video: "/reels/reel1.mp4",
    link: "https://www.instagram.com/reel/DSSII_fkVbg/",
    productLink: "https://www.bloomtales.shop/products/6949833e9398ad37c89721b3",
  },
  { 
    id: 2,
    video: "/reels/reel2.mp4",
    link: "https://www.instagram.com/reel/DPlx1oGkoVH/",
    productLink: "https://www.bloomtales.shop/products/6949833e9398ad37c89721b3",
  },
  { 
    id: 3,
    video: "/reels/reel3.mp4",
    link: "https://www.instagram.com/reel/DO8tXiYgf3K/",
    productLink: "https://www.bloomtales.shop/products/694986b09398ad37c897220e",
  },
  { 
    id: 4,
    video: "/reels/reel4.mp4",
    link: "https://www.instagram.com/reel/DO7op8lgrPd/",
    productLink: "https://www.bloomtales.shop/products/694984e79398ad37c89721f2",
  },
  { 
    id: 5,
    video: "/reels/reel5.mp4",
    link: "https://www.instagram.com/reel/DNIx8npppu8/",
    productLink: "https://www.bloomtales.shop/products/6949833e9398ad37c89721b3",
  },
];

// Context for managing video playback across all videos
type VideoContextType = {
  currentPlayingVideo: string | null;
  setCurrentPlayingVideo: (videoId: string | null) => void;
  globalMuted: boolean;
  setGlobalMuted: (muted: boolean) => void;
};

export const VideoContext = createContext<VideoContextType | undefined>(undefined);

const InstagramReels: React.FC = () => {
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string | null>(null);
  const [globalMuted, setGlobalMuted] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Intersection Observer to detect when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsSectionVisible(true);
            // Auto-play first video when section becomes visible
            if (isMobile && reels.length > 0) {
              const firstVideo = videoRefs.current[reels[0].id];
              if (firstVideo) {
                firstVideo.play().catch(console.error);
                setCurrentPlayingVideo(`reel-${reels[0].id}`);
              }
            }
          } else {
            setIsSectionVisible(false);
            // Pause all videos when section goes out of view
            Object.values(videoRefs.current).forEach((video) => {
              if (video) video.pause();
            });
            setCurrentPlayingVideo(null);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isMobile, setCurrentPlayingVideo]);

  // Pause previous video when slide changes and play current
  useEffect(() => {
    if (!isMobile || !isSectionVisible) return;

    const currentReelId = reels[currentSlide]?.id;
    
    // Pause all videos
    Object.keys(videoRefs.current).forEach((key) => {
      const videoId = parseInt(key);
      const video = videoRefs.current[videoId];
      if (video) {
        video.pause();
      }
    });

    // Play current video
    if (currentReelId) {
      const currentVideo = videoRefs.current[currentReelId];
      if (currentVideo) {
        currentVideo.currentTime = 0; // Reset to start
        currentVideo.play().catch(console.error);
        setCurrentPlayingVideo(`reel-${currentReelId}`);
      }
    }
  }, [currentSlide, isMobile, isSectionVisible, setCurrentPlayingVideo]);

  // Handle touch events for swipe (no animation)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      touchStartX.current = null;
      touchEndX.current = null;
      return;
    }
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && currentSlide < reels.length - 1) {
      // Swipe left - next slide
      setCurrentSlide(currentSlide + 1);
    } else if (distance < -minSwipeDistance && currentSlide > 0) {
      // Swipe right - previous slide
      setCurrentSlide(currentSlide - 1);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-advance to next reel after video completes
  const handleVideoEnd = useCallback((reelId: number) => {
    if (!isMobile || !isSectionVisible) return;
    
    // Find which slide index this reel is at
    const reelIndex = reels.findIndex(r => r.id === reelId);
    
    // Only advance if this is the currently playing reel
    if (reelIndex === currentSlide) {
      if (currentSlide < reels.length - 1) {
        // Auto-advance to next reel
        setCurrentSlide(currentSlide + 1);
      } else {
        // Loop back to first reel after last one
        setCurrentSlide(0);
      }
    }
  }, [isMobile, isSectionVisible, currentSlide]);

  // Register video ref callback
  const registerVideoRef = useCallback((id: number, video: HTMLVideoElement | null) => {
    if (video) {
      videoRefs.current[id] = video;
      
      // Create a handler that uses the current state
      const handleEnd = () => {
        if (!isMobile || !isSectionVisible) return;
        const reelIndex = reels.findIndex(r => r.id === id);
        
        // Only advance if this is the currently playing reel
        setCurrentSlide((prevSlide) => {
          if (reelIndex === prevSlide) {
            if (prevSlide < reels.length - 1) {
              return prevSlide + 1;
            } else {
              return 0; // Loop back to first
            }
          }
          return prevSlide;
        });
      };
      
      video.addEventListener('ended', handleEnd);
      
      return () => {
        video.removeEventListener('ended', handleEnd);
        delete videoRefs.current[id];
      };
    } else {
      delete videoRefs.current[id];
    }
  }, [isMobile, isSectionVisible]);

  return (
    <VideoContext.Provider
      value={{
        currentPlayingVideo,
        setCurrentPlayingVideo,
        globalMuted,
        setGlobalMuted,
      }}
    >
      <section ref={sectionRef} className="bg-background py-12 md:py-16 lg:py-20">
        <div className="xl:max-w-[1400px] px-4 md:px-6 mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="font-headline font-semibold lg:text-5xl md:text-4xl text-3xl mb-4">
              <a
                href="https://www.instagram.com/bloomtales_clothing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8B7B6D] block mb-2 text-lg md:text-xl lg:text-2xl hover:text-[#B28B5B] transition-all duration-300 hover:scale-105 inline-block"
              >
                Follow Our Journey
                <svg 
                  className="w-4 h-4 md:w-5 md:h-5 inline-block ml-2 animate-pulse" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/bloomtales_clothing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B28B5B] hover:text-[#9A7548] transition-all duration-300 hover:scale-105 inline-block"
              >
                See What's Trending
                <svg 
                  className="w-5 h-5 md:w-6 md:h-6 inline-block ml-2 animate-bounce" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </h3>
            <p className="text-[#A09A94] text-sm md:text-base max-w-2xl mx-auto">
              Discover our latest collections and styling tips from our Instagram community
            </p>
          </div>
          
          {/* Reels - Carousel on mobile, Grid on desktop */}
          <div className="relative">
            {/* Mobile Carousel */}
            <div 
              ref={carouselRef}
              className="md:hidden overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * 100}%)`
                }}
              >
                {reels.map((reel) => (
                  <div key={reel.id} className="min-w-full px-2 flex justify-center">
                    <div className="w-full max-w-[280px]">
                      <TestimonialVideoCard
                        id={reel.id}
                        video={reel.video}
                        link={reel.link}
                        productLink={reel.productLink}
                        productName={reel.productName}
                        onVideoRef={registerVideoRef}
                        isActive={currentSlide === reels.findIndex(r => r.id === reel.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots Indicator - Mobile */}
              {reels.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {reels.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "w-8 bg-primary"
                          : "w-2 bg-primary/30"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
              {reels.map((reel) => (
                <TestimonialVideoCard
                  key={reel.id}
                  id={reel.id}
                  video={reel.video}
                  link={reel.link}
                  productLink={reel.productLink}
                  productName={reel.productName}
                />
              ))}
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-12 md:mt-16 text-center">
            <a
              href="https://www.instagram.com/bloomtales_clothing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary hover:bg-hover transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 py-3 md:py-4 px-8 md:px-12 rounded-full text-primary-foreground text-base md:text-lg font-bold cursor-pointer"
            >
              Follow Us on Instagram
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </VideoContext.Provider>
  );
};

export default InstagramReels;

