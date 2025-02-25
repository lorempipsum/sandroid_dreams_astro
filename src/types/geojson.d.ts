declare module '*.geojson' {
  interface GeoJSONFeature {
    type: string;
    properties: {
      TYPE: string;
      SITE_NAME: string;
      [key: string]: any;
    };
    geometry: {
      type: string;
      coordinates: [number, number];
    };
  }

  interface GeoJSONCollection {
    type: string;
    name: string;
    crs: {
      type: string;
      properties: {
        name: string;
      };
    };
    features: GeoJSONFeature[];
  }

  const value: GeoJSONCollection;
  export default value;
}
