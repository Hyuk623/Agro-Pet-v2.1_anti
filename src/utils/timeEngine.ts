/**
 * timeEngine.ts — Real-World Time Layer (Layer 1)
 *
 * Handles all logic driven by REAL-WORLD elapsed time:
 * - Passive neglect / stat decay during absence
 * - WhileAwayReport generation with cause tags
 * - localStorage save/load
 * - Time formatting utilities
 *
 * Does NOT handle active session simulation (→ sessionEngine.ts)
 * Does NOT handle event generation (→ eventEngine.ts)
 */
import type { CropState, CropPack, NeglectSeverity, WhileAwayReport, StatChange } from '../types/game';

// ─── Thresholds ───────────────────────────────────────────────────────────────
const MILD_THRESHOLD     = 12;   // 8–12h: mild thirst
const MODERATE_THRESHOLD = 24;   // 12–24h: noticeable stress
const SEVERE_THRESHOLD   = 48;   // 24–48h: serious distress
// > 48h → critical

// ─── Neglect calculation ──────────────────────────────────────────────────────

export interface NeglectResult {
  stateChanges: Partial<CropState>;
  whileAwayReport: WhileAwayReport;
}

/**
 * Calculates passive stat decay for real-world time elapsed since last session.
 * Returns state changes AND a structured WhileAwayReport for the UI.
 */
export function calculateNeglect(
  crop: CropState,
  config: CropPack['neglectConfig'],
  currentTime: number = Date.now(),
): NeglectResult {
  const elapsedMs   = currentTime - crop.lastSessionTime;
  const elapsedHours= elapsedMs / (1000 * 60 * 60);
  const safeWindow  = config.safeWindowHours ?? 8;

  // ── Safe window: no penalty, gentle greeting ───────────────────────────
  if (elapsedHours < safeWindow) {
    const greeting = elapsedHours > 2
      ? `${formatElapsedTime(elapsedHours)} 만에 돌아왔네요. 작물이 기다리고 있었어요! 🌱`
      : '어서 오세요! 작물이 기다리고 있어요. 🌿';
    return {
      stateChanges: { lastSessionTime: currentTime, lastOpenedAt: currentTime },
      whileAwayReport: {
        hoursAway: elapsedHours,
        severity: 'none',
        changes: [],
        headline: greeting,
        advice: '',
      },
    };
  }

  // ── Beyond safe window: apply layered decay ────────────────────────────
  const neglectHours = elapsedHours - safeWindow;
  const sensitivity  = crop.neglectSensitivity ?? 1.0;
  const traitMult    = 1.0; // Caller may pass trait-adjusted sensitivity

  // Exponential intensity after 24h (encourages return, not brutal)
  const intensityMult =
    elapsedHours > MODERATE_THRESHOLD
      ? Math.min(3.5, 1 + Math.log2(elapsedHours / 12))
      : 1.0;

  const waterDecay   = config.waterDecayPerHour   * elapsedHours  * sensitivity;
  const stressRise   = config.stressRisePerHour   * neglectHours  * sensitivity * intensityMult;
  const staminaDecay = config.staminaDecayPerHour * neglectHours  * sensitivity;

  // Neglect level builds up with absence
  const neglectLevelRise = Math.min(100 - crop.neglectLevel, neglectHours * 1.2 * sensitivity);

  const newWater        = Math.max(0, crop.waterLevel - waterDecay);
  const newStress       = Math.min(100, crop.stress   + stressRise);
  const newStamina      = Math.max(0, crop.stamina    - staminaDecay);
  const newNeglectLevel = Math.min(100, crop.neglectLevel + neglectLevelRise);

  // ── Cause-tagged changes for educational feedback ──────────────────────
  const changes: StatChange[] = [];

  if (waterDecay > 1) {
    changes.push({
      stat: 'waterLevel', delta: -waterDecay, cause: 'passive_neglect',
      label: `${formatElapsedTime(elapsedHours)} 동안 급수 없음 → 수분 -${waterDecay.toFixed(0)}`,
    });
  }
  if (stressRise > 1) {
    changes.push({
      stat: 'stress', delta: stressRise, cause: 'passive_neglect',
      label: `장기 방치 → 스트레스 +${stressRise.toFixed(0)}`,
    });
  }
  if (staminaDecay > 1) {
    changes.push({
      stat: 'stamina', delta: -staminaDecay, cause: 'passive_neglect',
      label: `방치로 체력 소모 → 체력 -${staminaDecay.toFixed(0)}`,
    });
  }
  if (neglectLevelRise > 1) {
    changes.push({
      stat: 'neglectLevel', delta: neglectLevelRise, cause: 'passive_neglect',
      label: `방치 수준 +${neglectLevelRise.toFixed(0)}`,
    });
  }

  // ── Severity classification ────────────────────────────────────────────
  let severity: NeglectSeverity;
  let headline: string;
  let advice: string;
  let visualState = crop.visualState;

  if (elapsedHours >= SEVERE_THRESHOLD) {
    severity  = 'critical';
    visualState = 'wilted';
    headline  = `😰 ${formatElapsedTime(elapsedHours)} 동안 자리를 비웠어요!`;
    advice    = '수분과 체력이 크게 떨어졌어요. 지금 당장 물부터 주세요.';
  } else if (elapsedHours >= MODERATE_THRESHOLD) {
    severity  = 'severe';
    visualState = 'stressed';
    headline  = `😟 ${formatElapsedTime(elapsedHours)} 동안 자리를 비웠어요`;
    advice    = '수분 보충과 스트레스 완화가 필요합니다. 급수와 환기를 우선하세요.';
  } else if (elapsedHours >= MILD_THRESHOLD) {
    severity  = 'moderate';
    headline  = `💧 ${formatElapsedTime(elapsedHours)} 만에 돌아왔어요`;
    advice    = '약간 목이 말라 있어요. 급수를 잊지 마세요.';
  } else {
    severity  = 'mild';
    headline  = `🌿 ${formatElapsedTime(elapsedHours)} 자리를 비웠어요`;
    advice    = '수분이 살짝 줄었어요. 오늘 케어 때 채워주세요.';
  }

  return {
    stateChanges: {
      waterLevel:    newWater,
      stress:        newStress,
      stamina:       newStamina,
      neglectLevel:  newNeglectLevel,
      lastSessionTime: currentTime,
      lastOpenedAt:  currentTime,
      isRecovering:  false,
      visualState,
      awayHours:     elapsedHours,
    },
    whileAwayReport: {
      hoursAway: elapsedHours,
      severity,
      changes,
      headline,
      advice,
    },
  };
}

// ─── Time Formatting ──────────────────────────────────────────────────────────

export function formatElapsedTime(hours: number): string {
  if (hours < 1)  return '1시간 미만';
  if (hours < 24) {
    const h = Math.floor(hours);
    return `${h}시간`;
  }
  const days = Math.floor(hours / 24);
  const rem  = Math.floor(hours % 24);
  return rem > 0 ? `${days}일 ${rem}시간` : `${days}일`;
}


