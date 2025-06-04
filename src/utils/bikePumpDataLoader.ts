import pumpData from '../assets/bristol-data/Public_bike_pumps.json';

export interface BikePumpLocation {
  id: string;
  name: string;
  maintained: string;
  type: string;
  photo: string;
  region: string;
  latitude: number;
  longitude: number;
}

export function getBikePumpData(): BikePumpLocation[] {
  return pumpData.features.map((feature, index) => ({
    id: `pump-${index}`,
    name: feature.properties.NAME,
    maintained: feature.properties.MAINTAINED,
    type: feature.properties.TYPE,
    photo: feature.properties.PHOTO,
    region: feature.properties.REGION,
    latitude: feature.geometry.coordinates[1],
    longitude: feature.geometry.coordinates[0],
  }));
}
