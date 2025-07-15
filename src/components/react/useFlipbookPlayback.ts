import { useCallback, useRef, useEffect, useState } from 'react';
import type { ImageData } from './types';

export const useFlipbookPlayback = (
  images: ImageData[],
  currentImageIndex: number,
  setCurrentImageIndex: (index: number) => void,
  calculateDuration: (index: number) => number,
  calculateTransitionDuration: (index: number) => number,
  isTransitioning: boolean,
  setIsTransitioning: (transitioning: boolean) => void,
  imageCache: React.MutableRefObject<Map<string, HTMLImageElement>>,
  canvasBackRef: React.RefObject<HTMLCanvasElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  api: any
) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextImage = useCallback(() => {
    if (images.length === 0 || isTransitioning) return;
    
    setIsTransitioning(true);
    const nextIndex = (currentImageIndex + 1) % images.length;
    
    // First, load the new image on the back canvas and wait for it to be ready
    const backCanvas = canvasBackRef.current;
    if (backCanvas && images[nextIndex]) {
      const backCtx = backCanvas.getContext('2d');
      if (!backCtx) return;

      // Try to use cached image first
      const cachedImg = imageCache.current.get(images[nextIndex].id);
      
      const drawImageToBackCanvas = (img: HTMLImageElement) => {
        // Clear and draw the new image to back canvas
        backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
        
        // Calculate aspect ratio to fit image in canvas
        const canvasAspect = backCanvas.width / backCanvas.height;
        const imgAspect = img.width / img.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
          drawWidth = backCanvas.width;
          drawHeight = backCanvas.width / imgAspect;
          drawX = 0;
          drawY = (backCanvas.height - drawHeight) / 2;
        } else {
          drawHeight = backCanvas.height;
          drawWidth = backCanvas.height * imgAspect;
          drawX = (backCanvas.width - drawWidth) / 2;
          drawY = 0;
        }
        
        backCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        // Calculate the scaled transition duration for this image
        const scaledTransitionDuration = calculateTransitionDuration(currentImageIndex);
        
        // Now start the crossfade: front canvas fades out, back canvas fades in
        api.start({
          frontOpacity: 0,
          backOpacity: 1,
          config: { duration: scaledTransitionDuration },
          onRest: () => {
            // After transition, copy the back canvas content to front canvas
            setCurrentImageIndex(nextIndex);
            
            const frontCanvas = canvasRef.current;
            if (frontCanvas) {
              const frontCtx = frontCanvas.getContext('2d');
              if (frontCtx) {
                frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
                frontCtx.drawImage(backCanvas, 0, 0);
              }
            }
            
            // Reset opacities for next transition
            api.start({
              frontOpacity: 1,
              backOpacity: 0,
              config: { duration: 0 }, // Instant
              onRest: () => {
                setIsTransitioning(false);
              },
            });
          },
        });
      };

      if (cachedImg) {
        // Use cached image immediately
        drawImageToBackCanvas(cachedImg);
      } else {
        // Load image if not cached
        const img = new Image();
        img.onload = () => drawImageToBackCanvas(img);
        img.onerror = (error) => {
          console.warn('Failed to load next image:', images[nextIndex]?.id, error);
          setIsTransitioning(false);
        };
        img.src = images[nextIndex].previewUrl; // Use preview for display performance
      }
    }
  }, [currentImageIndex, images, api, calculateTransitionDuration, isTransitioning, setIsTransitioning, setCurrentImageIndex, imageCache, canvasBackRef, canvasRef]);

  // Effect to handle continuous playback
  useEffect(() => {
    if (!isPlaying || images.length === 0) return;

    const duration = calculateDuration(currentImageIndex);
    intervalRef.current = setTimeout(() => {
      nextImage();
    }, duration);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentImageIndex, images.length, calculateDuration, nextImage]);

  const startFlipbook = useCallback(() => {
    if (images.length === 0) return;
    setIsPlaying(true);
  }, [images.length]);

  const stopFlipbook = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup - only on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  return {
    isPlaying,
    startFlipbook,
    stopFlipbook,
    nextImage
  };
};
