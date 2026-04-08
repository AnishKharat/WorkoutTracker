const GRADIENT_STOPS = [
  { xp: 0,       color: [42,  42,  42]  },  // #2A2A2A
  { xp: 1000,    color: [92,  26,  26]  },  // #5C1A1A
  { xp: 5000,    color: [155, 34,  34]  },  // #9B2222
  { xp: 15000,   color: [211, 47,  47]  },  // #D32F2F
  { xp: 40000,   color: [229, 57,  53]  },  // #E53935
  { xp: 100000,  color: [255, 23,  68]  },  // #FF1744
];

export function getMuscleColour(xp: number): string {
  if (xp >= GRADIENT_STOPS[GRADIENT_STOPS.length - 1].xp) {
    const c = GRADIENT_STOPS[GRADIENT_STOPS.length - 1].color;
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    const lo = GRADIENT_STOPS[i];
    const hi = GRADIENT_STOPS[i + 1];
    if (xp >= lo.xp && xp < hi.xp) {
      const t = (xp - lo.xp) / (hi.xp - lo.xp);
      const r = Math.round(lo.color[0] + t * (hi.color[0] - lo.color[0]));
      const g = Math.round(lo.color[1] + t * (hi.color[1] - lo.color[1]));
      const b = Math.round(lo.color[2] + t * (hi.color[2] - lo.color[2]));
      return `rgb(${r},${g},${b})`;
    }
  }
  return `rgb(42,42,42)`;
}

export function shouldGlow(lastTrainedDate: string | undefined): boolean {
  if (!lastTrainedDate) return false;
  const diff = Date.now() - new Date(lastTrainedDate).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

export function trainedToday(lastTrainedDate: string | undefined): boolean {
  if (!lastTrainedDate) return false;
  return lastTrainedDate === new Date().toISOString().split('T')[0];
}
