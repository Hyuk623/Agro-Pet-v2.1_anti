export type GrowthStage = 'seed' | 'sprout' | 'growth' | 'flower' | 'fruit' | 'dead';
export type VisualState = 'healthy' | 'thriving' | 'stressed' | 'sick' | 'diseased' | 'recovering' | 'wilted' | 'dead' | 'stalled';

export type CropTrait = 'cheerful' | 'delicate' | 'resilient' | 'picky' | 'calm';
export type GrowthBranch = 'optimal' | 'standard' | 'stunted' | 'distorted';

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
  interactionCount: number; // For Tamagotchi play
  trait: CropTrait;
  branch: GrowthBranch;
  careQualityHistory: number[]; // Track daily care scores (0-100)
  totalHealthScore: number;
}

export type ActionLevel = 'low' | 'normal' | 'high';
export type SwitchAction = 'off' | 'auto' | 'on';

export interface DailyActions {
  water: ActionLevel;
  heat: ActionLevel;
  ventilation: ActionLevel;
  light: SwitchAction;
  play: boolean; // Played with today
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
    fertilizer: number;
    pesticide: number;
    booster: number;
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

export interface DayFeedback {
  title: string;
  desc: string;
  isWarning: boolean;
  tokensGained?: number;
  lesson?: string; // Short educational tip
  impact?: string; // What exactly changed in the crop
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
  dayFeedback: DayFeedback | null;
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
    feedback: DayFeedback;
    isDead: boolean;
    deathDetails?: { main: string; secondary: string; lesson: string; actions: string };
  };
}

// --- Crop Character Visual System ---

export type CropVisualStage = GrowthStage;
export type CropVisualCondition = VisualState;

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

// --- AI Prompt System ---

export interface CropPromptTemplate {
  cropName: string;
  concept: string;
  visualPersonality: string;
  facialExpressionStyle: string;
  keyColors: string[];
  globalStyleRules: string[];
  stageNotes: Record<Exclude<CropVisualStage, 'dead'>, string>;
  conditionNotes: Record<Exclude<CropVisualCondition, 'dead'>, string>;
}
