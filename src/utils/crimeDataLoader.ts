import crimeData from '../assets/bristol-data/Street_crime_incidents.json';

type CrimeLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  month: string;
  category: string;
  locationType: string;
  outcome: string;
  streetName: string;
}

const getCrimeData = (): CrimeLocation[] => {
  // Create a Map to store unique coordinates
  const uniqueLocations = new Map();
  
  crimeData.features.forEach(feature => {
    const coords = `${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]}`;
    
    // Only keep the first occurrence of each coordinate
    if (!uniqueLocations.has(coords)) {
      uniqueLocations.set(coords, {
        id: feature.properties.ID || `crime-${coords}`,
        name: feature.properties.STREET_NAME,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        month: feature.properties.MONTH,
        category: feature.properties.CRIME_CATEGORY,
        locationType: feature.properties.LOCATION_TYPE,
        outcome: feature.properties.OUTCOME_CATEGORY,
        streetName: feature.properties.STREET_NAME
      });
    }
  });

  return Array.from(uniqueLocations.values());
};

export type { CrimeLocation };
export { getCrimeData };
