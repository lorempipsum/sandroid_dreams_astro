import { useState, useEffect } from 'react';
import styles from './Binder.module.scss';
import AnimatedBobUp from '../animations/AnimatedBobUp';
import Button from '../Button/Button';
import TypeSelector from '../TypeSelector/TypeSelector';
import { calculateBearing, findNearestBin } from '../../../utils/locationUtils';
import { requestOrientationPermission } from '../../../utils/devicePermissions';
import { getUniqueTypes, getFacilitiesByType } from '../../../utils/geoJsonLoader';
import { getCrimeData, type CrimeLocation } from '../../../utils/crimeDataLoader';
import { getTreeData, type TreeLocation } from '../../../utils/treeDataLoader';
import { getGeneralTreeData, type GeneralTree } from '../../../utils/generalTreeDataLoader';
import React from 'react';
import Map from '../Map/Map';
import DataTypeSelector from '../DataTypeSelector/DataTypeSelector';
import InfoRenderer from '../InfoRenderer/InfoRenderer';

const DATASOURCES = ['Facilities', 'Crimes', 'Protected Trees', 'Trees'] as const;
type DataSourceType = typeof DATASOURCES[number];

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
  const [showAllNearby, setShowAllNearby] = useState(false);
  const [nearbyLocations, setNearbyLocations] = useState<Array<{
    bin: typeof locations[0],
    distance: number,
    bearing: number
  }>>([]);
  const [dataType, setDataType] = useState<'facilities' | 'crimes' | 'protected trees' | 'trees'>('facilities');
  const [crimeLocations] = useState(() => getCrimeData());
  const [treeLocations] = useState(() => getTreeData());
  const [generalTreeLocations, setGeneralTreeLocations] = useState<GeneralTree[]>([]);
  const [lockNorth, setLockNorth] = useState(false);
  const [isDebugMode] = useState(() => 
    typeof window !== 'undefined' && 
    !('ontouchstart' in window) && 
    process.env.NODE_ENV === 'development'
  );

  const updateLocations = (sorted: Array<{ bin: any, distance: number, bearing: number }>) => {
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
      const sorted = locations.map(bin => findNearestBin(userLocation, [bin]))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      updateLocations(sorted);
    }
  }, [locations, userLocation]);

  useEffect(() => {
    if (!userLocation) return;

    const getLocationsForType = (items: any[]) => {
      return items
        .map(item => ({
          bin: item,
          ...findNearestBin(userLocation, [item])
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
    };

    let sorted;
    switch (dataType) {
      case 'facilities':
        sorted = getLocationsForType(locations);
        break;
      case 'crimes':
        sorted = getLocationsForType(crimeLocations);
        break;
      case 'protected trees':
        sorted = getLocationsForType(treeLocations);
        break;
      case 'trees':
        sorted = getLocationsForType(generalTreeLocations);
        break;
    }
    
    if (sorted) {
      updateLocations(sorted);
    }
  }, [locations, userLocation, dataType, crimeLocations, treeLocations, generalTreeLocations]);

  useEffect(() => {
    const loadGeneralTrees = async () => {
      const trees = await getGeneralTreeData();
      setGeneralTreeLocations(trees);
    };
    loadGeneralTrees();
  }, []);

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
  // Fix rotation calculation to point correctly
  const rotation = compass ? (bearing - compass) : bearing; // Remove negative sign from formula

  const getDotPosition = (distance: number, bearing: number) => {
    const radius = 150; // has to be half of the width and height set in Binder.module.scss
    const scalingFactor = 1;
    const maxDistance = radius*scalingFactor;
    // Only rotate bearing with compass if not locked to north
    const rotatedBearing = lockNorth ? bearing : bearing - compass;
    // Convert to radians and adjust for CSS coordinate system
    const angle = ((rotatedBearing - 90) * Math.PI) / 180;
    const scaledDistance = Math.min(distance, maxDistance) * (radius / maxDistance);
    
    return {
      left: `${radius + scaledDistance * Math.cos(angle)}px`,
      top: `${radius + scaledDistance * Math.sin(angle)}px`
    };
  };

  const handleBackgroundClick = () => {
    setShowDotInfo(false);
  };

  const handleDotClick = (e: React.MouseEvent, binId?: string) => {
    e.stopPropagation(); // Prevent click from bubbling to background
    setShowDotInfo(binId ? binId : !showDotInfo);
  };

  const handleDebugCompass = (value: number) => {
    setCompass(value);
  };

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
          <Button id="enable-compass" onClick={requestPermissions} label="Enable Compass" />
        ) : (
          <>
            <div className={styles.radar}>
              <Map 
                userLocation={userLocation}
                currentLocation={currentBin}
                compass={compass}
                lockNorth={lockNorth}
                debugMode={isDebugMode}
                onDebugCompass={handleDebugCompass}
              />
              {showAllNearby ? (
                nearbyLocations.map((loc, index) => (
                  <React.Fragment key={loc.bin.id}>
                    <div 
                      className={`${styles.dot} ${index === 0 ? styles.nearest : ''}`}
                      style={getDotPosition(loc.distance, loc.bearing)}
                      onClick={(e) => handleDotClick(e, loc.bin.id)}
                      role="button"
                      tabIndex={0}
                    />
                    {showDotInfo === loc.bin.id && (
                      <div 
                        className={styles.dotInfo}
                        style={getDotPosition(loc.distance, loc.bearing)}
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
                ))
              ) : (
                <>
                  {currentBin && distance && (
                    <>
                      <div 
                        className={styles.dot} 
                        style={getDotPosition(distance, bearing)}
                        onClick={(e) => handleDotClick(e)}
                        role="button"
                        tabIndex={0}
                      />
                      {showDotInfo && (
                        <div 
                          className={styles.dotInfo}
                          style={getDotPosition(distance, bearing)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <InfoRenderer
                            location={currentBin}
                            distance={distance}
                            bearing={bearing}
                            dataType={dataType}
                          />
                        </div>
                      )}
                    </>
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
    </div>
  );
};

export default Binder;

