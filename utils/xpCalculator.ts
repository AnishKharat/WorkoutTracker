export interface MasteryTier {
  tier: number;
  name: string;
  emoji: string;
  multiplier: number;
  xpRequired: number;
}

export const MASTERY_TIERS: MasteryTier[] = [
  { tier: 1, name: 'Novice',      emoji: '🤍', multiplier: 1.0,  xpRequired: 0     },
  { tier: 2, name: 'Apprentice',  emoji: '🟦', multiplier: 1.1,  xpRequired: 1000  },
  { tier: 3, name: 'Skilled',     emoji: '🟨', multiplier: 1.25, xpRequired: 5000  },
  { tier: 4, name: 'Expert',      emoji: '🟧', multiplier: 1.5,  xpRequired: 15000 },
  { tier: 5, name: 'Master',      emoji: '🔴', multiplier: 2.0,  xpRequired: 40000 },
];

export function getMasteryTier(xp: number): MasteryTier {
  let tier = MASTERY_TIERS[0];
  for (const t of MASTERY_TIERS) {
    if (xp >= t.xpRequired) tier = t;
    else break;
  }
  return tier;
}

export function calcStrengthXP(
  sets: number,
  reps: number,
  weightKg: number,
  masteryMultiplier: number = 1.0,
): number {
  const base = sets * reps * weightKg * 0.25;
  return Math.round(base * masteryMultiplier);
}

export function calcCardioXP(durationMins: number): number {
  return Math.round(durationMins * 3);
}

export function getMasteryProgress(xp: number): { current: number; next: number; progress: number } {
  const tier = getMasteryTier(xp);
  const tierIndex = MASTERY_TIERS.indexOf(tier);
  if (tierIndex === MASTERY_TIERS.length - 1) {
    return { current: xp - tier.xpRequired, next: 1, progress: 1 };
  }
  const nextTier = MASTERY_TIERS[tierIndex + 1];
  const band = nextTier.xpRequired - tier.xpRequired;
  const earned = xp - tier.xpRequired;
  return { current: earned, next: band, progress: earned / band };
}
