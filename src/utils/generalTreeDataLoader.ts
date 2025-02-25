
export interface GeneralTree {
  latinName: string;
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
