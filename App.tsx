import React, { useState, useEffect, useCallback } from 'react';
// FIX: Add explicit imports for PlayerCharacter and Enemy types.
import { GameState, LogEntry, PlayerCharacter, Enemy } from './types';
import { CharacterSheet } from './components/CharacterSheet';
import { CombatTracker } from './components/CombatTracker';
import { LogDisplay } from './components/LogDisplay';
import { ActionBar } from './components/ActionBar';
import { ImageDisplay } from './components/ImageDisplay';
import { getInitialState, saveState, loadState } from './services/stateManager';
import { calculateModifier, rollDice, rollAttack } from './services/gameLogic';
import { generateNarrative, generateImage } from './services/geminiService';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(getInitialState());
    const [log, setLog] = useState<LogEntry[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);

    const addLogEntry = useCallback((type: LogEntry['type'], content: string) => {
        setLog(prevLog => [...prevLog, { id: Date.now() + Math.random(), type, content, timestamp: new Date().toISOString() }]);
    }, []);

    useEffect(() => {
        addLogEntry('narrative', gameState.current_scene.description);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // FIX: Cast results of Object.values to their proper types to avoid 'unknown' type errors.
    const playerCharacter = Object.values(gameState.player_characters)[0] as PlayerCharacter;
    // FIX: Cast results of Object.values to their proper types to avoid 'unknown' type errors.
    const enemies = (Object.values(gameState.enemies) as Enemy[]).filter(e => !e.isDefeated);
    // FIX: Provide explicit type for the combined map of combatants.
    const allCombatantsMap: Record<string, PlayerCharacter | Enemy> = { ...gameState.player_characters, ...gameState.enemies };

    const inCombat = gameState.current_scene.active_combatants.length > 0;
    const isPlayerTurn = inCombat && gameState.current_scene.current_turn === playerCharacter.id;

    const combatantsForTracker = gameState.current_scene.active_combatants
        .map(id => allCombatantsMap[id])
        // FIX: Use a type guard to correctly filter out undefined or defeated combatants.
        .filter((c): c is (PlayerCharacter | Enemy) => {
            if (!c) return false;
            if ('isDefeated' in c) {
                return !c.isDefeated;
            }
            return true;
        });

    const nextTurn = useCallback(() => {
        setGameState(prev => {
            // FIX: Explicitly type all combatants map to resolve 'unknown' types
            const allCombatants: Record<string, PlayerCharacter | Enemy> = {...prev.player_characters, ...prev.enemies};
            const activeCombatants = prev.current_scene.active_combatants.filter(id => {
                const combatant = allCombatants[id];
                // FIX: Use type-safe check for 'isDefeated' property.
                if (!combatant) return false;
                if ('isDefeated' in combatant) {
                    return !combatant.isDefeated;
                }
                return true; // PlayerCharacters are always considered active if in the list
            });

            if (activeCombatants.length === 0) return prev;

            const currentIndex = activeCombatants.indexOf(prev.current_scene.current_turn!);
            const nextIndex = (currentIndex + 1) % activeCombatants.length;
            const nextTurnId = activeCombatants[nextIndex];
            const newRound = nextIndex === 0;
            const nextRoundNumber = newRound ? prev.current_scene.round_number + 1 : prev.current_scene.round_number;
            
            if (newRound) {
                addLogEntry('system', `Round ${nextRoundNumber}!`);
            }
            const allChars = allCombatants;
            addLogEntry('system', `It is now ${allChars[nextTurnId]?.name}'s turn.`);

            return {
                ...prev,
                current_scene: {
                    ...prev.current_scene,
                    active_combatants: activeCombatants,
                    current_turn: nextTurnId,
                    round_number: nextRoundNumber,
                }
            };
        });
    }, [addLogEntry]);

     const endCombat = useCallback(() => {
        addLogEntry('system', 'All enemies defeated. Combat has ended!');
        setGameState(prev => ({
            ...prev,
            current_scene: {
                ...prev.current_scene,
                active_combatants: [],
                current_turn: null,
                round_number: 0,
            }
        }));
    }, [addLogEntry]);

    const handleEnemyTurn = useCallback(async (enemyId: string) => {
        const enemy = gameState.enemies[enemyId];
        if (!enemy || enemy.isDefeated) {
            nextTurn();
            return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Dramatic pause
        addLogEntry('combat', `It's ${enemy.name}'s turn!`);

        const attack = enemy.attacks[0];
        const attackResult = rollAttack(attack.attack_bonus);
        addLogEntry('dice_roll', `${enemy.name}'s ${attack.name}: ${attackResult.text}`);
        
        if (attackResult.final >= playerCharacter.armor_class) {
            const strMod = calculateModifier(enemy.abilities.str); // Most melee attacks use STR
            const damageRoll = rollDice(attack.damage, strMod);
            addLogEntry('dice_roll', `Damage: ${damageRoll.text}`);

            const narrative = await generateNarrative(`Describe ${enemy.name}'s successful ${attack.name} hitting ${playerCharacter.name} for ${damageRoll.final} damage.`);
            addLogEntry('narrative', narrative);

            setGameState(prev => {
                const pc = prev.player_characters[playerCharacter.id];
                const newHp = pc.hit_points.current - damageRoll.final;
                if (newHp <= 0) addLogEntry('system', `${playerCharacter.name} has fallen!`);
                return {
                    ...prev,
                    player_characters: { ...prev.player_characters, [pc.id]: {...pc, hit_points: {...pc.hit_points, current: Math.max(0, newHp)}} }
                }
            });
        } else {
            const narrative = await generateNarrative(`Describe ${enemy.name}'s ${attack.name} attack narrowly missing ${playerCharacter.name}.`);
            addLogEntry('narrative', narrative);
        }
        
        setIsLoading(false);
        setTimeout(nextTurn, 100);

    }, [gameState.enemies, playerCharacter, nextTurn, addLogEntry]);

    useEffect(() => {
        if (inCombat && gameState.current_scene.current_turn?.startsWith('enemy_')) {
            const enemyId = gameState.current_scene.current_turn;
            const timer = setTimeout(() => handleEnemyTurn(enemyId), 1500);
            return () => clearTimeout(timer);
        }
    }, [gameState.current_scene.current_turn, inCombat, handleEnemyTurn]);


    const handleAction = useCallback(async (action: string, targetId?: string) => {
        // System Actions
        if (action === 'save') {
            saveState(gameState);
            addLogEntry('system', 'Game saved successfully.');
            return;
        }
        if (action === 'load') {
            const loaded = loadState();
            if (loaded) {
                setGameState(loaded);
                setLog([]);
                addLogEntry('system', 'Game loaded.');
                addLogEntry('narrative', loaded.current_scene.description);
            } else {
                addLogEntry('system', 'No saved game found.');
            }
            return;
        }
        if (action === 'image') {
            setIsImageLoading(true);
            addLogEntry('system', 'Visualizing the scene...');
            const combatantDesc = combatantsForTracker.length > 0 ? ` In combat with: ${combatantsForTracker.map(c => c.name).join(', ')}.` : '';
            const prompt = `Location: ${gameState.current_scene.location}. ${gameState.current_scene.description}. Player character Theron is present.${combatantDesc}`;
            const result = await generateImage(prompt);
            setImageUrl(result);
            setIsImageLoading(false);
            return;
        }

        // Player Actions
        if (action === 'attack' && !inCombat) {
            addLogEntry('system', 'Combat has begun!');
            const allCombatants = [playerCharacter, ...enemies];
            const initiatives = allCombatants.map(c => ({ id: c.id, roll: rollDice('1d20', calculateModifier(c.abilities.dex)) }));
            initiatives.forEach(i => addLogEntry('dice_roll', `${(allCombatantsMap[i.id] as PlayerCharacter | Enemy)?.name} initiative: ${i.roll.text}`));
            initiatives.sort((a, b) => b.roll.final - a.roll.final);
            const combatantOrder = initiatives.map(i => i.id);
            
            setGameState(prev => ({
                ...prev,
                current_scene: { ...prev.current_scene, active_combatants: combatantOrder, current_turn: combatantOrder[0], round_number: 1 }
            }));
            addLogEntry('system', `Round 1! It is ${allCombatantsMap[combatantOrder[0]]?.name}'s turn.`);
            return;
        }

        if (!isPlayerTurn) {
            addLogEntry('system', "It is not your turn!");
            return;
        }
        
        setIsLoading(true);

        if (action === 'attack' && targetId) {
            const target = gameState.enemies[targetId];
            const weapon = playerCharacter.inventory.find(i => i.damage)!;
            const strMod = calculateModifier(playerCharacter.abilities.str);
            const attackBonus = strMod + playerCharacter.proficiency_bonus;

            addLogEntry('combat', `${playerCharacter.name} attacks ${target.name} with ${weapon.name}!`);
            const attackResult = rollAttack(attackBonus);
            addLogEntry('dice_roll', attackResult.text);

            if (attackResult.final >= target.armor_class) {
                const damageRoll = rollDice(weapon.damage!, strMod);
                addLogEntry('dice_roll', `Damage: ${damageRoll.text}`);
                
                const newHp = target.hit_points.current - damageRoll.final;
                const isDefeated = newHp <= 0;

                const narrative = await generateNarrative(`Describe ${playerCharacter.name}'s successful ${weapon.name} attack hitting ${target.name} for ${damageRoll.final} damage.${isDefeated ? ' It is a finishing blow!' : ''}`);
                addLogEntry('narrative', narrative);
                
                let combatIsOver = false;
                setGameState(prev => {
                    const updatedEnemies = { ...prev.enemies, [targetId]: { ...target, hit_points: { ...target.hit_points, current: Math.max(0, newHp) }, isDefeated } };
                    combatIsOver = Object.values(updatedEnemies).every(e => e.isDefeated);
                    return { ...prev, enemies: updatedEnemies };
                });

                if (combatIsOver) endCombat(); else nextTurn();
            } else {
                const narrative = await generateNarrative(`Describe ${playerCharacter.name}'s attack with a ${weapon.name} missing ${target.name}.`);
                addLogEntry('narrative', narrative);
                nextTurn();
            }
        } else if (action === 'search') {
            addLogEntry('system', `${playerCharacter.name} searches the area.`);
            const narrative = await generateNarrative(`Describe what ${playerCharacter.name} finds when searching the ${gameState.current_scene.location}. The area is described as: "${gameState.current_scene.description}".`);
            addLogEntry('narrative', narrative);
            if(inCombat) nextTurn();
        }
        
        setIsLoading(false);
    }, [gameState, addLogEntry, combatantsForTracker, playerCharacter, enemies, allCombatantsMap, inCombat, isPlayerTurn, nextTurn, endCombat]);

    return (
        <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://i.imgur.com/a6yGAde.jpg')" }}>
            <div className="min-h-screen bg-slate-900/70 backdrop-blur-sm flex flex-col">
                <header className="p-4 text-center border-b-2 border-amber-500/30">
                    <h1 className="text-3xl font-bold text-amber-400 tracking-wider font-serif">{gameState.campaign_name}</h1>
                </header>
                <main className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 grid-rows-[min-content_1fr]">
                    <div className="lg:col-span-4">
                       <ImageDisplay imageUrl={imageUrl} isLoading={isImageLoading} />
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-4">
                       <LogDisplay log={log} isLoading={isLoading} />
                    </div>
                    <div className="flex flex-col gap-4">
                        {inCombat && <CombatTracker combatants={combatantsForTracker} currentTurnId={gameState.current_scene.current_turn} />}
                    </div>
                    <div className="flex flex-col gap-4">
                        <CharacterSheet character={playerCharacter} />
                    </div>
                </main>
                <ActionBar onAction={handleAction} isPlayerTurn={isPlayerTurn} enemyIds={enemies.map(e => e.id)} />
            </div>
        </div>
    );
};

export default App;
