import React, { useState, useRef } from 'react';
import type { ImageData, FlipbookSettings } from './types';
import styles from './VideoExport.module.scss';

interface VideoExportProps {
  images: ImageData[];
  settings: FlipbookSettings;
  calculateDuration: (index: number) => number;
  calculateTransitionDuration: (index: number) => number;
}

interface ExportProgress {
  phase: 'idle' | 'processing' | 'encoding' | 'complete' | 'error';
  current: number;
  total: number;
  message: string;
}

const VideoExport: React.FC<VideoExportProps> = ({
  images,
  settings,
  calculateDuration,
  calculateTransitionDuration
}) => {
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    phase: 'idle',
    current: 0,
    total: 0,
    message: ''
  });
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const exportVideo = async () => {
    if (!canvasRef.current || images.length === 0) return;

    try {
      setExportProgress({
        phase: 'processing',
        current: 0,
        total: images.length,
        message: 'Preparing export...'
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set high quality export dimensions
      const exportWidth = Math.min(1920, Math.max(...images.map(img => img.originalWidth || 800)));
      const exportHeight = Math.min(1080, Math.max(...images.map(img => img.originalHeight || 600)));
      
      canvas.width = exportWidth;
      canvas.height = exportHeight;

      // Calculate total duration and frame rate
      const totalDuration = images.reduce((acc, _, index) => {
        return acc + calculateDuration(index) + calculateTransitionDuration(index);
      }, 0);

      const fps = 60; // Back to 30 FPS for compatibility
      const frameInterval = 1000 / fps;
      const totalFrames = Math.ceil((totalDuration / 1000) * fps);

      setExportProgress({
        phase: 'processing',
        current: 0,
        total: totalFrames,
        message: 'Processing frames...'
      });

      // Set up MediaRecorder for video capture with better compatibility
      const stream = canvas.captureStream(fps);
      
      // Check for codec support
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000 // 5 Mbps
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          setExportedVideoUrl(url);
          setExportProgress({
            phase: 'complete',
            current: totalFrames,
            total: totalFrames,
            message: 'Video export complete!'
          });
        } else {
          throw new Error('No video data captured');
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        throw new Error('Recording failed');
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every 1 second

      // Animate through all frames
      await animateFlipbook(ctx, fps, exportWidth, exportHeight);

      // Wait a bit to ensure last frame is captured
      await new Promise(resolve => setTimeout(resolve, 200));

      // Stop recording
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }

    } catch (error) {
      console.error('Export error:', error);
      setExportProgress({
        phase: 'error',
        current: 0,
        total: 0,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const animateFlipbook = async (
    ctx: CanvasRenderingContext2D,
    fps: number,
    width: number,
    height: number
  ): Promise<void> => {
    const frameInterval = 1000 / fps;
    let totalTime = 0;
    let frameCount = 0;

    // Calculate total animation time
    const totalDuration = images.reduce((acc, _, index) => {
      return acc + calculateDuration(index) + calculateTransitionDuration(index);
    }, 0);

    const totalFrames = Math.ceil((totalDuration / 1000) * fps);

    // Load all images first
    const loadedImages = await Promise.all(
      images.map(imageData => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = imageData.url;
        });
      })
    );

    const drawImage = (img: HTMLImageElement, alpha: number = 1) => {
      // Calculate scaling to fit image while maintaining aspect ratio
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;

      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspect > canvasAspect) {
        // Image is wider than canvas
        drawWidth = width;
        drawHeight = width / imgAspect;
        drawX = 0;
        drawY = (height - drawHeight) / 2;
      } else {
        // Image is taller than canvas
        drawWidth = height * imgAspect;
        drawHeight = height;
        drawX = (width - drawWidth) / 2;
        drawY = 0;
      }

      ctx.globalAlpha = alpha;
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
    };

    const animate = (): Promise<void> => {
      return new Promise((resolve) => {
        let frameCount = 0;
        let currentTime = 0;

        const step = () => {
          if (currentTime >= totalDuration) {
            resolve();
            return;
          }

          // Clear canvas with black background
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);

          // Find current image and calculate timing
          let accumulatedTime = 0;
          let currentIndex = 0;
          let imageTime = 0;
          let imageDuration = 0;
          let transitionDuration = 0;

          for (let i = 0; i < images.length; i++) {
            imageDuration = calculateDuration(i);
            transitionDuration = calculateTransitionDuration(i);
            const totalImageTime = imageDuration + transitionDuration;

            if (currentTime >= accumulatedTime && currentTime < accumulatedTime + totalImageTime) {
              currentIndex = i;
              imageTime = currentTime - accumulatedTime;
              break;
            }
            accumulatedTime += totalImageTime;
          }

          const currentImage = loadedImages[currentIndex];
          const nextImage = loadedImages[currentIndex + 1];

          if (currentImage) {
            if (imageTime < imageDuration) {
              // Show current image at full opacity
              drawImage(currentImage, 1.0);
            } else if (nextImage && transitionDuration > 0) {
              // Transition phase - fade between images
              const transitionTime = imageTime - imageDuration;
              const transitionProgress = Math.min(transitionTime / transitionDuration, 1);
              
              // Use smooth easing for more natural transitions
              const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
              const easedProgress = easeInOut(transitionProgress);
              
              // Fade out current image and fade in next image
              const currentAlpha = 1 - easedProgress;
              const nextAlpha = easedProgress;

              // Draw current image fading out
              drawImage(currentImage, currentAlpha);
              
              // Draw next image fading in
              drawImage(nextImage, nextAlpha);
            } else {
              // No transition or no next image - just show current
              drawImage(currentImage, 1.0);
            }
          }

          frameCount++;
          const progress = Math.min(currentTime / totalDuration, 1);
          setExportProgress(prev => ({
            ...prev,
            current: frameCount,
            total: totalFrames,
            message: `Rendering frame ${frameCount}... (${Math.round(progress * 100)}%)`
          }));

          currentTime += frameInterval;

          if (currentTime < totalDuration) {
            // Use setTimeout to ensure proper timing for MediaRecorder
            setTimeout(step, frameInterval);
          } else {
            resolve();
          }
        };

        // Start the animation
        step();
      });
    };

    await animate();
  };

  const downloadVideo = () => {
    if (!exportedVideoUrl) return;

    const a = document.createElement('a');
    a.href = exportedVideoUrl;
    a.download = `flipbook-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetExport = () => {
    if (exportedVideoUrl) {
      URL.revokeObjectURL(exportedVideoUrl);
      setExportedVideoUrl(null);
    }
    setExportProgress({
      phase: 'idle',
      current: 0,
      total: 0,
      message: ''
    });
  };

  const isExporting = exportProgress.phase === 'processing' || exportProgress.phase === 'encoding';

  return (
    <div className={styles.videoExport}>
      <h4>Export Video</h4>
      
      <div className={styles.exportInfo}>
        <p>Export your flipbook as a high-quality video file.</p>
        <ul>
          <li>Format: WebM</li>
          <li>Quality: High (5 Mbps)</li>
          <li>Frame Rate: 30 FPS</li>
          <li>Resolution: Up to 1920x1080</li>
          <li>Includes smooth fade transitions</li>
        </ul>
      </div>

      {exportProgress.phase === 'idle' && (
        <button
          onClick={exportVideo}
          disabled={images.length === 0}
          className={styles.exportButton}
        >
          Export Video ({images.length} images)
        </button>
      )}

      {isExporting && (
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
            />
          </div>
          <p>{exportProgress.message}</p>
          <p>{exportProgress.current} / {exportProgress.total}</p>
        </div>
      )}

      {exportProgress.phase === 'complete' && exportedVideoUrl && (
        <div className={styles.complete}>
          <p>✅ Video export complete!</p>
          <div className={styles.exportActions}>
            <button onClick={downloadVideo} className={styles.downloadButton}>
              Download Video
            </button>
            <button onClick={resetExport} className={styles.resetButton}>
              Export Another
            </button>
          </div>
          <video 
            src={exportedVideoUrl} 
            controls 
            className={styles.previewVideo}
            width="100%"
            style={{ maxWidth: '400px', marginTop: '1rem' }}
          />
        </div>
      )}

      {exportProgress.phase === 'error' && (
        <div className={styles.error}>
          <p>❌ {exportProgress.message}</p>
          <button onClick={resetExport} className={styles.resetButton}>
            Try Again
          </button>
        </div>
      )}

      {/* Hidden canvas for video rendering */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={1920}
        height={1080}
      />
    </div>
  );
};

export default VideoExport;
