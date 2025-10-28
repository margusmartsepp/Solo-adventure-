
import { GameState } from '../types';

const SAVE_GAME_KEY = 'dnd_game_state_agent';

export const getInitialState = (): GameState => ({
  session_id: `session_${Date.now()}`,
  campaign_name: "The Goblin Warrens",
  current_scene: {
    location: "Cave Entrance",
    description: "You stand at the entrance to the Goblin Warren. The cave mouth yawns before you, dark and foreboding.",
    active_combatants: [],
    current_turn: null,
    round_number: 0,
  },
  player_characters: {
    "pc_theron": {
      id: "pc_theron",
      name: "Theron",
      level: 1,
      class: "Fighter",
      race: "Human",
      abilities: { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8 },
      hit_points: { current: 12, max: 12, temporary: 0 },
      armor_class: 18,
      speed: 30,
      proficiency_bonus: 2,
      inventory: [
        { name: "Longsword", damage: "1d8", type: "slashing" },
        { name: "Shield", ac_bonus: 2 }
      ],
      conditions: [],
    }
  },
  enemies: {
    "enemy_goblin_1": {
      id: "enemy_goblin_1",
      name: "Goblin Scout",
      type: "creature",
      hit_points: { current: 7, max: 7, temporary: 0 },
      armor_class: 13,
      abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
      attacks: [
        { name: "Scimitar", attack_bonus: 4, damage: "1d6+2", type: "slashing" }
      ],
      isDefeated: false,
    },
    "enemy_goblin_2": {
      id: "enemy_goblin_2",
      name: "Goblin Archer",
      type: "creature",
      hit_points: { current: 7, max: 7, temporary: 0 },
      armor_class: 13,
      abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
      attacks: [
        { name: "Shortbow", attack_bonus: 4, damage: "1d6+2", type: "piercing" }
      ],
      isDefeated: false,
    }
  },
  dm_only_data: {
    plot_secrets: {
      goblin_leader: "A larger hobgoblin named Grukk leads this warren."
    }
  },
  party_shared_data: {
    party_gold: 10
  }
});

export const saveState = (state: GameState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(SAVE_GAME_KEY, serializedState);
  } catch (error) {
    console.error("Failed to save game state:", error);
  }
};

export const loadState = (): GameState | null => {
  try {
    const serializedState = localStorage.getItem(SAVE_GAME_KEY);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Failed to load game state:", error);
    return null;
  }
};
