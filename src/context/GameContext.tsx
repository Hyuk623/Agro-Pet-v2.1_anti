import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameState, CropState, PlayerState, Environment, DailyActions, Checkpoint, ItemType } from '../types/game';
import { strawberryPack } from '../data/strawberryPack';
import { generateEnvironment } from '../data/environmentGen';

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
}

const initialPlayer: PlayerState = {
  tokens: 5, // Initial tokens for easier testing
  inventory: { 
    nutrients: 1, 
    coldProtectors: 1,
    fertilizer: 0,
    pesticide: 0,
    booster: 0
  },
  activeBuffs: { coldProtectionDays: 0 }
};

const initialCrop = (id: string, name: string): CropState => ({
  id,
  name,
  day: 1,
  stage: 'sprout',
  visualState: 'healthy',
  waterLevel: 50,
  lightLevel: 50,
  stamina: 80,
  stress: 0,
  diseaseRisk: 0,
  growthProgress: 0,
  isRecovering: false,
  interactionCount: 0
});

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, setState] = useState<GameState>({
    hasStarted: false,
    currentPage: 'farm',
    crop: initialCrop('strawberry', ''),
    player: initialPlayer,
    environment: generateEnvironment(1),
    actions: { water: 'normal', heat: 'normal', ventilation: 'normal', light: 'auto', play: false },
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
      crop: initialCrop('strawberry', name),
      environment: generateEnvironment(1)
    }));
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
          cropAdjustments = { 
            stamina: Math.min(100, prev.crop.stamina + 20), 
            growthProgress: prev.crop.growthProgress + 5 
          };
          break;
        case 'coldProtectors':
          buffAdjustments = { coldProtectionDays: 1 };
          break;
        case 'fertilizer':
          // High growth, slight stress
          cropAdjustments = { 
            growthProgress: prev.crop.growthProgress + 20, 
            stress: Math.min(100, prev.crop.stress + 5) 
          };
          break;
        case 'pesticide':
          // Direct disease risk reduction
          cropAdjustments = { 
            diseaseRisk: Math.max(0, prev.crop.diseaseRisk - 30) 
          };
          break;
        case 'booster':
          // Major growth boost
          cropAdjustments = { 
            growthProgress: prev.crop.growthProgress + 35,
            stamina: Math.max(0, prev.crop.stamina - 10)
          };
          break;
      }
      
      return {
        ...prev,
        player: { 
          ...p, 
          inventory: newInventory, 
          activeBuffs: { ...p.activeBuffs, ...buffAdjustments } 
        },
        crop: { ...prev.crop, ...cropAdjustments }
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
          inventory: {
            ...prev.player.inventory,
            [itemType]: prev.player.inventory[itemType] + 1
          }
        }
      };
    });
  };

  const interactWithCrop = () => {
    setState(prev => ({
      ...prev,
      crop: {
        ...prev.crop,
        stress: Math.max(0, prev.crop.stress - 5),
        interactionCount: prev.crop.interactionCount + 1
      },
      actions: {
        ...prev.actions,
        play: true
      }
    }));
  };

  const runDay = () => {
    setState(prev => {
      // 1. Snapshot for checkpoint (Safe Day)
      let checkpoints = [...prev.checkpoints];
      if (prev.crop.stress < 40 && prev.crop.diseaseRisk < 40 && prev.crop.stamina > 50) {
        checkpoints = [{
          day: prev.crop.day,
          cropState: JSON.parse(JSON.stringify(prev.crop)),
          playerState: JSON.parse(JSON.stringify(prev.player)),
          reason: 'major_danger'
        }];
      }

      // 2. Evaluate Day
      let envToEvaluate = prev.environment;
      if (prev.player.activeBuffs.coldProtectionDays > 0) {
         if (envToEvaluate.temperature < 10) envToEvaluate = { ...envToEvaluate, temperature: 18 };
      }

      const result = strawberryPack.evaluateDay(envToEvaluate, prev.actions, prev.crop);
      
      if (result.isDead) {
        return { ...prev, checkpoints, deathReason: result.deathDetails || null };
      }

      // 3. Process Stage Progression
      let newStage = prev.crop.stage;
      let growthP = (prev.crop.growthProgress + (result.stateChanges.growthProgress || 0));
      let tokensGained = 0;
      
      const reqs = strawberryPack.stages[newStage as keyof typeof strawberryPack.stages];
      if (reqs && growthP >= reqs.growthThreshold) {
        growthP = 0;
        tokensGained += 5; // Bonus tokens for stage up
        if (newStage === 'sprout') newStage = 'growth';
        else if (newStage === 'growth') newStage = 'flower';
        else if (newStage === 'flower') newStage = 'fruit';
      }

      const newStats = { ...result.stateChanges };
      let visualState: any = 'healthy';
      if (newStats.stress! > 60) visualState = 'stressed';
      else if (newStats.diseaseRisk! > 60) visualState = 'risky';
      
      if (newStage === 'flower') visualState = 'flowering';
      if (newStage === 'fruit') visualState = 'fruiting';

      // Decrement buffs
      const newActiveBuffs = { ...prev.player.activeBuffs };
      if (newActiveBuffs.coldProtectionDays > 0) newActiveBuffs.coldProtectionDays--;

      // 4. Update Crop State with recovery detection
      const isRecovering = 
        (result.stateChanges.diseaseRisk !== undefined && result.stateChanges.diseaseRisk < 30 && prev.crop.diseaseRisk > 50) ||
        (result.stateChanges.stamina !== undefined && result.stateChanges.stamina > 60 && prev.crop.stamina < 30);

      const updatedCrop = {
        ...prev.crop,
        ...result.stateChanges,
        day: prev.crop.day + 1,
        stage: newStage,
        growthProgress: growthP,
        visualState: visualState,
        isRecovering: isRecovering
      };

      return {
        ...prev,
        checkpoints,
        minigameActive: false,
        minigameTokensEarnedToday: 0,
        environment: generateEnvironment(updatedCrop.day),
        crop: updatedCrop,
        actions: { 
          ...prev.actions, 
          water: prev.actions.water, // reset logic could go here
          play: false 
        },
        dayFeedback: {
          ...result.feedback,
          tokensGained: tokensGained > 0 ? tokensGained : undefined
        },
        player: { 
          ...prev.player, 
          tokens: prev.player.tokens + tokensGained + 1,
          activeBuffs: newActiveBuffs
        }
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
            ? (canEarn ? "Success! You earned a token." : "Correct! (Daily limit reached)") 
            : "Keep learning!", 
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
