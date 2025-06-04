import React from 'react';
import styles from './ZoomControls.module.scss';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
  min = 0.5,
  max = 2,
  step = 0.25,
  label = '',
}) => {
  return (
    <div className={styles.controls}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        onClick={() => onZoomChange(Math.max(min, zoom - step))}
        disabled={zoom <= min}
      >
        -
      </button>
      <span>
        {label === 'Map Zoom' ? Math.round(zoom) : Math.round(zoom * 100) + '%'}
      </span>
      <button
        onClick={() => onZoomChange(Math.min(max, zoom + step))}
        disabled={zoom >= max}
      >
        +
      </button>
    </div>
  );
};

export default ZoomControls;
