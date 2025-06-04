import facilitiesData from '../data/facilities.json';

export interface Facility {
  type: string;
  properties: {
    TYPE: string;
    SITE_NAME: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export const loadFacilities = (): Facility[] => {
  if (!facilitiesData || !facilitiesData.features) {
    console.error('Failed to load facilities data');
    return [];
  }
  return facilitiesData.features as unknown as Facility[];
};

export const getUniqueTypes = (): string[] => {
  const facilities = loadFacilities();
  const types = new Set(facilities.map((f) => f.properties.TYPE));
  return Array.from(types).sort();
};

export const getFacilitiesByType = (type: string) => {
  const facilities = loadFacilities();
  return facilities
    .filter(
      (f) =>
        f?.properties?.TYPE === type &&
        f?.geometry?.coordinates &&
        Array.isArray(f.geometry.coordinates) &&
        f.geometry.coordinates.length === 2
    )
    .map((f) => ({
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      name: f.properties.SITE_NAME || f.properties.TYPE,
      id: f.properties.ASSET_ID || `facility-${Math.random()}`,
    }))
    .filter((f) => !isNaN(f.latitude) && !isNaN(f.longitude));
};
