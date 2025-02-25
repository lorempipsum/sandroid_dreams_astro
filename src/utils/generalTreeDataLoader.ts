import type { Feature, FeatureCollection } from 'geojson';

export interface GeneralTree {
  latinName: ReactNode;
  crownWidth: string;
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  species: string;
  commonName: string;
  height: number;
  spread: number;
  age: string;
  condition: string;
}

export const getGeneralTreeData = async (): Promise<GeneralTree[]> => {
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'bristol-data/Trees.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: FeatureCollection = await response.json();
    
    // Only take first 50 valid entries to prevent memory issues
    return data.features
      .filter(feature => 
        feature.geometry?.coordinates && 
        Array.isArray(feature.geometry.coordinates) &&
        feature.geometry.coordinates.length === 2
      )
      .map(feature => ({
        id: `tree-${feature.properties.ASSET_ID}`,
        name: feature.properties.COMMON_NAME || feature.properties.SPECIES || 'Unknown Tree',
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        species: feature.properties.TREE_SPECIES || 'Unknown',
        commonName: feature.properties.FULL_COMMON_NAME || feature.properties.COMMON_NAME || 'Unknown',
        latinName: feature.properties.LATIN_NAME || 'Unknown',
        height: feature.properties.CROWN_HEIGHT || 0,
        crownWidth: feature.properties.CROWN_WIDTH || 0,
        age: feature.properties.AGE_DESC || 'Unknown',
        condition: feature.properties.CONDITION || 'Unknown',
        deadFlag: feature.properties.DEAD_FLAG || 'Unknown'
      }));
  } catch (error) {
    console.error('Error loading tree data:', error);
    return [];
  }
};
