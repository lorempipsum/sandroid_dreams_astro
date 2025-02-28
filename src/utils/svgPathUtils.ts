export interface PathPoint {
  id: number;
  latitude: number;
  longitude: number;
  order: number;
  completed: boolean;
}

interface SVGProcessingOptions {
  minDistanceMeters: number;
  maxDistanceMeters?: number;
  maxPoints?: number;
  svgScale?: number;  // Add scale factor parameter
}

export const processSVGPath = (
  svgContent: string, 
  startLat: number, 
  startLng: number, 
  options: SVGProcessingOptions = { minDistanceMeters: 10, maxDistanceMeters: 20 }
): PathPoint[] => {
  const {
    minDistanceMeters,
    maxDistanceMeters = 20,
    maxPoints = 1000,
    svgScale = 1.0  // Default scale is 1.0 (unchanged)
  } = options;

  try {
    const parser = new DOMParser();
    // Parse as XML instead of HTML to handle SVG properly
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // Check for parsing errors
    const parseError = svgDoc.querySelector('parsererror');
    if (parseError) {
      console.error('SVG parsing error:', parseError.textContent);
      return [];
    }
    
    // Extract viewBox from SVG root
    const svgElement = svgDoc.querySelector('svg');
    if (!svgElement) {
      console.error('No SVG element found');
      return [];
    }
    
    // Get viewBox or use element dimensions
    let viewBox = svgElement.getAttribute('viewBox');
    let viewBoxValues: number[] = [];
    
    if (viewBox) {
      // Handle viewBox with commas or spaces
      viewBoxValues = viewBox.split(/[\s,]+/).map(Number);
    } else {
      // Fallback to width/height
      const width = Number(svgElement.getAttribute('width')) || 100;
      const height = Number(svgElement.getAttribute('height')) || 100;
      viewBoxValues = [0, 0, width, height];
    }
    
    const [minX, minY, width, height] = viewBoxValues;
    
    // Find all path elements
    const pathElements = svgDoc.querySelectorAll('path');
    if (pathElements.length === 0) {
      console.error('No path elements found in SVG');
      return [];
    }
        
    const points: PathPoint[] = [];
    let order = 0;
    let pointsAdded = 0;
    
    // Create an SVG path parser - this will properly handle all path commands
    pathElements.forEach((pathElement) => {
      if (pointsAdded >= maxPoints) return;
      
      const pathData = pathElement.getAttribute('d');
      if (!pathData) {
        console.warn('Path element without d attribute');
        return;
      }
      
      
      // Create a temporary SVG path element to use the browser's path parsing
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempPath.setAttribute('d', pathData);
      document.body.appendChild(tempPath);
      
      try {
        // Get total length to sample points evenly
        const pathLength = tempPath.getTotalLength();
        
        // Calculate how many points to sample based on min/max distance
        const targetPointCount = Math.min(
          maxPoints - pointsAdded, 
          Math.ceil(pathLength / minDistanceMeters)
        );
        
        // Always ensure we have at least 2 points
        const numPoints = Math.max(2, targetPointCount);
        
        for (let i = 0; i < numPoints && pointsAdded < maxPoints; i++) {
          // Sample points evenly along path length
          const distance = (i / (numPoints - 1)) * pathLength;
          const point = tempPath.getPointAtLength(distance);
          
          // Convert to SVG coordinates
          let x = point.x;
          let y = point.y;
          
          // Normalize to viewBox coords and scale to GPS
          const normalizedX = (x - (minX + width/2)) / width;
          const normalizedY = (y - (minY + height/2)) / height;
          
          // Apply the scale factor here
          // Multiply normalizedX and normalizedY by svgScale before converting to GPS
          const scaledX = normalizedX * svgScale;
          const scaledY = normalizedY * svgScale;
          
          // Scale to reasonable GPS range - 0.001 is roughly 100m
          const scaleFactor = 0.001;
          const lat = startLat - scaledY * scaleFactor; // Invert Y for GPS
          const lng = startLng + scaledX * scaleFactor;
          
          // Check if this point is too close to the previous point
          const lastPoint = points.length > 0 ? points[points.length - 1] : null;
          
          if (!lastPoint || calculateDistance(
              lastPoint.latitude, lastPoint.longitude, 
              lat, lng
            ) >= minDistanceMeters) {
            
            points.push({
              id: points.length,
              latitude: lat,
              longitude: lng,
              order: order++,
              completed: false
            });
            
            pointsAdded++;
          }
        }
      } finally {
        // Clean up the temporary element
        tempPath.remove();
      }
    });
    
    return points;
  } catch (error) {
    console.error('Error processing SVG:', error);
    return [];
  }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  // Haversine formula implementation
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};
