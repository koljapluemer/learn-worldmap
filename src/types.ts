import type { Card, Grade } from 'ts-fsrs';

export interface Flashcard {
  id?: number;
  front: string;
  back: string;
  card: Card;
  lastReviewDate?: Date;
}

export type ReviewGrade = Grade;

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
