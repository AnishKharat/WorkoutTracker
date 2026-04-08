# Anish's Workout Tracker — Implementation Plan

A React Native (Expo) personal workout app with dark red aesthetic, XP/leveling, streak tracking, body heatmap, and local notifications. Built entirely with local storage — no backend.

---

## Proposed Changes

### Project Scaffold

#### [NEW] Expo TypeScript project at `workout tracker/`

Initialize with `npx create-expo-app@latest . --template blank-typescript` and install:

| Package | Purpose |
|---|---|
| `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/stack` | Navigation |
| `react-native-screens`, `react-native-safe-area-context` | Navigation deps |
| `@react-native-async-storage/async-storage` | Persistent storage |
| `zustand` + `zustand/middleware` | State management |
| `react-native-svg` | SVG body heatmap |
| `react-native-reanimated` | Pulse glow animations |
| `expo-notifications` | Local push notifications |
| `expo-task-manager` | Background tasks |
| `expo-background-fetch` | 8 AM nightly check |
| `@expo-google-fonts/inter` | Inter font |

---

### Constants & Utils

#### [NEW] `constants/colors.ts`
App-wide color tokens: `#0A0A0A`, `#E53935`, `#1A1A1A`, etc.

#### [NEW] `constants/ranks.ts`
Level → rank title mapping (Rookie → Iron → Bronze → Silver → Gold → Platinum → Elite → Legendary).

#### [NEW] `constants/exercises.ts`
Full preset exercise list (~70+ exercises) with muscle group tags. Cardio types included.

#### [NEW] `utils/xpCalculator.ts`
- `calcStrengthXP(sets, reps, weight, masteryMultiplier)`
- `getMasteryTier(xp)` → tier 1–5 + multiplier
- `calcCardioXP(duration)`

#### [NEW] `utils/levelCalculator.ts`
- `xpForLevel(level)` — `300 × level^1.8`
- `getLevelFromXP(totalXP)`
- `getRankFromLevel(level)`

#### [NEW] `utils/muscleHeatmap.ts`
- `getMuscleColour(xp)` — linear interpolation across 6 gradient stops
- `shouldGlow(lastTrainedDate)` — trained within 7 days

#### [NEW] `utils/notificationScheduler.ts`
- `scheduleAlarmNotifications(alarm)` — on-time + 15-min warning
- `checkMissedWorkout()` — morning check logic

#### [NEW] `utils/dateHelpers.ts`
- `getTodayString()`, `getYesterdayString()`, `daysAgo(n)`

---

### State Management

#### [NEW] `store/useUserStore.ts` (Zustand + AsyncStorage persistence)
Tracks: `totalXP`, `level`, `rank`, `exerciseMastery`, `muscleGroupXP`, `dayLogs`.

#### [NEW] `store/useWorkoutStore.ts`
Active workout session state: current exercise, sets logged, session XP total.

---

### Components

#### [NEW] `components/XPBar.tsx`
Animated progress bar showing XP progress toward next level.

#### [NEW] `components/RankBadge.tsx`
Emoji + rank title pill badge.

#### [NEW] `components/MasteryBadge.tsx`
5-tier mastery emoji badge shown on exercise card.

#### [NEW] `components/ExerciseXPBar.tsx`
Small XP bar on exercise card for per-exercise mastery progress.

#### [NEW] `components/ExerciseCard.tsx`
Card for an exercise entry: name, mastery badge, XP bar, set/rep/weight inputs.

#### [NEW] `components/StreakCalendar.tsx`
GitHub-style monthly heatmap grid. 4 tile states (empty/workout/rest/missed). Shows 🔥 streak counter.

#### [NEW] `components/BodyFront.tsx`
SVG front torso with named muscle paths. Fill driven by `getMuscleColour(xp)`. Pulse glow via Reanimated when trained recently.

#### [NEW] `components/BodyBack.tsx`
SVG back torso with named paths.

#### [NEW] `components/MuscleTooltip.tsx`
Bottom sheet / overlay showing muscle XP, mastery, last trained date on muscle tap.

---

### Screens

#### [NEW] `screens/HomeScreen.tsx`
- "Welcome back, Anish 👊" header
- Level badge + rank title + XP bar
- Today's streak status
- Quick-access: Start Workout / Log Cardio / Rest Day buttons
- Rest Day logic (undo before midnight, max 2 consecutive)

#### [NEW] `screens/WorkoutScreen.tsx`
- Exercise picker → sets/reps/weight inputs per exercise
- Add multiple exercises per session
- Save → award XP (global + exercise pool)
- Level-up / mastery-up animation modal

#### [NEW] `screens/CardioScreen.tsx`
- Cardio type selector (6 types)
- Duration + optional distance inputs
- Save → award XP

#### [NEW] `screens/ExercisePickerScreen.tsx`
- Browse preset by muscle group
- "+ Add Custom Exercise" with name + muscle group picker

#### [NEW] `screens/BodyHeatmapScreen.tsx`
- Swipeable front/back SVG heatmap
- Tap muscle → MuscleTooltip

#### [NEW] `screens/AlarmScreen.tsx`
- List saved alarms with toggle/delete
- Tap to edit: time, days, label
- "+ Add Alarm" button
- Shows next scheduled fire time

#### [NEW] `screens/ProfileScreen.tsx`
- Global XP, level, rank
- All exercises with mastery tier + XP bar

---

### Navigation

#### [NEW] `App.tsx`
Bottom tab navigator (5 tabs): Home, Workout, Heatmap, Alarms, Profile. Workout tab uses Stack for ExercisePicker.

---

## Verification Plan

### Manual Testing (Expo Go)

> **Run**: `npx expo start` in the project directory, then scan QR code with Expo Go on Android/iOS

1. **Home Screen** — Launch app, verify greeting, XP bar, streak 0, buttons present
2. **Workout Logging** — Tap Start Workout → pick Chest → Bench Press → enter 3 sets / 10 reps / 60 kg → Save → verify XP awarded = 450 (Novice) shown in toast/animation
3. **Streak Calendar** — Verify today's tile turns green after logging workout
4. **Rest Day** — Tap Rest Day on Home → calendar tile turns blue → streak not broken
5. **Level Up** — Demo by adding large XP manually → verify level-up modal fires
6. **Cardio** — Log 30 min Running → verify +90 XP
7. **Body Heatmap** — Open Heatmap screen → Chest region is red after Bench Press XP → tap chest → tooltip shows XP + last trained
8. **Alarms** — Create alarm at current time + 1 min on current day → verify notification fires
9. **Custom Exercise** — Create "Zercher Squat" under Legs → it appears in picker → log it → XP awarded

### Automated Logic Tests (unit — run in Node)
```
node -e "const {getLevelFromXP} = require('./utils/levelCalculator'); console.log(getLevelFromXP(300))" 
```
Verify output is `2`.
