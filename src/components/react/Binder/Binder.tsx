import { useState, useEffect } from 'react';
import styles from './Binder.module.scss';
import Button from '../Button/Button';
import { calculateBearing, findNearestBin } from '../../../utils/locationUtils';
import { requestOrientationPermission } from '../../../utils/devicePermissions';
import {
  getUniqueTypes,
  getFacilitiesByType,
} from '../../../utils/geoJsonLoader';
import { getCrimeData } from '../../../utils/crimeDataLoader';
import { getTreeData } from '../../../utils/treeDataLoader';
import {
  getGeneralTreeData,
  type GeneralTree,
} from '../../../utils/generalTreeDataLoader';
import React from 'react';
import Map from '../Map/Map';
import DataTypeSelector from './DataTypeSelector/DataTypeSelector';
import DistanceDisplay from './DistanceDisplay/DistanceDisplay';
import { getLocationsForType } from './utils';
import Dot from './Dot/Dot';
import ZoomControls from './ZoomControls/ZoomControls';

const DATASOURCES = [
  'Facilities',
  'Crimes',
  'Protected Trees',
  'Trees',
] as const;
type DataSourceType = (typeof DATASOURCES)[number];

const Binder = () => {
  const [userLocation, setUserLocation] =
    useState<GeolocationCoordinates | null>(null);
  const [compass, setCompass] = useState<number>(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [facilityTypes] = useState(() => getUniqueTypes());
  const [selectedType, setSelectedType] = useState(facilityTypes[0]);
  const [locations, setLocations] = useState(() =>
    getFacilitiesByType(facilityTypes[0])
  );
  const [currentBin, setCurrentBin] = useState(locations[0]);
  const [error, setError] = useState<string | null>(null);
  const [showDotInfo, setShowDotInfo] = useState(false);
  const [showAllNearby, setShowAllNearby] = useState(false);
  const [nearbyLocations, setNearbyLocations] = useState<
    Array<{
      bin: (typeof locations)[0];
      distance: number;
      bearing: number;
    }>
  >([]);
  const [dataType, setDataType] = useState<
    'facilities' | 'crimes' | 'protected trees' | 'trees'
  >('facilities');
  const [crimeLocations] = useState(() => getCrimeData());
  const [treeLocations] = useState(() => getTreeData());
  const [generalTreeLocations, setGeneralTreeLocations] = useState<
    GeneralTree[]
  >([]);
  const [lockNorth, setLockNorth] = useState(false);
  const [isDebugMode] = useState(
    () =>
      typeof window !== 'undefined' &&
      !('ontouchstart' in window) &&
      process.env.NODE_ENV === 'development'
  );
  const [mapZoom, setMapZoom] = useState(17); // Default zoom level 17

  const updateLocations = (
    sorted: Array<{ bin: any; distance: number; bearing: number }>
  ) => {
    setNearbyLocations(sorted);
    setCurrentBin(sorted[0].bin);
    setDistance(sorted[0].distance);
  };

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
      const sorted = locations
        .map((bin) => findNearestBin(userLocation, [bin]))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      updateLocations(sorted);
    }
  }, [locations, userLocation]);

  useEffect(() => {
    if (!userLocation) return;

    let sorted;
    switch (dataType) {
      case 'facilities':
        sorted = getLocationsForType(locations, userLocation);
        break;
      case 'crimes':
        sorted = getLocationsForType(crimeLocations, userLocation);
        break;
      case 'protected trees':
        sorted = getLocationsForType(treeLocations, userLocation);
        break;
      case 'trees':
        sorted = getLocationsForType(generalTreeLocations, userLocation);
        break;
    }

    if (sorted) {
      updateLocations(sorted);
    }
  }, [
    locations,
    userLocation,
    dataType,
    crimeLocations,
    treeLocations,
    generalTreeLocations,
  ]);

  useEffect(() => {
    const loadGeneralTrees = async () => {
      const trees = await getGeneralTreeData();
      setGeneralTreeLocations(trees);
    };
    loadGeneralTrees();
  }, []);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    const angle = (event as any).webkitCompassHeading ?? event.alpha ?? 0;
    setCompass(angle);
  };

  const requestPermissions = async () => {
    await requestOrientationPermission(handleOrientation, () =>
      setPermissionGranted(true)
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

  const handleBackgroundClick = () => {
    setShowDotInfo(false);
  };

  const handleDotClick = (e: React.MouseEvent, binId?: string) => {
    e.stopPropagation(); // Prevent click from bubbling to background
    setShowDotInfo(binId ? true : !showDotInfo);
  };

  const handleDebugCompass = (value: number) => {
    setCompass(value);
  };

  const handleDebugPositionChange = (lat: number, lng: number) => {
    // Create a mock GeolocationCoordinates object
    const mockPosition: GeolocationCoordinates = {
      latitude: lat,
      longitude: lng,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    };

    setUserLocation(mockPosition);
  };

  // Calculate bearing based on active navigation mode
  let bearing = 0;

  if (userLocation) {
    if (currentBin) {
      // Point to facility otherwise
      bearing = calculateBearing(userLocation, currentBin);
    }
  }

  // Calculate final rotation with compass adjustment
  const rotation = compass ? bearing - compass : bearing;

  return (
    <div onClick={handleBackgroundClick}>
      <div className={styles.titleContainer}>
        <span>Find the closest</span>
        <DataTypeSelector
          dataType={dataType}
          onDataTypeChange={(type) => setDataType(type as typeof dataType)}
          facilityTypes={facilityTypes}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        <div className={styles.toggleContainer}>
          <label className={styles.toggleNearby}>
            <input
              type="checkbox"
              checked={showAllNearby}
              onChange={(e) => setShowAllNearby(e.target.checked)}
            />
            Show closest 10
          </label>
          <label className={styles.toggleNearby}>
            <input
              type="checkbox"
              checked={lockNorth}
              onChange={(e) => setLockNorth(e.target.checked)}
            />
            Lock North
          </label>
        </div>
      </div>

      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}

        {!permissionGranted ? (
          <Button
            id="enable-compass"
            onClick={requestPermissions}
            label="Enable Compass"
          />
        ) : (
          <>
            <div className={styles.zoomControls}>
              <ZoomControls
                zoom={mapZoom}
                onZoomChange={setMapZoom}
                min={11}
                max={20}
                step={1}
                label="Map Zoom"
              />
            </div>
            <div className={styles.radar}>
              <Map
                userLocation={userLocation}
                currentLocation={currentBin}
                compass={compass}
                lockNorth={lockNorth}
                debugMode={isDebugMode}
                onDebugCompass={handleDebugCompass}
                onDebugPositionChange={handleDebugPositionChange} // Add this prop
                mapZoom={mapZoom}
              />

              {/* Only show facility dots when not in SVG navigation mode */}
              {showAllNearby &&
                nearbyLocations.map((loc, index) => (
                  <Dot
                    key={loc.bin.id}
                    loc={loc}
                    isNearest={index === 0}
                    showDotInfo={showDotInfo}
                    dataType={dataType}
                    compass={compass}
                    isNorthLocked={lockNorth}
                    onDotClick={handleDotClick}
                    mapZoom={mapZoom}
                  />
                ))}

              {!showAllNearby && currentBin && distance && (
                <Dot
                  loc={{ bin: currentBin, distance, bearing }}
                  isNearest={true}
                  showDotInfo={showDotInfo}
                  dataType={dataType}
                  compass={compass}
                  isNorthLocked={lockNorth}
                  onDotClick={handleDotClick}
                  mapZoom={mapZoom}
                />
              )}
            </div>

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

            <DistanceDisplay
              name={currentBin?.name || ''}
              distance={distance}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Binder;
