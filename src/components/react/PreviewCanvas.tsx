import React, { useRef, useLayoutEffect, useState } from 'react';
import { animated } from '@react-spring/web';
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

  // Store fullscreen canvas size in state, recalc only on fullscreen or resize
  const [fullscreenCanvasSize, setFullscreenCanvasSize] = useState(() => ({
    width: canvasDimensions.width,
    height: canvasDimensions.height,
    offsetX: 0,
    offsetY: 0
  }));
  useLayoutEffect(() => {
    if (!isFullscreen) {
      setFullscreenCanvasSize({ width: canvasDimensions.width, height: canvasDimensions.height, offsetX: 0, offsetY: 0 });
      return;
    }
    function calcSize() {
      const border = 40;
      const maxW = window.innerWidth - border;
      const maxH = window.innerHeight - border;
      const aspect = canvasDimensions.width / canvasDimensions.height;
      let width = Math.floor(maxW);
      let height = Math.floor(width / aspect);
      if (height > maxH) {
        height = Math.floor(maxH);
        width = Math.floor(height * aspect);
      }
      // Calculate centering offset
      const offsetX = Math.floor((maxW - width) / 2);
      const offsetY = Math.floor((maxH - height) / 2);
      setFullscreenCanvasSize({ width, height, offsetX, offsetY });
    }
    calcSize();
    window.addEventListener('resize', calcSize);
    return () => window.removeEventListener('resize', calcSize);
  }, [isFullscreen, canvasDimensions.width, canvasDimensions.height]);

  // Fullscreen styles
  const fullscreenPreviewStyle = isFullscreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: '#000',
    zIndex: 1000,
    padding: 0,
    margin: 0,
    borderRadius: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } : {};

  const fullscreenCanvasStyle = isFullscreen ? {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000'
  } : {};

  return (
    <div className={styles.previewSection} style={fullscreenPreviewStyle}>
      <div className={styles.canvasContainer} style={fullscreenCanvasStyle}>
        <animated.canvas
          ref={canvasRef}
          width={fullscreenCanvasSize.width}
          height={fullscreenCanvasSize.height}
          className={`${styles.previewCanvas} ${styles.frontCanvas}`}
          style={{
            ...(isFullscreen ? {
              position: 'absolute' as const,
              top: fullscreenCanvasSize.offsetY + 20,
              left: fullscreenCanvasSize.offsetX + 20,
              width: fullscreenCanvasSize.width,
              height: fullscreenCanvasSize.height,
              borderRadius: '32px',
              background: '#000',
            } : {}),
            ...frontCanvasStyle
          }}
        />
        <animated.canvas
          ref={canvasBackRef}
          width={fullscreenCanvasSize.width}
          height={fullscreenCanvasSize.height}
          className={`${styles.previewCanvas} ${styles.backCanvas}`}
          style={{
            ...(isFullscreen ? {
              position: 'absolute' as const,
              top: fullscreenCanvasSize.offsetY + 20,
              left: fullscreenCanvasSize.offsetX + 20,
              width: fullscreenCanvasSize.width,
              height: fullscreenCanvasSize.height,
              borderRadius: '32px',
              background: '#000',
            } : {}),
            ...backCanvasStyle
          }}
        />
        {currentImage && !isFullscreen && (
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
      {images.length > 1 && !isFullscreen && (
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
      {images.length > 0 && !isFullscreen && (
        <div className={styles.currentImageInfo}>
          <p>
            Image {currentImageIndex + 1} of {images.length}
            {currentImage?.isFeatured && ' (Featured)'}
          </p>
        </div>
      )}        {isFullscreen && (
          <div style={{
            position: 'absolute',
            top: fullscreenCanvasSize.offsetY + 20,
            left: fullscreenCanvasSize.offsetX + 20,
            width: fullscreenCanvasSize.width,
            height: fullscreenCanvasSize.height,
            border: '16px solid white',
            borderRadius: '32px',
            pointerEvents: 'none',
            boxSizing: 'border-box',
            zIndex: 10,
            overflow: 'hidden',
          }} />
        )}
    </div>
  );
};

export default PreviewCanvas;
