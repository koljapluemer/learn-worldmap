export interface DailyChallenge {
  date: string;
  totalScore: number;
  totalTimeMs: number;
  averageTimeMs: number;
  results: {
    country: string;
    correct: boolean;
    timeMs: number;
    zoomLevel: number;
  }[];
}