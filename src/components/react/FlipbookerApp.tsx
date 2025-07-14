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
}

const FlipbookerApp: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [settings, setSettings] = useState<FlipbookSettings>({
    baseDuration: 200,
    featuredDuration: 800,
    transitionDuration: 100,
  });
  const [isRecording, setIsRecording] = useState<boolean>(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Spring animation for image opacity - using animated style
  const [{ opacity }, api] = useSpring(() => ({
    opacity: 1,
    config: { duration: settings.transitionDuration },
  }));

  const animatedStyle = {
    opacity: opacity,
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
      const filtered = prev.filter(img => img.id !== id);
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

  const nextImage = useCallback(() => {
    if (images.length === 0 || isTransitioning) return;
    
    setIsTransitioning(true);
    const nextIndex = (currentImageIndex + 1) % images.length;
    
    // Start fade out
    api.start({
      opacity: 0,
      config: { duration: settings.transitionDuration / 2 },
      onRest: () => {
        // Switch to new image
        setCurrentImageIndex(nextIndex);
        // Start fade in
        api.start({
          opacity: 1,
          config: { duration: settings.transitionDuration / 2 },
          onRest: () => {
            setIsTransitioning(false);
          },
        });
      },
    });
  }, [currentImageIndex, images.length, api, settings.transitionDuration, isTransitioning]);

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
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const stream = canvas.captureStream(30); // 30 FPS
    
    recordedChunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    });

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
  }, [startFlipbook]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopFlipbook();
    }
  }, [isRecording, stopFlipbook]);

  // Draw current image to canvas
  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentImage = images[currentImageIndex];
    if (!currentImage) return;

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
    
    img.src = currentImage.url;
  }, [currentImageIndex, images]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      images.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, [images]);

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
                min="50"
                max="2000"
                step="50"
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
                step="100"
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
              width="800"
              height="600"
              className="preview-canvas"
              style={animatedStyle}
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
