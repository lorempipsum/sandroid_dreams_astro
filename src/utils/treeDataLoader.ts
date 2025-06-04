import treeData from '../assets/bristol-data/Tree_dataset_TPO.json';

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

const parsePoint = (pointStr: string): [number, number] => {
  const match = pointStr.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!match) throw new Error(`Invalid point format: ${pointStr}`);
  return [parseFloat(match[1]), parseFloat(match[2])];
};

export const getTreeData = (): TreeLocation[] => {
  return treeData.features
    .filter((feature) => feature.properties.POINT) // Ensure point exists
    .map((feature) => {
      const [longitude, latitude] = parsePoint(feature.properties.POINT);
      return {
        id: feature.properties.REFERENCE,
        name: feature.properties.NAME,
        latitude,
        longitude,
        reference: feature.properties.REFERENCE,
        treePreservationOrder: feature.properties.TREE_PRESERVATION_ORDER,
        addressText: feature.properties.ADDRESS_TEXT,
        notes: feature.properties.NOTES,
        startDate: feature.properties.START_DATE,
        endDate: feature.properties.END_DATE,
        entryDate: feature.properties.ENTRY_DATE,
        treeType: feature.properties.TREE_TYPE,
        shapeArea: feature.properties.ShapeSTArea,
        shapeLength: feature.properties.ShapeSTLength,
      };
    });
};
