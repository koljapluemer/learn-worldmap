import type { LessonData } from './types';
import { ExerciseTemplate } from './ExerciseTemplate';

export class Lesson {
  readonly id: string;
  readonly name: string;
  readonly templates: ExerciseTemplate[];
  readonly country: string;

  constructor(data: LessonData) {
    this.id = data.id;
    this.name = data.name;
    
    // First create all templates
    const templateMap = new Map<string, ExerciseTemplate>();
    this.templates = data.templates.map(templateData => {
      const template = ExerciseTemplate.fromJSON(templateData);
      templateMap.set(template.id, template);
      return template;
    });

    // Then set up the blockedBy relationships
    data.templates.forEach(templateData => {
      if (templateData.blockedBy) {
        const template = templateMap.get(templateData.id);
        if (template) {
          const blockedByTemplates = templateData.blockedBy
            .map(id => templateMap.get(id))
            .filter((t): t is ExerciseTemplate => t !== undefined);
          template.setBlockedBy(blockedByTemplates);
        }
      }
    });

    this.country = data.data.country;
  }

  static fromJSON(data: LessonData): Lesson {
    return new Lesson(data);
  }
}
