import type { CropPromptTemplate } from '../../types/game';

export const strawberryPrompt: CropPromptTemplate = {
  cropName: "Strawberry",
  concept: "Adorable sentient strawberry spirit with distinct expressive face",
  visualPersonality: "Tamagotchi-style charm, innocent and highly reactive",
  facialExpressionStyle: "Clear expressive eyes (black dots or shiny manga eyes), a cute tiny mouth, and rosy blush stickers",
  keyColors: ["#FF4B72 (Berry Pink)", "#4CAF50 (Leaf Green)", "#FEFCBF (Seed Yellow)"],
  globalStyleRules: [
    "2D flat vector style",
    "Thick clean outlines",
    "Vibrant sticker-like contrast",
    "Transparent background",
    "Consistent chibi proportions"
  ],
  stageNotes: {
    seed: "A tiny brown seed tucked into a small pile of moist soil.",
    sprout: "Just a tiny seed with a single green sprout cap, looking up curious",
    growth: "Small green stems with tiny pink buds starting to show",
    flower: "Large white flower crown, looking proud and elegant",
    fruit: "Fully ripened bright pink berry body, round and chubby"
  },
  conditionNotes: {
    thriving: "Sparkling aura, heart-shaped eyes, huge blush",
    healthy: "Confident smile, upright posture, standard happy face",
    stressed: "Single sweat drop, worried squiggly mouth, slightly wilted cap",
    sick: "Pale desaturated colors, spiral eyes, drooping posture",
    diseased: "Dark spots on face or body, crying eyes, visible sadness",
    recovering: "Hopeful upward gaze, small bandage icon, subtle healing glint",
    wilted: "Greyish desaturated color, collapsed posture, closing eyes.",
    stalled: "Bored neutral expression, looking to the side, no sparkles."
  }
};
