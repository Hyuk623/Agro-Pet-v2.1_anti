import type { CropPromptTemplate, CropVisualStage, CropVisualCondition } from '../types/game';
import { strawberryPrompt } from '../data/cropPrompts/strawberryPrompt';
import { tomatoPrompt } from '../data/cropPrompts/tomatoPrompt';

const promptRegistry: Record<string, CropPromptTemplate> = {
  strawberry: strawberryPrompt,
  tomato: tomatoPrompt
};

/**
 * Builds a structured text prompt for AI image generation.
 */
export function buildCropAIPrompt(
  cropId: string, 
  stage: Exclude<CropVisualStage, 'dead'>, 
  condition: Exclude<CropVisualCondition, 'dead'>
): string {
  const template = promptRegistry[cropId];
  if (!template) {
    return `A cute character-like crop named ${cropId} at stage ${stage} in ${condition} condition, 2D vector style.`;
  }

  const stageInfo = template.stageNotes[stage];
  const conditionInfo = template.conditionNotes[condition];
  
  const prompt = [
    `Character Art: ${template.cropName} character, ${template.concept}.`,
    `Visual Style: ${template.globalStyleRules.join(", ")}.`,
    `Personality & Face: ${template.visualPersonality}, ${template.facialExpressionStyle}.`,
    `Stage (${stage}): ${stageInfo}.`,
    `Current Condition (${condition}): ${conditionInfo}.`,
    `Colors: ${template.keyColors.join(", ")}.`,
    `Requirements: expressive silhouette, mobile game friendly, clean background, high contrast.`
  ].join(" ");

  return prompt;
}

/**
 * For documentation/example purposes
 */
export const examplePrompts = {
  strawberry_sprout_healthy: buildCropAIPrompt('strawberry', 'sprout', 'healthy'),
  strawberry_fruit_thriving: buildCropAIPrompt('strawberry', 'fruit', 'thriving'),
  tomato_fruit_sick: buildCropAIPrompt('tomato', 'fruit', 'sick')
};
