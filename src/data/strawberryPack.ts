/**
 * strawberryPack.ts — DATA ONLY
 *
 * This file defines the strawberry crop's configuration.
 * NO simulation logic lives here.
 * Session simulation → sessionEngine.ts
 * Neglect/real-time → timeEngine.ts
 * Event generation  → eventEngine.ts
 */
import type { CropPack } from '../types/game';

export const strawberryPack: CropPack = {
  id: 'strawberry',
  name: '딸기',
  themeColor: '#FF4B72',

  baseStats: {
    water: 50,
    light: 50,
    stamina: 80,
  },

  stages: {
    seed:   { daysNeeded: 1, growthThreshold: 100 },
    sprout: { daysNeeded: 2, growthThreshold: 100 },
    growth: { daysNeeded: 3, growthThreshold: 100 },
    flower: { daysNeeded: 3, growthThreshold: 100 },
    fruit:  { daysNeeded: 2, growthThreshold: 100 },
  },

  preferences: {
    optimalTemp:  [15, 25],
    optimalWater: [40, 70],
    optimalLight: 50,
  },

  deathConditions: {
    maxStress:  100,
    maxDisease: 100,
    minStamina: 0,
  },

  neglectConfig: {
    safeWindowHours:     8,    // No penalty for absences under 8h
    waterDecayPerHour:   1.5,  // Strawberries are thirsty
    stressRisePerHour:   0.8,
    staminaDecayPerHour: 0.4,
  },

  sessionConfig: {
    baseGrowthPerSession:  30,
    optimalGrowthBonus:    15,  // Total 45 on optimal branch
    stuntedGrowthPenalty:  25,  // Total 5 on stunted branch
    optimalCareThreshold:  85,  // careQuality >= 85 → optimal
    stuntedCareThreshold:  40,  // careQuality < 40 → stunted
  },

  recoveryConfig: {
    neglectDecayOnGoodCare: 15, // neglectLevel drops 15 per good session
  },

  traitModifiers: {
    cheerful:  { tempSensitivity: 1.0, waterSensitivity: 1.0, neglectSensitivity: 0.8, recoverySpeed: 1.2 },
    delicate:  { tempSensitivity: 2.0, waterSensitivity: 1.5, neglectSensitivity: 1.5, recoverySpeed: 0.7 },
    resilient: { tempSensitivity: 0.7, waterSensitivity: 0.8, neglectSensitivity: 0.6, recoverySpeed: 1.5 },
    picky:     { tempSensitivity: 1.3, waterSensitivity: 1.8, neglectSensitivity: 1.2, recoverySpeed: 0.9 },
    calm:      { tempSensitivity: 0.9, waterSensitivity: 1.0, neglectSensitivity: 0.9, recoverySpeed: 1.1 },
  },
};
