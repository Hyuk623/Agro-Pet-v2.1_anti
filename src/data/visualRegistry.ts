import type { VisualRegistryEntry } from '../types/game';

export const cropVisualRegistry: Record<string, VisualRegistryEntry> = {
  strawberry: {
    profile: {
      id: 'strawberry',
      displayName: 'Summer Strawberry',
      personalityKeywords: ['Cheerful', 'Sensitive', 'Sweet'],
      moodStyle: 'Vibrant and expressive',
      charmPoints: ['Seed freckles', 'Leafy hat', 'Blushing cheeks'],
      description: 'A cheerful strawberry that loves sunlight but gets thirsty easily.'
    },
    assets: {
      sprout: {
        healthy: '/assets/crops/strawberry/sprout_healthy.png',
        stressed: '/assets/crops/strawberry/sprout_stressed.png',
        sick: '/assets/crops/strawberry/sprout_sick.png',
        diseased: '/assets/crops/strawberry/sprout_diseased.png',
        recovering: '/assets/crops/strawberry/sprout_recovering.png',
        dead: '/assets/crops/strawberry/sprout_dead.png',
        default: '/assets/crops/strawberry/sprout_healthy.png'
      },
      growth: {
        healthy: '/assets/crops/strawberry/growth_healthy.png',
        stressed: '/assets/crops/strawberry/growth_stressed.png',
        sick: '/assets/crops/strawberry/growth_sick.png',
        default: '/assets/crops/strawberry/growth_healthy.png'
      },
      flower: {
        healthy: '/assets/crops/strawberry/flower_healthy.png',
        default: '/assets/crops/strawberry/flower_healthy.png'
      },
      fruit: {
        healthy: '/assets/crops/strawberry/fruit_healthy.png',
        stressed: '/assets/crops/strawberry/fruit_stressed.png',
        default: '/assets/crops/strawberry/fruit_healthy.png'
      },
      dead: {
        default: '/assets/crops/strawberry/dead.png'
      }
    }
  },
  tomato: {
    profile: {
      id: 'tomato',
      displayName: 'Round Tomato',
      personalityKeywords: ['Sturdy', 'Gloomy', 'Plump'],
      moodStyle: 'Solid and calm',
      charmPoints: ['Shiny skin', 'Star stem'],
      description: 'A sturdy tomato that grows at its own pace.'
    },
    assets: {
      sprout: {
        healthy: '/assets/crops/tomato/sprout_healthy.png',
        default: '/assets/crops/tomato/sprout_healthy.png'
      },
      // Other stages partially wired for validation
      dead: {
        default: '/assets/crops/tomato/dead.png'
      }
    }
  }
};

/**
 * Resolves the visual asset path with fallback logic.
 */
export function resolveCropVisual(
  cropId: string, 
  stage: string, 
  condition: string
): string {
  const cropEntry = cropVisualRegistry[cropId];
  if (!cropEntry) return '/assets/crops/fallback_placeholder.png';

  const stageAssets = cropEntry.assets[stage as keyof typeof cropEntry.assets];
  if (!stageAssets) return '/assets/crops/fallback_placeholder.png';

  // 1. Exact match
  const exactMatch = (stageAssets as any)[condition];
  if (exactMatch) return exactMatch;

  // 2. Stage default
  return stageAssets.default || '/assets/crops/fallback_placeholder.png';
}
