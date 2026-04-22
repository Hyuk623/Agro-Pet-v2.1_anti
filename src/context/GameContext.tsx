import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { GameState, CropState, PlayerState, Environment, DailyActions, Checkpoint } from '../types/game';
import { strawberryPack } from '../data/strawberryPack';
import { generateEnvironment } from '../data/environmentGen';

interface GameContextProps {
  state: GameState;
  startGame: (cropName: string) => void;
  updateAction: (key: keyof DailyActions, value: any) => void;
  runDay: () => void;
  useItem: (itemType: 'nutrients' | 'coldProtectors') => void;
  recoverFromCheckpoint: () => void;
  completeMinigame: (success: boolean) => void;
  closeFeedback: () => void;
  setCurrentPage: (page: 'farm' | 'shop' | 'arcade') => void;
  buyItem: (itemType: 'nutrients' | 'coldProtectors', price: number) => void;
}

const initialPlayer: PlayerState = {
  tokens: 2,
  inventory: { nutrients: 1, coldProtectors: 1 },
  activeBuffs: { coldProtectionDays: 0 }
};

const initialCrop = (name: string): CropState => ({
  name,
  day: 1,
  stage: 'sprout',
  visualState: 'healthy',
  waterLevel: 50,
  lightLevel: 50,
  stamina: 80,
  stress: 0,
  diseaseRisk: 0,
  growthProgress: 0
});

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, setState] = useState<GameState>({
    hasStarted: false,
    currentPage: 'farm',
    crop: initialCrop(''),
    player: initialPlayer,
    environment: generateEnvironment(1),
    actions: { water: 'normal', heat: 'normal', ventilation: 'normal', light: 'auto' },
    checkpoints: [],
    deathReason: null,
    dayFeedback: null,
    minigameActive: false,
    minigameTokensEarnedToday: 0,
    maxDailyMinigameTokens: 3
  });

  const startGame = (name: string) => {
    setState(prev => ({
      ...prev,
      hasStarted: true,
      crop: initialCrop(name),
      environment: generateEnvironment(1)
    }));
  };

  const setCurrentPage = (page: 'farm' | 'shop' | 'arcade') => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const updateAction = (key: keyof DailyActions, value: any) => {
    setState(prev => ({ ...prev, actions: { ...prev.actions, [key]: value } }));
  };

  const useItem = (itemType: 'nutrients' | 'coldProtectors') => {
    setState(prev => {
      const p = prev.player;
      if (p.inventory[itemType] <= 0) return prev;
      
      const newInventory = { ...p.inventory, [itemType]: p.inventory[itemType] - 1 };
      
      if (itemType === 'nutrients') {
        return {
          ...prev,
          player: { ...p, inventory: newInventory },
          crop: { ...prev.crop, stamina: Math.min(100, prev.crop.stamina + 30), growthProgress: prev.crop.growthProgress + 10 }
        };
      } else {
        return {
          ...prev,
          player: { ...p, inventory: newInventory, activeBuffs: { ...p.activeBuffs, coldProtectionDays: 1 } }
        };
      }
    });
  };

  const buyItem = (itemType: 'nutrients' | 'coldProtectors', price: number) => {
    setState(prev => {
      if (prev.player.tokens < price) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          tokens: prev.player.tokens - price,
          inventory: {
            ...prev.player.inventory,
            [itemType]: prev.player.inventory[itemType] + 1
          }
        }
      };
    });
  };

  const runDay = () => {
    setState(prev => {
      // 1. Snapshot for checkpoint (Safe Day)
      let checkpoints = [...prev.checkpoints];
      if (prev.crop.stress < 50 && prev.crop.diseaseRisk < 50 && prev.crop.stamina > 40) {
        checkpoints = [{
          day: prev.crop.day,
          cropState: JSON.parse(JSON.stringify(prev.crop)),
          playerState: JSON.parse(JSON.stringify(prev.player)),
          reason: 'major_danger'
        }]; // Keep just the latest safe one to save memory
      }

      // 2. Evaluate Day
      let envToEvaluate = prev.environment;
      // Item buff intercept
      if (prev.player.activeBuffs.coldProtectionDays > 0) {
         if (envToEvaluate.temperature < 10) envToEvaluate = { ...envToEvaluate, temperature: 15 };
      }

      const result = strawberryPack.evaluateDay(envToEvaluate, prev.actions, prev.crop);
      
      // Stop if dead
      if (result.isDead) {
        return { ...prev, checkpoints, deathReason: result.deathDetails || null };
      }

      // 3. Process Stage Progression
      let newStage = prev.crop.stage;
      let visualState = result.stateChanges.stress! > 60 ? 'stressed' : result.stateChanges.diseaseRisk! > 60 ? 'risky' : 'healthy';
      
      let growthP = result.stateChanges.growthProgress || 0;
      let tokensGained = 0;
      
      const reqs = strawberryPack.stages[newStage as keyof typeof strawberryPack.stages];
      if (reqs && growthP >= reqs.growthThreshold) {
        // Level UP
        growthP = 0;
        tokensGained += 2;
        if (newStage === 'sprout') newStage = 'growth';
        else if (newStage === 'growth') newStage = 'flower';
        else if (newStage === 'flower') newStage = 'fruit';
      }

      if (newStage === 'flower') visualState = 'flowering';
      if (newStage === 'fruit') visualState = 'fruiting';

      // Decrement buffs
      const newActiveBuffs = { ...prev.player.activeBuffs };
      if (newActiveBuffs.coldProtectionDays > 0) newActiveBuffs.coldProtectionDays--;

      // Render minigame every 3 days approx.
      const isMinigameDay = (prev.crop.day + 1) % 4 === 0;

      return {
        ...prev,
        checkpoints,
        minigameActive: isMinigameDay,
        minigameTokensEarnedToday: 0, // Reset daily tokens
        currentPage: 'farm', // Return to farm if they were elsewhere? Or stay? Let's stay.
        environment: generateEnvironment(prev.crop.day + 1),
        player: { ...prev.player, tokens: prev.player.tokens + tokensGained, activeBuffs: newActiveBuffs },
        crop: {
          ...prev.crop,
          ...result.stateChanges,
          day: prev.crop.day + 1,
          growthProgress: growthP,
          stage: newStage,
          visualState: visualState as any
        },
        dayFeedback: { ...result.feedback, tokensGained }
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
        player: { ...cp.playerState, tokens: prev.player.tokens - 2 }, // Apply directly since state is overridden
        environment: generateEnvironment(cp.cropState.day)
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
          title: "Mini-game Result", 
          desc: success 
            ? (canEarn ? "Great! You answered correctly and earned a token." : "Correct! But you've already earned the maximum tokens for today.") 
            : "Oops! Let's review agricultural knowledge.", 
          isWarning: !success, 
          tokensGained: tokensToAdd 
        }
      };
    });
  };

  const closeFeedback = () => {
    setState(prev => ({ ...prev, dayFeedback: null }));
  };

  return (
    <GameContext.Provider value={{ state, startGame, updateAction, runDay, useItem, recoverFromCheckpoint, completeMinigame, closeFeedback, setCurrentPage, buyItem }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
};
