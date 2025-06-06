import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CountryExercise {
  name: string;
  zoom: number;
  scope: string;
}

interface LearningGoal {
  id: string;
  name: string;
  isLesson: boolean;
  associatedLearningGoals: string[];
  blockedBy?: string[];
  data: {
    country: string;
  };
}

interface ExerciseTemplate {
  id: string;
  belongsTo: string;
  instruction: string;
  templateType: {
    method: string;
    generator: {
      name: string;
      data?: {
        propertyToVary: string;
        lowestVariationNumber: number;
        highestVariationNumber: number;
      };
    };
  };
  data: {
    zoom: number;
  };
}

function generateId(country: string, index: number): string {
  return `${country.toLowerCase().replace(/\s+/g, '-')}-${index}`;
}

function generateLearningGoals(countryExercises: Record<string, CountryExercise[]>): Record<string, LearningGoal> {
  const learningGoals: Record<string, LearningGoal> = {};
  
  for (const [country, exercises] of Object.entries(countryExercises)) {
    if (exercises.length === 0) continue;
    
    // Main lesson goal
    const mainGoalId = generateId(country, 1);
    const subGoalIds = exercises.slice(1).map((_, i) => generateId(country, i + 2));
    
    learningGoals[mainGoalId] = {
      id: mainGoalId,
      name: `Know where ${country} is`,
      isLesson: true,
      associatedLearningGoals: [mainGoalId, ...subGoalIds],
      data: {
        country
      }
    };
    
    // Sub goals
    exercises.forEach((exercise, index) => {
      const goalId = generateId(country, index + 1);
      const blockedBy = index > 0 ? [generateId(country, index)] : undefined;
      
      learningGoals[goalId] = {
        id: goalId,
        name: exercise.name,
        isLesson: false,
        associatedLearningGoals: [mainGoalId],
        blockedBy,
        data: {
          country
        }
      };
    });
  }
  
  return learningGoals;
}

function generateExerciseTemplates(countryExercises: Record<string, CountryExercise[]>): Record<string, ExerciseTemplate> {
  const templates: Record<string, ExerciseTemplate> = {};
  
  for (const [country, exercises] of Object.entries(countryExercises)) {
    exercises.forEach((exercise, index) => {
      const templateId = generateId(country, index + 1);
      const goalId = generateId(country, index + 1);
      
      templates[templateId] = {
        id: templateId,
        belongsTo: goalId,
        instruction: `$task_pre ${country} $task_post`,
        templateType: {
          method: 'BY_INSTRUCTION',
          generator: index === 0 ? {
            name: 'SINGLE'
          } : {
            name: 'VARY_PROPERTY_WHOLE_NUMBER_RANGE',
            data: {
              propertyToVary: 'panField',
              lowestVariationNumber: 0,
              highestVariationNumber: 8
            }
          }
        },
        data: {
          zoom: exercise.zoom
        }
      };
    });
  }
  
  return templates;
}

// Main execution
const inputPath = join(__dirname, 'learning-goals-per-country.json');
const outputDir = join(__dirname, 'generated');

// Create output directory if it doesn't exist
if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}

// Read and parse input file
const countryExercises: Record<string, CountryExercise[]> = JSON.parse(
  readFileSync(inputPath, 'utf-8')
);

// Generate learning goals and exercise templates
const learningGoals = generateLearningGoals(countryExercises);
const exerciseTemplates = generateExerciseTemplates(countryExercises);

// Write output files
writeFileSync(
  join(outputDir, 'learningGoals.json'),
  JSON.stringify(learningGoals, null, 2)
);

writeFileSync(
  join(outputDir, 'exerciseTemplates.json'),
  JSON.stringify(exerciseTemplates, null, 2)
);

console.log('Files generated successfully in the "generated" directory');
