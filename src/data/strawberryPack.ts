import type { CropPack, CropState, DailyActions, Environment, DayFeedback, VisualState, GrowthBranch } from '../types/game';

export const strawberryPack: CropPack = {
  id: 'strawberry',
  name: 'Strawberry',
  themeColor: '#FF4B72',
  baseStats: {
    water: 50,
    light: 50,
    stamina: 80,
  },
  stages: {
    seed: { daysNeeded: 1, growthThreshold: 100 },
    sprout: { daysNeeded: 2, growthThreshold: 100 },
    growth: { daysNeeded: 3, growthThreshold: 100 },
    flower: { daysNeeded: 3, growthThreshold: 100 },
    fruit: { daysNeeded: 2, growthThreshold: 100 },
  },
  preferences: {
    optimalTemp: [15, 25],
    optimalWater: [40, 70]
  },
  deathConditions: {
    maxStress: 100,
    maxDisease: 100,
    minStamina: 0
  },
  
  evaluateDay: (env, actions, state) => {
    let newWater = state.waterLevel;
    let newStress = state.stress;
    let newDisease = state.diseaseRisk + env.diseasePressure / 5;
    let newStamina = state.stamina;
    let growthProgress = state.growthProgress;
    let careQualityScore = 0;
    
    // 1. Process Environment & Care Quality
    // Temperature check
    let effectiveTemp = env.temperature;
    if (actions.heat === 'high') effectiveTemp += 8;
    else if (actions.heat === 'normal') effectiveTemp += 4;
    
    let tempDiff = 0;
    if (effectiveTemp < 15) tempDiff = 15 - effectiveTemp;
    else if (effectiveTemp > 25) tempDiff = effectiveTemp - 25;

    // Traits influence temp sensitivity
    let tempSensitivity = state.trait === 'delicate' ? 2.0 : state.trait === 'resilient' ? 0.7 : 1.0;
    newStress += tempDiff * tempSensitivity;
    
    // 2. Process Watering
    if (actions.water === 'high') newWater += 30;
    else if (actions.water === 'normal') newWater += 10;
    else if (actions.water === 'low') newWater -= 10;
    
    // Drying out
    newWater -= (effectiveTemp > 25 ? 15 : 5);
    
    let waterDiff = 0;
    if (newWater < 40) waterDiff = 40 - newWater;
    else if (newWater > 70) waterDiff = newWater - 70;
    
    let waterSensitivity = state.trait === 'picky' ? 1.8 : 1.0;
    newStress += waterDiff * waterSensitivity * 0.5;

    // 3. Process Ventilation & Disease
    if (actions.ventilation === 'low') {
      newDisease += (newWater > 70 ? 20 : 10);
    } else if (actions.ventilation === 'high') {
      newDisease -= 8;
      newWater -= 8;
    }

    // 4. Lighting
    let effLight = state.lightLevel;
    if (env.sunlight === 'sunny') effLight += 20;
    else if (env.sunlight === 'rainy') effLight -= 10;
    if (actions.light === 'on') effLight += 25;
    effLight = Math.max(0, Math.min(100, effLight));

    // Calculate Care Quality Score (0-100)
    // Based on how many "mistakes" were made
    let penalty = (tempDiff * 3) + (waterDiff * 2) + (newDisease / 2);
    careQualityScore = Math.max(0, 100 - penalty);

    // 5. Growth & Branching Logic
    let baseGrowth = 30;
    let branch: GrowthBranch = 'standard';
    let impact = "Standard growth achieved.";
    
    if (careQualityScore > 85 && effLight > 50) {
      branch = 'optimal';
      baseGrowth = 45;
      impact = "Optimal conditions accelerated growth!";
    } else if (newStress > 60 || newDisease > 60 || effLight < 20) {
      branch = 'stunted';
      baseGrowth = 10;
      impact = "High stress or poor light causing stunted growth.";
    }

    if (state.stamina < 30) {
      baseGrowth *= 0.5;
      impact += " Low stamina is slowing things down.";
    }
    
    growthProgress += baseGrowth;

    // 6. State Transitions (State Machine)
    let visualState: VisualState = 'healthy';
    if (newStress > 80 || newDisease > 80) visualState = 'wilted';
    else if (newStress > 40 || newDisease > 40) visualState = 'stressed';
    else if (careQualityScore > 90) visualState = 'thriving';
    
    if (branch === 'stunted' && visualState === 'healthy') visualState = 'stalled';

    // Clamp values
    newWater = Math.max(0, Math.min(100, newWater));
    newStress = Math.max(0, Math.min(100, newStress));
    newDisease = Math.max(0, Math.min(100, newDisease));
    newStamina = Math.max(0, Math.min(100, newStamina));
    growthProgress = Math.min(100, growthProgress);

    // Stamina logic
    if (effLight > 40) newStamina += 10;
    else newStamina -= 10;
    if (newStress > 50) newStamina -= (newStress - 50) / 4;

    // Evaluate Dead
    let isDead = false;
    let deathDetails = undefined;

    if (newStamina <= 0) {
      isDead = true;
      deathDetails = {
        main: "Energy Depletion",
        secondary: "The crop ran out of stamina to sustain biological functions.",
        lesson: "Always ensure enough light for energy production and avoid high-stress environments.",
        actions: "Consider using 'Max Grow' or 'Booster' item when stamina is falling."
      };
    } else if (newStress >= 100) {
      isDead = true;
      deathDetails = {
        main: "Environmental Shock",
        secondary: "Critical stress from temperature or water imbalance.",
        lesson: "Keep your strawberry between 15-25°C. Rapid temperature shifts are fatal.",
        actions: "Use 'Thermal' protectors during cold rainy days."
      };
    } else if (newDisease >= 100) {
      isDead = true;
      deathDetails = {
        main: "Lethal Infection",
        secondary: "Disease risk reached the point of no return.",
        lesson: "Prevent humidity buildup. High water and low ventilation is a deadly combo.",
        actions: "Regular 'Ventilation' and 'Pesticide' items can save a sick crop."
      };
    }

    const feedback: DayFeedback = {
      title: isDead ? "Tragedy!" : (branch === 'stunted' ? "Difficult Day" : "Day Results"),
      desc: isDead ? "The crop has succumbed." : (careQualityScore > 80 ? "Your care was excellent!" : "Your crop is struggling a bit."),
      isWarning: branch === 'stunted' || isDead,
      impact,
      lesson: branch === 'stunted' ? "Try to balance the environment closer to the optimal ranges shown on top." : undefined
    };

    return {
      stateChanges: {
        waterLevel: newWater,
        stress: newStress,
        diseaseRisk: newDisease,
        stamina: newStamina,
        lightLevel: effLight,
        growthProgress,
        visualState,
        branch,
        interactionCount: state.interactionCount, // preserved
        careQualityHistory: [...state.careQualityHistory, careQualityScore],
        totalHealthScore: Math.round(((state.totalHealthScore * state.day) + careQualityScore) / (state.day + 1))
      },
      feedback,
      isDead,
      deathDetails
    }
  }
};
