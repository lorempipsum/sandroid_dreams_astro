import { useState, useEffect } from 'react';
import styles from './Binder.module.scss';
import AnimatedBobUp from '../animations/AnimatedBobUp';
import Button from '../Button/Button';
import { calculateBearing, calculateDistance, findNearestBin } from '../../../utils/locationUtils';
import { requestOrientationPermission } from '../../../utils/devicePermissions';
import { getUniqueTypes, getFacilitiesByType } from '../../../utils/geoJsonLoader';
import { getCrimeData, type CrimeLocation } from '../../../utils/crimeDataLoader';
import { getTreeData, type TreeLocation } from '../../../utils/treeDataLoader';
import { getGeneralTreeData, type GeneralTree } from '../../../utils/generalTreeDataLoader';
import React from 'react';
import Map from '../Map/Map';
import DataTypeSelector from './DataTypeSelector/DataTypeSelector';
import InfoRenderer from '../InfoRenderer/InfoRenderer';
import DistanceDisplay from './DistanceDisplay/DistanceDisplay';
import { getLocationsForType } from './utils';
import Dot, { getDotPosition } from './Dot/Dot';
import ZoomControls from './ZoomControls/ZoomControls';
import { processSVGPath, type PathPoint } from '../../../utils/svgPathUtils';
import SVGImporter from './SVGImporter/SVGImporter';

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
  const [mapZoom, setMapZoom] = useState(17); // Default zoom level 17
  const [svgPathPoints, setSvgPathPoints] = useState<PathPoint[]>([]);
  const [showSVGImporter, setShowSVGImporter] = useState(false);
  const [svgMinDistance, setSvgMinDistance] = useState(10); // Default 10m
  const [svgMaxDistance, setSvgMaxDistance] = useState(20); // Default 20m
  const [showSvgPath, setShowSvgPath] = useState(false);
  const [svgMaxPoints] = useState(1000); // Add this state
  const [currentSvgContent, setCurrentSvgContent] = useState<string | null>(null);
  const [svgScale, setSvgScale] = useState(1.0); // Default scale is 1x

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
  }, [locations, userLocation, dataType, crimeLocations, treeLocations, generalTreeLocations]);

  useEffect(() => {
    const loadGeneralTrees = async () => {
      const trees = await getGeneralTreeData();
      setGeneralTreeLocations(trees);
    };
    loadGeneralTrees();
  }, []);

  // Re-process SVG when parameters change
  useEffect(() => {
    if (currentSvgContent && userLocation) {
      const points = processSVGPath(currentSvgContent, userLocation.latitude, userLocation.longitude, {
        minDistanceMeters: svgMinDistance,
        maxDistanceMeters: svgMaxDistance,
        maxPoints: svgMaxPoints,
        svgScale: svgScale  // Pass scale factor to processing function
      });
      
      setSvgPathPoints(points);
    }
  }, [currentSvgContent, userLocation, svgMinDistance, svgMaxDistance, svgMaxPoints, svgScale]);

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

  const handleSVGImport = (svgContent: string) => {
    if (userLocation) {
      setCurrentSvgContent(svgContent);
      // The actual processing will happen in the useEffect
      setShowSvgPath(true);
    } else {
      setError('User location not available. Please enable location services.');
    }
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
          <button 
            className={styles.svgButton} 
            onClick={() => setShowSVGImporter(prev => !prev)}
          >
            {showSVGImporter ? 'Hide SVG Importer' : 'Import SVG Path'}
          </button>
          
          {svgPathPoints.length > 0 && (
            <label className={styles.toggleNearby}>
              <input
                type="checkbox"
                checked={showSvgPath}
                onChange={(e) => setShowSvgPath(e.target.checked)}
              />
              Show SVG Path ({svgPathPoints.length} points)
            </label>
          )}
        </div>
      </div>
      
      {showSVGImporter && (
        <SVGImporter
          onSVGImport={handleSVGImport}
          minDistance={svgMinDistance}
          maxDistance={svgMaxDistance}
          onMinDistanceChange={setSvgMinDistance}
          onMaxDistanceChange={setSvgMaxDistance}
          maxPoints={svgMaxPoints}
          svgScale={svgScale}
          onSvgScaleChange={setSvgScale}
        />
      )}
      
      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}

        {!permissionGranted ? (
          <Button id="enable-compass" onClick={requestPermissions} label="Enable Compass" />
        ) : (
          <>
            <div className={styles.zoomControls}>
              <ZoomControls 
                zoom={mapZoom} 
                onZoomChange={setMapZoom} 
                min={15} 
                max={19} 
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
                mapZoom={mapZoom}
              />
              {showAllNearby ? (
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
                ))
              ) : (
                currentBin && distance && (
                  <Dot
                    loc={{ bin: currentBin, distance, bearing }}
                    isNearest={true}
                    showDotInfo={showDotInfo}
                    dataType={dataType}
                    compass={compass}
                    isNorthLocked={lockNorth}
                    onDotClick={handleDotClick}
                  />
                )
              )}
              {showSvgPath && svgPathPoints.map((point) => (
                <div
                  key={`svg-${point.id}`}
                  className={`${styles.dot} ${styles.svgDot}`}
                  style={getDotPosition(
                    calculateDistance(
                      userLocation!, 
                      { latitude: point.latitude, longitude: point.longitude }
                    ),
                    calculateBearing(
                      userLocation!, 
                      { latitude: point.latitude, longitude: point.longitude }
                    ),
                    lockNorth,
                    compass,
                    mapZoom
                  )}
                  title={`Point ${point.order}`}
                />
              ))}
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
            <DistanceDisplay name={currentBin.name} distance={distance} />
          </>
        )}
      </div>
    </div>
  );
};

export default Binder;

