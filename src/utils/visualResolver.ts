import type { CropState, CropVisualCondition } from '../types/game';

/**
 * Heuristic function to determine the current visual "vibe" or condition 
 * of the crop based on its technical stats.
 */
export function determineVisualCondition(crop: CropState): CropVisualCondition {
  // 1. Explicit dead check
  if (crop.stage === 'dead' || crop.stamina <= 0) return 'dead';

  // 2. Health-based checks (High priority to critical states)
  if (crop.diseaseRisk > 75) return 'diseased';
  if (crop.diseaseRisk > 40) return 'sick';
  
  // 3. Stress-based checks
  if (crop.stress > 60) return 'stressed';

  // 4. Recovery check (Explicit flag set by game logic)
  if (crop.isRecovering) return 'recovering';

  // 5. Thriving check (Peak health)
  if (crop.stamina > 85 && crop.stress < 20 && crop.diseaseRisk < 15) {
    return 'thriving';
  }

  // 6. Default healthy
  return 'healthy';
}

/**
 * Returns visual meta-info for CSS styles and icons based on the condition.
 */
export function getConditionFeedback(condition: CropVisualCondition) {
  switch (condition) {
    case 'thriving':
      return {
        badge: '✨ THRIVING',
        color: '#4FD1C5',
        animation: 'animate-bounce-slow',
        effect: 'glow-thriving'
      };
    case 'recovering':
      return {
        badge: '💖 RECOVERING',
        color: '#F687B3',
        animation: 'animate-pop-in',
        effect: 'sparkle'
      };
    case 'stressed':
      return {
        badge: '😅 STRESSED',
        color: '#ED8936',
        animation: 'animate-wobble',
        effect: 'sweat-drop'
      };
    case 'sick':
      return {
        badge: '🤒 UNWELL',
        color: '#FC8181',
        animation: 'animate-sway-slow',
        effect: 'dull-overlay'
      };
    case 'diseased':
      return {
        badge: '🆘 DISEASED',
        color: '#E53E3E',
        animation: 'none',
        effect: 'warning-pulse'
      };
    case 'wilted':
      return { 
        color: '#718096', 
        animation: 'animate-sway', 
        effect: 'sepia', 
        desc: 'Collapsed and dehydrated.', 
        mood: 'Miserable' 
      };
    case 'stalled':
      return { 
        color: '#A0AEC0', 
        animation: '', 
        effect: 'grayscale', 
        desc: 'Growth has stopped due to poor conditions.', 
        mood: 'Bored' 
      };
    case 'dead':
      return {
        badge: '💀 DEAD',
        color: '#718096',
        animation: 'none',
        effect: 'grayscale'
      };
    default:
      return {
        badge: '🌿 HEALTHY',
        color: '#48BB78',
        animation: 'animate-float',
        effect: 'none'
      };
  }
}
