import { useState, useEffect } from 'react';
import styles from './Binder.module.scss';
import AnimatedBobUp from '../animations/AnimatedBobUp';
import Button from '../Button/Button';
import { calculateBearing, findNearestBin } from '../../../utils/locationUtils';

const BIN_LOCATIONS = [
  {
  latitude: 51.459630162385146, 
  longitude: -2.616381270527417,
  name: "Clifton Cathedral"
},
  {
  latitude:  51.46889719595909, 
  longitude: -2.6330892462843325,
  name: "Sea Walls"
},
  {
  latitude:  51.461985595937925, 
  longitude: -2.6258963970676614,
  name: "Alderman's Water Fountain"
},

];

const Binder = () => {
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [compass, setCompass] = useState<number>(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [currentBin, setCurrentBin] = useState(BIN_LOCATIONS[0]);

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation(position.coords);
        if (position.coords) {
          const nearest = findNearestBin(position.coords, BIN_LOCATIONS);
          setCurrentBin(nearest.bin);
          setDistance(nearest.distance);
        }
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

  return (
    <div className={styles.container}>
      {!permissionGranted ? (
        <Button id="enable-compass" onClick={requestPermissions} label="Enable Compass" />
      
      ) : (
        <>
        <AnimatedBobUp>
          <svg
            className={styles.arrow}
            style={{ transform: `rotate(${rotation}deg)` }}
            viewBox="0 0 210 297"
            width="100"
            height="100"
            fill="none"
            stroke-width="5"
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
  );
};

export default Binder;

