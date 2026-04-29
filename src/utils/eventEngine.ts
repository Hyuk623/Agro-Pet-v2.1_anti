/**
 * eventEngine.ts — Situational Event Generation (Layer 3)
 *
 * Generates events based on the CURRENT crop state and environment,
 * NOT hardcoded day-number logic.
 * This makes events feel reactive rather than scripted.
 */
import type { Environment, CropState } from '../types/game';

interface EventCandidate {
  id: string;
  title: string;
  type: 'danger' | 'bonus' | 'neutral';
  description: string;
  durationDays?: number;
  /** Minimum probability weight to roll this event */
  weight: number;
}

function pickWeighted(candidates: EventCandidate[]): EventCandidate | undefined {
  const totalWeight = candidates.reduce((s, c) => s + c.weight, 0);
  if (totalWeight <= 0) return undefined;
  let r = Math.random() * totalWeight;
  for (const c of candidates) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return candidates[candidates.length - 1];
}

/**
 * Generates the environment for the next session.
 * Considers current crop state to make events situational.
 */
export function generateNextEnvironment(
  session: number,
  crop: CropState,
  previousEnv?: Environment,
): Environment {
  // ── Base temperature (seasonal simulation using session count) ─────────
  const baseTempRange = session < 10
    ? [12, 22]   // early: cooler
    : session < 20
    ? [18, 28]   // mid: warm
    : [10, 20];  // late: cooler again

  const temperature = Math.round(
    baseTempRange[0] + Math.random() * (baseTempRange[1] - baseTempRange[0])
  );

  // ── Sunlight ──────────────────────────────────────────────────────────
  const sunRoll = Math.random();
  const sunlight: Environment['sunlight'] =
    sunRoll < 0.5 ? 'sunny' :
    sunRoll < 0.75 ? 'cloudy' : 'rainy';

  // ── Disease pressure ──────────────────────────────────────────────────
  // Higher when humid/rainy AND ventilation was recently poor
  let diseasePressure = Math.random() * 5; // Base 0–5
  if (sunlight === 'rainy')       diseasePressure += 3;
  if (crop.diseaseRisk > 30)      diseasePressure += 2; // Snowball effect
  if (crop.neglectLevel > 50)     diseasePressure += 2; // Neglect increases disease pressure
  diseasePressure = Math.min(10, Math.round(diseasePressure * 10) / 10);

  // ── Situational special events ────────────────────────────────────────
  const candidates: EventCandidate[] = [];

  // Cold snap — more likely in early/late sessions or after good weather
  if (temperature < 15) {
    candidates.push({
      id: 'cold_snap', title: '❄️ 한파 주의보',
      type: 'danger',
      description: '기온이 급격히 낮아졌습니다. 가온을 높여 냉해를 막으세요.',
      weight: 0.4,
    });
  }

  // Disease warning — triggered by high disease risk or rainy stretch
  if (crop.diseaseRisk > 40 || (sunlight === 'rainy' && crop.diseaseRisk > 20)) {
    candidates.push({
      id: 'disease_pressure', title: '🦠 병해 경보',
      type: 'danger',
      description: '습한 환경으로 곰팡이 위험이 높습니다. 환기를 강화하세요.',
      weight: 0.5,
    });
  }

  // Recovery window — when crop is recovering from stress
  if (crop.isRecovering && crop.stress < 50) {
    candidates.push({
      id: 'recovery_window', title: '💖 회복의 기회',
      type: 'bonus',
      description: '작물이 회복 중입니다. 이번 케어에서 좋은 성과를 낼 수 있어요.',
      weight: 0.6,
    });
  }

  // Flowering opportunity — when near flower stage
  if (crop.stage === 'growth' && crop.growthProgress > 70) {
    candidates.push({
      id: 'flower_window', title: '🌸 개화 직전',
      type: 'bonus',
      description: '꽃이 피기 직전입니다. 이번 세션의 케어가 결실에 큰 영향을 줍니다!',
      weight: 0.5,
    });
  }

  // Sunny bonus — random sunshine event
  if (sunlight === 'sunny' && Math.random() < 0.2) {
    candidates.push({
      id: 'sunny_boost', title: '☀️ 맑은 날',
      type: 'bonus',
      description: '햇빛이 풍부합니다. 오늘은 광합성이 활발하게 진행됩니다.',
      weight: 0.3,
    });
  }

  // High neglect warning
  if (crop.neglectLevel > 60) {
    candidates.push({
      id: 'neglect_warning', title: '⚠️ 방치 누적 경고',
      type: 'danger',
      description: '방치 수준이 높습니다. 연속으로 좋은 케어를 해야 회복됩니다.',
      weight: 0.7,
    });
  }

  // Pick one event (or none — events are not guaranteed)
  const eventRoll = Math.random();
  const specialEvent = eventRoll < 0.4 && candidates.length > 0
    ? pickWeighted(candidates)
    : undefined;

  return {
    temperature,
    sunlight,
    diseasePressure,
    specialEvent: specialEvent
      ? {
        id: specialEvent.id,
        title: specialEvent.title,
        type: specialEvent.type,
        description: specialEvent.description,
        durationDays: specialEvent.durationDays,
      }
      : undefined,
  };
}
