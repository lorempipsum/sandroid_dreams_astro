import React, { useLayoutEffect, useState } from 'react';
import { animated } from '@react-spring/web';
import { createPortal } from 'react-dom';
import type { ImageData } from './types';
import styles from './PreviewCanvas.module.scss';

interface PreviewCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasBackRef: React.RefObject<HTMLCanvasElement>;
  frontCanvasStyle: any;
  backCanvasStyle: any;
  canvasDimensions: { width: number; height: number };
  images: ImageData[];
  currentImageIndex: number;
  onToggleFeatured: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onImageChange: (index: number) => void;
  isFullscreen?: boolean;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  canvasRef,
  canvasBackRef,
  frontCanvasStyle,
  backCanvasStyle,
  canvasDimensions,
  images,
  currentImageIndex,
  onToggleFeatured,
  onRemoveImage,
  onImageChange,
  isFullscreen = false
}) => {
  const currentImage = images[currentImageIndex];

  // Fullscreen canvas sizing with responsive calculation
  const [fullscreenCanvasSize, setFullscreenCanvasSize] = useState(() => ({
    width: canvasDimensions.width,
    height: canvasDimensions.height
  }));

  useLayoutEffect(() => {
    if (!isFullscreen) {
      setFullscreenCanvasSize({ 
        width: canvasDimensions.width, 
        height: canvasDimensions.height 
      });
      return;
    }

    function calculateFullscreenSize() {
      // Use visualViewport for better mobile support, fallback to window dimensions
      const viewportWidth = window.visualViewport?.width || window.innerWidth;
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      
      // Detect mobile devices for adaptive border sizing
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      window.innerWidth <= 768;
      
      // Use smaller margins on mobile for maximum screen usage
      const margin = isMobile ? 20 : 40;
      const maxWidth = viewportWidth - margin;
      const maxHeight = viewportHeight - margin;
      
      // Calculate size maintaining aspect ratio
      const aspect = canvasDimensions.width / canvasDimensions.height;
      let width = maxWidth;
      let height = width / aspect;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspect;
      }
      
      // Ensure integer values for crisp rendering
      setFullscreenCanvasSize({ 
        width: Math.floor(width), 
        height: Math.floor(height)
      });
    }

    calculateFullscreenSize();
    
    // Prevent body scrolling and ensure fullscreen works properly
    const originalBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
      margin: document.body.style.margin,
      padding: document.body.style.padding
    };
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'relative';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Listen for viewport changes (especially important on mobile)
    window.addEventListener('resize', calculateFullscreenSize);
    window.addEventListener('orientationchange', () => {
      // Delay calculation after orientation change to ensure viewport is stable
      setTimeout(calculateFullscreenSize, 100);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', calculateFullscreenSize);
    }
    
    return () => {
      // Restore original body styles
      document.body.style.overflow = originalBodyStyle.overflow;
      document.body.style.position = originalBodyStyle.position;
      document.body.style.width = originalBodyStyle.width;
      document.body.style.height = originalBodyStyle.height;
      document.body.style.margin = originalBodyStyle.margin;
      document.body.style.padding = originalBodyStyle.padding;
      
      window.removeEventListener('resize', calculateFullscreenSize);
      window.removeEventListener('orientationchange', calculateFullscreenSize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', calculateFullscreenSize);
      }
    };
  }, [isFullscreen, canvasDimensions.width, canvasDimensions.height]);

  return (
    <>
      {/* Normal preview when not fullscreen */}
      {!isFullscreen && (
        <div className={styles.previewSection}>
          <div className={styles.canvasContainer}>
            <animated.canvas
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              className={`${styles.previewCanvas} ${styles.frontCanvas}`}
              style={frontCanvasStyle}
            />
            <animated.canvas
              ref={canvasBackRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              className={`${styles.previewCanvas} ${styles.backCanvas}`}
              style={backCanvasStyle}
            />
            {currentImage && (
              <div className={styles.previewControls}>
                <button
                  onClick={() => onToggleFeatured(currentImage.id)}
                  className={`${styles.featureButton} ${currentImage.isFeatured ? styles.featured : ''}`}
                  title={currentImage.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                >
                  ⭐
                </button>
                <button
                  onClick={() => onRemoveImage(currentImage.id)}
                  className={styles.removeButton}
                  title="Delete image"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className={styles.scrubberContainer}>
              <div className={styles.scrubberLabel}>
                <span>Frame {currentImageIndex + 1}</span>
                <span>{images.length} total</span>
              </div>
              <input
                type="range"
                min="0"
                max={images.length - 1}
                value={currentImageIndex}
                onChange={(e) => onImageChange(parseInt(e.target.value))}
                className={styles.scrubber}
              />
              <div className={styles.scrubberTicks}>
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`${styles.tick} ${index === currentImageIndex ? styles.active : ''} ${image.isFeatured ? styles.featured : ''}`}
                    style={{ left: `${(index / (images.length - 1)) * 100}%` }}
                    onClick={() => onImageChange(index)}
                  />
                ))}
              </div>
            </div>
          )}
          {images.length > 0 && (
            <div className={styles.currentImageInfo}>
              <p>
                Image {currentImageIndex + 1} of {images.length}
                {currentImage?.isFeatured && ' (Featured)'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen preview using React portal to document.body */}
      {isFullscreen && createPortal(
        <div style={{
          // Aggressive positioning to override any parent constraints
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          minWidth: '100vw',
          minHeight: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          background: '#000',
          backgroundColor: '#000',
          zIndex: 999999,
          margin: 0,
          padding: 0,
          border: 0,
          outline: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Force hardware acceleration for smooth rendering
          WebkitTransform: 'translate3d(0,0,0)',
          transform: 'translate3d(0,0,0)',
          // Additional CSS reset properties
          boxSizing: 'border-box',
          fontSize: 0,
          lineHeight: 0,
          verticalAlign: 'baseline',
          // Ensure it's above everything
          isolation: 'isolate'
        }}>
          {/* Front canvas */}
          <animated.canvas
            ref={canvasRef}
            width={fullscreenCanvasSize.width}
            height={fullscreenCanvasSize.height}
            style={{
              display: 'block',
              borderRadius: '16px',
              background: '#000',
              backgroundColor: '#000',
              zIndex: 1,
              // Ensure proper canvas rendering
              imageRendering: 'auto',
              ...frontCanvasStyle
            }}
          />
          
          {/* Back canvas (positioned absolutely behind front canvas) */}
          <animated.canvas
            ref={canvasBackRef}
            width={fullscreenCanvasSize.width}
            height={fullscreenCanvasSize.height}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'block',
              borderRadius: '16px',
              background: '#000',
              backgroundColor: '#000',
              zIndex: 0,
              // Ensure proper canvas rendering
              imageRendering: 'auto',
              ...backCanvasStyle
            }}
          />
          
          {/* White film border overlay */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: fullscreenCanvasSize.width,
            height: fullscreenCanvasSize.height,
            border: '8px solid white',
            borderRadius: '24px', // Slightly larger radius for the border
            pointerEvents: 'none',
            boxSizing: 'border-box',
            zIndex: 2,
            // Ensure the border is always visible
            backgroundColor: 'transparent'
          }} />
        </div>,
        document.body
      )}
    </>
  );
};

export default PreviewCanvas;
