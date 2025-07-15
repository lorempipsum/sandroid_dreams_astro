import React from 'react';
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

  return (
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
  );
};

export default PreviewCanvas;
