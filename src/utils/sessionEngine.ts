/**
 * sessionEngine.ts — Active Session Simulation (Layer 2)
 *
 * Handles all logic that happens DURING a care session:
 * - Temperature, water, ventilation, light resolution
 * - Care quality scoring
 * - Growth branch determination
 * - Death evaluation
 * - StatChange cause-tagging for educational feedback
 *
 * Does NOT handle real-world absence (→ timeEngine.ts)
 * Does NOT handle event generation (→ eventEngine.ts)
 */
import type {
  CropPack, CropState, DailyActions, Environment,
  GrowthBranch, VisualState, StatChange, SessionResultReport,
} from '../types/game';

export interface SessionResult {
  stateChanges: Partial<CropState>;
  sessionReport: SessionResultReport;
  isDead: boolean;
  deathDetails?: {
    main: string;
    secondary: string;
    lesson: string;
    actions: string;
    neglectContribution?: string;
  };
}

export function runSession(
  env: Environment,
  actions: DailyActions,
  crop: CropState,
  pack: CropPack,
): SessionResult {
  const trait = pack.traitModifiers[crop.trait];
  const changes: StatChange[] = [];

  // ── 1. TEMPERATURE ────────────────────────────────────────────────────
  let effectiveTemp = env.temperature;
  if (actions.heat === 'high')        effectiveTemp += 8;
  else if (actions.heat === 'normal') effectiveTemp += 4;

  const [minTemp, maxTemp] = pack.preferences.optimalTemp;
  const tempDiff =
    effectiveTemp < minTemp ? minTemp - effectiveTemp :
    effectiveTemp > maxTemp ? effectiveTemp - maxTemp : 0;

  const tempStress = tempDiff * trait.tempSensitivity;
  if (tempStress > 0) {
    const isCold = effectiveTemp < minTemp;
    changes.push({
      stat: 'stress', delta: tempStress,
      cause: (env.temperature < minTemp && actions.heat !== 'high') ? 'event_driven' : 'active_care',
      label: isCold
        ? `저온(${effectiveTemp}°C) → 스트레스 +${tempStress.toFixed(1)}`
        : `고온(${effectiveTemp}°C) → 스트레스 +${tempStress.toFixed(1)}`,
    });
  }

  // ── 2. WATERING ───────────────────────────────────────────────────────
  let newWater = crop.waterLevel;
  if (actions.water === 'high')        newWater += 30;
  else if (actions.water === 'normal') newWater += 15;
  else if (actions.water === 'low')    newWater -= 5;

  const waterDeltaFromAction = newWater - crop.waterLevel;
  changes.push({
    stat: 'waterLevel', delta: waterDeltaFromAction,
    cause: 'active_care',
    label: `급수(${actions.water === 'high' ? '많이' : actions.water === 'normal' ? '보통' : '조금'}): 수분 ${waterDeltaFromAction > 0 ? '+' : ''}${waterDeltaFromAction}`,
  });

  const [minWater, maxWater] = pack.preferences.optimalWater;
  const waterDiff =
    newWater < minWater ? minWater - newWater :
    newWater > maxWater ? newWater - maxWater : 0;

  const waterStress = waterDiff * trait.waterSensitivity * 0.5;
  if (waterStress > 0) {
    changes.push({
      stat: 'stress', delta: waterStress, cause: 'active_care',
      label: newWater < minWater
        ? `물 부족(${newWater.toFixed(0)}) → 스트레스 +${waterStress.toFixed(1)}`
        : `과급수(${newWater.toFixed(0)}) → 스트레스 +${waterStress.toFixed(1)}`,
    });
  }

  // ── 3. DISEASE + VENTILATION ──────────────────────────────────────────
  const envDiseaseDelta = env.diseasePressure / 5;
  let newDisease = crop.diseaseRisk + envDiseaseDelta;
  if (envDiseaseDelta > 0.1) {
    changes.push({
      stat: 'diseaseRisk', delta: envDiseaseDelta, cause: 'event_driven',
      label: `환경 병해압: +${envDiseaseDelta.toFixed(1)}`,
    });
  }

  if (actions.ventilation === 'low') {
    const ventPenalty = newWater > maxWater ? 25 : 12;
    newDisease += ventPenalty;
    changes.push({
      stat: 'diseaseRisk', delta: ventPenalty, cause: 'active_care',
      label: newWater > maxWater
        ? `저환기+과습 조합 → 곰팡이 위험 +${ventPenalty}`
        : `환기 부족 → 병해 위험 +${ventPenalty}`,
    });
  } else if (actions.ventilation === 'high') {
    newDisease -= 10;
    newWater   -= 5;
    changes.push({ stat: 'diseaseRisk', delta: -10, cause: 'active_care', label: '강환기: 병해 위험 -10' });
    changes.push({ stat: 'waterLevel',  delta: -5,  cause: 'active_care', label: '강환기로 건조: 수분 -5' });
  }

  // ── 4. LIGHT ──────────────────────────────────────────────────────────
  let effLight = crop.lightLevel;
  if (env.sunlight === 'sunny')        effLight += 20;
  else if (env.sunlight === 'rainy')   effLight -= 15;
  if (actions.light === 'on')          effLight += 30;
  effLight = Math.max(0, Math.min(100, effLight));

  // ── 5. PLAY ───────────────────────────────────────────────────────────
  if (actions.play) {
    changes.push({ stat: 'stress', delta: -8, cause: 'active_care', label: '함께 놀기 → 스트레스 -8 💚' });
  }

  // ── 6. STAMINA DELTA ──────────────────────────────────────────────────
  let staminaDelta = effLight > 50 ? 15 : -5;
  const stressLoad  = Math.max(0, crop.stress - 40) / 3;
  staminaDelta -= stressLoad;
  const staminaCause = effLight > 50 ? 'active_care' : 'event_driven';
  changes.push({
    stat: 'stamina', delta: staminaDelta, cause: staminaCause,
    label: effLight > 50
      ? `충분한 광량 → 체력 ${staminaDelta > 0 ? '+' : ''}${staminaDelta.toFixed(1)}`
      : `광량 부족 → 체력 ${staminaDelta.toFixed(1)}`,
  });

  // ── 7. FINAL VALUES ───────────────────────────────────────────────────
  const totalStressDelta = tempStress + waterStress + (actions.play ? -8 : 0);
  const finalStress  = Math.min(100, Math.max(0, crop.stress  + totalStressDelta));
  const finalWater   = Math.min(100, Math.max(0, newWater));
  const finalDisease = Math.min(100, Math.max(0, newDisease));
  const finalStamina = Math.min(100, Math.max(0, crop.stamina + staminaDelta));

  // ── 8. CARE QUALITY ───────────────────────────────────────────────────
  const penalty = (tempDiff * 3) + (waterDiff * 2) + (finalDisease / 2);
  const careQuality = Math.max(0, Math.round(100 - penalty));

  // ── 9. NEGLECT LEVEL ADJUSTMENT ───────────────────────────────────────
  let newNeglectLevel = crop.neglectLevel;
  if (careQuality >= pack.sessionConfig.optimalCareThreshold) {
    const reduction = pack.recoveryConfig.neglectDecayOnGoodCare;
    newNeglectLevel = Math.max(0, newNeglectLevel - reduction);
    if (reduction > 0 && crop.neglectLevel > 0) {
      changes.push({
        stat: 'neglectLevel', delta: -reduction, cause: 'recovery',
        label: `좋은 케어로 방치 수준 회복: -${reduction}`,
      });
    }
  }

  // ── 10. GROWTH BRANCH & AMOUNT ────────────────────────────────────────
  let branch: GrowthBranch = 'standard';
  let growthGained = pack.sessionConfig.baseGrowthPerSession;
  let headline = '안정적인 케어 세션이 완료되었습니다. 🌿';
  let lesson: string | undefined;

  if (careQuality >= pack.sessionConfig.optimalCareThreshold && effLight > 50) {
    branch       = 'optimal';
    growthGained = pack.sessionConfig.baseGrowthPerSession + pack.sessionConfig.optimalGrowthBonus;
    headline     = '최적 케어 달성! 성장이 크게 가속됩니다. 🚀';
  } else if (careQuality < pack.sessionConfig.stuntedCareThreshold || finalStress > 60 || finalDisease > 60 || effLight < 20) {
    branch       = 'stunted';
    growthGained = Math.max(5, pack.sessionConfig.baseGrowthPerSession - pack.sessionConfig.stuntedGrowthPenalty);
    headline     = '세션 조건 불량. 성장이 크게 저해됩니다. 🛑';
    lesson       = finalDisease > 40
      ? '환기를 높이고 급수를 줄여 병해 위험을 낮추세요.'
      : '온도·수분 범위를 적정 수준으로 맞춰주세요.';
  }

  changes.push({
    stat: 'growthProgress', delta: growthGained, cause: 'natural',
    label: `성장 진행: +${growthGained} (${branch === 'optimal' ? '최적' : branch === 'stunted' ? '정체' : '표준'} 경로)`,
  });

  // ── 11. VISUAL STATE ──────────────────────────────────────────────────
  let visualState: VisualState = 'healthy';
  if (finalStress > 85 || finalDisease > 85) visualState = 'wilted';
  else if (finalDisease > 60)                visualState = 'diseased';
  else if (finalDisease > 30)                visualState = 'sick';
  else if (finalStress > 60)                 visualState = 'stressed';
  else if (crop.isRecovering)                visualState = 'recovering';
  else if (careQuality > 90)                 visualState = 'thriving';

  // ── 12. DEATH CHECK ───────────────────────────────────────────────────
  const isDead = finalStamina <= pack.deathConditions.minStamina
    || finalStress  >= pack.deathConditions.maxStress
    || finalDisease >= pack.deathConditions.maxDisease;

  let deathDetails: SessionResult['deathDetails'];
  if (isDead) {
    const neglectWasContributor = crop.neglectLevel > 40;
    deathDetails = {
      main: finalDisease >= 100
        ? '치명적 감염 (Lethal Infection)'
        : finalStress  >= 100
        ? '환경 쇼크 (Environmental Shock)'
        : '에너지 고갈 (Energy Collapse)',
      secondary: neglectWasContributor
        ? '방치로 인한 체력 저하가 치명타로 작용했습니다.'
        : '잘못된 케어 결정이 치명적인 상태를 초래했습니다.',
      lesson: '균형이 핵심입니다. 방치와 잘못된 케어는 복합적으로 작용합니다.',
      actions: '체크포인트에서 복구해 다른 전략을 시도해보세요.',
      neglectContribution: neglectWasContributor
        ? `방치 수준 ${crop.neglectLevel.toFixed(0)}/100 이 복합적으로 작용했습니다.`
        : undefined,
    };
  }

  const sessionReport: SessionResultReport = {
    careQuality,
    branch,
    changes,
    headline,
    lesson,
    growthGained,
  };

  return {
    stateChanges: {
      waterLevel:    finalWater,
      stress:        finalStress,
      diseaseRisk:   finalDisease,
      stamina:       finalStamina,
      lightLevel:    effLight,
      growthProgress: Math.min(100, crop.growthProgress + growthGained),
      visualState,
      branch,
      neglectLevel:  newNeglectLevel,
      careQualityHistory: [...crop.careQualityHistory, careQuality],
      totalHealthScore: Math.round(
        ((crop.totalHealthScore * crop.day) + careQuality) / (crop.day + 1)
      ),
      isRecovering: (finalDisease < 30 && crop.diseaseRisk > 50)
        || (finalStamina > 60 && crop.stamina < 30),
      interactionCount: crop.interactionCount,
      lastSessionTime: Date.now(),
    },
    sessionReport,
    isDead,
    deathDetails,
  };
}
