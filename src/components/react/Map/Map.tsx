import { useEffect, useRef } from 'react';
import styles from './Map.module.scss';

interface MapProps {
  userLocation: GeolocationCoordinates | null;
  currentLocation?: { latitude: number; longitude: number } | null;
  compass: number;
  lockNorth: boolean;
  debugMode?: boolean;
  onDebugCompass?: (value: number) => void;
}

const Map = ({ 
  userLocation, 
  currentLocation, 
  compass, 
  lockNorth,
  debugMode = false,
  onDebugCompass 
}: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current && userLocation) {
      mapRef.current = L.map('map', {
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      }).setView(
        [userLocation.latitude, userLocation.longitude],
        17
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      userMarkerRef.current = L.marker(
        [userLocation.latitude, userLocation.longitude],
        {
          icon: L.divIcon({
            className: styles.userMarker,
            html: '<div></div>'
          })
        }
      ).addTo(mapRef.current);
    }

    // Update map rotation based on compass - negate the value to match compass direction
    if (mapRef.current && !lockNorth) {
      const mapContainer = mapRef.current.getContainer();
      mapContainer.style.transform = `rotate(-${compass}deg)`;
    }

    // Update user location and center
    if (mapRef.current && userLocation && userMarkerRef.current) {
      const newLatLng = [userLocation.latitude, userLocation.longitude] as [number, number];
      userMarkerRef.current.setLatLng(newLatLng);
      mapRef.current.setView(newLatLng, 17, { animate: false });
    }

    // Update destination marker
    if (mapRef.current && currentLocation) {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      markerRef.current = L.marker(
        [currentLocation.latitude, currentLocation.longitude],
        {
          icon: L.divIcon({
            className: styles.destinationMarker,
            html: '<div></div>'
          })
        }
      ).addTo(mapRef.current);
    }
  }, [userLocation, currentLocation, compass, lockNorth]);

  return (
    <div className={styles.mapContainer}>
      <div id="map" className={styles.map} />
      {debugMode && (
        <div className={styles.debugControls}>
          <input
            type="range"
            min="0"
            max="360"
            value={compass}
            onChange={(e) => onDebugCompass?.(Number(e.target.value))}
          />
          <span>{Math.round(compass)}°</span>
        </div>
      )}
    </div>
  );
};

export default Map;
