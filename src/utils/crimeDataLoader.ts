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
  return crimeData.features.map((feature, index) => ({
    id: feature.properties.ID || `crime-${index}`,
    name: feature.properties.STREET_NAME,
    latitude: feature.geometry.coordinates[1],
    longitude: feature.geometry.coordinates[0],
    month: feature.properties.MONTH,
    category: feature.properties.CRIME_CATEGORY,
    locationType: feature.properties.LOCATION_TYPE,
    outcome: feature.properties.OUTCOME_CATEGORY,
    streetName: feature.properties.STREET_NAME
  }));
};

export type { CrimeLocation };
export { getCrimeData };
