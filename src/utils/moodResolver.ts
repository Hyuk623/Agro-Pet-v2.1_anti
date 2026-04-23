import type { CropState, CropVisualCondition } from '../types/game';

/**
 * Resolves a short, playful reaction string based on the crop's state and condition.
 */
export function getCropReaction(crop: CropState, condition: CropVisualCondition): string {
  if (condition === 'dead') return "Goodbye, friend...";
  
  // 1. Stage-specific greetings
  if (crop.day === 1 && crop.stage === 'sprout') return "Hello! I'm just a little seed!";
  if (crop.growthProgress >= 90) return "I feel like I'm about to change!";
  
  // 2. Condition-based reactions
  switch (condition) {
    case 'thriving':
      return "Whoa! I feel so much energy! ✨";
    case 'recovering':
      return "Phew, I'm starting to feel better! 💖";
    case 'stressed':
      if (crop.waterLevel < 20) return "I'm so thirsty... water please?";
      if (crop.stress > 70) return "It's a bit overwhelming here...";
      return "Ugh, not feeling my best today.";
    case 'sick':
      return "Something feels wrong... *cough*";
    case 'diseased':
      return "Help! I really don't feel good! 🆘";
    case 'healthy':
      if (crop.stage === 'flower') return "Look at my beautiful flower! 🌸";
      if (crop.stage === 'fruit') return "I'm so plump and sweet! 🍓";
      return "What a wonderful day to grow!";
    default:
      return "Growing slowly but surely!";
  }
}

/**
 * Returns a short emotional label for the status area.
 */
export function getMoodLabel(condition: CropVisualCondition): string {
  const labels: Record<string, string> = {
    thriving: "Overjoyed",
    healthy: "Content",
    stressed: "Anxious",
    sick: "Dizzy",
    diseased: "Faint",
    recovering: "Hopeful",
    dead: "Gone"
  };
  return labels[condition] || "Neutral";
}
