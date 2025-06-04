import { useState, useEffect } from 'react';
import React from 'react';
import styles from './Navigator.module.scss';
import Button from '../Button/Button';
import NavigationArrow from '../NavigationArrow/NavigationArrow';
import {
  calculateBearing,
  calculateDistance,
} from '../../../utils/locationUtils';
import { requestOrientationPermission } from '../../../utils/devicePermissions';

const Navigator = () => {
  const [userLocation, setUserLocation] =
    useState<GeolocationCoordinates | null>(null);
  const [compass, setCompass] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [target, setTarget] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    const orientation = event as DeviceOrientationEvent & {
      webkitCompassHeading?: number;
    };
    const angle = orientation.webkitCompassHeading ?? orientation.alpha ?? 0;
    setCompass(angle);
  };

  const requestPermissions = async () => {
    await requestOrientationPermission(handleOrientation, () =>
      setPermissionGranted(true)
    );
  };

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (pos) => setUserLocation(pos.coords),
      (err) => console.error('Error getting location:', err),
      { enableHighAccuracy: true }
    );

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const handleGo = () => {
    const parts = inputValue.split(',').map((p) => p.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        setTarget({ latitude: lat, longitude: lng });
        setError(null);
        return;
      }
    }
    setError('Invalid coordinates. Use "lat,lng"');
  };

  let bearing = 0;
  let distance: number | null = null;
  if (userLocation && target) {
    bearing = calculateBearing(userLocation, target);
    distance = calculateDistance(userLocation, target);
  }

  const rotation = compass ? bearing - compass : bearing;

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="lat,lng"
          className={styles.input}
        />
        <Button id="go" onClick={handleGo} label="GO" />
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {!permissionGranted ? (
        <Button
          id="enable-compass"
          onClick={requestPermissions}
          label="Enable Compass"
        />
      ) : (
        <>
          <NavigationArrow rotation={rotation} className={styles.bigArrow} />
          {distance !== null && (
            <div className={styles.distance}>{Math.round(distance)}m</div>
          )}
        </>
      )}
    </div>
  );
};

export default Navigator;
