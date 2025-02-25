import { useState, useEffect } from 'react';
import styles from './Binder.module.scss';
import AnimatedBobUp from '../animations/AnimatedBobUp';
import Button from '../Button/Button';
import TypeSelector from '../TypeSelector/TypeSelector';
import { calculateBearing, findNearestBin } from '../../../utils/locationUtils';
import { requestOrientationPermission } from '../../../utils/devicePermissions';
import { getUniqueTypes, getFacilitiesByType } from '../../../utils/geoJsonLoader';

const Binder = () => {
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [compass, setCompass] = useState<number>(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [facilityTypes] = useState(() => getUniqueTypes());
  const [selectedType, setSelectedType] = useState(facilityTypes[0]);
  const [locations, setLocations] = useState(() => getFacilitiesByType(facilityTypes[0]));
  const [currentBin, setCurrentBin] = useState(locations[0]);
  const [error, setError] = useState<string | null>(null);
  const [showDotInfo, setShowDotInfo] = useState(false);

  useEffect(() => {
    try {
      const newLocations = getFacilitiesByType(selectedType);
      if (newLocations.length === 0) {
        setError(`No facilities found for type: ${selectedType}`);
        return;
      }
      setLocations(newLocations);
      setCurrentBin(newLocations[0]);
      setError(null);
    } catch (err) {
      setError('Failed to load facility data');
      console.error(err);
    }
  }, [selectedType]);

  useEffect(() => {
    if (userLocation && locations.length > 0) {
      const nearest = findNearestBin(userLocation, locations);
      setCurrentBin(nearest.bin);
      setDistance(nearest.distance);
    }
  }, [locations, userLocation]);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    const angle = event.webkitCompassHeading || event.alpha || 0;
    setCompass(angle);
  };

  const requestPermissions = async () => {
    await requestOrientationPermission(
      handleOrientation,
      () => setPermissionGranted(true)
    );
  };

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation(position.coords);
      },
      (error) => console.error('Error getting location:', error),
      { enableHighAccuracy: true }
    );

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const bearing = userLocation ? calculateBearing(userLocation, currentBin) : 0;
  const rotation = compass ? bearing - compass : 0;

  const getDotPosition = (distance: number, bearing: number) => {
    // Scale distance to fit within 150px radius (300px diameter)
    const radius = 150;
    const angle = (bearing - 90) * (Math.PI / 180); // Convert to radians, -90 to align north
    const scaledDistance = Math.min(distance, 300) * (radius / 300);
    
    return {
      left: `${radius + scaledDistance * Math.cos(angle)}px`,
      top: `${radius + scaledDistance * Math.sin(angle)}px`
    };
  };

  return (
    <>
      <div className={styles.titleContainer}>
        <span>Find the closest</span>
        <div className={styles.selector}>
        <TypeSelector 
          types={facilityTypes}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        /></div>
      </div>
      
      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}
        
        {!permissionGranted ? (
          <Button id="enable-compass" onClick={requestPermissions} label="Enable Compass" />
        ) : (
          <>
            <div className={styles.radar}>
              {currentBin && distance && (
                <>
                  <div 
                    className={styles.dot} 
                    style={getDotPosition(distance, bearing)}
                    onClick={() => setShowDotInfo(!showDotInfo)}
                    role="button"
                    tabIndex={0}
                  />
                  {showDotInfo && (
                    <div 
                      className={styles.dotInfo}
                      style={getDotPosition(distance, bearing)}
                    >
                      <h3>{currentBin.name}</h3>
                      <p>{Math.round(distance)}m away</p>
                      <p>Bearing: {Math.round(bearing)}°</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <AnimatedBobUp>
              <svg
                className={styles.arrow}
                style={{ transform: `rotate(${rotation}deg)` }}
                viewBox="0 0 210 297"
                width="100"
                height="100"
                fill="none"
                strokeWidth="6"
              >
                <path d="m 106.15699,104.81898 0.81766,137.66811 102.24487,52.63857 L 106.09742,1.2562312 1.2008898,295.02942 96.460978,247.10502" />
              </svg>
            </AnimatedBobUp>
            <div className={styles.distance}>
              <div className={styles.binName}>{currentBin.name}</div>
              {distance ? `${Math.round(distance)}m` : 'Calculating...'}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Binder;

