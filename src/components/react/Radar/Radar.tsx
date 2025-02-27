import React from 'react';
import styles from './Radar.module.scss';

interface RadarProps {
  showAllNearby: boolean;
  nearbyLocations: any[];
  currentBin: any;
  distance: number | null;
  bearing: number;
  compass: number;
  showDotInfo: string | boolean;
  onDotClick: (e: React.MouseEvent, binId?: string) => void;
  renderInfo: (location: any, distance: number, bearing: number) => React.ReactNode;
}

const Radar = ({
  showAllNearby,
  nearbyLocations,
  currentBin,
  distance,
  bearing,
  compass,
  showDotInfo,
  onDotClick,
  renderInfo
}: RadarProps) => {
  const getDotPosition = (distance: number, bearing: number) => {
    const radius = 150;
    const scalingFactor = 0.33;
    const maxDistance = radius * scalingFactor;
    const rotatedBearing = bearing - compass;
    const angle = ((rotatedBearing - 90) * Math.PI) / 180;
    const scaledDistance = Math.min(distance, maxDistance) * (radius / maxDistance);
    
    return {
      left: `${radius + scaledDistance * Math.cos(angle)}px`,
      top: `${radius + scaledDistance * Math.sin(angle)}px`
    };
  };

  return (
    <div className={styles.radar}>
      {showAllNearby ? (
        nearbyLocations.map((loc, index) => (
          <React.Fragment key={loc.bin.id}>
            <div 
              className={`${styles.dot} ${index === 0 ? styles.nearest : ''}`}
              style={getDotPosition(loc.distance, loc.bearing)}
              onClick={(e) => onDotClick(e, loc.bin.id)}
              role="button"
              tabIndex={0}
            />
            {showDotInfo === loc.bin.id && (
              <div 
                className={styles.dotInfo}
                style={getDotPosition(loc.distance, loc.bearing)}
                onClick={(e) => e.stopPropagation()}
              >
                {renderInfo(loc.bin, loc.distance, loc.bearing)}
              </div>
            )}
          </React.Fragment>
        ))
      ) : (
        <>
          {currentBin && distance && (
            <>
              <div 
                className={styles.dot} 
                style={getDotPosition(distance, bearing)}
                onClick={(e) => onDotClick(e)}
                role="button"
                tabIndex={0}
              />
              {showDotInfo && (
                <div 
                  className={styles.dotInfo}
                  style={getDotPosition(distance, bearing)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderInfo(currentBin, distance, bearing)}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Radar;
