import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animated, useSpring } from '@react-spring/web';
import './FlipbookerApp.css';

interface ImageData {
  id: string;
  file: File;
  url: string;
  isFeatured: boolean;
}

interface FlipbookSettings {
  baseDuration: number; // base duration in ms
  featuredDuration: number; // duration for featured images in ms
  transitionDuration: number; // fade transition duration in ms
  videoQuality: 'high' | 'medium' | 'low'; // video recording quality
}

const FlipbookerApp: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [settings, setSettings] = useState<FlipbookSettings>({
    baseDuration: 50,
    featuredDuration: 300,
    transitionDuration: 40,
    videoQuality: 'high',
  });
  const [isRecording, setIsRecording] = useState<boolean>(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
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

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageData[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      isFeatured: false,
    }));

    setImages(prev => [...prev, ...newImages]);
  }, []);

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
    
    // Set the image source
    if (imageData.url) {
      img.src = imageData.url;
    }
  }, []);

  // Composite the front and back canvases with their opacities for recording
  const updateCompositeCanvas = useCallback(() => {
    if (!compositeCanvasRef.current || !canvasRef.current || !canvasBackRef.current) return;

    const compositeCtx = compositeCanvasRef.current.getContext('2d');
    if (!compositeCtx) return;

    const frontCanvas = canvasRef.current;
    const backCanvas = canvasBackRef.current;

    // Clear composite canvas
    compositeCtx.clearRect(0, 0, compositeCanvasRef.current.width, compositeCanvasRef.current.height);

    // Always draw the back canvas first (it might have the new image during transition)
    compositeCtx.globalAlpha = currentBackOpacity;
    compositeCtx.drawImage(backCanvas, 0, 0);

    // Then draw the front canvas on top
    compositeCtx.globalAlpha = currentFrontOpacity;
    compositeCtx.drawImage(frontCanvas, 0, 0);

    // Reset global alpha
    compositeCtx.globalAlpha = 1;
  }, [currentFrontOpacity, currentBackOpacity]);

  // Continuously update composite canvas during recording
  useEffect(() => {
    if (!isRecording) return;

    const animate = () => {
      updateCompositeCanvas();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start the animation loop immediately
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRecording, updateCompositeCanvas]);

  const nextImage = useCallback(() => {
    if (images.length === 0 || isTransitioning) return;
    
    setIsTransitioning(true);
    const nextIndex = (currentImageIndex + 1) % images.length;
    
    // First, load the new image on the back canvas and wait for it to be ready
    const backCanvas = canvasBackRef.current;
    if (backCanvas && images[nextIndex]) {
      const backCtx = backCanvas.getContext('2d');
      if (!backCtx) return;

      const img = new Image();
      img.onload = () => {
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
      
      img.onerror = (error) => {
        console.warn('Failed to load next image:', images[nextIndex]?.id, error);
        setIsTransitioning(false);
      };
      
      img.src = images[nextIndex].url;
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

  const startRecording = useCallback(async () => {
    if (!compositeCanvasRef.current) return;

    const canvas = compositeCanvasRef.current;
    
    // Quality settings based on user preference
    const qualitySettings = {
      high: { fps: 60, bitrate: 10000000 }, // 10 Mbps
      medium: { fps: 30, bitrate: 5000000 }, // 5 Mbps
      low: { fps: 24, bitrate: 2000000 }, // 2 Mbps
    };
    
    const { fps, bitrate } = qualitySettings[settings.videoQuality];
    const stream = canvas.captureStream(fps);
    
    recordedChunksRef.current = [];
    
    // Try different codecs for better quality, with fallbacks
    let options;
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: bitrate,
      };
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      options = {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: bitrate,
      };
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options = {
        mimeType: 'video/mp4',
        videoBitsPerSecond: bitrate,
      };
    } else {
      options = {
        videoBitsPerSecond: bitrate,
      };
    }
    
    mediaRecorderRef.current = new MediaRecorder(stream, options);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: 'video/webm',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flipbook.webm';
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    startFlipbook();
  }, [startFlipbook, settings.videoQuality]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop the animation loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      stopFlipbook();
    }
  }, [isRecording, stopFlipbook]);

  // Draw current image to front canvas initially
  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return;

    const currentImage = images[currentImageIndex];
    if (!currentImage) return;

    // Only draw to front canvas initially
    drawImageToCanvas(canvasRef.current, currentImage);
  }, [currentImageIndex, images, drawImageToCanvas]);

  // Update composite canvas whenever canvases or opacities change
  useEffect(() => {
    updateCompositeCanvas();
  }, [updateCompositeCanvas, currentImageIndex, currentFrontOpacity, currentBackOpacity]);

  // Cleanup - only on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Only revoke URLs on unmount
      images.forEach(img => {
        try {
          URL.revokeObjectURL(img.url);
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
      <p>Create flipbook-style videos from your photos</p>
      
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
              Video Quality:
              <select
                value={settings.videoQuality}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  videoQuality: e.target.value as 'high' | 'medium' | 'low'
                }))}
              >
                <option value="high">High (10 Mbps, 60 FPS)</option>
                <option value="medium">Medium (5 Mbps, 30 FPS)</option>
                <option value="low">Low (2 Mbps, 24 FPS)</option>
              </select>
            </label>
          </div>
        </div>

        <div className="playback-controls">
          <button
            onClick={isPlaying ? stopFlipbook : startFlipbook}
            disabled={images.length === 0}
            className={`control-button ${isPlaying ? 'stop' : 'play'}`}
          >
            {isPlaying ? 'Stop' : 'Play'} Flipbook
          </button>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={images.length === 0}
            className={`control-button ${isRecording ? 'recording' : 'record'}`}
          >
            {isRecording ? 'Stop Recording' : 'Record Video'}
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="preview-section">
          <h3>Preview</h3>
          <div className="canvas-container">
            <animated.canvas
              ref={canvasRef}
              width="1920"
              height="1080"
              className="preview-canvas front-canvas"
              style={frontCanvasStyle}
            />
            <animated.canvas
              ref={canvasBackRef}
              width="1920"
              height="1080"
              className="preview-canvas back-canvas"
              style={backCanvasStyle}
            />
            {/* Hidden composite canvas for recording */}
            <canvas
              ref={compositeCanvasRef}
              width="1920"
              height="1080"
              style={{ display: 'none' }}
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
