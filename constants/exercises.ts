export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Legs'
  | 'Arms'
  | 'Core'
  | 'Cardio';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: string;
  isCustom?: boolean;
}

export const PRESET_EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench-press',             name: 'Bench Press',                   muscleGroup: 'Chest' },
  { id: 'incline-bench-press',     name: 'Incline Bench Press',           muscleGroup: 'Chest' },
  { id: 'decline-bench-press',     name: 'Decline Bench Press',           muscleGroup: 'Chest' },
  { id: 'db-bench-press',          name: 'Dumbbell Bench Press',          muscleGroup: 'Chest' },
  { id: 'incline-db-bench-press',  name: 'Incline Dumbbell Bench Press',  muscleGroup: 'Chest' },
  { id: 'decline-db-bench-press',  name: 'Decline Dumbbell Bench Press',  muscleGroup: 'Chest' },
  { id: 'dumbbell-fly',            name: 'Dumbbell Fly',                  muscleGroup: 'Chest' },
  { id: 'cable-fly',               name: 'Cable Fly',                     muscleGroup: 'Chest' },
  { id: 'push-up',                 name: 'Push-Up',                       muscleGroup: 'Chest' },
  { id: 'dips-chest',              name: 'Dips',                          muscleGroup: 'Chest' },
  { id: 'pec-dec',                 name: 'Pec-Dec',                       muscleGroup: 'Chest' },

  // Back
  { id: 'pull-up',                 name: 'Pull-Up',                       muscleGroup: 'Back' },
  { id: 'chin-up',                 name: 'Chin-Up',                       muscleGroup: 'Back' },
  { id: 'barbell-row',             name: 'Barbell Row',                   muscleGroup: 'Back' },
  { id: 'dumbbell-row',            name: 'Dumbbell Row',                  muscleGroup: 'Back' },
  { id: 'single-arm-db-row',       name: 'Single Arm Dumbbell Row',       muscleGroup: 'Back' },
  { id: 'lat-pulldown',            name: 'Lat Pulldown',                  muscleGroup: 'Back' },
  { id: 'seated-cable-row',        name: 'Seated Cable Row',              muscleGroup: 'Back' },
  { id: 'chest-supported-row',     name: 'Chest Supported Row',           muscleGroup: 'Back' },
  { id: 'deadlift',                name: 'Deadlift',                      muscleGroup: 'Back' },
  { id: 'face-pull',               name: 'Face Pull',                     muscleGroup: 'Back' },
  { id: 'lat-prayers',             name: 'Lat Prayers',                   muscleGroup: 'Back' },
  { id: 't-bar-row',               name: 'T-Bar Row',                     muscleGroup: 'Back' },

  // Shoulders
  { id: 'overhead-press',          name: 'Overhead Press',                muscleGroup: 'Shoulders' },
  { id: 'db-shoulder-press',       name: 'Dumbbell Shoulder Press',       muscleGroup: 'Shoulders' },
  { id: 'db-lateral-raise',        name: 'Dumbbell Lateral Raise',        muscleGroup: 'Shoulders' },
  { id: 'db-front-raise',          name: 'Dumbbell Front Raise',          muscleGroup: 'Shoulders' },
  { id: 'db-shrugs',               name: 'Dumbbell Shrugs',               muscleGroup: 'Shoulders' },
  { id: 'shrugs',                  name: 'Shrugs',                        muscleGroup: 'Shoulders' },
  { id: 'reverse-fly',             name: 'Reverse Fly',                   muscleGroup: 'Shoulders' },
  { id: 'db-reverse-fly',          name: 'Dumbbell Reverse Fly',          muscleGroup: 'Shoulders' },
  { id: 'front-raise',             name: 'Front Raise',                   muscleGroup: 'Shoulders' },

  // Legs
  { id: 'squat',                   name: 'Squat',                         muscleGroup: 'Legs' },
  { id: 'front-squat',             name: 'Front Squat',                   muscleGroup: 'Legs' },
  { id: 'goblet-squat',            name: 'Goblet Squat',                  muscleGroup: 'Legs' },
  { id: 'hacksquat',               name: 'Hack Squat',                    muscleGroup: 'Legs' },
  { id: 'leg-press',               name: 'Leg Press',                     muscleGroup: 'Legs' },
  { id: 'romanian-deadlift',       name: 'Romanian Deadlift',             muscleGroup: 'Legs' },
  { id: 'db-rdl',                  name: 'Dumbbell Romanian Deadlift',    muscleGroup: 'Legs' },
  { id: 'bulgarian-split-squat',   name: 'Bulgarian Split Squat',         muscleGroup: 'Legs' },
  { id: 'lunges',                  name: 'Lunges',                        muscleGroup: 'Legs' },
  { id: 'db-lunges',               name: 'Dumbbell Lunges',               muscleGroup: 'Legs' },
  { id: 'leg-curl',                name: 'Leg Curl',                      muscleGroup: 'Legs' },
  { id: 'leg-extension',           name: 'Leg Extension',                 muscleGroup: 'Legs' },
  { id: 'calf-raise',              name: 'Calf Raise',                    muscleGroup: 'Legs' },
  { id: 'db-calf-raise',           name: 'Dumbbell Calf Raise',           muscleGroup: 'Legs' },

  // Arms
  { id: 'barbell-curl',            name: 'Barbell Curl',                  muscleGroup: 'Arms' },
  { id: 'dumbbell-curl',           name: 'Dumbbell Curl',                 muscleGroup: 'Arms' },
  { id: 'hammer-curl',             name: 'Hammer Curl',                   muscleGroup: 'Arms' },
  { id: 'db-hammer-curl',          name: 'Dumbbell Hammer Curl',          muscleGroup: 'Arms' },
  { id: 'preacher-curl',           name: 'Preacher Curl',                 muscleGroup: 'Arms' },
  { id: 'db-preacher-curl',        name: 'Dumbbell Preacher Curl',        muscleGroup: 'Arms' },
  { id: 'tricep-pushdown',         name: 'Tricep Pushdown',               muscleGroup: 'Arms' },
  { id: 'single-arm-pushdown',     name: 'Single Arm Tricep Pushdown',    muscleGroup: 'Arms' },
  { id: 'db-tricep-pushdown',      name: 'Dumbbell Tricep Pushdown',      muscleGroup: 'Arms' },
  { id: 'skull-crusher',           name: 'Skull Crusher',                 muscleGroup: 'Arms' },
  { id: 'db-skull-crusher',        name: 'Dumbbell Skull Crusher',        muscleGroup: 'Arms' },
  { id: 'overhead-tricep',         name: 'Overhead Tricep Extension',     muscleGroup: 'Arms' },
  { id: 'single-arm-overhead',     name: 'Single Arm Overhead Tricep Extension', muscleGroup: 'Arms' },
  { id: 'db-overhead-tricep',      name: 'Dumbbell Overhead Tricep Extension', muscleGroup: 'Arms' },
  { id: 'wrist-curls',             name: 'Wrist Curls',                   muscleGroup: 'Arms' },
  { id: 'reverse-wrist-curls',     name: 'Reverse Wrist Curls',           muscleGroup: 'Arms' },

  // Core
  { id: 'plank',                   name: 'Plank',                         muscleGroup: 'Core' },
  { id: 'crunch',                  name: 'Crunch',                        muscleGroup: 'Core' },
  { id: 'hanging-leg-raise',       name: 'Hanging Leg Raise',             muscleGroup: 'Core' },
  { id: 'leg-raises',              name: 'Leg Raises',                    muscleGroup: 'Core' },
  { id: 'cable-crunch',            name: 'Cable Crunch',                  muscleGroup: 'Core' },
  { id: 'russian-twist',           name: 'Russian Twist',                 muscleGroup: 'Core' },
  { id: 'ab-wheel',                name: 'Ab Wheel Rollout',              muscleGroup: 'Core' },

  // Cardio
  { id: 'running',                 name: 'Running',                       muscleGroup: 'Cardio' },
  { id: 'cycling',                 name: 'Cycling',                       muscleGroup: 'Cardio' },
  { id: 'swimming',                name: 'Swimming',                      muscleGroup: 'Cardio' },
  { id: 'jump-rope',               name: 'Jump Rope',                     muscleGroup: 'Cardio' },
  { id: 'walking',                 name: 'Walking',                       muscleGroup: 'Cardio' },
  { id: 'rowing-machine',          name: 'Rowing Machine',                muscleGroup: 'Cardio' },
  { id: 'stair-climber',           name: 'Stair Climber',                 muscleGroup: 'Cardio' },
  { id: 'hiit',                    name: 'HIIT',                          muscleGroup: 'Cardio' },
];

// Maps muscle group → body heatmap region XP accumulation
export const MUSCLE_GROUP_MAP: Record<string, string[]> = {
  Chest:      ['Chest'],
  Back:       ['Lats', 'Rhomboids', 'Lower Back', 'Traps', 'Rear Delts'],
  Shoulders:  ['Shoulders', 'Traps', 'Rear Delts'],
  Legs:       ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Arms:       ['Biceps', 'Triceps'],
  Core:       ['Abs'],
  Cardio:     [],
};

export const CARDIO_TYPES = [
  { id: 'running',      name: 'Running',      emoji: '🏃' },
  { id: 'cycling',      name: 'Cycling',      emoji: '🚴' },
  { id: 'swimming',     name: 'Swimming',     emoji: '🏊' },
  { id: 'jump-rope',    name: 'Jump Rope',    emoji: '⏱️' },
  { id: 'walking',      name: 'Walking',      emoji: '🚶' },
  { id: 'rowing',       name: 'Rowing',       emoji: '🚣' },
  { id: 'stair-climber',name: 'Stair Climber',emoji: '🏔️' },
  { id: 'hiit',         name: 'HIIT',         emoji: '⚡' },
];

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Cardio',
];
