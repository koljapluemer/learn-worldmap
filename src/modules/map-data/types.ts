export interface GeoJSONFeature {
    type: string;
    properties: {
      name: string;
      [key: string]: any;
    };
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }
  
  export interface GeoJSONData {
    type: string;
    features: GeoJSONFeature[];
  }
  