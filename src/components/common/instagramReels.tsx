"use client"

import React, { useState, createContext, useEffect, useRef, useCallback, useMemo } from "react";
import TestimonialVideoCard from "./testimonialVideoCard";
import { reelApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { BRAND } from "@/lib/constants";

// Display shape consumed by TestimonialVideoCard
interface ReelItem {
  id: number;
  video: string;
  link: string;
  productLink?: string;
  productName?: string;
}

// Context for managing video playback across all videos
type VideoContextType = {
  currentPlayingVideo: string | null;
  setCurrentPlayingVideo: (videoId: string | null) => void;
  globalMuted: boolean;
  setGlobalMuted: (muted: boolean) => void;
};

export const VideoContext = createContext<VideoContextType | undefined>(undefined);

const InstagramReels: React.FC = () => {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Load reels from the API — no hardcoded data
  useEffect(() => {
    let cancelled = false;
    reelApi
      .getActiveReels()
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.data?.reels ?? [];
        setReels(
          list.map((reel, index) => ({
            id: index + 1,
            video: reel.video.url,
            link: reel.instagramUrl || BRAND.instagram,
            productLink: reel.product ? `/products/${reel.product._id}` : undefined,
            productName: reel.product?.name,
          }))
        );
      })
      .catch((error) => {
        console.error('Failed to load reels:', error);
        if (!cancelled) setReels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
      observer.disconnect();
    };
  }, [isMobile, reels]);

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
  }, [currentSlide, isMobile, isSectionVisible, reels]);

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

  // Register video ref callback — auto-advance carousel when a video ends
  const registerVideoRef = useCallback((id: number, video: HTMLVideoElement | null) => {
    if (video) {
      videoRefs.current[id] = video;

      const handleEnd = () => {
        if (!isMobile || !isSectionVisible) return;
        const reelIndex = reels.findIndex((r) => r.id === id);

        // Only advance if this is the currently playing reel
        setCurrentSlide((prevSlide) => {
          if (reelIndex === prevSlide) {
            if (prevSlide < reels.length - 1) {
              return prevSlide + 1;
            }
            return 0; // Loop back to first
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
  }, [isMobile, isSectionVisible, reels]);

  const contextValue = useMemo(
    () => ({ currentPlayingVideo, setCurrentPlayingVideo, globalMuted, setGlobalMuted }),
    [currentPlayingVideo, globalMuted]
  );

  // Nothing to show — hide the section entirely (no hardcoded fallback)
  if (!loading && reels.length === 0) {
    return null;
  }

  return (
    <VideoContext.Provider value={contextValue}>
      <section ref={sectionRef} className="bg-linen/70 py-12 md:py-16 lg:py-20">
        <div className="xl:max-w-[1400px] px-4 md:px-6 mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="eyebrow mb-4">@bloomtales_clothing</p>
            <h3 className="font-display text-4xl font-medium leading-tight md:text-5xl mb-4">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-gold"
              >
                As seen on you
              </a>
            </h3>
            <p className="text-text-muted text-sm md:text-base max-w-2xl mx-auto">
              Styling stories from our Instagram community — tap a reel to shop the look.
            </p>
          </div>

          {/* Reels - Carousel on mobile, Grid on desktop */}
          <div className="relative">
            {loading ? (
              <>
                {/* Loading skeletons */}
                <div className="md:hidden flex justify-center px-2">
                  <Skeleton className="aspect-[9/16] w-full max-w-[280px] rounded-none" />
                </div>
                <div className="hidden md:grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[9/16] w-full rounded-none" />
                  ))}
                </div>
              </>
            ) : (
              <>
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
                    {reels.map((reel, index) => (
                      <div key={reel.id} className="min-w-full px-2 flex justify-center">
                        <div className="w-full max-w-[280px]">
                          <TestimonialVideoCard
                            id={reel.id}
                            video={reel.video}
                            link={reel.link}
                            productLink={reel.productLink}
                            productName={reel.productName}
                            onVideoRef={registerVideoRef}
                            isActive={currentSlide === index}
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
              </>
            )}
          </div>

          {/* CTA Button */}
          <div className="mt-12 md:mt-16 text-center">
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 border border-primary/70 px-10 py-4 font-sans text-[12px] font-semibold uppercase tracking-luxe text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
            >
              Follow Us on Instagram
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
