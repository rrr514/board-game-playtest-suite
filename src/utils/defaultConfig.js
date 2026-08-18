// Default Game Rules and Configuration derived directly from Lakehouse '26 Activity - Roy & Jenna PDF

export const RELIC_PRESETS = [
  {
    id: "fortitude",
    relicName: "Fortitude",
    name: "Fortitude Shield",
    staminaCost: 2,
    damage: 0,
    block: 0,
    drawsAggro: true,
    effectType: "grant_party_shield",
    shieldAmount: 2,
    description: "Give every other hero 2 shield. Draws Aggro.",
    type: "support"
  },
  {
    id: "wisdom",
    relicName: "Wisdom",
    name: "Wisdom Transfer",
    staminaCost: 2,
    damage: 0,
    block: 0,
    drawsAggro: false,
    effectType: "grant_hero_stamina",
    staminaAmount: 2,
    description: "Give another hero 2 bonus stamina*. (*Does not expire/reset, capped at 2)",
    type: "support"
  },
  {
    id: "courage",
    relicName: "Courage",
    name: "Courageous Strike",
    staminaCost: 3,
    damage: 5,
    block: 0,
    drawsAggro: true,
    effectType: "heavy_attack",
    description: "Deal 5 damage to boss. Draws Aggro.",
    type: "attack"
  },
  {
    id: "unity",
    relicName: "Unity",
    name: "Unity Heal",
    staminaCost: 2,
    damage: 0,
    block: 0,
    drawsAggro: false,
    effectType: "heal_hero",
    healAmount: 2,
    description: "Heal a hero for 2 HP. Does not draw aggro.",
    type: "heal"
  },
  {
    id: "creativity",
    relicName: "Creativity",
    name: "Creative Mastery (Passive)",
    staminaCost: 0,
    damage: 0,
    block: 0,
    drawsAggro: false,
    effectType: "passive",
    canAttackProtected: true,
    ignoreFirstKoPenalty: true,
    description: "Passive Abilities: On first KO, no stamina cost penalty. Can attack in protected sectors.",
    type: "passive"
  }
];

export const DEFAULT_CONFIG = {
  boss: {
    name: "Inferno Dragon",
    maxHp: 100,
    facingSector: 0, // 0: North (Front), 1: East (Right Flank), 2: South (Back), 3: West (Left Flank)
    struggleThreshold: 3,
    struggleDamage: 3,
    struggleThreatenedBonusDamage: 2, // Deals 3 base + 2 bonus damage & applies Burned to threatened heroes
    frontSectorDamage: 5, // 5 damage at movement phase start in Front Sector
    threatenedFrontDamage: 3, // 3 damage + Burned at movement phase start in Front Sector when threatened
  },
  gameRules: {
    maxRounds: 10,
    movementStaminaCost: 1,
    koReviveHpPercent: 0.5,
    koStaminaPenaltyPerCount: 1,
  },
  sectors: [
    { id: 0, name: "North", label: "Front Sector", defaultRelative: "Front" },
    { id: 1, name: "East", label: "Right Flank", defaultRelative: "Flank" },
    { id: 2, name: "South", label: "Back Sector", defaultRelative: "Back" },
    { id: 3, name: "West", label: "Left Flank", defaultRelative: "Flank" },
  ],
  sectorModifiers: {
    front: { type: "EXPOSED", damageMultiplier: 1.0, label: "Exposed (Front)", description: "EXPOSED / Vulnerable (100% Dmg Dealt)" },
    back: { type: "EXPOSED", damageMultiplier: 1.0, label: "Exposed (Rear)", description: "EXPOSED / Vulnerable (100% Dmg Dealt)" },
    flank: { type: "PROTECTED", damageMultiplier: 0.0, label: "Protected (Flank)", description: "PROTECTED / Invulnerable (0% Dmg Dealt)" },
  },
  universalActions: [
    {
      id: "attack",
      name: "Basic Attack",
      staminaCost: 1,
      damage: 1,
      block: 0,
      drawsAggro: true,
      description: "Deal 1 damage to boss. Draws Aggro (boss turns to face you).",
      type: "attack"
    },
    {
      id: "defend",
      name: "Defend",
      staminaCost: 1,
      damage: 0,
      block: 1,
      drawsAggro: false,
      description: "Gain 1 block. Does not draw aggro.",
      type: "defend"
    }
  ],
  heroes: [
    {
      id: "hero_1",
      name: "Alice (Fortitude)",
      maxHp: 10,
      maxStamina: 3,
      sector: 0,
      relicName: "Fortitude",
      relicAction: { ...RELIC_PRESETS[0] }
    },
    {
      id: "hero_2",
      name: "Bob (Wisdom)",
      maxHp: 10,
      maxStamina: 3,
      sector: 1,
      relicName: "Wisdom",
      relicAction: { ...RELIC_PRESETS[1] }
    },
    {
      id: "hero_3",
      name: "Charlie (Courage)",
      maxHp: 10,
      maxStamina: 3,
      sector: 2,
      relicName: "Courage",
      relicAction: { ...RELIC_PRESETS[2] }
    },
    {
      id: "hero_4",
      name: "David (Unity)",
      maxHp: 10,
      maxStamina: 3,
      sector: 3,
      relicName: "Unity",
      relicAction: { ...RELIC_PRESETS[3] }
    },
    {
      id: "hero_5",
      name: "Eve (Creativity)",
      maxHp: 10,
      maxStamina: 3,
      sector: 0,
      relicName: "Creativity",
      relicAction: { ...RELIC_PRESETS[4] }
    }
  ]
};

/**
 * Calculates sector position relative to Boss Facing sector.
 * @param {number} heroSector - 0 to 3
 * @param {number} bossFacing - 0 to 3
 * @returns {"front" | "back" | "flank"}
 */
export function getRelativeSector(heroSector, bossFacing) {
  const diff = (heroSector - bossFacing + 4) % 4;
  if (diff === 0) return "front";
  if (diff === 2) return "back";
  return "flank";
}

/**
 * Returns valid adjacent sector IDs for a given sector ID in a 4-sector circular layout.
 * @param {number} sectorId - 0 to 3
 * @returns {number[]} array of 2 adjacent sector IDs
 */
export function getAdjacentSectors(sectorId) {
  return [(sectorId + 3) % 4, (sectorId + 1) % 4];
}

