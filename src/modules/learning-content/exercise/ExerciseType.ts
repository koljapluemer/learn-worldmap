export type ExerciseType = {
  id: string;
  instruction: string;
  data: {
    zoom: number;
    panIndex?: number;
    country: string;
  };
};
