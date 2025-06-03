// Type declarations for treeDataLoader module
declare module '../utils/treeDataLoader' {
  export interface TreeLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    reference: string;
    treePreservationOrder: string;
    addressText: string;
    notes: string;
    startDate: string;
    endDate: string;
    entryDate: string;
    treeType: string;
    shapeArea: number;
    shapeLength: number;
  }

  export function getTreeData(): TreeLocation[];
}
