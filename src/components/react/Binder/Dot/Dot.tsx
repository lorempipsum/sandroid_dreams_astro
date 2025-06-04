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
  showDotInfo?: string | boolean;
  dataType: string;
  compass: number;
  isNorthLocked: boolean;
  onDotClick: (e: React.MouseEvent, binId: string) => void;
  mapZoom?: number;
}

export const getDotPosition = (
  distance: number,
  bearing: number,
  isNorthLocked: boolean,
  compass: number,
  mapZoom: number = 17
) => {
  const radius = 150;

  // Replace switch statement with a general formula that works for any zoom level
  // Use 17 as reference zoom with scale factor 1.0
  // Each zoom level difference changes scale by factor of 2
  const zoomDifference = 17 - mapZoom;
  const scalingFactor = Math.pow(2, zoomDifference);

  const maxDistance = radius * scalingFactor;
  const rotatedBearing = isNorthLocked ? bearing : bearing - compass;
  const angle = ((rotatedBearing - 90) * Math.PI) / 180;
  const scaledDistance =
    Math.min(distance, maxDistance) * (radius / maxDistance);

  return {
    left: `${radius + scaledDistance * Math.cos(angle)}px`,
    top: `${radius + scaledDistance * Math.sin(angle)}px`,
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
  mapZoom = 17,
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
