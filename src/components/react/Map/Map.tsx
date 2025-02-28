import { useEffect, useRef } from 'react';
import styles from './Map.module.scss';

interface MapProps {
  userLocation: GeolocationCoordinates | null;
  currentLocation?: { latitude: number; longitude: number } | null;
  compass: number;
  lockNorth: boolean;
  debugMode?: boolean;
  onDebugCompass?: (value: number) => void;
  onDebugPositionChange?: (lat: number, lng: number) => void; // Add this prop
  mapZoom?: number;
}

const Map = ({ 
  userLocation, 
  currentLocation, 
  compass, 
  lockNorth,
  debugMode = false,
  onDebugCompass,
  onDebugPositionChange,
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

      // Create user marker with draggable option if in debug mode
      userMarkerRef.current = L.marker(
        [userLocation.latitude, userLocation.longitude],
        {
          icon: L.divIcon({
            className: styles.userMarker,
            html: '<div></div>'
          }),
          draggable: debugMode // Make marker draggable in debug mode
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

      // Add drag end event listener for debug mode
      if (debugMode && onDebugPositionChange) {
        userMarkerRef.current.on('dragend', function() {
          const position = userMarkerRef.current?.getLatLng();
          if (position) {
            onDebugPositionChange(position.lat, position.lng);
          }
        });
      }
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
      mapRef.current.setView(newLatLng, mapZoom, { animate: false });
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

    // Update draggable status if debug mode changes
    if (userMarkerRef.current) {
      if (debugMode) {
        userMarkerRef.current.dragging?.enable();
      } else {
        userMarkerRef.current.dragging?.disable();
      }
    }
  }, [userLocation, currentLocation, compass, lockNorth, mapZoom, debugMode]);

  return (
    <div className={styles.mapContainer}>
      <div id="map" className={styles.map} />
      {debugMode && (
        <div className={styles.debugControls}>
          <div className={styles.debugControl}>
            <label>Compass:</label>
            <input
              type="range"
              min="0"
              max="360"
              value={compass}
              onChange={(e) => onDebugCompass?.(Number(e.target.value))}
            />
            <span>{Math.round(compass)}°</span>
          </div>
          
          <div className={styles.debugInfo}>
            <h4>Debug Mode</h4>
            <p>Drag the blue marker to change your position</p>
            {userLocation && (
              <div>
                <div>Lat: {userLocation.latitude.toFixed(6)}</div>
                <div>Lng: {userLocation.longitude.toFixed(6)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
