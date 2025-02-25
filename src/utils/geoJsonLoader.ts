import parkFacilities from '../data/facilities.json';

export interface Facility {
  type: string;
  properties: {
    TYPE: string;
    SITE_NAME: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export const loadFacilities = (): Facility[] => {
  if (!parkFacilities?.features) {
    console.error('Failed to load facilities data');
    return [];
  }
  return parkFacilities.features.filter(f => 
    f?.geometry?.coordinates && 
    Array.isArray(f.geometry.coordinates) && 
    f.geometry.coordinates.length === 2
  );
};

export const getUniqueTypes = (): string[] => {
  const facilities = loadFacilities();
  const types = new Set(facilities
    .filter(f => f?.properties?.TYPE)
    .map(f => f.properties.TYPE));
  return Array.from(types).sort();
};

export const getFacilitiesByType = (type: string): Array<{
  latitude: number;
  longitude: number;
  name: string;
}> => {
  const facilities = loadFacilities();
  return facilities
    .filter(f => 
      f?.properties?.TYPE === type && 
      f?.geometry?.coordinates
    )
    .map(f => ({
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      name: f.properties.SITE_NAME || 'Unknown'
    }));
};
