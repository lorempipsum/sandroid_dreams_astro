import { useCallback } from 'react';

export const useImageProcessing = () => {
  const resizeImage = useCallback((file: File, maxSize: number, quality: number = 0.8): Promise<{url: string, width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Skip resizing if image is already small enough
        if (img.width <= maxSize && img.height <= maxSize) {
          resolve({ url: URL.createObjectURL(file), width: img.width, height: img.height });
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ url: URL.createObjectURL(file), width: img.width, height: img.height });
          return;
        }

        // Calculate new dimensions
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const newWidth = Math.floor(img.width * ratio);
        const newHeight = Math.floor(img.height * ratio);

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Use smoother scaling for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({ 
              url: URL.createObjectURL(blob), 
              width: newWidth, 
              height: newHeight 
            });
          } else {
            resolve({ url: URL.createObjectURL(file), width: img.width, height: img.height });
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = () => {
        resolve({ url: URL.createObjectURL(file), width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  return { resizeImage };
};
