/**
 * persistenceEngine.ts — Centralized Persistence & Guest Identity Layer
 *
 * Manages guest identity without requiring account creation.
 * Handles loading, saving, and clearing the game state from local storage.
 * Keeps persistence logic out of UI components and other engines.
 */
import type { GameState, GuestProfile } from '../types/game';

const SAVE_KEY = 'agropet_v21_save';

/**
 * Generates a unique guest ID for anonymous continuity.
 */
function generateGuestId(): string {
  return 'guest_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

/**
 * Creates a new guest profile with current timestamps.
 */
export function createGuestProfile(): GuestProfile {
  const now = Date.now();
  return {
    guestId: generateGuestId(),
    createdAt: now,
    lastSeenAt: now,
    lastProcessedAt: now,
  };
}

/**
 * Saves the game state to local storage.
 * Updates the lastSeenAt timestamp for guest continuity.
 */
export function saveGameState(state: GameState): void {
  try {
    const stateToSave: GameState = {
      ...state,
      guestProfile: {
        ...state.guestProfile,
        lastSeenAt: Date.now(),
      },
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
  } catch (e) {
    console.warn('[AgroPet] Could not save state:', e);
  }
}

/**
 * Loads the game state from local storage.
 */
export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

/**
 * Clears the saved game state from local storage.
 */
export function clearGameState(): void {
  localStorage.removeItem(SAVE_KEY);
}
