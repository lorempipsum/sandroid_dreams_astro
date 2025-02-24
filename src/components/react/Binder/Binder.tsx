import { useState, useEffect } from 'react';
import styles from './Binder.module.scss';
import AnimatedBobUp from '../animations/AnimatedBobUp';

const BIN_LOCATION = {
  latitude: 51.459630162385146, 
  longitude: -2.616381270527417
};

const Binder = () => {
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [compass, setCompass] = useState<number>(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Calculate bearing between two points
  const calculateBearing = (start: GeolocationCoordinates, end: { latitude: number; longitude: number }) => {
    const startLat = start.latitude * Math.PI / 180;
    const endLat = end.latitude * Math.PI / 180;
    const diffLong = (end.longitude - start.longitude) * Math.PI / 180;

    const x = Math.sin(diffLong) * Math.cos(endLat);
    const y = Math.cos(startLat) * Math.sin(endLat) -
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(diffLong);

    return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
  };

  // Calculate distance in meters
  const calculateDistance = (start: GeolocationCoordinates, end: { latitude: number; longitude: number }) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = start.latitude * Math.PI / 180;
    const φ2 = end.latitude * Math.PI / 180;
    const Δφ = (end.latitude - start.latitude) * Math.PI / 180;
    const Δλ = (end.longitude - start.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const requestPermissions = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } else {
        setPermissionGranted(true);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.webkitCompassHeading) {
      setCompass(event.webkitCompassHeading);
    } else if (event.alpha) {
      setCompass(360 - event.alpha);
    }
  };

  useEffect(() => {
    // Request geolocation permission
    navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation(position.coords);
        if (position.coords) {
          setDistance(calculateDistance(position.coords, BIN_LOCATION));
        }
      },
      (error) => console.error('Error getting location:', error),
      { enableHighAccuracy: true }
    );

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const bearing = userLocation ? calculateBearing(userLocation, BIN_LOCATION) : 0;
  const rotation = compass ? bearing - compass : 0;

  return (
    <div className={styles.container}>
      {!permissionGranted ? (
        <button className={styles.permissionButton} onClick={requestPermissions}>
          Enable Compass
        </button>
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
            {distance ? `${Math.round(distance)}m` : 'Calculating...'}
          </div>
        </>
      )}
    </div>
  );
};

export default Binder;
