import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_CONFIG, getRelativeSector, getAdjacentSectors } from '../utils/defaultConfig';


const GameContext = createContext();

export function GameProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [round, setRound] = useState(1);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [turnPhase, setTurnPhase] = useState('setup'); // 'setup' | 'movement' | 'action' | 'recovery' | 'game_over'
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'victory' | 'defeat'

  // Game Log entries: { id, timestamp, type: 'info'|'action'|'reaction'|'phase', text }
  const [gameLog, setGameLog] = useState([]);

  // Active Pending Reaction modal state: null or { title, description, targets, choiceRequired: false }
  const [pendingReaction, setPendingReaction] = useState(null);

  // Undo History Stack
  const [history, setHistory] = useState([]);

  // Initialize Aggro Token & Turn Order
  const [aggroHeroId, setAggroHeroId] = useState(() => DEFAULT_CONFIG.heroes[0]?.id || 'hero_1');
  const [turnOrder, setTurnOrder] = useState(() => DEFAULT_CONFIG.heroes.map((h) => h.id));

  const pushSnapshot = () => {
    const snapshot = {
      round,
      currentHeroIndex,
      turnPhase,
      gameStatus,
      aggroHeroId,
      turnOrder: [...turnOrder],
      boss: JSON.parse(JSON.stringify(boss)),
      heroes: JSON.parse(JSON.stringify(heroes)),
      gameLog: [...gameLog],
      pendingReaction: pendingReaction ? JSON.parse(JSON.stringify(pendingReaction)) : null,
    };
    setHistory((prev) => [...prev.slice(-40), snapshot]);
  };

  const undoTurn = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    setRound(previousState.round);
    setCurrentHeroIndex(previousState.currentHeroIndex);
    setTurnPhase(previousState.turnPhase);
    setGameStatus(previousState.gameStatus);
    if (previousState.aggroHeroId) setAggroHeroId(previousState.aggroHeroId);
    if (previousState.turnOrder) setTurnOrder(previousState.turnOrder);
    setBoss(previousState.boss);
    setHeroes(previousState.heroes);
    setPendingReaction(previousState.pendingReaction);
    setGameLog([
      {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `↩️ Undid last action/turn (Restored previous state).`,
        type: 'phase'
      },
      ...previousState.gameLog
    ]);
  };

  // Initialize Boss State
  const [boss, setBoss] = useState(() => ({
    name: DEFAULT_CONFIG.boss.name,
    hp: DEFAULT_CONFIG.boss.maxHp,
    maxHp: DEFAULT_CONFIG.boss.maxHp,
    facingSector: DEFAULT_CONFIG.boss.facingSector,
    struggle: 0,
    isAlive: true
  }));

  // Initialize Heroes State
  const [heroes, setHeroes] = useState(() =>
    DEFAULT_CONFIG.heroes.map((h) => ({
      ...h,
      baseMaxStamina: h.maxStamina || 3,
      hp: h.maxHp,
      stamina: h.maxStamina,
      bonusStamina: 0,
      block: 0,
      previousRoundBlock: 0,
      currentRoundBlock: 0,
      isThreatened: false,
      isBurned: false,
      isKo: false,
      koCount: 0,
      turnsSkipped: 0
    }))
  );

  // Reset Game when Config changes or user clicks restart
  const resetGame = (customConfig = config) => {
    setHistory([]);
    setConfig(customConfig);
    setRound(1);
    setCurrentHeroIndex(0);
    setTurnPhase('setup');
    setGameStatus('playing');
    setPendingReaction(null);

    const initialBoss = {
      name: customConfig.boss.name,
      hp: customConfig.boss.maxHp,
      maxHp: customConfig.boss.maxHp,
      facingSector: customConfig.boss.facingSector,
      struggle: 0,
      isAlive: true
    };
    const initialHeroes = customConfig.heroes.map((h) => ({
      ...h,
      baseMaxStamina: h.maxStamina || 3,
      hp: h.maxHp,
      stamina: h.maxStamina,
      bonusStamina: 0,
      block: 0,
      previousRoundBlock: 0,
      currentRoundBlock: 0,
      isThreatened: false,
      isBurned: false,
      isKo: false,
      koCount: 0,
      turnsSkipped: 0
    }));

    const initialAggroId = initialHeroes[0]?.id || 'hero_1';
    const initialTurnOrder = initialHeroes.map((h) => h.id);

    setAggroHeroId(initialAggroId);
    setTurnOrder(initialTurnOrder);
    setBoss(initialBoss);
    setHeroes(initialHeroes);
    setGameLog([
      {
        id: Date.now(),
        type: 'phase',
        text: `🎮 New Game Started! Choose starting sectors for each hero before starting Round 1.`
      }
    ]);
  };

  const setHeroStartingSector = (heroId, sectorId) => {
    setHeroes((prev) =>
      prev.map((h) => (h.id === heroId ? { ...h, sector: sectorId } : h))
    );
    const targetHero = heroes.find((h) => h.id === heroId);
    if (targetHero) {
      addLog(`🎯 ${targetHero.name} selected Sector ${sectorId} (${config.sectors[sectorId]?.name}) as their starting sector.`, 'info');
    }
  };

  const startBattle = () => {
    setTurnPhase('movement');
    addLog(`⚔️ Setup complete! All heroes placed in starting sectors. Round 1 begins!`, 'phase');
    const firstHeroId = turnOrder[0] || aggroHeroId;
    setHeroes((prev) => processStartOfMovementPhase(firstHeroId, prev, boss));
  };

  useEffect(() => {
    // Initial load in setup phase
    setTurnPhase('setup');
  }, []);

  const addLog = (text, type = 'info') => {
    setGameLog((prev) => [
      {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text,
        type
      },
      ...prev
    ]);
  };

  // Get active hero based on turn order
  const activeHeroId = turnOrder[currentHeroIndex] || turnOrder[0];
  const activeHero = heroes.find((h) => h.id === activeHeroId) || heroes[0];

  // Helper: Calculate effective Max Stamina based on baseMaxStamina and KO count
  const calculateEffectiveMaxStamina = (heroObj) => {
    if (!heroObj) return 3;
    const base = heroObj.baseMaxStamina || heroObj.maxStamina || 3;
    const isCreativity = heroObj.relicAction?.effectType === 'passive' && heroObj.relicAction?.ignoreFirstKoPenalty;
    const effectiveKoCount = (isCreativity && heroObj.koCount <= 1) ? 0 : (isCreativity ? heroObj.koCount - 1 : heroObj.koCount);
    return Math.max(1, base - effectiveKoCount);
  };

  // Ability action stamina cost (KO decreases Max Stamina directly instead of increasing ability costs)
  const getActionCost = (hero, baseCost) => {
    return baseCost;
  };

  // Helper: Apply damage with block absorption
  // Absorb from previousRoundBlock first, then currentRoundBlock
  const applyDamageWithBlock = (hero, rawDamage) => {
    const updated = { ...hero };
    let prevBlock = updated.previousRoundBlock || 0;
    let currBlock = updated.currentRoundBlock || 0;
    let totalBlock = prevBlock + currBlock;

    if (totalBlock > 0) {
      const absorbed = Math.min(totalBlock, rawDamage);
      let remDmg = rawDamage;

      // Absorb from previousRoundBlock first
      if (prevBlock > 0) {
        const absPrev = Math.min(prevBlock, remDmg);
        prevBlock -= absPrev;
        remDmg -= absPrev;
      }
      // Absorb remaining from currentRoundBlock
      if (remDmg > 0 && currBlock > 0) {
        const absCurr = Math.min(currBlock, remDmg);
        currBlock -= absCurr;
        remDmg -= absCurr;
      }

      updated.previousRoundBlock = prevBlock;
      updated.currentRoundBlock = currBlock;
      updated.block = prevBlock + currBlock;
      updated.hp = Math.max(0, updated.hp - remDmg);
      return { hero: updated, absorbed, hpLost: remDmg };
    } else {
      updated.hp = Math.max(0, updated.hp - rawDamage);
      return { hero: updated, absorbed: 0, hpLost: rawDamage };
    }
  };

  // Process Reactions & Status Ticks at the Start of a Hero's Movement Phase
  const processStartOfMovementPhase = (heroId, heroesList, bossState) => {
    const targetHero = heroesList.find((h) => h.id === heroId);
    if (!targetHero || targetHero.isKo) return heroesList;

    let updatedHero = { ...targetHero };
    let logs = [];
    let reactionOccurred = false;
    let reactionText = '';

    // 1. Check Burned Tick Damage (Lose 1 HP at start of turn)
    if (updatedHero.isBurned) {
      updatedHero.hp = Math.max(0, updatedHero.hp - 1);
      logs.push({ text: `🌋 ${updatedHero.name} is BURNED and lost 1 HP at start of movement phase! (${updatedHero.hp}/${updatedHero.maxHp} HP)`, type: 'reaction' });
      if (updatedHero.hp <= 0 && !updatedHero.isKo) {
        updatedHero.isKo = true;
        updatedHero.koCount += 1;
        updatedHero.maxStamina = calculateEffectiveMaxStamina(updatedHero);
        logs.push({ text: `💀 ${updatedHero.name} was KNOCKED OUT by Burn damage! (Max Stamina reduced to ${updatedHero.maxStamina})`, type: 'reaction' });
      }
    }

    // 2. Check Boss Reaction on Start of Movement Phase (Front sector checks — absorbed by Block!)
    if (!updatedHero.isKo) {
      const relativePos = getRelativeSector(updatedHero.sector, bossState.facingSector);
      if (relativePos === 'front') {
        reactionOccurred = true;
        if (updatedHero.isThreatened) {
          // Threatened hero starting movement phase in front sector: Take 3 additional damage (8 total damage: 5 base + 3 threatened) + Become Burned!
          const dmg = config.boss.frontSectorDamage + config.boss.threatenedFrontDamage; // 5 + 3 = 8 damage
          const result = applyDamageWithBlock(updatedHero, dmg);
          updatedHero = result.hero;
          updatedHero.isBurned = true;

          reactionText = `🔥 DRAGON REACTION: ${updatedHero.name} started movement phase THREATENED in the FRONT Sector! Took ${dmg} Total Damage (5 base + 3 threatened)${result.absorbed > 0 ? ` (${result.absorbed} absorbed by Block, lost ${result.hpLost} HP)` : ''} and became BURNED!`;
          logs.push({ text: reactionText, type: 'reaction' });
        } else {
          // Hero starting movement phase in front sector: Take 5 damage
          const dmg = config.boss.frontSectorDamage;
          const result = applyDamageWithBlock(updatedHero, dmg);
          updatedHero = result.hero;

          reactionText = `🔥 DRAGON REACTION: ${updatedHero.name} started movement phase in the FRONT Sector! Took ${dmg} Damage${result.absorbed > 0 ? ` (${result.absorbed} absorbed by Block, lost ${result.hpLost} HP)` : ''}!`;
          logs.push({ text: reactionText, type: 'reaction' });
        }

        // Check if reaction KO'd the hero
        if (updatedHero.hp <= 0) {
          updatedHero.hp = 0;
          updatedHero.isKo = true;
          updatedHero.koCount += 1;
          updatedHero.maxStamina = calculateEffectiveMaxStamina(updatedHero);
          logs.push({ text: `💀 ${updatedHero.name} was KNOCKED OUT by the Boss reaction! (Max Stamina reduced to ${updatedHero.maxStamina})`, type: 'reaction' });
        }
      }
    }

    // Append logs
    logs.forEach((l) => addLog(l.text, l.type));

    if (reactionOccurred) {
      setPendingReaction({
        title: '🐲 Boss Movement Phase Reaction!',
        description: reactionText
      });
    }

    const updatedList = heroesList.map((h) => (h.id === heroId ? updatedHero : h));

    // Check simultaneous KO defeat condition (PDF 4)
    if (updatedList.length > 0 && updatedList.every((h) => h.isKo)) {
      setGameStatus('defeat');
      setTurnPhase('game_over');
      addLog(`💀 ALL HEROES KNOCKED OUT SIMULTANEOUSLY! DEFEAT!`, 'phase');
    }

    return updatedList;
  };

  // Helper to spend stamina (uses regular stamina first, then bonusStamina)
  const spendStaminaFromHero = (heroObj, costVal) => {
    let updated = { ...heroObj };
    let rem = costVal;
    if (updated.stamina >= rem) {
      updated.stamina -= rem;
    } else {
      rem -= updated.stamina;
      updated.stamina = 0;
      updated.bonusStamina = Math.max(0, (updated.bonusStamina || 0) - rem);
    }
    return updated;
  };

  // Movement Phase Choice
  const handleMovementChoice = (choice, targetSector) => {
    if (turnPhase !== 'movement' || gameStatus !== 'playing') return;

    pushSnapshot();
    let updatedHero = { ...activeHero };
    const moveCost = config.gameRules.movementStaminaCost;
    const availableStamina = updatedHero.stamina + (updatedHero.bonusStamina || 0);

    if (choice === 'move') {
      const validAdjacent = getAdjacentSectors(updatedHero.sector);
      if (!validAdjacent.includes(targetSector)) {
        addLog(`⚠️ Invalid move! ${updatedHero.name} can only move to adjacent sectors (${validAdjacent.map((s) => `Sector ${s} (${config.sectors[s]?.name})`).join(' or ')}).`, 'info');
        return;
      }
      if (availableStamina < moveCost) {
        addLog(`⚠️ ${updatedHero.name} does not have enough stamina to move! (${availableStamina}/${moveCost})`, 'info');
        return;
      }
      updatedHero = spendStaminaFromHero(updatedHero, moveCost);
      updatedHero.sector = targetSector;
      updatedHero.isThreatened = false;
      addLog(`🏃 ${updatedHero.name} spent ${moveCost} Stamina and moved to Sector ${targetSector} (${config.sectors[targetSector]?.name}).`, 'action');
    } else {
      updatedHero.isThreatened = true;
      addLog(`🛑 ${updatedHero.name} chose not to move and became THREATENED!`, 'action');
    }

    // Update hero state
    setHeroes((prev) =>
      prev.map((h) => (h.id === activeHero.id ? updatedHero : h))
    );

    // Transition to Action Phase
    setTurnPhase('action');
  };


  // Perform Action (Attack, Defend, Relic)
  const performAction = (action, targetHeroId = null) => {
    if (turnPhase !== 'action' || gameStatus !== 'playing') return;

    // Passives cannot be explicitly triggered as active actions
    if (action.effectType === 'passive') {
      addLog(`✨ ${action.name} is a passive relic ability and is automatically active!`, 'info');
      return;
    }

    pushSnapshot();
    let updatedHero = { ...activeHero };
    const cost = getActionCost(updatedHero, action.staminaCost);
    const availableStamina = updatedHero.stamina + (updatedHero.bonusStamina || 0);

    if (availableStamina < cost) {
      addLog(`⚠️ Not enough stamina for ${action.name} (Requires ${cost}, Has ${availableStamina})`, 'info');
      return;
    }

    const isAttackAction = action.type === 'attack' || action.damage > 0;
    const canAttackProtected = updatedHero.relicAction?.effectType === 'passive' && updatedHero.relicAction?.canAttackProtected;

    if (isAttackAction) {
      if (updatedHero.isBurned) {
        addLog(`🌋 ${updatedHero.name} is BURNED and cannot take Attack actions this turn!`, 'info');
        return;
      }

      const relativePos = getRelativeSector(updatedHero.sector, boss.facingSector);
      const sectorMod = config.sectorModifiers[relativePos] || { damageMultiplier: 1.0, type: "EXPOSED" };
      const isProtectedSector = sectorMod.type === "PROTECTED" || sectorMod.damageMultiplier === 0;

      if (isProtectedSector && !canAttackProtected) {
        addLog(`🛡️ CANNOT ATTACK! ${updatedHero.name} is in a PROTECTED sector (${relativePos.toUpperCase()}). You cannot take attack actions from a protected sector! Move to an Exposed Sector first.`, 'info');
        return;
      }
    }

    // Deduct stamina (uses regular stamina first, then bonusStamina)
    updatedHero = spendStaminaFromHero(updatedHero, cost);

    // 1. Resolve Defend / Block (Single Hero)
    if (action.block > 0 && !action.effectType) {
      updatedHero.currentRoundBlock = (updatedHero.currentRoundBlock || 0) + action.block;
      updatedHero.block = (updatedHero.previousRoundBlock || 0) + updatedHero.currentRoundBlock;
      addLog(`🛡️ ${updatedHero.name} used ${action.name} (Cost ${cost} Stamina) and gained +${action.block} Block. (Total Block: ${updatedHero.block})`, 'action');
    }

    // 2. Resolve Relic: Fortitude (Give every other hero 2 shield/block & Draw Aggro)
    if (action.effectType === 'grant_party_shield') {
      const shieldVal = action.shieldAmount || 2;
      setHeroes((prev) =>
        prev.map((h) => {
          if (h.id === activeHero.id) return updatedHero;
          if (h.isKo) return h;
          const newCurr = (h.currentRoundBlock || 0) + shieldVal;
          const newTotal = (h.previousRoundBlock || 0) + newCurr;
          return { ...h, currentRoundBlock: newCurr, block: newTotal };
        })
      );
      if (action.drawsAggro) {
        setAggroHeroId(updatedHero.id);
      }
      addLog(`🛡️ ${updatedHero.name} used ${action.name} (Cost ${cost} Stamina) and granted +${shieldVal} Shield to all other living heroes! ${action.drawsAggro ? 'Claimed Aggro Token!' : ''}`, 'action');
      return;
    }

    // 3. Resolve Relic: Wisdom (Give another hero 2 bonus stamina)
    if (action.effectType === 'grant_hero_stamina') {
      const target = heroes.find((h) => h.id === targetHeroId) || heroes.find((h) => h.id !== activeHero.id) || activeHero;
      const stamVal = action.staminaAmount || 2;
      const currentBonus = target.bonusStamina || 0;
      const newBonus = Math.min(2, currentBonus + stamVal);

      setHeroes((prev) =>
        prev.map((h) => {
          if (h.id === target.id) {
            return h.id === activeHero.id
              ? { ...updatedHero, bonusStamina: newBonus }
              : { ...h, bonusStamina: newBonus };
          }
          return h.id === activeHero.id ? updatedHero : h;
        })
      );
      if (action.drawsAggro) {
        setAggroHeroId(updatedHero.id);
      }
      addLog(`🧠 ${updatedHero.name} used ${action.name} (Cost ${cost} Stamina) and granted +${stamVal} Bonus Stamina to ${target.name}! (Bonus Stamina: ${newBonus}/2)`, 'action');
      return;
    }

    // 4. Resolve Relic: Unity (Heal a hero for 2 HP)
    if (action.effectType === 'heal_hero') {
      const target = heroes.find((h) => h.id === targetHeroId) || activeHero;
      const healVal = action.healAmount || 2;
      setHeroes((prev) =>
        prev.map((h) => {
          if (h.id === target.id) {
            const newHp = Math.min(h.maxHp, h.hp + healVal);
            return h.id === activeHero.id
              ? { ...updatedHero, hp: newHp }
              : { ...h, hp: newHp };
          }
          return h.id === activeHero.id ? updatedHero : h;
        })
      );
      if (action.drawsAggro) {
        setAggroHeroId(updatedHero.id);
      }
      addLog(`💖 ${updatedHero.name} used ${action.name} (Cost ${cost} Stamina) and restored +${healVal} HP to ${target.name}!`, 'action');
      return;
    }

    // 5. Resolve Attack / Heavy Attack (Courage, Basic Attack)
    if (action.damage > 0) {
      const relativePos = getRelativeSector(updatedHero.sector, boss.facingSector);
      const sectorMod = config.sectorModifiers[relativePos] || { damageMultiplier: 1.0, type: "EXPOSED", description: "Normal" };
      const rawDmg = action.damage;

      let finalDmg = Math.floor(rawDmg * sectorMod.damageMultiplier);
      const isProtected = sectorMod.type === "PROTECTED" || sectorMod.damageMultiplier === 0;

      // Creativity passive: allows dealing 100% damage even in protected sectors
      if (isProtected && canAttackProtected) {
        finalDmg = rawDmg;
      }

      const sectorTag = isProtected
        ? (canAttackProtected ? "✨ CREATIVITY PASSIVE (Bypasses Protection!)" : "🛡️ PROTECTED (INVULNERABLE / 0% Dmg)")
        : "🎯 EXPOSED (100% Dmg)";

      if (isProtected && finalDmg === 0) {
        addLog(`🛡️ INVULNERABLE! ${updatedHero.name}'s ${action.name} hit ${boss.name}'s PROTECTED side and dealt 0 damage!`, 'action');
      } else {
        addLog(`⚔️ ${updatedHero.name} used ${action.name} against ${boss.name} from ${relativePos.toUpperCase()} sector [${sectorTag}] dealing ${finalDmg} damage!`, 'action');
      }

      // Update Boss HP
      const newBossHp = Math.max(0, boss.hp - finalDmg);
      setBoss((prev) => ({
        ...prev,
        hp: newBossHp,
        isAlive: newBossHp > 0
      }));

      // VICTORY CHECK: Rule - "If a hero action causes the boss's hp to reach 0, do not resolve any reactions."
      if (newBossHp <= 0) {
        setGameStatus('victory');
        setTurnPhase('game_over');
        addLog(`🎉 VICTORY! ${boss.name} has been defeated! The heroes win!`, 'phase');
        setHeroes((prev) => prev.map((h) => (h.id === activeHero.id ? updatedHero : h)));
        return;
      }

      // Resolve Aggro Token Acquisition (PDF 4 Rule)
      if (action.drawsAggro) {
        setAggroHeroId(updatedHero.id);
        addLog(`🎯 AGGRO TOKEN TAKEN! ${updatedHero.name} claimed the Aggro Token!`, 'action');
      }
    }

    // Apply updated hero
    setHeroes((prev) =>
      prev.map((h) => (h.id === activeHero.id ? updatedHero : h))
    );
  };

  // Pass Action Turn to Next Hero or Recovery Phase
  const endHeroTurn = () => {
    if (turnPhase !== 'action' && turnPhase !== 'movement') return;

    pushSnapshot();
    addLog(`⌛ ${activeHero.name} ended their turn.`, 'info');

    // Expire block from previous round at the end of hero's turn
    if (activeHero.previousRoundBlock > 0) {
      addLog(`🛡️ ${activeHero.name}'s turn ended: ${activeHero.previousRoundBlock} Block from previous round expired.`, 'info');
    }

    // Clear burn at end of hero's turn & clear expired previousRoundBlock
    setHeroes((prev) =>
      prev.map((h) => {
        if (h.id === activeHero.id) {
          const remainingCurr = h.currentRoundBlock || 0;
          return {
            ...h,
            isBurned: false,
            previousRoundBlock: 0,
            block: remainingCurr
          };
        }
        return h;
      })
    );

    // Find next hero or transition to recovery
    const nextIndex = currentHeroIndex + 1;
    if (nextIndex < turnOrder.length) {
      const nextHeroId = turnOrder[nextIndex];
      setCurrentHeroIndex(nextIndex);
      setTurnPhase('movement');

      // Pass current boss state; use setHeroes callback for latest heroes
      setHeroes((prevHeroes) => {
        let currentHeroes = prevHeroes.map((h) => {
          if (h.id === activeHero.id) {
            const remainingCurr = h.currentRoundBlock || 0;
            return { ...h, isBurned: false, previousRoundBlock: 0, block: remainingCurr };
          }
          return h;
        });
        // Process start of movement phase reactions for next hero
        const updatedHeroes = processStartOfMovementPhase(nextHeroId, currentHeroes, boss);
        const nextHero = updatedHeroes.find((h) => h.id === nextHeroId);
        if (nextHero && nextHero.isKo) {
          addLog(`💀 ${nextHero.name} is KO'd and loses their turn!`, 'info');
        }
        return updatedHeroes;
      });
    } else {
      // All heroes finished their turn -> Trigger Recovery Phase
      triggerRecoveryPhase();
    }
  };

  // Recovery Phase / End of Round Handler
  const triggerRecoveryPhase = () => {
    addLog(`✨ === END OF ROUND ${round} & RECOVERY PHASE ===`, 'phase');

    // 1. Boss Rotation: "after all heroes take their action, the boss will rotate to face the hero with the aggro token"
    const aggroHolder = heroes.find((h) => h.id === aggroHeroId) || heroes[0];
    let updatedBossFacing = boss.facingSector;
    if (boss.facingSector !== aggroHolder.sector) {
      updatedBossFacing = aggroHolder.sector;
      addLog(`🐉 ${boss.name} rotated to face Sector ${updatedBossFacing} (${config.sectors[updatedBossFacing]?.name}), turning towards ${aggroHolder.name} (Aggro Token Holder)!`, 'reaction');
    }

    let updatedHeroesList = [...heroes];

    // 2. Boss Struggle (Block stays active and absorbs struggle damage!)
    const newStruggle = boss.struggle + 1;
    addLog(`🐉 ${boss.name} gained +1 Struggle (${newStruggle}/${config.boss.struggleThreshold}).`, 'reaction');

    let struggleTriggered = false;
    let struggleText = '';

    if (newStruggle >= config.boss.struggleThreshold) {
      struggleTriggered = true;
      struggleText = `🌋 DRAGON STRUGGLE UNLEASHED! ${boss.name} reached ${config.boss.struggleThreshold} Struggle! Deals ${config.boss.struggleDamage} damage to ALL heroes, plus ${config.boss.struggleThreatenedBonusDamage} bonus damage & BURN to THREATENED heroes!`;
      addLog(struggleText, 'reaction');

      // Apply struggle damage to all heroes (with block absorption)
      updatedHeroesList = updatedHeroesList.map((h) => {
        let updated = { ...h };
        const baseDmg = config.boss.struggleDamage;
        const bonusDmg = updated.isThreatened ? config.boss.struggleThreatenedBonusDamage : 0;
        const totalDmg = baseDmg + bonusDmg;

        const result = applyDamageWithBlock(updated, totalDmg);
        updated = result.hero;
        if (result.absorbed > 0) {
          addLog(`🛡️ ${updated.name}'s Block absorbed ${result.absorbed} Struggle damage!`, 'info');
        }
        if (updated.isThreatened) {
          updated.isBurned = true; // PDF 4 Rule: Threatened heroes also become burned on struggle
        }
        if (updated.hp <= 0 && !updated.isKo) {
          updated.isKo = true;
          updated.koCount += 1;
          updated.maxStamina = calculateEffectiveMaxStamina(updated);
          addLog(`💀 ${updated.name} was KNOCKED OUT by Boss Struggle! (Max Stamina reduced to ${updated.maxStamina})`, 'reaction');
        }
        return updated;
      });
    }

    // 3. End of Round Processing: Revive KO'd heroes, Recover Stamina & Shift Block to Previous Round for Next Round
    updatedHeroesList = updatedHeroesList.map((h) => {
      let updated = { ...h };

      // Revive KO'd heroes with half HP & reduce max stamina by 1 per KO (stacks)
      if (updated.isKo) {
        updated.isKo = false;
        updated.hp = Math.floor(updated.maxHp * config.gameRules.koReviveHpPercent);
        updated.maxStamina = calculateEffectiveMaxStamina(updated);
        updated.stamina = updated.maxStamina;
        updated.block = 0;
        updated.previousRoundBlock = 0;
        updated.currentRoundBlock = 0;
        addLog(`💖 ${updated.name} revived with ${updated.hp} HP! (Max stamina reduced to ${updated.maxStamina} due to KO penalty)`, 'info');
      } else {
        // Recover stamina (bonus stamina persists!)
        updated.maxStamina = calculateEffectiveMaxStamina(updated);
        updated.stamina = updated.maxStamina;

        if (updated.isBurned) {
          updated.isBurned = false;
          addLog(`❄️ ${updated.name} recovered from Burn.`, 'info');
        }

        // Shift currentRoundBlock to previousRoundBlock for the upcoming round (lasts until end of hero's next turn)
        const currentBlockToCarry = updated.currentRoundBlock || 0;
        updated.previousRoundBlock = currentBlockToCarry;
        updated.currentRoundBlock = 0;
        updated.block = currentBlockToCarry;
      }

      return updated;
    });

    const updatedBoss = {
      ...boss,
      facingSector: updatedBossFacing,
      struggle: struggleTriggered ? 0 : newStruggle
    };
    setBoss(updatedBoss);

    if (struggleTriggered) {
      setPendingReaction({
        title: '💥 Boss Struggle Unleashed!',
        description: struggleText
      });
    }

    // Check simultaneous KO defeat condition (PDF 4)
    if (updatedHeroesList.length > 0 && updatedHeroesList.every((h) => h.isKo)) {
      setGameStatus('defeat');
      setTurnPhase('game_over');
      addLog(`💀 ALL HEROES KNOCKED OUT SIMULTANEOUSLY! DEFEAT!`, 'phase');
      setHeroes(updatedHeroesList);
      return;
    }

    // Round progression check
    const nextRound = round + 1;
    if (nextRound > config.gameRules.maxRounds) {
      setGameStatus('defeat');
      setTurnPhase('game_over');
      addLog(`⏳ DEFEAT! Allotted time (${config.gameRules.maxRounds} rounds) expired before defeating the Boss!`, 'phase');
      setHeroes(updatedHeroesList);
      return;
    }

    // PDF 4 Rule: "the player with the aggro token goes first each round, then play goes in order"
    const aggroIndex = updatedHeroesList.findIndex((h) => h.id === aggroHeroId);
    const validAggroIdx = aggroIndex >= 0 ? aggroIndex : 0;
    const newTurnOrder = [
      ...updatedHeroesList.slice(validAggroIdx),
      ...updatedHeroesList.slice(0, validAggroIdx)
    ].map((h) => h.id);

    setTurnOrder(newTurnOrder);
    setRound(nextRound);
    setCurrentHeroIndex(0);
    setTurnPhase('movement');

    const firstHeroId = newTurnOrder[0];
    addLog(`🔄 Round ${nextRound} Started! Turn Order: ${newTurnOrder.map((id) => updatedHeroesList.find((h) => h.id === id)?.name).join(' ➔ ')} (${updatedHeroesList.find((h) => h.id === aggroHeroId)?.name} holds Aggro Token).`, 'phase');

    // Trigger movement phase start reactions for first hero in new round
    setHeroes(processStartOfMovementPhase(firstHeroId, updatedHeroesList, updatedBoss));
  };

  // DM / Playtester Manual Overrides
  const updateHeroStat = (heroId, field, value) => {
    setHeroes((prev) =>
      prev.map((h) => {
        if (h.id !== heroId) return h;
        let updated = { ...h, [field]: value };

        // Handle DM KO toggles and HP reductions to 0
        if (field === 'hp' && value <= 0 && !h.isKo) {
          updated.hp = 0;
          updated.isKo = true;
          updated.koCount = (h.koCount || 0) + 1;
        } else if (field === 'isKo' && value === true && !h.isKo) {
          updated.hp = 0;
          updated.isKo = true;
          updated.koCount = (h.koCount || 0) + 1;
        } else if (field === 'isKo' && value === false && h.isKo) {
          updated.isKo = false;
          if (updated.hp <= 0) {
            updated.hp = Math.floor((h.maxHp || 10) * config.gameRules.koReviveHpPercent);
          }
        }

        // Recalculate effective maxStamina upon any DM override
        updated.maxStamina = calculateEffectiveMaxStamina(updated);
        updated.stamina = Math.min(updated.stamina, updated.maxStamina);

        return updated;
      })
    );
    addLog(`🛠️ [DM Override] Updated ${heroId} ${field} to ${value}`, 'info');
  };

  const updateBossStat = (field, value) => {
    setBoss((prev) => ({ ...prev, [field]: value }));
    addLog(`🛠️ [DM Override] Updated Boss ${field} to ${value}`, 'info');
  };

  // Add & Remove Hero/Player Functions
  const addHero = (newHeroData) => {
    const newId = newHeroData?.id || `hero_${Date.now()}`;
    const heroNumber = heroes.length + 1;
    const heroObj = {
      id: newId,
      name: newHeroData?.name || `Player ${heroNumber}`,
      maxHp: newHeroData?.maxHp || 10,
      hp: newHeroData?.maxHp || 10,
      maxStamina: newHeroData?.maxStamina || 3,
      stamina: newHeroData?.maxStamina || 3,
      block: 0,
      sector: newHeroData?.sector !== undefined ? newHeroData.sector : (heroNumber - 1) % 4,
      isThreatened: false,
      isBurned: false,
      isKo: false,
      koCount: 0,
      turnsSkipped: 0,
      relicName: newHeroData?.relicName || "Mystic Relic",
      relicAction: newHeroData?.relicAction || {
        id: `relic_${newId}`,
        name: "Power Strike",
        staminaCost: 2,
        damage: 2,
        block: 0,
        drawsAggro: true,
        description: "Deal 2 damage to the boss. Draws Aggro.",
        type: "attack"
      }
    };

    setHeroes((prev) => [...prev, heroObj]);
    setTurnOrder((prev) => [...prev, newId]);
    setConfig((prev) => ({
      ...prev,
      heroes: [...prev.heroes, heroObj]
    }));
    addLog(`➕ Added new player: ${heroObj.name} (Sector ${heroObj.sector})`, 'info');
  };

  const removeHero = (heroId) => {
    if (heroes.length <= 1) {
      addLog(`⚠️ Cannot remove player! At least 1 player is required.`, 'info');
      return;
    }

    const heroToRemove = heroes.find((h) => h.id === heroId);
    setHeroes((prev) => prev.filter((h) => h.id !== heroId));
    setTurnOrder((prev) => prev.filter((id) => id !== heroId));
    setConfig((prev) => ({
      ...prev,
      heroes: prev.heroes.filter((h) => h.id !== heroId)
    }));

    if (aggroHeroId === heroId) {
      const remaining = heroes.filter((h) => h.id !== heroId);
      if (remaining.length > 0) {
        setAggroHeroId(remaining[0].id);
      }
    }

    setCurrentHeroIndex((prevIdx) => {
      if (prevIdx >= heroes.length - 1) {
        return Math.max(0, heroes.length - 2);
      }
      return prevIdx;
    });

    addLog(`🗑️ Removed player: ${heroToRemove ? heroToRemove.name : heroId}`, 'info');
  };

  const dismissReactionModal = () => {
    setPendingReaction(null);
  };

  return (
    <GameContext.Provider
      value={{
        config,
        setConfig,
        round,
        currentHeroIndex,
        activeHero,
        turnPhase,
        gameStatus,
        aggroHeroId,
        setAggroHeroId,
        turnOrder,
        boss,
        heroes,
        gameLog,
        pendingReaction,
        canUndo: history.length > 0,
        undoTurn,
        dismissReactionModal,
        handleMovementChoice,
        performAction,
        endHeroTurn,
        resetGame,
        setHeroStartingSector,
        startBattle,
        getActionCost,
        updateHeroStat,
        updateBossStat,
        addHero,
        removeHero,
        addLog
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
