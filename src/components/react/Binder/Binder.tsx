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
  const [dataType, setDataType] = useState<'facilities' | 'crimes' | 'trees' | 'general-trees'>('facilities');
  const [crimeLocations] = useState(() => getCrimeData());
  const [treeLocations] = useState(() => getTreeData());
  const [generalTreeLocations, setGeneralTreeLocations] = useState<GeneralTree[]>([]);
  const [lockNorth, setLockNorth] = useState(false);
  const [isDebugMode] = useState(() => 
    typeof window !== 'undefined' && 
    !('ontouchstart' in window) && 
    process.env.NODE_ENV === 'development'
  );

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

      setNearbyLocations(sorted);
      setCurrentBin(sorted[0].bin);
      setDistance(sorted[0].distance);
    }
  }, [locations, userLocation]);

  useEffect(() => {
    if (!userLocation) return;

    switch (dataType) {
      case 'facilities': {
        const sorted = locations.map(bin => findNearestBin(userLocation, [bin]))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);
        setNearbyLocations(sorted);
        setCurrentBin(sorted[0].bin);
        setDistance(sorted[0].distance);
        break;
      }
      case 'crimes': {
        const sorted = crimeLocations
          .map(crime => ({
            bin: crime,
            ...findNearestBin(userLocation, [crime])
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);
        setNearbyLocations(sorted);
        setCurrentBin(sorted[0].bin);
        setDistance(sorted[0].distance);
        break;
      }
      case 'trees': {
        const sorted = treeLocations
          .map(tree => ({
            bin: tree,
            ...findNearestBin(userLocation, [tree])
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);
        setNearbyLocations(sorted);
        setCurrentBin(sorted[0].bin);
        setDistance(sorted[0].distance);
        break;
      }
      case 'general-trees': {
        const sorted = generalTreeLocations
          .map(tree => ({
            bin: tree,
            ...findNearestBin(userLocation, [tree])
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);
        setNearbyLocations(sorted);
        setCurrentBin(sorted[0].bin);
        setDistance(sorted[0].distance);
        break;
      }
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
  const rotation = compass ? -(bearing - compass) : 0;

  const getDotPosition = (distance: number, bearing: number) => {
    const radius = 150; // has to be half of the width and height set in Binder.module.scss
    const scalingFactor = 1;
    const maxDistance = radius*scalingFactor;
    // Use the same rotation calculation as the arrow
    const rotatedBearing = bearing - compass;
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

  const renderInfo = (location: any, distance: number, bearing: number) => {
    switch (dataType) {
      case 'crimes': {
        const crime = location as CrimeLocation;
        return (
          <>
            <h3>{crime.streetName}</h3>
            <p>{Math.round(distance)}m away</p>
            <p>Month: {crime.month}</p>
            <p>Category: {crime.category}</p>
            <p>Crime Type: {crime.locationType}</p>
            <p>Outcome: {crime.outcome || 'Unknown'}</p>
            <p>Bearing: {Math.round(bearing)}°</p>
          </>
        );
      }
      case 'trees': {
        const tree = location as TreeLocation;
        return (
          <>
            <h3>{tree.reference}</h3>
            <p>{Math.round(distance)}m away</p>
            <p>Type: {tree.treeType}</p>
            {tree.notes && <p>Notes: {tree.notes}</p>}
            {tree.treePreservationOrder && <p>TPO: {tree.treePreservationOrder}</p>}
            {tree.startDate && <p>Protected since: {tree.startDate}</p>}

            <p>Bearing: {Math.round(bearing)}°</p>
          </>
        );
      }
      case 'general-trees': {
        const tree = location as GeneralTree;
        return (
          <>
            <h3>{tree.commonName}</h3>
            <p>{Math.round(distance)}m away</p>
            <p>Latin Name: {tree.latinName}</p>
            <p>Height: {tree.height}</p>
            <p>Crown width: {tree.crownWidth}</p>
            <p>Condition: {tree.condition}</p>
            <p>Bearing: {Math.round(bearing)}°</p>
          </>
        );
      }
      default:
        return (
          <>
            <h3>{location.name}</h3>
            <p>{Math.round(distance)}m away</p>
            <p>Bearing: {Math.round(bearing)}°</p>
          </>
        );
    }
  };

  return (
    <div onClick={handleBackgroundClick}>
      <div className={styles.titleContainer}>
        <span>Find the closest</span>
        <div className={styles.selector}>
          <select 
            value={dataType} 
            onChange={(e) => setDataType(e.target.value as typeof dataType)}
            className={styles.dataTypeSelect}
          >
            <option value="facilities">Facilities</option>
            <option value="crimes">Crimes</option>
            <option value="trees">Protected Trees</option>
            <option value="general-trees">Trees</option>
          </select>
          {dataType === 'facilities' && (
            <TypeSelector 
              types={facilityTypes}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          )}
        </div>
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
                          {renderInfo(currentBin, distance)}
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

