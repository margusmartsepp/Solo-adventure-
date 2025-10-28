
export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface HitPoints {
  current: number;
  max: number;
  temporary: number;
}

export interface InventoryItem {
  name: string;
  damage?: string;
  type?: string;
  ac_bonus?: number;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  level: number;
  class: string;
  race: string;
  abilities: AbilityScores;
  hit_points: HitPoints;
  armor_class: number;
  speed: number;
  proficiency_bonus: number;
  inventory: InventoryItem[];
  conditions: string[];
}

export interface Enemy {
  id: string;
  name: string;
  type: 'creature';
  hit_points: HitPoints;
  armor_class: number;
  abilities: AbilityScores;
  attacks: {
    name: string;
    attack_bonus: number;
    damage: string;
    type: string;
  }[];
  isDefeated: boolean;
}

export interface Combatant extends PlayerCharacter, Enemy {}

export interface GameState {
  session_id: string;
  campaign_name: string;
  current_scene: {
    location: string;
    description: string;
    active_combatants: string[]; // list of initiative order ids
    current_turn: string | null; // id of the current combatant
    round_number: number;
  };
  player_characters: {
    [id: string]: PlayerCharacter;
  };
  enemies: {
    [id: string]: Enemy;
  };
  dm_only_data: {
    plot_secrets: object;
  };
  party_shared_data: {
    party_gold: number;
  };
}

export type LogEntryType = 'narrative' | 'dice_roll' | 'combat' | 'system' | 'dialogue';

export interface LogEntry {
  id: number;
  type: LogEntryType;
  content: string;
  timestamp: string;
}
