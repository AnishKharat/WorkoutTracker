export interface Rank {
  minLevel: number;
  title: string;
  emoji: string;
  color: string;
  multiplier: number;
}

export const RANKS: Rank[] = [
  { minLevel: 1, title: 'Rookie', emoji: '\uD83E\uDEB6', color: '#9E9E9E', multiplier: 1.0 },
  { minLevel: 5, title: 'Iron', emoji: '\u26AA', color: '#BDBDBD', multiplier: 1.05 },
  { minLevel: 15, title: 'Bronze', emoji: '\uD83E\uDF89', color: '#CD7F32', multiplier: 1.1 },
  { minLevel: 25, title: 'Silver', emoji: '\uD83D\uDD35', color: '#C0C0C0', multiplier: 1.2 },
  { minLevel: 40, title: 'Gold', emoji: '\uD83D\uDFE0', color: '#FFD700', multiplier: 1.35 },
  { minLevel: 55, title: 'Platinum', emoji: '\uD83D\uDD37', color: '#E5E4E2', multiplier: 1.5 },
  { minLevel: 75, title: 'Elite', emoji: '\uD83D\uDC80', color: '#E53935', multiplier: 1.75 },
  { minLevel: 100, title: 'Legendary', emoji: '\uD83D\uDC79', color: '#FF1744', multiplier: 2.0 },
];

export function getRankFromLevel(level: number): Rank {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r;
    else break;
  }
  return rank;
}
