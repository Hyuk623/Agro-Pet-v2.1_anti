export type GrowthStage = 'sprout' | 'growth' | 'flower' | 'fruit' | 'dead';
export type VisualState = 'healthy' | 'stressed' | 'risky' | 'flowering' | 'fruiting' | 'dead';

export interface CropState {
  name: string;
  day: number;
  stage: GrowthStage;
  visualState: VisualState;
  
  // Core stats (0-100)
  waterLevel: number;
  lightLevel: number;
  stamina: number;
  stress: number;
  diseaseRisk: number;
  
  // Growth progress for current stage (0-100)
  growthProgress: number;
}

export type ActionLevel = 'low' | 'normal' | 'high';
export type SwitchAction = 'off' | 'auto' | 'on';

export interface DailyActions {
  water: ActionLevel;
  heat: ActionLevel;
  ventilation: ActionLevel;
  light: SwitchAction;
}

export interface Environment {
  temperature: number; // Celsius
  sunlight: 'sunny' | 'cloudy' | 'rainy';
  diseasePressure: number; // 0-100 external pressure
  specialEvent?: {
    id: string;
    title: string;
    type: 'danger' | 'bonus' | 'neutral';
    description: string;
  };
}

export interface PlayerState {
  tokens: number;
  inventory: {
    nutrients: number; // +Stamina, +Growth
    coldProtectors: number; // Ignores cold stress for a day
  };
  activeBuffs: {
    coldProtectionDays: number;
  };
}

export interface Checkpoint {
  day: number;
  cropState: CropState;
  playerState: PlayerState;
  reason: 'major_danger' | 'stage_up';
}

export interface GameState {
  hasStarted: boolean;
  crop: CropState;
  player: PlayerState;
  environment: Environment;
  actions: DailyActions;
  checkpoints: Checkpoint[];
  deathReason: { main: string; secondary: string; lesson: string; actions: string } | null;
  dayFeedback: { title: string; desc: string; isWarning: boolean; tokensGained?: number } | null;
  minigameActive: boolean;
}

// Crop Pack Architecture (Standardized Data for Future Expansion)
export interface StageRequirement {
  daysNeeded: number;
  growthThreshold: number;
}

export interface EffectsMap {
  waterLevelChange: number;
  stressChange: number;
  diseaseChange: number;
  staminaChange: number;
}

export interface CropPack {
  id: string;
  name: string;
  themeColor: string;
  baseStats: {
    water: number;
    light: number;
    stamina: number;
  };
  stages: Record<Exclude<GrowthStage, 'dead'>, StageRequirement>;
  preferences: {
    optimalTemp: [number, number];
    optimalWater: [number, number];
  };
  deathConditions: {
    maxStress: number;
    maxDisease: number;
    minStamina: number;
  };
  // How daily actions affect the crop based on generic environment
  evaluateDay: (env: Environment, actions: DailyActions, crop: CropState) => {
    stateChanges: Partial<CropState>;
    feedback: { title: string; desc: string; isWarning: boolean };
    isDead: boolean;
    deathDetails?: { main: string; secondary: string; lesson: string; actions: string };
  };
}
