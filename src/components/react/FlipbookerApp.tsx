import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSpring } from '@react-spring/web';
import styles from './FlipbookerApp.module.scss';

// Components
import ExampleVideos from './ExampleVideos';
import FileUpload from './FileUpload';
import FlipbookSettingsComponent from './FlipbookSettingsComponent';
import PlaybackControls from './PlaybackControls';
import PreviewCanvas from './PreviewCanvas';
import ImageGrid from './ImageGrid';

// Types and hooks
import type { ImageData, FlipbookSettings, ProgressInfo } from './types';
import { useImageProcessing } from './useImageProcessing';
import { useImagePreloading } from './useImagePreloading';
import { useFlipbookTiming } from './useFlipbookTiming';
import { useCanvasAnimation } from './useCanvasAnimation';
import { useFlipbookPlayback } from './useFlipbookPlayback';

const FlipbookerApp: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [settings, setSettings] = useState<FlipbookSettings>({
    baseDuration: 50,
    featuredDuration: 150,
    transitionDuration: 40,
    previewQuality: 'medium',
    maxPreviewSize: 800,
  });
  const [processingProgress, setProcessingProgress] = useState<ProgressInfo>({current: 0, total: 0});

  // Hooks
  const { resizeImage } = useImageProcessing();
  const { 
    imageCache, 
    isPreloading, 
    setIsPreloading, 
    preloadingProgress, 
    setPreloadingProgress, 
    preloadImages 
  } = useImagePreloading();
  const { calculateDuration, calculateTransitionDuration } = useFlipbookTiming(images, settings);
  
  const {
    canvasRef,
    canvasBackRef,
    isTransitioning,
    setIsTransitioning,
    frontCanvasStyle,
    backCanvasStyle,
    api,
    getCanvasDimensions,
    drawImageToCanvas
  } = useCanvasAnimation(images, currentImageIndex, settings, imageCache, calculateTransitionDuration);

  const { isPlaying, startFlipbook, stopFlipbook } = useFlipbookPlayback(
    images,
    currentImageIndex,
    setCurrentImageIndex,
    calculateDuration,
    calculateTransitionDuration,
    isTransitioning,
    setIsTransitioning,
    imageCache,
    canvasBackRef,
    canvasRef,
    api
  );

  // Preload images when they change
  useEffect(() => {
    if (images.length > 0) {
      preloadImages(images);
    }
  }, [images, preloadImages]);

  // Draw current image to front canvas initially
  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return;

    const currentImage = images[currentImageIndex];
    if (!currentImage) return;

    drawImageToCanvas(canvasRef.current, currentImage);
  }, [currentImageIndex, images, drawImageToCanvas]);

  // Cleanup - only on component unmount
  useEffect(() => {
    return () => {
      // Clear image cache
      imageCache.current.clear();
      // Only revoke URLs on unmount
      images.forEach(img => {
        try {
          URL.revokeObjectURL(img.url);
          URL.revokeObjectURL(img.previewUrl);
        } catch (error) {
          // Ignore errors when revoking URLs
        }
      });
    };
  }, []); // Empty dependency array - only run on mount/unmount

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsPreloading(true);
    const totalFiles = files.length;
    setProcessingProgress({current: 0, total: totalFiles});
    setPreloadingProgress({current: 0, total: 0});
    
    const newImages: ImageData[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `${Date.now()}-${i}`;
      
      // Update processing progress
      setProcessingProgress({current: i + 1, total: totalFiles});
      
      // Create full resolution version
      const originalUrl = URL.createObjectURL(file);
      
      // Create preview version based on settings
      const qualityMap = { high: 0.9, medium: 0.7, low: 0.5 };
      const quality = qualityMap[settings.previewQuality];
      const previewResult = await resizeImage(file, settings.maxPreviewSize, quality);
      
      // Get original dimensions
      const originalDimensions = await new Promise<{width: number, height: number}>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = originalUrl;
      });
      
      newImages.push({
        id,
        file,
        url: originalUrl,
        previewUrl: previewResult.url,
        isFeatured: false,
        originalWidth: originalDimensions.width,
        originalHeight: originalDimensions.height,
      });
    }

    setImages(prev => [...prev, ...newImages]);
    
    // Reset processing progress and start preloading
    setProcessingProgress({current: totalFiles, total: totalFiles});
    
    // Preload the new images
    if (newImages.length > 0) {
      await preloadImages(newImages);
    } else {
      setIsPreloading(false);
      setProcessingProgress({current: 0, total: 0});
      setPreloadingProgress({current: 0, total: 0});
    }
  }, [settings.previewQuality, settings.maxPreviewSize, resizeImage, preloadImages, setIsPreloading, setProcessingProgress, setPreloadingProgress]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      const filtered = prev.filter(img => img.id !== id);
      
      // Revoke the URL of the removed image
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      
      if (currentImageIndex >= filtered.length && filtered.length > 0) {
        setCurrentImageIndex(filtered.length - 1);
      }
      return filtered;
    });
  }, [currentImageIndex]);

  const toggleFeatured = useCallback((id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, isFeatured: !img.isFeatured } : img
    ));
  }, []);

  const handleImageClick = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentImageIndex(index);
    }
  }, [images.length]);

  return (
    <div className={styles.app}>
      <h1>Flipbooker</h1>
      <p className={styles.description}>Create smooth flipbook-style videos from your photos</p>

      <ExampleVideos />

      <div className={styles.controlsSection}>
        <FileUpload onFileSelect={handleFileSelect} />

        <FlipbookSettingsComponent 
          settings={settings} 
          onSettingsChange={setSettings} 
        />

        <PlaybackControls
          isPlaying={isPlaying}
          imagesLength={images.length}
          isPreloading={isPreloading}
          processingProgress={processingProgress}
          preloadingProgress={preloadingProgress}
          onPlayClick={startFlipbook}
          onStopClick={stopFlipbook}
        />
      </div>

      <div className={styles.mainContent}>
        <PreviewCanvas
          canvasRef={canvasRef}
          canvasBackRef={canvasBackRef}
          frontCanvasStyle={frontCanvasStyle}
          backCanvasStyle={backCanvasStyle}
          canvasDimensions={getCanvasDimensions()}
          images={images}
          currentImageIndex={currentImageIndex}
        />

        <ImageGrid
          images={images}
          currentImageIndex={currentImageIndex}
          onToggleFeatured={toggleFeatured}
          onRemoveImage={removeImage}
          onImageClick={handleImageClick}
        />
      </div>
    </div>
  );
};

export default FlipbookerApp;
