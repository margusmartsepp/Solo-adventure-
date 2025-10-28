
export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

interface RollResult {
  total: number;
  rolls: number[];
  modifier: number;
  final: number;
  text: string;
}

export const rollDice = (diceNotation: string, modifier: number = 0): RollResult => {
    const match = diceNotation.match(/(\d+)d(\d+)/);
    if (!match) throw new Error("Invalid dice notation");

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);

    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((sum, roll) => sum + roll, 0);
    const final = total + modifier;
    
    const modifierString = formatModifier(modifier);
    const text = `Rolled ${diceNotation}: [${rolls.join(', ')}]${modifier !== 0 ? ` ${modifierString}` : ''} = ${final}`;

    return { total, rolls, modifier, final, text };
};

export const rollAttack = (attackBonus: number): RollResult => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const final = roll + attackBonus;
    const text = `Attack Roll: [${roll}] + ${attackBonus} = ${final}`;
    return { total: roll, rolls: [roll], modifier: attackBonus, final, text };
}
