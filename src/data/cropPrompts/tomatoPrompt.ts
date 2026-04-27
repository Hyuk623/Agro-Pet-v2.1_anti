import type { CropPromptTemplate } from '../../types/game';

export const tomatoPrompt: CropPromptTemplate = {
  cropName: "Tomato",
  concept: "Round, bouncy tomato character with a leafy vine hat",
  visualPersonality: "Energetic, determined, and very round",
  facialExpressionStyle: "Round dot eyes, small active mouth",
  keyColors: ["#FF5252 (Red)", "#4CAF50 (Green)", "#FFD740 (Yellow)"],
  globalStyleRules: [
    "2D flat vector style",
    "Thick clean outlines",
    "Bouncy animation physics in spirit",
    "Transparent background"
  ],
  stageNotes: {
    seed: "A small yellow-white seed buried in rich brown soil.",
    sprout: "Tiny green stem with two symmetrical leaves, very energetic",
    growth: "Bigger vine-like structure with small green globes appearing",
    flower: "Bright yellow star-shaped flowers hanging from the green vines",
    fruit: "Large, shiny red tomato body, round and glistening"
  },
  conditionNotes: {
    thriving: "Glistening skin, super happy face, sparkling surrounding",
    healthy: "Active smile, upright firm posture",
    stressed: "Dull color, slightly sweating, vine hat drooping",
    sick: "Slightly yellowish/pale, dizzy eyes, limp posture",
    diseased: "Blight spots, very tired expression, almost greyish red",
    recovering: "Returning shine, determined face, small medical cross stickers",
    wilted: "Completely sagged vine, very dark red/grey, sad closing eyes.",
    stalled: "Uninterested face, no movement, looking away."
  }
};
