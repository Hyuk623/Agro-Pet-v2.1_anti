export type GrowthStage = 'sprout' | 'growth' | 'flower' | 'fruit' | 'dead';
export type VisualState = 'healthy' | 'stressed' | 'risky' | 'flowering' | 'fruiting' | 'dead';

export interface CropState {
  id: string; // The crop type ID (e.g., 'strawberry')
  name: string; // User-given name
  day: number;
  stage: GrowthStage;
  visualState: VisualState;
  waterLevel: number;
  lightLevel: number;
  stamina: number;
  stress: number;
  diseaseRisk: number;
  growthProgress: number;
  isRecovering: boolean; // Flag to trigger recovery visuals
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
  temperature: number;
  sunlight: 'sunny' | 'cloudy' | 'rainy';
  diseasePressure: number;
  specialEvent?: {
    id: string;
    title: string;
    type: 'danger' | 'bonus' | 'neutral';
    description: string;
  };
}

export type ItemType = 'nutrients' | 'coldProtectors' | 'fertilizer' | 'pesticide' | 'booster';

export interface PlayerState {
  tokens: number;
  inventory: {
    nutrients: number;
    coldProtectors: number;
    fertilizer: number;    // NEW
    pesticide: number;     // NEW
    booster: number;       // NEW
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
  currentPage: 'farm' | 'shop' | 'arcade';
  crop: CropState;
  player: PlayerState;
  environment: Environment;
  actions: DailyActions;
  checkpoints: Checkpoint[];
  deathReason: { main: string; secondary: string; lesson: string; actions: string } | null;
  dayFeedback: { title: string; desc: string; isWarning: boolean; tokensGained?: number } | null;
  minigameActive: boolean;
  minigameTokensEarnedToday: number;
  maxDailyMinigameTokens: number;
}

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
  evaluateDay: (env: Environment, actions: DailyActions, crop: CropState) => {
    stateChanges: Partial<CropState>;
    feedback: { title: string; desc: string; isWarning: boolean };
    isDead: boolean;
    deathDetails?: { main: string; secondary: string; lesson: string; actions: string };
  };
}

// --- Crop Character Visual System ---

export type CropVisualStage = 'sprout' | 'growth' | 'flower' | 'fruit' | 'dead';
export type CropVisualCondition = 'healthy' | 'thriving' | 'stressed' | 'sick' | 'diseased' | 'recovering' | 'dead';

export interface CropCharacterProfile {
  id: string; // 'strawberry', 'tomato', etc.
  displayName: string;
  personalityKeywords: string[];
  moodStyle: string;
  charmPoints: string[];
  description: string;
}

export type CropVisualAssetMap = {
  [stage in CropVisualStage]?: {
    [condition in CropVisualCondition]?: string; // Path to image
  } & { default: string };
};

export interface VisualRegistryEntry {
  profile: CropCharacterProfile;
  assets: CropVisualAssetMap;
}
