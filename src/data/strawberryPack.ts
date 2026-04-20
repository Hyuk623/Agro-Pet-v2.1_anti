import { CropPack, CropState, DailyActions, Environment } from '../types/game';

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
    let isWarning = false;
    let feedbackDesc = "It was a peaceful day.";

    // 1. Process Watering
    if (actions.water === 'high') newWater += 30;
    else if (actions.water === 'normal') newWater += 10;
    else if (actions.water === 'low') newWater -= 10;

    // Environmental dry out
    if (env.temperature > 25) newWater -= 15;
    else newWater -= 5;

    // 2. Process Environment & Heating
    let effectiveTemp = env.temperature;
    if (actions.heat === 'high') effectiveTemp += 8;
    if (actions.heat === 'normal') effectiveTemp += 4;

    if (effectiveTemp < 5) {
      newStress += 20;
      isWarning = true;
      feedbackDesc = "It was too cold! The crop suffered cold stress.";
    } else if (effectiveTemp > 30) {
      newStress += 15;
      newWater -= 10;
      isWarning = true;
      feedbackDesc = "It was too hot! Heat stress increased.";
    }

    // 3. Process Ventilation
    if (actions.ventilation === 'low') {
      newDisease += 15;
      if (newWater > 70) {
        newDisease += 20; // High water + low vent = huge disease risk
        isWarning = true;
        feedbackDesc = "High humidity and low vent spiked disease risk!";
      }
    } else if (actions.ventilation === 'high') {
      newDisease -= 10;
      newWater -= 10;
    }

    // 4. Lighting & Growth
    let effLight = state.lightLevel;
    if (env.sunlight === 'sunny') effLight += 20;
    if (env.sunlight === 'cloudy') effLight += 5;
    if (actions.light === 'on') effLight += 20;
    
    if (effLight > 80) effLight = 80; // Max cap

    if (effLight < 20) {
      newStamina -= 10;
      isWarning = true;
      feedbackDesc = "Not enough light to grow properly.";
    } else if (newStress < 50 && newDisease < 50) {
      // Good growth condition
      growthProgress += 35;
      if (typeof feedbackDesc === 'string' && feedbackDesc === "It was a peaceful day.") {
         feedbackDesc = "Good conditions! The crop grew well.";
      }
    } else {
      growthProgress += 10; // Stunted
    }

    // Clamp values
    newWater = Math.max(0, Math.min(100, newWater));
    newStress = Math.max(0, Math.min(100, newStress));
    newDisease = Math.max(0, Math.min(100, newDisease));
    newStamina = Math.max(0, Math.min(100, newStamina));
    growthProgress = Math.min(100, growthProgress);

    // Constant stamina drain if high stress
    if (newStress > 70) newStamina -= 15;

    // Evaluate Dead
    let isDead = false;
    let deathDetails = undefined;

    if (newStamina <= 0) {
      isDead = true;
      deathDetails = {
        main: "Starvation / Exhaustion",
        secondary: "Stamina reached 0",
        lesson: "Plants need proper light and acceptable stress levels to maintain energy. Constant stress drains life.",
        actions: `Water was ${actions.water}, Heat was ${actions.heat}.`
      };
    } else if (newStress >= 100) {
      isDead = true;
      deathDetails = {
        main: "Critical Stress",
        secondary: "Temperature or Extreme conditions",
        lesson: "Strawberry is sensitive to temperature extremes. Keep between 15°C and 25°C.",
        actions: `Effective Temp roughly ${effectiveTemp}°C.`
      };
    } else if (newDisease >= 100) {
      isDead = true;
      deathDetails = {
        main: "Root Rot / Fungal Infection",
        secondary: "Disease pressure reached 100",
        lesson: "Overwatering combined with poor ventilation creates a perfect environment for fatal diseases.",
        actions: `Water level remained high while ventilation was ${actions.ventilation}.`
      };
    }

    return {
      stateChanges: {
        waterLevel: newWater,
        stress: newStress,
        diseaseRisk: newDisease,
        stamina: newStamina,
        lightLevel: effLight,
        growthProgress
      },
      feedback: {
        title: isDead ? "Tragedy!" : isWarning ? "Danger!" : "Day completed",
        desc: feedbackDesc,
        isWarning
      },
      isDead,
      deathDetails
    }
  }
};
