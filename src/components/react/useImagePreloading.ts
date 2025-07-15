import { useCallback, useRef, useState } from 'react';
import type { ImageData, ProgressInfo } from './types';

export const useImagePreloading = () => {
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [preloadingProgress, setPreloadingProgress] = useState<ProgressInfo>({ current: 0, total: 0 });

  const preloadImages = useCallback(async (imageList: ImageData[]) => {
    const cache = imageCache.current;
    
    // Clear old cache and set up preloading progress
    cache.clear();
    setPreloadingProgress({ current: 0, total: imageList.length });
    
    try {
      // Preload images in batches to avoid overwhelming the browser
      const batchSize = 5;
      let completedCount = 0;
      
      for (let i = 0; i < imageList.length; i += batchSize) {
        const batch = imageList.slice(i, i + batchSize);
        
        await Promise.all(batch.map(imageData => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              cache.set(imageData.id, img);
              completedCount++;
              setPreloadingProgress({ current: completedCount, total: imageList.length });
              resolve();
            };
            img.onerror = () => {
              console.warn('Failed to preload image:', imageData.id);
              completedCount++;
              setPreloadingProgress({ current: completedCount, total: imageList.length });
              resolve();
            };
            // Use preview images for caching
            img.src = imageData.previewUrl;
          });
        }));
        
        // Small delay between batches to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.warn('Error during image preloading:', error);
    } finally {
      setIsPreloading(false);
      setPreloadingProgress({ current: 0, total: 0 });
    }
  }, []);

  return {
    imageCache,
    isPreloading,
    setIsPreloading,
    preloadingProgress,
    setPreloadingProgress,
    preloadImages
  };
};
