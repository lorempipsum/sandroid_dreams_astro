import React from 'react';
import type { ProgressInfo } from './types';
import styles from './PlaybackControls.module.scss';

interface PlaybackControlsProps {
  isPlaying: boolean;
  imagesLength: number;
  isPreloading: boolean;
  processingProgress: ProgressInfo;
  preloadingProgress: ProgressInfo;
  onPlayClick: () => void;
  onStopClick: () => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  imagesLength,
  isPreloading,
  processingProgress,
  preloadingProgress,
  onPlayClick,
  onStopClick
}) => {
  return (
    <div className={styles.playbackControls}>
      <button
        onClick={isPlaying ? onStopClick : onPlayClick}
        disabled={imagesLength === 0 || isPreloading}
        className={`${styles.controlButton} ${isPlaying ? styles.stop : styles.play}`}
      >
        {isPreloading ? 'Loading Images...' : isPlaying ? 'Stop' : 'Play'} Flipbook
      </button>
      
      {isPreloading && (
        <div className={styles.loadingIndicator}>
          {processingProgress.total > 0 && (
            <div className={styles.progressSection}>
              <span>Converting images: {processingProgress.current} / {processingProgress.total}</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          {preloadingProgress.total > 0 && (
            <div className={styles.progressSection}>
              <span>Caching images: {preloadingProgress.current} / {preloadingProgress.total}</span>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${styles.preloading}`} 
                  style={{ width: `${(preloadingProgress.current / preloadingProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaybackControls;
