import React from 'react';
import styles from './Dot.module.scss';
import InfoRenderer from '../../InfoRenderer/InfoRenderer';

interface DotProps {
  loc: {
    bin: any;
    distance: number;
    bearing: number;
  };
  isNearest: boolean;
  showDotInfo?: boolean;
  dataType: string;
  compass: number;
  isNorthLocked: boolean;
  onDotClick: (e: React.MouseEvent, binId: string) => void;
  mapZoom?: number;
}

const getDotPosition = (
  distance: number, 
  bearing: number, 
  isNorthLocked: boolean, 
  compass: number,
  mapZoom: number = 17
) => {
  const radius = 150;
  
  // Calculate scaling factor based on map zoom:
  // For zoom 15, we want to show more area (smaller scaling to fit more)
  // For zoom 19, we want to show less area (larger scaling to show detail)
  const baseScalingFactor = 1;
  const zoomScaleAdjustment = Math.pow(2, (17 - mapZoom) / 2); // Exponential scaling
  const scalingFactor = baseScalingFactor * zoomScaleAdjustment;
  
  const maxDistance = radius * scalingFactor;
  const rotatedBearing = isNorthLocked ? bearing : bearing - compass;
  const angle = ((rotatedBearing - 90) * Math.PI) / 180;
  const scaledDistance = Math.min(distance, maxDistance) * (radius / maxDistance);
  
  return {
    left: `${radius + scaledDistance * Math.cos(angle)}px`,
    top: `${radius + scaledDistance * Math.sin(angle)}px`
  };
};

const Dot: React.FC<DotProps> = ({
  loc,
  isNearest,
  showDotInfo,
  dataType,
  compass,
  isNorthLocked,
  onDotClick,
  mapZoom = 17
}) => {
  const position = getDotPosition(
    loc.distance,
    loc.bearing,
    isNorthLocked,
    compass,
    mapZoom
  );

  return (
    <React.Fragment key={loc.bin.id}>
      <div 
        className={`${styles.dot} ${isNearest ? styles.nearest : ''}`}
        style={position}
        onClick={(e) => onDotClick(e, loc.bin.id)}
        role="button"
        tabIndex={0}
      />
      {showDotInfo === loc.bin.id && (
        <div 
          className={styles.dotInfo}
          style={position}
          onClick={(e) => e.stopPropagation()}
        >
          <InfoRenderer
            location={loc.bin}
            distance={loc.distance}
            bearing={loc.bearing}
            dataType={dataType}
          />
        </div>
      )}
    </React.Fragment>
  );
};

export default Dot;