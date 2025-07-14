import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animated, useSpring } from '@react-spring/web';
import './FlipbookerApp.css';

interface ImageData {
  id: string;
  file: File;
  url: string;
  previewUrl: string; // Smaller version for preview
  isFeatured: boolean;
  originalWidth: number;
  originalHeight: number;
}

interface FlipbookSettings {
  baseDuration: number; // base duration in ms
  featuredDuration: number; // duration for featured images in ms
  transitionDuration: number; // fade transition duration in ms
  previewQuality: 'high' | 'medium' | 'low'; // preview quality for performance
  maxPreviewSize: number; // max width/height for preview images
}

const FlipbookerApp: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [settings, setSettings] = useState<FlipbookSettings>({
    baseDuration: 50,
    featuredDuration: 300,
    transitionDuration: 40,
    previewQuality: 'medium',
    maxPreviewSize: 800,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [currentFrontOpacity, setCurrentFrontOpacity] = useState<number>(1);
  const [currentBackOpacity, setCurrentBackOpacity] = useState<number>(0);
  
  // Image preloading cache
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<{current: number, total: number}>({current: 0, total: 0});
  const [preloadingProgress, setPreloadingProgress] = useState<{current: number, total: number}>({current: 0, total: 0});

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

  // Image processing utilities with optimizations
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

  // Preload images for smoother playback
  const preloadImages = useCallback(async (imageList: ImageData[]) => {
    const cache = imageCache.current;
    
    // Clear old cache and set up preloading progress
    cache.clear();
    setPreloadingProgress({current: 0, total: imageList.length});
    
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
              setPreloadingProgress({current: completedCount, total: imageList.length});
              resolve();
            };
            img.onerror = () => {
              console.warn('Failed to preload image:', imageData.id);
              completedCount++;
              setPreloadingProgress({current: completedCount, total: imageList.length});
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
      setProcessingProgress({current: 0, total: 0});
      setPreloadingProgress({current: 0, total: 0});
    }
  }, []);

  // Preload images when they change
  useEffect(() => {
    if (images.length > 0) {
      preloadImages(images); // Preload preview images
    }
  }, [images, preloadImages]);

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
  }, [settings.previewQuality, settings.maxPreviewSize, resizeImage]);

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

  const calculateDuration = useCallback((index: number): number => {
    const image = images[index];
    if (!image) return settings.baseDuration;

    if (image.isFeatured) {
      return settings.featuredDuration;
    }

    // Check if we're approaching or leaving a featured image
    const nextImage = images[index + 1];
    const prevImage = images[index - 1];
    
    const isBeforeFeatured = nextImage?.isFeatured;
    const isAfterFeatured = prevImage?.isFeatured;

    if (isBeforeFeatured || isAfterFeatured) {
      // Gradually slow down/speed up
      return settings.baseDuration * 1.5;
    }

    return settings.baseDuration;
  }, [images, settings]);

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
  }, []);

  // Canvas dimensions based on context
  const getCanvasDimensions = useCallback(() => {
    const qualityMap = {
      high: { width: 1280, height: 720 },
      medium: { width: 854, height: 480 },
      low: { width: 640, height: 360 }
    };
    return qualityMap[settings.previewQuality];
  }, [settings.previewQuality]);

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
        
        // Now start the crossfade: front canvas fades out, back canvas fades in
        api.start({
          frontOpacity: 0,
          backOpacity: 1,
          config: { duration: settings.transitionDuration },
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
  }, [currentImageIndex, images, api, settings.transitionDuration, isTransitioning]);

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
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
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

  const currentImage = images[currentImageIndex];

  return (
    <div className="flipbooker-app">
      <h1>Flipbooker</h1>
      <p className='description'>Create smooth flipbook-style animations from your photos</p>

      <div className="controls-section">
        <div className="file-input-section">
          <label htmlFor="image-input" className="file-input-label">
            Choose Images
          </label>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="file-input"
          />
        </div>

        <div className="settings-section">
          <h3>Settings</h3>
          <div className="setting">
            <label>
              Base Duration (ms):
              <input
                type="number"
                value={settings.baseDuration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  baseDuration: parseInt(e.target.value) || 200
                }))}
                min="10"
                max="2000"
                step="10"
              />
            </label>
          </div>
          <div className="setting">
            <label>
              Featured Duration (ms):
              <input
                type="number"
                value={settings.featuredDuration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  featuredDuration: parseInt(e.target.value) || 800
                }))}
                min="100"
                max="5000"
                step="20"
              />
            </label>
          </div>
          <div className="setting">
            <label>
              Transition Duration (ms):
              <input
                type="number"
                value={settings.transitionDuration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  transitionDuration: parseInt(e.target.value) || 100
                }))}
                min="10"
                max="500"
                step="10"
              />
            </label>
          </div>
          <div className="setting">
            <label>
              Preview Quality:
              <select
                value={settings.previewQuality}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  previewQuality: e.target.value as 'high' | 'medium' | 'low'
                }))}
              >
                <option value="high">High (720p) - Better quality</option>
                <option value="medium">Medium (480p) - Balanced</option>
                <option value="low">Low (360p) - Better performance</option>
              </select>
            </label>
          </div>
          <div className="setting">
            <label>
              Max Preview Size:
              <input
                type="number"
                value={settings.maxPreviewSize}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  maxPreviewSize: parseInt(e.target.value) || 800
                }))}
                min="400"
                max="1920"
                step="100"
              />
            </label>
          </div>
        </div>

        <div className="playback-controls">
          <button
            onClick={isPlaying ? stopFlipbook : startFlipbook}
            disabled={images.length === 0 || isPreloading}
            className={`control-button ${isPlaying ? 'stop' : 'play'}`}
          >
            {isPreloading ? 'Loading Images...' : isPlaying ? 'Stop' : 'Play'} Flipbook
          </button>
          
          {isPreloading && (
            <div className="loading-indicator">
              {processingProgress.total > 0 && (
                <div className="progress-section">
                  <span>Converting images: {processingProgress.current} / {processingProgress.total}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {preloadingProgress.total > 0 && (
                <div className="progress-section">
                  <span>Caching images: {preloadingProgress.current} / {preloadingProgress.total}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill preloading" 
                      style={{ width: `${(preloadingProgress.current / preloadingProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="preview-section">
          <h3>Preview</h3>
          <div className="canvas-container">
            <animated.canvas
              ref={canvasRef}
              width={getCanvasDimensions().width}
              height={getCanvasDimensions().height}
              className="preview-canvas front-canvas"
              style={frontCanvasStyle}
            />
            <animated.canvas
              ref={canvasBackRef}
              width={getCanvasDimensions().width}
              height={getCanvasDimensions().height}
              className="preview-canvas back-canvas"
              style={backCanvasStyle}
            />
          </div>
          {images.length > 0 && (
            <div className="current-image-info">
              <p>
                Image {currentImageIndex + 1} of {images.length}
                {currentImage?.isFeatured && ' (Featured)'}
              </p>
            </div>
          )}
        </div>

        <div className="images-section">
          <h3>Images ({images.length})</h3>
          <div className="images-grid">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`image-item ${index === currentImageIndex ? 'current' : ''} ${image.isFeatured ? 'featured' : ''}`}
              >
                <img src={image.url} alt={`Image ${index + 1}`} />
                <div className="image-controls">
                  <button
                    onClick={() => toggleFeatured(image.id)}
                    className={`feature-button ${image.isFeatured ? 'featured' : ''}`}
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="remove-button"
                  >
                    ×
                  </button>
                </div>
                <div className="image-index">{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipbookerApp;
