export const calculateBearing = (start: GeolocationCoordinates, end: { latitude: number; longitude: number }) => {
  const startLat = start.latitude * Math.PI / 180;
  const endLat = end.latitude * Math.PI / 180;
  const diffLong = (end.longitude - start.longitude) * Math.PI / 180;

  const x = Math.sin(diffLong) * Math.cos(endLat);
  const y = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(diffLong);

  return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
};

export const calculateDistance = (start: GeolocationCoordinates, end: { latitude: number; longitude: number }) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = start.latitude * Math.PI / 180;
  const φ2 = end.latitude * Math.PI / 180;
  const Δφ = (end.latitude - start.latitude) * Math.PI / 180;
  const Δλ = (end.longitude - start.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

export const findNearestBin = (userCoords: GeolocationCoordinates, binLocations: Array<{ latitude: number; longitude: number; name: string }>) => {
  let nearestBin = binLocations[0];
  let shortestDistance = calculateDistance(userCoords, binLocations[0]);

  binLocations.forEach(bin => {
    const distance = calculateDistance(userCoords, bin);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestBin = bin;
    }
  });

  return { bin: nearestBin, distance: shortestDistance };
};
