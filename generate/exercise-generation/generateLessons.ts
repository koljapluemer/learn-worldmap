import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { ExerciseTemplate, LearningGoal, LessonManager } from 'igu-algos';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

interface ExerciseTemplateData {
  belongsTo: string;
  instruction: string;
  templateType: {
    method: string;
    generator: {
      name: string;
      data?: Record<string, any>;
    };
  };
  data: Record<string, any>;
}

interface LearningGoalData {
  name: string;
  isLesson: boolean;
  associatedLearningGoals?: string[];
  data: {
    country: string;
  };
}

export function loadExerciseTemplates(learningGoals: Map<string, InstanceType<typeof LearningGoal>>): InstanceType<typeof ExerciseTemplate>[] {
  const filePath = join(__dirname, 'generated', 'exerciseTemplates.json');
  const rawData = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, ExerciseTemplateData>;
  
  return ExerciseTemplate.makeExerciseTemplatesFromDataDict(rawData, learningGoals);
}

export function loadLearningGoals(): InstanceType<typeof LearningGoal>[] {
  const filePath = join(__dirname, 'generated', 'learningGoals.json');
  const rawData = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, LearningGoalData>;
  
  return LearningGoal.makeLearningGoalsFromDataDict(rawData);
}

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const learningGoals = loadLearningGoals();
    const learningGoalsMap = new Map(learningGoals.map(goal => [goal.id, goal]));
    const exerciseTemplates = loadExerciseTemplates(learningGoalsMap);
    const lessons = LessonManager.generateLessons(learningGoals, exerciseTemplates);
    
    console.log('Loaded Exercise Templates:', exerciseTemplates.length);
    console.log('Loaded Learning Goals:', learningGoals.length);
    console.log('Generated Lessons:', lessons.length);
    console.log('\nFirst Lesson:', JSON.stringify(lessons[1], null, 2));
  } catch (error) {
    console.error('Error loading data:', error);
    process.exit(1);
  }
}
