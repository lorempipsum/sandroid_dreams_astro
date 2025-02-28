import { useEffect, useRef } from 'react';
import styles from './Map.module.scss';

interface MapProps {
  userLocation: GeolocationCoordinates | null;
  currentLocation?: { latitude: number; longitude: number } | null;
  compass: number;
  lockNorth: boolean;
  debugMode?: boolean;
  onDebugCompass?: (value: number) => void;
  mapZoom?: number;
}

const Map = ({ 
  userLocation, 
  currentLocation, 
  compass, 
  lockNorth,
  debugMode = false,
  onDebugCompass,
  mapZoom = 17
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
        mapZoom
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
      )
      .bindPopup(() => {
        const content = document.createElement('div');
        content.className = styles.userPopup;
        content.innerHTML = `
          <h3>Your Location</h3>
          <p>Lat: ${userLocation.latitude.toFixed(6)}</p>
          <p>Lng: ${userLocation.longitude.toFixed(6)}</p>
          <p>Accuracy: ${userLocation.accuracy.toFixed(1)}m</p>
          ${userLocation.altitude ? `<p>Altitude: ${userLocation.altitude.toFixed(1)}m</p>` : ''}
        `;
        return content;
      }, {
        closeButton: false,
        className: styles.popup
      })
      .addTo(mapRef.current);
    }

    // Update map rotation based on compass - reset to 0 when locked to north
    if (mapRef.current) {
      const mapContainer = mapRef.current.getContainer();
      mapContainer.style.transform = lockNorth ? 
        'rotate(0deg)' : 
        `rotate(-${compass}deg)`;
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

    // Update zoom level when it changes
    if (mapRef.current) {
      mapRef.current.setZoom(mapZoom);
    }
  }, [userLocation, currentLocation, compass, lockNorth, mapZoom]);

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
