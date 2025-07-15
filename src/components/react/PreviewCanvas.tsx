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
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  canvasRef,
  canvasBackRef,
  frontCanvasStyle,
  backCanvasStyle,
  canvasDimensions,
  images,
  currentImageIndex
}) => {
  const currentImage = images[currentImageIndex];

  return (
    <div className={styles.previewSection}>
      <h3>Preview</h3>
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
      </div>
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
