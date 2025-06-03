// Type declarations for generalTreeDataLoader module
declare module '../../../utils/generalTreeDataLoader' {
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

  export function getGeneralTreeData(): Promise<GeneralTree[]>;
}
