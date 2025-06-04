import type { BaseLocation } from '../types/locations';

export interface GeneralTree extends BaseLocation {
  latinName: string;
  crownWidth: string;
  species: string;
  commonName: string;
  height: number;
  spread: number;
  age: string;
  condition: string;
}

export const getGeneralTreeData = async (): Promise<GeneralTree[]> => {
  try {
    const response = await fetch('/api/trees.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading tree data:', error);
    return [];
  }
};
