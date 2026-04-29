export type GrowthStage = 'seed' | 'sprout' | 'growth' | 'flower' | 'fruit' | 'dead';
export type VisualState = 'healthy' | 'thriving' | 'stressed' | 'sick' | 'diseased' | 'recovering' | 'wilted' | 'dead' | 'stalled';
export type CropTrait = 'cheerful' | 'delicate' | 'resilient' | 'picky' | 'calm';
export type GrowthBranch = 'optimal' | 'standard' | 'stunted' | 'distorted';
export type NeglectSeverity = 'none' | 'mild' | 'moderate' | 'severe' | 'critical';

export interface GuestProfile {
  guestId: string;
  createdAt: number;
  lastSeenAt: number;
  lastProcessedAt: number;
}

/**
 * Educational cause tagging — every stat change carries a reason.
 * This is the core of the layered time model.
 */
export type CauseTag =
  | 'passive_neglect'   // Happened because player was away (real-world time)
  | 'active_care'       // Happened because of player's care decisions (session)
  | 'event_driven'      // Happened because of an environmental event
  | 'trait_effect'      // Happened because of the crop's personality trait
  | 'recovery'          // Positive change from recovery action
  | 'natural';          // Normal background process (disease pressure etc.)

/** One traceable stat change with its cause */
export interface StatChange {
  stat: 'waterLevel' | 'stress' | 'stamina' | 'diseaseRisk' | 'growthProgress' | 'neglectLevel';
  delta: number;        // positive = increase, negative = decrease
  cause: CauseTag;
  label: string;        // Human-readable Korean, e.g. "물 부족으로 수분 감소"
}

/** Report shown when player returns after real-world absence */
export interface WhileAwayReport {
  hoursAway: number;
  severity: NeglectSeverity;
  changes: StatChange[];
  headline: string;     // e.g. "12시간 동안 자리를 비웠어요"
  advice: string;       // e.g. "물을 우선 보충해주세요"
}

/** Report for what happened during an active care session */
export interface SessionResultReport {
  careQuality: number;  // 0–100
  branch: GrowthBranch;
  changes: StatChange[];
  headline: string;
  lesson?: string;
  growthGained: number;
}

export interface CropState {
  id: string;
  name: string;
  day: number;                  // Session count (care sessions completed)
  stage: GrowthStage;
  visualState: VisualState;
  waterLevel: number;
  lightLevel: number;
  stamina: number;
  stress: number;
  diseaseRisk: number;
  growthProgress: number;
  isRecovering: boolean;
  interactionCount: number;
  trait: CropTrait;
  branch: GrowthBranch;
  careQualityHistory: number[];
  totalHealthScore: number;
  lastSessionTime: number;       // Unix ms: last care session completed
  lastOpenedAt: number;          // Unix ms: last time app was opened
  neglectSensitivity: number;    // 0.1–2.0 multiplier
  neglectLevel: number;          // 0–100: accumulated neglect (passive)
  awayHours: number;             // How many hours player was away before last return
}

export type ActionLevel = 'low' | 'normal' | 'high';
export type SwitchAction = 'off' | 'auto' | 'on';

export interface DailyActions {
  water: ActionLevel;
  heat: ActionLevel;
  ventilation: ActionLevel;
  light: SwitchAction;
  play: boolean;
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
    durationDays?: number;
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
  /** Structured neglect report (layered time layer 1) */
  whileAwayReport?: WhileAwayReport;
  /** Structured session report (layered time layer 2) */
  sessionResult?: SessionResultReport;
  // Legacy convenience strings (kept for backward compat)
  neglectReport?: string;
  neglectSeverity?: NeglectSeverity;
  hoursAway?: number;
  lesson?: string;
  impact?: string;
  sessionReport?: string;
}

export interface GameState {
  guestProfile: GuestProfile;
  hasStarted: boolean;
  currentPage: 'farm' | 'shop' | 'arcade';
  crop: CropState;
  player: PlayerState;
  environment: Environment;
  actions: DailyActions;
  checkpoints: Checkpoint[];
  deathReason: {
    main: string;
    secondary: string;
    lesson: string;
    actions: string;
    neglectContribution?: string;
  } | null;
  dayFeedback: DayFeedback | null;
  minigameActive: boolean;
  minigameTokensEarnedToday: number;
  maxDailyMinigameTokens: number;
  diary: string[];
}

export interface StageRequirement {
  daysNeeded: number;
  growthThreshold: number;
}

/**
 * CropPack is now DATA-FIRST.
 * Simulation logic lives in sessionEngine.ts, not here.
 * Future crops vary by swapping this config object.
 */
export interface CropPack {
  id: string;
  name: string;
  themeColor: string;
  baseStats: { water: number; light: number; stamina: number };
  stages: Record<Exclude<GrowthStage, 'dead'>, StageRequirement>;
  preferences: {
    optimalTemp: [number, number];
    optimalWater: [number, number];
    optimalLight: number;
  };
  deathConditions: {
    maxStress: number;
    maxDisease: number;
    minStamina: number;
  };
  neglectConfig: {
    safeWindowHours: number;
    waterDecayPerHour: number;
    stressRisePerHour: number;
    staminaDecayPerHour: number;
  };
  sessionConfig: {
    baseGrowthPerSession: number;
    optimalGrowthBonus: number;
    stuntedGrowthPenalty: number;
    optimalCareThreshold: number;  // careQuality >= this → optimal branch
    stuntedCareThreshold: number;  // careQuality < this → stunted branch
  };
  recoveryConfig: {
    neglectDecayOnGoodCare: number; // How much neglectLevel drops per good session
  };
  traitModifiers: Record<CropTrait, {
    tempSensitivity: number;
    waterSensitivity: number;
    neglectSensitivity: number;
    recoverySpeed: number;
  }>;
}

// ─── Visual / AI Prompt Types (unchanged) ────────────────────────────────────
export type CropVisualStage = GrowthStage;
export type CropVisualCondition = VisualState;

export interface CropCharacterProfile {
  id: string;
  displayName: string;
  personalityKeywords: string[];
  moodStyle: string;
  charmPoints: string[];
  description: string;
}

export type CropVisualAssetMap = {
  [stage in CropVisualStage]?: {
    [condition in CropVisualCondition]?: string;
  } & { default: string };
};

export interface VisualRegistryEntry {
  profile: CropCharacterProfile;
  assets: CropVisualAssetMap;
}

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
