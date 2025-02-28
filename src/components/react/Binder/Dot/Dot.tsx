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
}

const getDotPosition = (distance: number, bearing: number, isNorthLocked: boolean, compass: number) => {
    const radius = 150; // has to be half of the width and height set in Binder.module.scss
    const scalingFactor = 1;
    const maxDistance = radius*scalingFactor;
    // Only rotate bearing with compass if not locked to north
    const rotatedBearing = isNorthLocked ? bearing : bearing - compass;
    // Convert to radians and adjust for CSS coordinate system
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
  onDotClick
}) => {
  const position = getDotPosition(
    loc.distance,
    loc.bearing,
    isNorthLocked,
    compass
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