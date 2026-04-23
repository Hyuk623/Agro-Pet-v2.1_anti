import { CropPromptTemplate } from '../../types/game';

export const tomatoPrompt: CropPromptTemplate = {
  cropName: "Tomato",
  concept: "Round, sturdy, and slightly grumpy plump fellow",
  visualPersonality: "Solid, calm, reliable but easily frustrated",
  facialExpressionStyle: "Dotted eyes, grumpy flat mouth, star-shaped stem hair",
  keyColors: ["#E53E3E (Deep Red)", "#2F855A (Stem Green)", "#C05621 (Earth Tone)"],
  globalStyleRules: [
    "2D flat vector style",
    "Bold clean lines",
    "Saturated solid colors",
    "Character-centric silhouette",
    "Clean white or transparent background"
  ],
  stageNotes: {
    sprout: "Solid green seedling, looks determined and tough",
    growth: "Thick vine starting to curl, looking focused on climbing",
    flower: "Small yellow star flowers forming a small crown",
    fruit: "Big round red body, shiny skin, looking very proud"
  },
  conditionNotes: {
    thriving: "Glowing red skin, high-five hand gesture (if applicable), shiny star stem",
    healthy: "Solid neutral expression, tall and sturdy posture",
    stressed: "Steam coming from head, furrowed brow, slightly redder (angry)",
    sick: "Dark green/yellowish tint, looking dizzy, wilted stem",
    diseased: "Black blight spots, coughing expression, extremely low energy",
    recovering: "Wiping forehead, taking a deep breath, color returning to red"
  }
};
