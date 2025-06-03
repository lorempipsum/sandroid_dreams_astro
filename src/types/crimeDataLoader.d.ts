// Type declarations for crimeDataLoader module
declare module '../../../utils/crimeDataLoader' {
  export interface CrimeLocation {
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

  export function getCrimeData(): CrimeLocation[];
}
