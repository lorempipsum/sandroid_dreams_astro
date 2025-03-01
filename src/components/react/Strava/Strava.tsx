import { useState, useEffect } from 'react';
import styles from './Strava.module.scss';
import AnimatedBobUp from '../animations/AnimatedBobUp';
import Button from '../Button/Button';
import { calculateBearing, calculateDistance } from '../../../utils/locationUtils';
import { requestOrientationPermission } from '../../../utils/devicePermissions';
import React from 'react';
import Map from '../Map/Map';
import { getDotPosition } from '../Binder/Dot/Dot';
import ZoomControls from '../Binder/ZoomControls/ZoomControls';
import { processSVGPath, type PathPoint, type SVGPathMetadata } from '../../../utils/svgPathUtils';
import SVGControlsOverlay from '../Binder/SVGControlsOverlay/SVGControlsOverlay';

const Strava = () => {
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [compass, setCompass] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockNorth, setLockNorth] = useState(false);
  const [isDebugMode] = useState(() => 
    typeof window !== 'undefined' && 
    !('ontouchstart' in window) && 
    process.env.NODE_ENV === 'development'
  );
  const [mapZoom, setMapZoom] = useState(17); // Default zoom level 17
  
  // SVG-specific state
  const [svgPathPoints, setSvgPathPoints] = useState<PathPoint[]>([]);
  const [svgMinDistance, setSvgMinDistance] = useState(10);
  const [svgMaxDistance, setSvgMaxDistance] = useState(20);
  const [showSvgPath, setShowSvgPath] = useState(true);
  const [svgMaxPoints] = useState(1000);
  const [currentSvgContent, setCurrentSvgContent] = useState<string | null>(null);
  const [svgScale, setSvgScale] = useState(1.0);
  const [currentGoalIndex, setCurrentGoalIndex] = useState<number>(0);
  const [svgAnchorLocation, setSvgAnchorLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [svgRotation, setSvgRotation] = useState(0);
  const [showSvgOptions, setShowSvgOptions] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const [svgMetadata, setSvgMetadata] = useState<SVGPathMetadata>({ 
    totalDistanceMeters: 0, 
    averagePointDistanceMeters: 0, 
    pointsCount: 0 
  });
  const [limitVisiblePoints, setLimitVisiblePoints] = useState(false);

  // Re-process SVG when parameters change
  useEffect(() => {
    if (!currentSvgContent || (!userLocation && !svgAnchorLocation)) return;
    
    // Use either the anchor location (if set) or the current user location
    const anchorPoint = svgAnchorLocation || userLocation!;
    
    const result = processSVGPath(
      currentSvgContent, 
      anchorPoint.latitude, 
      anchorPoint.longitude, 
      {
        minDistanceMeters: svgMinDistance,
        maxDistanceMeters: svgMaxDistance,
        maxPoints: svgMaxPoints,
        svgScale: svgScale,
        svgRotation: svgRotation
      }
    );
    
    setSvgPathPoints(result.points);
    setSvgMetadata(result.metadata);
    
    console.log(`SVG path total distance: ${result.metadata.totalDistanceMeters.toFixed(2)}m`);
  }, [currentSvgContent, svgAnchorLocation, svgMinDistance, svgMaxDistance, svgMaxPoints, svgScale, svgRotation, userLocation]);

  // Check if user is near the current goal dot
  useEffect(() => {
    if (userLocation && svgPathPoints.length > 0 && showSvgPath) {
      // Use order property to find the next incomplete point
      const orderedPoints = [...svgPathPoints].sort((a, b) => a.order - b.order);
      const currentGoalPoint = orderedPoints.find(point => !point.completed);
      
      if (!currentGoalPoint) return; // All dots completed
      
      // Calculate distance to current goal dot
      const distanceToGoal = calculateDistance(
        userLocation,
        { latitude: currentGoalPoint.latitude, longitude: currentGoalPoint.longitude }
      );
      
      // If user is within 5 meters, mark this dot as completed
      if (distanceToGoal < 5) {
        setSvgPathPoints(prevPoints => 
          prevPoints.map(point => 
            point.id === currentGoalPoint.id 
              ? { ...point, completed: true } 
              : point
          )
        );
      }
    }
  }, [userLocation, svgPathPoints, showSvgPath]);

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

  const handleDebugCompass = (value: number) => {
    setCompass(value);
  };

  const handleDebugPositionChange = (lat: number, lng: number) => {
    const mockPosition: GeolocationCoordinates = {
      latitude: lat,
      longitude: lng,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    };
    
    setUserLocation(mockPosition);
  };

  const handleSVGImport = (svgContent: string) => {
    if (userLocation) {
      setCurrentSvgContent(svgContent);
      
      // Set the anchor point to current user location
      setSvgAnchorLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
      
      // Reset the goal index and ensure path is visible
      setCurrentGoalIndex(0);
      setShowSvgPath(true);
    } else {
      setError('User location not available. Please enable location services.');
    }
  };

  const handleRecenterSVG = () => {
    if (userLocation) {
      setSvgAnchorLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
    }
  };

  const handleShowSvgControls = () => {
    setShowSvgOptions(true);
  };

  const handleToggleSvgPath = (value: boolean) => {
    setShowSvgPath(value);
  };

  const handleToggleLimitPoints = (value: boolean) => {
    setLimitVisiblePoints(value);
  };

  const handleOverlayPositionChange = (position: { x: number, y: number }) => {
    setOverlayPosition(position);
  };

  // Add handler to manually mark current goal as completed
  const handleSkipCurrentGoal = () => {
    if (!currentGoalDot) return;
    
    setSvgPathPoints(prevPoints => 
      prevPoints.map(point => 
        point.id === currentGoalDot.id 
          ? { ...point, completed: true } 
          : point
      )
    );
  };

  // Find the current goal dot and determine SVG navigation mode
  const orderedSvgPoints = [...svgPathPoints].sort((a, b) => a.order - b.order);
  const currentGoalDot = orderedSvgPoints.find(point => !point.completed);
  const completedCount = svgPathPoints.filter(point => point.completed).length;
  const totalCount = svgPathPoints.length;
  const isSvgNavigationActive = showSvgPath && svgPathPoints.length > 0 && currentGoalDot;
  
  // Calculate bearing to current goal
  let bearing = 0;
  
  if (userLocation && isSvgNavigationActive && currentGoalDot) {
    bearing = calculateBearing(
      userLocation, 
      { latitude: currentGoalDot.latitude, longitude: currentGoalDot.longitude }
    );
  }
  
  // Calculate final rotation with compass adjustment
  const rotation = compass ? (bearing - compass) : bearing;

  // Determine which points to render based on limitVisiblePoints setting
  let pointsToRender = orderedSvgPoints;
  
  if (limitVisiblePoints && currentGoalDot) {
    // Find the index of current goal dot
    const currentGoalIndex = orderedSvgPoints.findIndex(point => point.id === currentGoalDot.id);
    
    // Select only the next 3 points (including current goal)
    pointsToRender = orderedSvgPoints.slice(
      currentGoalIndex, 
      currentGoalIndex + 3
    );
    
    // Always include completed points
    const completedPoints = orderedSvgPoints.filter(point => point.completed);
    pointsToRender = [...completedPoints, ...pointsToRender];
    
  
  }

  return (
    <div>
      <div className={styles.titleContainer}>
        <h1>SVG Path Navigator</h1>
        <div className={styles.toggleContainer}>
          <label className={styles.toggleOption}>
            <input
              type="checkbox"
              checked={lockNorth}
              onChange={(e) => setLockNorth(e.target.checked)}
            />
            Lock North
          </label>
          <button 
            className={styles.svgButton} 
            onClick={handleShowSvgControls}
          >
            SVG Path Tools
          </button>
        </div>
      </div>
      
      {svgPathPoints.length > 0 && showSvgPath && (
        <div className={styles.svgProgress}>
          <span>Progress: {completedCount}/{totalCount} points</span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          
          <div className={styles.svgControlsRow}>
            <button 
              className={styles.svgControlsButton}
              onClick={handleShowSvgControls}
              title="Open SVG controls"
            >
              ⚙️ SVG Settings
            </button>
          </div>
          
          <button 
            className={styles.recenterButton}
            onClick={handleRecenterSVG}
            title="Recenter SVG path at your current location"
          >
            Recenter SVG
          </button>
        </div>
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
                min={11} 
                max={20} 
                step={1}
                label="Map Zoom"
              />
            </div>
            <div className={styles.radar}>
              <Map 
                userLocation={userLocation}
                currentLocation={currentGoalDot ? 
                  { latitude: currentGoalDot.latitude, longitude: currentGoalDot.longitude } : 
                  null
                }
                compass={compass}
                lockNorth={lockNorth}
                debugMode={isDebugMode}
                onDebugCompass={handleDebugCompass}
                onDebugPositionChange={handleDebugPositionChange}
                mapZoom={mapZoom}
              />
              
              {/* SVG path dots */}
              {showSvgPath && userLocation && pointsToRender.map((point) => (
                <div
                  key={`svg-${point.id}`}
                  className={`
                    ${styles.dot} 
                    ${styles.svgDot} 
                    ${point.completed ? styles.completedDot : ''} 
                    ${point === currentGoalDot ? styles.goalDot : ''}
                  `}
                  style={getDotPosition(
                    calculateDistance(
                      userLocation, 
                      { latitude: point.latitude, longitude: point.longitude }
                    ),
                    calculateBearing(
                      userLocation, 
                      { latitude: point.latitude, longitude: point.longitude }
                    ),
                    lockNorth,
                    compass,
                    mapZoom
                  )}
                  title={`Point ${point.order}${point.completed ? ' (Completed)' : ''}`}
                />
              ))}
              
              {/* SVG controls overlay */}
              {showSvgOptions && (
                <SVGControlsOverlay
                  onClose={() => setShowSvgOptions(false)}
                  svgScale={svgScale}
                  onSvgScaleChange={setSvgScale}
                  svgRotation={svgRotation}
                  onSvgRotationChange={setSvgRotation}
                  onRecenter={handleRecenterSVG}
                  onSVGImport={handleSVGImport}
                  minDistance={svgMinDistance}
                  maxDistance={svgMaxDistance}
                  onMinDistanceChange={setSvgMinDistance}
                  onMaxDistanceChange={setSvgMaxDistance}
                  progress={{ completed: completedCount, total: totalCount }}
                  position={overlayPosition}
                  onPositionChange={handleOverlayPositionChange}
                  isDraggable={true}
                  totalDistance={svgMetadata.totalDistanceMeters}
                  showSvgPath={showSvgPath}
                  onToggleSvgPath={handleToggleSvgPath}
                  totalPoints={svgPathPoints.length}
                  limitVisiblePoints={limitVisiblePoints}
                  onToggleLimitPoints={handleToggleLimitPoints}
                />
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
            
            {/* Add skip button below arrow when in SVG navigation mode */}
            {isSvgNavigationActive && (
              <button 
                className={styles.skipGoalButton}
                onClick={handleSkipCurrentGoal}
                title="Mark this point as completed without physically reaching it"
              >
                Skip Goal
              </button>
            )}
            
            {/* Show goal information */}
            {isSvgNavigationActive && userLocation && (
              <div className={styles.goalInfo}>
                <span>Next goal: {Math.round(calculateDistance(
                  userLocation,
                  { latitude: currentGoalDot.latitude, longitude: currentGoalDot.longitude }
                ))}m</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Strava;
