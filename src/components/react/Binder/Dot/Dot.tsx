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
  
  // Reset the scaling calculations to make zoom level 17 the accurate reference point
  let scalingFactor;
  
  // Simple scaling based on powers of 2 - each zoom level shows twice the area
  switch (mapZoom) {
    case 15:
      scalingFactor = 4.0;  // 4x scale at zoom 15
      break;
    case 16:
      scalingFactor = 2.0;  // 2x scale at zoom 16
      break;
    case 17:
      scalingFactor = 1.0;  // 1x scale (reference) at zoom 17
      break;
    case 18:
      scalingFactor = 0.5;  // 0.5x scale at zoom 18
      break;
    case 19:
      scalingFactor = 0.25; // 0.25x scale at zoom 19
      break;
    default:
      scalingFactor = 1.0;  // Default to reference
  }
  
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