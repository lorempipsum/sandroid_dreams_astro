import collisionData from '../assets/bristol-data/Traffic_collisions.json';

export interface CollisionLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  coordinates: [number, number]; // Required for the geojson format
  date: string;
  time: string;
  severity: string;
  accidentType: string;
  accidentDescription: string;
  vehicles: number;
  casualties: number;
  pedestrians: number;
  cycles: number;
  motorcycles: number;
  children: number;
  elderly: number;
}

export function getCollisionData(): CollisionLocation[] {
  return collisionData.features
    .map((feature, index) => {
      const lat = feature.geometry.coordinates[1];
      const lng = feature.geometry.coordinates[0];


      return {
        id: `collision-${index}`,
        name: feature.properties.ACCIDENT_DESCRIPTION,
        latitude: lat,
        longitude: lng,
        coordinates: [lng, lat] as [number, number], // Add coordinates in GeoJSON format [lng, lat]
        date: feature.properties.DATE_,
        time: feature.properties.TIME,
        severity: feature.properties.SEVERITY_DESCRIPTION,
        accidentType: feature.properties.ACCIDENT_TYPE,
        accidentDescription: feature.properties.ACCIDENT_DESCRIPTION,
        vehicles: feature.properties.VEHICLES,
        casualties: feature.properties.CASUALTIES,
        pedestrians: feature.properties.PEDESTRIAN,
        cycles: feature.properties.CYCLES,
        motorcycles: feature.properties.MCYCLES,
        children: feature.properties.CHILDREN,
        elderly: feature.properties.OAPS
      };
    })
    .filter((item) => item !== null) as CollisionLocation[]; // Remove any null entries
}
