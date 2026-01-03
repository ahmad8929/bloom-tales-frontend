'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface ProductImageGalleryProps {
  imageUrls: string[];
  productName: string;
  videoUrl?: string;
}

type MediaItem = {
  type: 'image' | 'video';
  url: string;
};

export function ProductImageGallery({ imageUrls, productName, videoUrl }: ProductImageGalleryProps) {
  // Combine images and video into a single array
  const mediaItems: MediaItem[] = [
    ...imageUrls.map(url => ({ type: 'image' as const, url })),
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : [])
  ];

  const [selectedMedia, setSelectedMedia] = useState<MediaItem>(mediaItems[0] || { type: 'image', url: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMediaIndex, setModalMediaIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Get current modal media
  const currentModalMedia = mediaItems[modalMediaIndex];

  // Auto-restart video when it ends (in modal)
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentModalMedia?.type === 'video' && isModalOpen) {
      const handleEnded = () => {
        video.currentTime = 0;
        video.play().catch(() => {
          // Ignore play errors (e.g., if user paused)
        });
      };
      video.addEventListener('ended', handleEnded);
      return () => video.removeEventListener('ended', handleEnded);
    }
  }, [modalMediaIndex, isModalOpen, currentModalMedia]);

  // Auto-play and restart video when it ends (in main view)
  useEffect(() => {
    const video = mainVideoRef.current;
    if (video && selectedMedia.type === 'video' && !isModalOpen) {
      // Play video when selected
      video.play().catch(() => {
        // Ignore play errors (autoplay might be blocked by browser)
      });
      
      const handleEnded = () => {
        video.currentTime = 0;
        video.play().catch(() => {
          // Ignore play errors
        });
      };
      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('ended', handleEnded);
        video.pause();
      };
    }
  }, [selectedMedia, isModalOpen]);

  if (mediaItems.length === 0) {
    return null;
  }

  const openModal = (index: number) => {
    setModalMediaIndex(index);
    setIsModalOpen(true);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const goToPrevious = () => {
    const newIndex = modalMediaIndex > 0 ? modalMediaIndex - 1 : mediaItems.length - 1;
    setModalMediaIndex(newIndex);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const goToNext = () => {
    const newIndex = modalMediaIndex < mediaItems.length - 1 ? modalMediaIndex + 1 : 0;
    setModalMediaIndex(newIndex);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.25, 1);
      if (newZoom === 1) {
        setImagePosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') closeModal();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen, modalMediaIndex]);

  return (
    <>
      <div className="space-y-4 w-full">
        <Card className="overflow-hidden w-full bg-transparent border-0 shadow-none">
          <CardContent className="p-0 w-full">
            <div 
              className="relative w-full cursor-pointer flex items-center justify-center min-h-[400px]"
              onClick={() => {
                const index = mediaItems.findIndex(item => item.url === selectedMedia.url);
                openModal(index >= 0 ? index : 0);
              }}
            >
              {selectedMedia.type === 'video' ? (
                <video
                  ref={mainVideoRef}
                  src={selectedMedia.url}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  data-ai-hint="product video"
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={selectedMedia.url}
                  alt={`Main image for ${productName}`}
                  width={1200}
                  height={1500}
                  className="w-full h-auto object-contain max-h-[80vh]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  data-ai-hint="product image"
                  priority
                  unoptimized
                />
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-5 gap-2">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedMedia(item);
              }}
              className={cn(
                "relative aspect-square rounded-md overflow-hidden transition-all",
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selectedMedia.url === item.url ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
              )}
            >
              {item.type === 'video' ? (
                <>
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="w-6 h-6 text-white" fill="white" />
                  </div>
                </>
              ) : (
                <Image
                  src={item.url}
                  alt={`Thumbnail ${index + 1} for ${productName}`}
                  fill
                  className="object-cover"
                  sizes="20vw"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none [&>button]:hidden">
          <div className="relative w-full h-full flex items-center justify-center min-h-[400px]">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeModal}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Previous Button */}
            {mediaItems.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 text-white hover:bg-white/20"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* Next Button */}
            {mediaItems.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 text-white hover:bg-white/20"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* Zoom Controls (only for images) */}
            {currentModalMedia?.type === 'image' && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/50 rounded-lg p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleResetZoom}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Media Display */}
            <div
              ref={imageContainerRef}
              className="w-full h-full flex items-center justify-center overflow-hidden p-4"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {currentModalMedia?.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={currentModalMedia.url}
                  controls
                  autoPlay
                  loop
                  className="max-w-full max-h-[85vh] object-contain w-full h-auto"
                />
              ) : (
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel})`,
                    transition: isDragging ? 'none' : 'transform 0.2s',
                    cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    maxWidth: '100%',
                    maxHeight: '85vh'
                  }}
                >
                  <Image
                    src={currentModalMedia?.url || ''}
                    alt={`${productName} - Image ${modalMediaIndex + 1}`}
                    width={1200}
                    height={1500}
                    className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* Media Counter */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 right-4 z-50 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                {modalMediaIndex + 1} / {mediaItems.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
