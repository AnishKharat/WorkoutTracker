import { getRankFromLevel, Rank } from '../constants/ranks';

const BASE = 300;
const MULTIPLIER = 1.8;

/** XP needed to go FROM level N to level N+1 */
export function xpForLevel(level: number): number {
  return Math.floor(BASE * Math.pow(level, MULTIPLIER));
}

/** Total cumulative XP needed to reach a level from scratch */
export function totalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

/** Get current level from total XP */
export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  while (totalXP >= totalXPForLevel(level + 1)) level++;
  return level;
}

/** Get XP progress within the current level */
export function getLevelProgress(totalXP: number): {
  level: number;
  rank: Rank;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const level = getLevelFromXP(totalXP);
  const levelStart = totalXPForLevel(level);
  const levelEnd = totalXPForLevel(level + 1);
  const currentLevelXP = totalXP - levelStart;
  const nextLevelXP = levelEnd - levelStart;
  const progress = currentLevelXP / nextLevelXP;
  const rank = getRankFromLevel(level);
  return { level, rank, currentLevelXP, nextLevelXP, progress };
}
