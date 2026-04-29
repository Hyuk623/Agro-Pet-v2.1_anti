/**
 * GameContext.tsx — Game State Orchestrator
 *
 * Wires together the three time layers:
 *   Layer 1 (Real-world time):  timeEngine.calculateNeglect()
 *   Layer 2 (Session):          sessionEngine.runSession()
 *   Layer 3 (Events):           eventEngine.generateNextEnvironment()
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { GameState, CropState, PlayerState, DailyActions, ItemType, DayFeedback } from '../types/game';
import { strawberryPack } from '../data/strawberryPack';
import { calculateNeglect } from '../utils/timeEngine';
import { saveGameState, loadGameState, clearGameState, createGuestProfile } from '../utils/persistenceEngine';
import { runSession } from '../utils/sessionEngine';
import { generateNextEnvironment } from '../utils/eventEngine';

interface GameContextProps {
  state: GameState;
  startGame: (cropName: string) => void;
  updateAction: (key: keyof DailyActions, value: any) => void;
  runDay: () => void;
  useItem: (itemType: ItemType) => void;
  recoverFromCheckpoint: () => void;
  completeMinigame: (success: boolean) => void;
  closeFeedback: () => void;
  setCurrentPage: (page: 'farm' | 'shop' | 'arcade') => void;
  buyItem: (itemType: ItemType, price: number) => void;
  interactWithCrop: () => void;
  resetGame: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const initialPlayer: PlayerState = {
  tokens: 5,
  inventory: { nutrients: 1, coldProtectors: 1, fertilizer: 0, pesticide: 0, booster: 0 },
  activeBuffs: { coldProtectionDays: 0 },
};

const initialCrop = (id: string, name: string): CropState => ({
  id, name,
  day: 1,
  stage: 'seed',
  visualState: 'healthy',
  waterLevel: 50,
  lightLevel: 50,
  stamina: 80,
  stress: 0,
  diseaseRisk: 0,
  growthProgress: 0,
  isRecovering: false,
  interactionCount: 0,
  trait: (['cheerful', 'delicate', 'resilient', 'picky', 'calm'][Math.floor(Math.random() * 5)]) as any,
  branch: 'standard',
  careQualityHistory: [],
  totalHealthScore: 100,
  lastSessionTime: Date.now(),
  lastOpenedAt: Date.now(),
  neglectSensitivity: 1.0,
  neglectLevel: 0,
  awayHours: 0,
});

const buildInitialState = (): GameState => ({
  guestProfile: createGuestProfile(),
  hasStarted: false,
  currentPage: 'farm',
  crop: initialCrop('strawberry', ''),
  player: initialPlayer,
  environment: generateNextEnvironment(1, initialCrop('strawberry', '')),
  actions: { water: 'normal', heat: 'normal', ventilation: 'normal', light: 'auto', play: false },
  checkpoints: [],
  deathReason: null,
  dayFeedback: null,
  minigameActive: false,
  minigameTokensEarnedToday: 0,
  maxDailyMinigameTokens: 5,
  diary: [],
});

// ─── Context ──────────────────────────────────────────────────────────────────

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // Restore from localStorage or start fresh
  const [state, setState] = useState<GameState>(() => {
    const saved = loadGameState();
    if (saved && saved.hasStarted) {
      const { _savedAt, ...gameState } = saved as any;
      const loadedState = gameState as GameState;
      // Backward compatibility: inject guestProfile if it doesn't exist
      if (!loadedState.guestProfile) {
        loadedState.guestProfile = createGuestProfile();
      }
      return loadedState;
    }
    return buildInitialState();
  });

  // ── Persist after every state change ───────────────────────────────────
  useEffect(() => {
    if (state.hasStarted) saveGameState(state);
  }, [state]);

  // ── Layer 1: Real-world neglect check ──────────────────────────────────
  const applyNeglectCheck = useCallback((currentState: GameState): GameState => {
    if (!currentState.hasStarted || currentState.deathReason) return currentState;

    const { stateChanges, whileAwayReport } = calculateNeglect(
      currentState.crop,
      strawberryPack.neglectConfig,
    );

    // Severity 'none' = update timestamp silently, no modal
    if (whileAwayReport.severity === 'none') {
      return {
        ...currentState,
        crop: { ...currentState.crop, ...stateChanges },
      };
    }

    // Build the DayFeedback that will trigger the WhileAway modal
    const feedback: DayFeedback = {
      title:
        whileAwayReport.severity === 'critical' ? '⚠️ 위기 상태!' :
        whileAwayReport.severity === 'severe'   ? '😟 많이 비웠어요' :
        whileAwayReport.severity === 'moderate' ? '💧 잠시 자리 비움' :
        '🌿 가볍게 자리 비움',
      desc: whileAwayReport.headline,
      isWarning: whileAwayReport.severity === 'severe' || whileAwayReport.severity === 'critical',
      whileAwayReport,
      neglectReport: whileAwayReport.headline,
      neglectSeverity: whileAwayReport.severity,
      hoursAway: Math.floor(whileAwayReport.hoursAway),
    };

    return {
      ...currentState,
      crop: { ...currentState.crop, ...stateChanges },
      dayFeedback: feedback,
    };
  }, []);

  // Run on mount (app open)
  useEffect(() => {
    setState(prev => applyNeglectCheck(prev));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run when tab becomes visible (return from background)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setState(prev => applyNeglectCheck(prev));
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [applyNeglectCheck]);

  // ─── Public Actions ─────────────────────────────────────────────────────

  const startGame = (name: string) => {
    const crop = initialCrop('strawberry', name);
    setState({
      ...buildInitialState(),
      hasStarted: true,
      crop,
      environment: generateNextEnvironment(1, crop),
    });
  };

  const resetGame = () => {
    clearGameState();
    setState(buildInitialState());
  };

  const setCurrentPage = (page: 'farm' | 'shop' | 'arcade') => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const updateAction = (key: keyof DailyActions, value: any) => {
    setState(prev => ({ ...prev, actions: { ...prev.actions, [key]: value } }));
  };

  const useItem = (itemType: ItemType) => {
    setState(prev => {
      const p = prev.player;
      if (p.inventory[itemType] <= 0) return prev;
      const newInventory = { ...p.inventory, [itemType]: p.inventory[itemType] - 1 };
      let cropAdjustments: Partial<CropState> = {};
      let buffAdjustments: Partial<GameState['player']['activeBuffs']> = {};
      switch (itemType) {
        case 'nutrients':
          cropAdjustments = { stamina: Math.min(100, prev.crop.stamina + 20), growthProgress: prev.crop.growthProgress + 5 };
          break;
        case 'coldProtectors':
          buffAdjustments = { coldProtectionDays: 1 };
          break;
        case 'fertilizer':
          cropAdjustments = { growthProgress: prev.crop.growthProgress + 20, stress: Math.min(100, prev.crop.stress + 5) };
          break;
        case 'pesticide':
          cropAdjustments = { diseaseRisk: Math.max(0, prev.crop.diseaseRisk - 30) };
          break;
        case 'booster':
          cropAdjustments = { growthProgress: prev.crop.growthProgress + 35, stamina: Math.max(0, prev.crop.stamina - 10) };
          break;
      }
      return {
        ...prev,
        player: { ...p, inventory: newInventory, activeBuffs: { ...p.activeBuffs, ...buffAdjustments } },
        crop: { ...prev.crop, ...cropAdjustments },
      };
    });
  };

  const buyItem = (itemType: ItemType, price: number) => {
    setState(prev => {
      if (prev.player.tokens < price) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          tokens: prev.player.tokens - price,
          inventory: { ...prev.player.inventory, [itemType]: prev.player.inventory[itemType] + 1 },
        },
      };
    });
  };

  const interactWithCrop = () => {
    setState(prev => ({
      ...prev,
      crop: { ...prev.crop, stress: Math.max(0, prev.crop.stress - 5), interactionCount: prev.crop.interactionCount + 1 },
      actions: { ...prev.actions, play: true },
    }));
  };

  // ── Layer 2: Active session (runDay) ────────────────────────────────────
  const runDay = () => {
    setState(prev => {
      // Checkpoint if crop is currently healthy
      let checkpoints = [...prev.checkpoints];
      if (prev.crop.stress < 40 && prev.crop.diseaseRisk < 40 && prev.crop.stamina > 50) {
        checkpoints = [{
          day: prev.crop.day,
          cropState: JSON.parse(JSON.stringify(prev.crop)),
          playerState: JSON.parse(JSON.stringify(prev.player)),
          reason: 'major_danger',
        }];
      }

      // Apply cold-protection buff
      let envToUse = prev.environment;
      if (prev.player.activeBuffs.coldProtectionDays > 0 && envToUse.temperature < 10) {
        envToUse = { ...envToUse, temperature: 18 };
      }

      // ── Layer 2: session simulation ──────────────────────────────────
      const result = runSession(envToUse, prev.actions, prev.crop, strawberryPack);

      if (result.isDead) {
        return { ...prev, checkpoints, deathReason: result.deathDetails || null };
      }

      // Stage progression
      let newStage = prev.crop.stage;
      let growthP = Math.min(100, prev.crop.growthProgress + result.sessionReport.growthGained);
      let tokensGained = 0;

      const reqs = strawberryPack.stages[newStage as keyof typeof strawberryPack.stages];
      if (reqs && growthP >= reqs.growthThreshold) {
        growthP = 0;
        tokensGained += 5;
        if (newStage === 'seed')   newStage = 'sprout';
        else if (newStage === 'sprout') newStage = 'growth';
        else if (newStage === 'growth') newStage = 'flower';
        else if (newStage === 'flower') newStage = 'fruit';
      }

      const newActiveBuffs = { ...prev.player.activeBuffs };
      if (newActiveBuffs.coldProtectionDays > 0) newActiveBuffs.coldProtectionDays--;

      const updatedCrop: CropState = {
        ...prev.crop,
        ...result.stateChanges,
        day: prev.crop.day + 1,
        stage: newStage,
        growthProgress: growthP,
        lastSessionTime: Date.now(),
      };

      // ── Layer 3: generate next session's environment ─────────────────
      const nextEnv = generateNextEnvironment(updatedCrop.day, updatedCrop, prev.environment);

      const dayFeedback: DayFeedback = {
        title: result.sessionReport.branch === 'optimal' ? '완벽한 케어! ✨'
          : result.sessionReport.branch === 'stunted' ? '성장 정체 ⚠️' : '세션 완료 🌿',
        desc: `케어 품질 ${result.sessionReport.careQuality}점`,
        isWarning: result.sessionReport.branch === 'stunted',
        tokensGained: tokensGained > 0 ? tokensGained : undefined,
        sessionResult: result.sessionReport,
        lesson: result.sessionReport.lesson,
        impact: result.sessionReport.headline,
        sessionReport: result.sessionReport.headline,
      };

      return {
        ...prev,
        checkpoints,
        minigameActive: false,
        minigameTokensEarnedToday: 0,
        environment: nextEnv,
        crop: updatedCrop,
        diary: [...prev.diary, `세션 ${prev.crop.day}: ${result.sessionReport.headline}`],
        actions: { ...prev.actions, play: false },
        dayFeedback,
        player: {
          ...prev.player,
          tokens: prev.player.tokens + tokensGained + 1,
          activeBuffs: newActiveBuffs,
        },
      };
    });
  };

  const recoverFromCheckpoint = () => {
    setState(prev => {
      if (prev.player.tokens < 2 || prev.checkpoints.length === 0) return prev;
      const cp = prev.checkpoints[0];
      return {
        ...prev,
        deathReason: null,
        crop: cp.cropState,
        player: { ...cp.playerState, tokens: prev.player.tokens - 2 },
        environment: generateNextEnvironment(cp.cropState.day, cp.cropState),
      };
    });
  };

  const completeMinigame = (success: boolean) => {
    setState(prev => {
      const canEarn = prev.minigameTokensEarnedToday < prev.maxDailyMinigameTokens;
      const tokensToAdd = (success && canEarn) ? 1 : 0;
      return {
        ...prev,
        minigameActive: false,
        minigameTokensEarnedToday: prev.minigameTokensEarnedToday + tokensToAdd,
        player: { ...prev.player, tokens: prev.player.tokens + tokensToAdd },
        dayFeedback: {
          title: 'Mini-game Result',
          desc: success ? (canEarn ? '정답! 토큰 +1 🎉' : '정답! (일일 한도 초과)') : '틀렸어요! 다시 도전해보세요. 📚',
          isWarning: !success,
          tokensGained: tokensToAdd,
        },
      };
    });
  };

  const closeFeedback = () => {
    setState(prev => ({ ...prev, dayFeedback: null }));
  };

  return (
    <GameContext.Provider value={{
      state, startGame, updateAction, runDay, useItem,
      recoverFromCheckpoint, completeMinigame, closeFeedback,
      setCurrentPage, buyItem, interactWithCrop, resetGame,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
};
