import { useCallback, useRef, useEffect, useState } from 'react';
import { useSpring } from '@react-spring/web';
import type { ImageData, FlipbookSettings } from './types';

export const useCanvasAnimation = (
  images: ImageData[],
  currentImageIndex: number,
  settings: FlipbookSettings,
  imageCache: React.MutableRefObject<Map<string, HTMLImageElement>>,
  calculateTransitionDuration: (index: number) => number
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [currentFrontOpacity, setCurrentFrontOpacity] = useState<number>(1);
  const [currentBackOpacity, setCurrentBackOpacity] = useState<number>(0);

  // Spring animation for crossfade - separate opacity for each canvas
  const [{ frontOpacity, backOpacity }, api] = useSpring(() => ({
    frontOpacity: 1,
    backOpacity: 0,
    config: { duration: settings.transitionDuration },
    onChange: (result) => {
      // Update state with current animated values
      if (result.value.frontOpacity !== undefined) {
        setCurrentFrontOpacity(result.value.frontOpacity);
      }
      if (result.value.backOpacity !== undefined) {
        setCurrentBackOpacity(result.value.backOpacity);
      }
    },
  }));

  const frontCanvasStyle = {
    opacity: frontOpacity,
  };

  const backCanvasStyle = {
    opacity: backOpacity,
  };

  // Canvas dimensions based on context
  const getCanvasDimensions = useCallback(() => {
    const qualityMap = {
      high: { width: 1280, height: 720 },
      medium: { width: 854, height: 480 },
      low: { width: 640, height: 360 }
    };
    return qualityMap[settings.previewQuality];
  }, [settings.previewQuality]);

  const drawImageToCanvas = useCallback((canvas: HTMLCanvasElement, imageData: ImageData) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Try to use preloaded image first for better performance
    const cachedImg = imageCache.current.get(imageData.id);
    if (cachedImg) {
      // Use cached image for faster rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const canvasAspect = canvas.width / canvas.height;
      const imgAspect = cachedImg.width / cachedImg.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imgAspect > canvasAspect) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgAspect;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgAspect;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      }
      
      ctx.drawImage(cachedImg, drawX, drawY, drawWidth, drawHeight);
      return;
    }

    // Fallback to loading image if not cached
    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate aspect ratio to fit image in canvas
      const canvasAspect = canvas.width / canvas.height;
      const imgAspect = img.width / img.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imgAspect > canvasAspect) {
        // Image is wider than canvas
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgAspect;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      } else {
        // Image is taller than canvas
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgAspect;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      }
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };
    
    img.onerror = (error) => {
      console.warn('Failed to load image:', imageData.id, error);
    };
    
    // Use preview resolution for display
    if (imageData.previewUrl) {
      img.src = imageData.previewUrl;
    }
  }, [imageCache]);

  return {
    canvasRef,
    canvasBackRef,
    isTransitioning,
    setIsTransitioning,
    frontCanvasStyle,
    backCanvasStyle,
    api,
    getCanvasDimensions,
    drawImageToCanvas,
    currentFrontOpacity,
    currentBackOpacity
  };
};
