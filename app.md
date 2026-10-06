# 💪 Anish's Workout Tracker — Vibe Coding Doc

## Project Overview
A **React Native** mobile workout tracker app for personal use. Dark, aggressive aesthetic with black and red as the primary color palette. Gamified fitness experience with XP, leveling, and streaks.

---

## 🎨 Design & Theme

- **Primary Background:** `#0A0A0A` (near black)
- **Accent / Highlight:** `#E53935` (bold red)
- **Secondary Background:** `#1A1A1A` (card surfaces)
- **Text Primary:** `#FFFFFF`
- **Text Muted:** `#888888`
- **Success / Active:** `#4CAF50` (green, for streak days)
- **Font Style:** Bold, modern — something like *Inter* or *Rajdhani*
 am anish kharat
---

## 📱 Screens & Features

### 1. Home / Dashboard Screen
- Greets the user with: **"Welcome back, Anish 👊"**
- Shows current XP, level badge, and rank title
- Shows today's streak status
- Quick-access buttons: Start Workout, Log Cardio

---

### 2. Workout Streak (GitHub-style Heatmap)
- Displays a **monthly calendar grid** (similar to GitHub's contribution graph)
- Each day starts as a dark/empty tile
- Streak counter displayed at the top (e.g. 🔥 7 Day Streak)
- Data persisted locally (AsyncStorage or SQLite)

#### Day Tile States

| State | Colour | Meaning |
|-------|--------|---------|
| Empty | `#2A2A2A` dark grey | No activity logged |
| Workout | `#4CAF50` green | Workout logged |
| Rest Day | `#1565C0` blue | Manually marked as rest |
| Missed | `#B71C1C` dark red | No log, no rest, streak broken |

#### Rest Day Button
- A **"Rest Day"** button lives on the Home screen (alongside Start Workout / Log Cardio)
- Tapping it marks today as a **planned rest day**
- Rest days **count as active streak days** — the streak does not break
- The heatmap tile turns **blue** instead of green to distinguish rest from training
- You can only mark a rest day **once per day**, and it can be **undone before midnight** if you decide to train after all
- Rest days are **capped at 2 consecutive days** — marking 3 or more in a row breaks the streak (prevents abuse)

#### Missed Workout Notification Interaction
- If a day is marked as Rest → the **missed workout notification is suppressed** for that day
- No guilt-trip notification the next morning if rest was intentional

**Component idea:**
```
[ Mo ][ Tu ][ We ][ Th ][ Fr ][ Sa ][ Su ]
[  ⬛ ][  🟩 ][  🟩 ][  🟦 ][  🟩 ][  ⬛ ][  ⬛ ]
                      ^ rest day
```

```ts
// Day log shape (stored per date)
{
  date: "2026-03-25",
  type: "workout" | "rest" | "missed" | "empty",
  workoutId?: "uuid"   // only if type === "workout"
}

// Streak calculation — rest days don't break the chain
function calculateStreak(logs: DayLog[]): number {
  let streak = 0;
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  for (const log of sorted) {
    if (log.type === "workout" || log.type === "rest") streak++;
    else break; // first missed or empty day ends the streak
  }
  return streak;
}
```

---

### 3. Muscle Group Body Heatmap

A **humanoid SVG body diagram** displayed on the home or stats screen. Each muscle group is its own coloured region that evolves as you train it.

#### Layout
- **Two views:** Front and Back, swipeable left/right (or toggled with a button)
- Rendered as an **SVG with named path regions** per muscle group
- Tapping a muscle group opens a mini card showing: total XP, mastery of exercises in that group, and last trained date

#### Colour System

Each muscle region has two independent visual layers:

| Layer | Driven by | Effect |
|-------|-----------|--------|
| **Fill colour** | Total XP in that muscle group | Dark grey → dim red → vivid red → bright crimson as XP grows |
| **Glow / pulse** | Trained within the last 7 days | Soft animated pulse ring around the region |

**Colour gradient (fill, based on XP):**

The fill colour is **continuously interpolated** — not bucketed into tiers. As XP increases, the muscle smoothly transitions through this gradient:

```
#2A2A2A → #5C1A1A → #9B2222 → #D32F2F → #E53935 → #FF1744
(untrained)                                          (elite)
```

| Gradient Stop | Colour | XP Anchor |
|--------------|--------|-----------|
| 0% | `#2A2A2A` | 0 XP |
| 20% | `#5C1A1A` | 1,000 XP |
| 40% | `#9B2222` | 5,000 XP |
| 60% | `#D32F2F` | 15,000 XP |
| 80% | `#E53935` | 40,000 XP |
| 100% | `#FF1744` | 100,000 XP |

XP is mapped to a 0–1 progress value using a **log scale** (so early gains feel visible and rewarding), then linearly interpolated between the nearest two colour stops:

```ts
// Smooth gradient colour from XP
function getMuscleColour(xp: number): string {
  const stops = [
    { xp: 0,       color: [42,  42,  42]  },  // #2A2A2A
    { xp: 1000,    color: [92,  26,  26]  },  // #5C1A1A
    { xp: 5000,    color: [155, 34,  34]  },  // #9B2222
    { xp: 15000,   color: [211, 47,  47]  },  // #D32F2F
    { xp: 40000,   color: [229, 57,  53]  },  // #E53935
    { xp: 100000,  color: [255, 23,  68]  },  // #FF1744
  ];

  // Clamp to last stop beyond max
  if (xp >= stops[stops.length - 1].xp) {
    const c = stops[stops.length - 1].color;
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  // Find surrounding stops
  for (let i = 0; i < stops.length - 1; i++) {
    const lo = stops[i], hi = stops[i + 1];
    if (xp >= lo.xp && xp < hi.xp) {
      const t = (xp - lo.xp) / (hi.xp - lo.xp); // 0–1 within this band
      const r = Math.round(lo.color[0] + t * (hi.color[0] - lo.color[0]));
      const g = Math.round(lo.color[1] + t * (hi.color[1] - lo.color[1]));
      const b = Math.round(lo.color[2] + t * (hi.color[2] - lo.color[2]));
      return `rgb(${r},${g},${b})`;
    }
  }
  return `rgb(42,42,42)`;
}
```

> This means a muscle at 10,000 XP won't just snap to a new colour — it will sit at an exact interpolated shade between `#9B2222` and `#D32F2F`, giving the body map a living, organic feel as you progress.

**Glow rule:**
- Trained **within the last 7 days** → animated pulse ring in red/orange
- Trained **today** → brighter, faster pulse
- Not trained in 7+ days → no glow, fill colour only

---

#### Muscle Group → Exercise Mapping

The body heatmap XP for a group is the **sum of XP across all exercises** mapped to it.

| Body Region | Muscle Group | Mapped Exercises |
|-------------|-------------|-------------------|
| Front upper | Chest | Bench Press, Fly, Push-Up, Dips… |
| Front upper | Shoulders | OHP, Lateral Raise, Arnold Press… |
| Front upper | Biceps | All curl variations |
| Front mid | Abs / Core | Plank, Crunch, Leg Raise… |
| Front lower | Quads | Squat, Leg Press, Lunges… |
| Front lower | Calves | Calf Raise |
| Back upper | Traps | Shrugs, Face Pull |
| Back upper | Rear Delts | Reverse Fly, Face Pull |
| Back mid | Lats | Pull-Up, Lat Pulldown, Rows… |
| Back mid | Rhomboids | Cable Row, DB Row |
| Back lower | Lower Back | Deadlift, Romanian Deadlift |
| Back lower | Glutes | Romanian Deadlift, Bulgarian Split Squat |
| Back lower | Hamstrings | Leg Curl, Romanian Deadlift |
| Arms (both) | Triceps | Pushdown, Skull Crusher, Dips… |

> Custom exercises require the user to pick a muscle group when creating them — that group receives their XP on the heatmap.

---

#### Implementation Notes

- Use a **pre-made SVG body outline** with each muscle as a named `<path id="chest">`, `<path id="biceps">` etc.
- At render time, look up each group's XP → map to fill colour
- Check last-trained date → apply CSS pulse animation if within 7 days
- Recommended library: **`react-native-svg`** for the body, **`react-native-reanimated`** for the pulse glow

```ts
// Glow check
function shouldGlow(lastTrainedDate: string): boolean {
  const diff = Date.now() - new Date(lastTrainedDate).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}
```

---

### 4. Workout Logging (Strength)
- User selects a **muscle group** → then selects an **exercise**
- For each exercise, logs:
  - Sets
  - Reps
  - Weight (kg)
- On save → **XP is calculated and awarded**

#### XP Formula (Strength)
```
XP = sets × reps × weight × 0.25
```
> Example: 3 sets × 10 reps × 60kg × 0.25 = **450 XP**

---

### 5. Cardio Logging
- Separate section for cardio tracking
- Options include:
  - 🏃 Running
  - 🚴 Cycling
  - 🏊 Swimming
  - ⏱️ Jump Rope
  - 🚶 Walking
- Log: **duration (minutes)** and optionally **distance (km)**

#### XP Formula (Cardio)
```
XP = duration (mins) × 3
```
> Example: 30 min run = **90 XP**

---

### 6. XP & Leveling System

Every workout awards XP in **two separate pools** simultaneously:

| Pool | What it tracks | What it unlocks |
|------|---------------|-----------------|
| **Total (Global) XP** | Every rep, set, and cardio minute ever done | Overall player level & rank title |
| **Exercise XP** | XP earned specifically on e.g. Bench Press | Mastery tier for that one exercise |

Both pools receive the **same XP value** from a single log entry — no splitting.

---

#### Global Level Formula (Unlimited Levels)

```
XP_required(level) = BASE × level^MULTIPLIER
```

- **BASE** = `300`
- **MULTIPLIER** = `1.8`

| Level | XP to reach | Cumulative XP | Rank Title     |
|-------|-------------|---------------|----------------|
| 1     | 0           | 0             | 🩶 Rookie       |
| 2     | 300         | 300           | 🩶 Rookie       |
| 3     | 785         | 1,085         | ⚪ Iron         |
| 5     | 1,985       | 4,720         | ⚪ Iron         |
| 10    | 7,524       | 24,792        | 🟡 Bronze       |
| 20    | 28,514      | 148,119       | 🔵 Silver       |
| 35    | 82,347      | 658,214       | 🟠 Gold         |
| 50    | 183,712     | 2,134,500     | 🔴 Platinum     |
| 75    | 492,803     | 8,921,003     | 💀 Elite        |
| 100+  | 1,000,000+  | 25,000,000+   | 👹 Legendary    |

> The rank title stays the same across a band of levels — it upgrades at key milestones (e.g. levels 1–4 = Rookie, 5–14 = Iron, etc.). Design the bands however feels right.

**Code helper:**
```ts
const BASE = 300;
const MULTIPLIER = 1.8;

// XP needed to go FROM level N to level N+1
function xpForLevel(level: number): number {
  return Math.floor(BASE * Math.pow(level, MULTIPLIER));
}

// Total cumulative XP needed to reach a level from scratch
function totalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

// Get current level from total XP
function getLevelFromXP(totalXP: number): number {
  let level = 1;
  while (totalXP >= totalXPForLevel(level + 1)) level++;
  return level;
}
```

---

#### Exercise Mastery System

Each exercise has its **own XP counter** and a 5-tier mastery ladder.

| Tier | Exercise XP Required | Badge | XP Bonus Applied |
|------|----------------------|-------|-----------------|
| 1 — Novice      | 0        | 🤍    | ×1.0 (no bonus)  |
| 2 — Apprentice  | 1,000    | 🟦    | ×1.1 (+10%)      |
| 3 — Skilled     | 5,000    | 🟨    | ×1.25 (+25%)     |
| 4 — Expert      | 15,000   | 🟧    | ×1.5 (+50%)      |
| 5 — Master      | 40,000   | 🔴    | ×2.0 (+100%)     |

- The **XP bonus multiplier** applies to XP earned from that specific exercise only
- Both the exercise XP pool **and** the global XP pool receive the boosted value
- The mastery badge is displayed on the exercise card when logging

**Example with mastery bonus:**
```
Bench Press at Skilled tier (×1.25 bonus)
3 sets × 10 reps × 60kg × 0.25 = 450 base XP
450 × 1.25 = 562 XP awarded

→ Global XP        +562
→ Bench Press XP   +562
```

---

#### What Shows on Screen

- **Home screen:** Global level, rank title, XP progress bar to next level
- **Exercise card (during logging):** Mastery tier badge + exercise XP mini-bar
- **Profile screen:** List of all exercises with their mastery tier and XP progress
- **Level-up / Mastery-up:** Full-screen animation + haptic feedback

---

---

## 🔔 Workout Alarms & Notifications

### Alarm Setup
- User can create **one or more workout alarms** from a dedicated screen or settings panel
- Each alarm has:
  - **Time** (e.g. 6:30 PM)
  - **Days of the week** it repeats (e.g. Mon / Wed / Fri)
  - **Label** (optional, e.g. "Evening Lift", "Morning Run")
  - **Toggle** to enable/disable without deleting

```ts
// Alarm shape
{
  id: "alarm_uuid",
  label: "Evening Lift",
  time: "18:30",           // 24hr format
  days: [1, 3, 5],        // 0 = Sun, 1 = Mon … 6 = Sat
  enabled: true
}
```

---

### Notification Types

#### 1. 🕐 15-Minute Warning
- Fires **15 minutes before** each scheduled alarm
- Message: *"Workout in 15 minutes — get ready, Anish 💪"*
- Tapping opens the app directly to the workout screen

#### 2. ⏰ Alarm Notification (On Time)
- Fires **at the exact alarm time**
- Message: *"It's time to train. Don't break the streak 🔥"*
- Tapping opens the app directly to the workout screen

#### 3. 😴 Missed Scheduled Alarm
- Triggers the **next morning at 8:00 AM** if a workout was not logged on a day an alarm was scheduled
- Message: *"You missed yesterday's session, Anish. Get back on it today 👊"*
- Includes current streak count so the loss feels real

#### 4. 📅 Missed Day (No Workout At All)
- Triggers the **next morning at 8:00 AM** if no workout of any kind was logged the previous day (regardless of alarm)
- Message: *"No workout logged yesterday. Your streak is at risk — don't let it die 🔥"*
- Only fires if streak is currently > 0 (no point guilt-tripping on day 0)

> Types 3 and 4 can fire on the same morning if both conditions are true — but should be **combined into one notification** to avoid spam.

---

### Implementation Notes

- Use **`expo-notifications`** for local push notifications (no server needed)
- Use **`expo-task-manager`** + **`expo-background-fetch`** to run a nightly background check (fires at 8 AM to assess yesterday's workout log)
- All notification scheduling is **local-only** — no backend required
- When a workout is logged, **cancel** any pending missed-workout notification for that day

```ts
// Schedule alarm notifications for a given alarm object
async function scheduleAlarmNotifications(alarm: Alarm) {
  // 15-min warning
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Workout in 15 minutes 💪",
      body: `Get ready, Anish — ${alarm.label} starts soon`,
    },
    trigger: {
      weekday: alarm.days,       // repeat on selected days
      hour: warningHour,         // alarm hour minus 15 mins
      minute: warningMinute,
      repeats: true,
    },
  });

  // On-time alarm
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to train 🔥",
      body: "Don't break the streak. Let's go.",
    },
    trigger: {
      weekday: alarm.days,
      hour: parseInt(alarm.time.split(':')[0]),
      minute: parseInt(alarm.time.split(':')[1]),
      repeats: true,
    },
  });
}

// Morning missed-workout check (runs via background task at 8 AM)
async function checkMissedWorkout() {
  const yesterday = getYesterdayDateString();
  const dayLog    = await getDayLog(yesterday);        // { type: "workout"|"rest"|"missed"|"empty" }
  const hadAlarm  = await hadScheduledAlarmOn(yesterday);
  const streak    = await getCurrentStreak();

  // Suppress notification if rest day was marked
  if (dayLog.type === "rest") return;

  if (dayLog.type !== "workout" && streak > 0) {
    const body = hadAlarm
      ? "You missed your scheduled session yesterday. Get back on it 👊"
      : "No workout logged yesterday. Don't let the streak die 🔥";

    await Notifications.scheduleNotificationAsync({
      content: { title: "Missed workout reminder", body },
      trigger: null,
    });
  }
}
```

---

### Alarm Screen UI
- List of all saved alarms (toggle on/off inline)
- Tap alarm → edit time, days, label
- Swipe to delete
- **"+ Add Alarm"** button at the bottom
- Shows next scheduled fire time under each alarm (e.g. *"Next: Today at 6:30 PM"*)

---

## 🏋️ Exercise Library

### How It Works
- The app ships with a **preset exercise library** organised by muscle group
- Users can also **create custom exercises** — these work identically to presets (same mastery system, same XP pool)
- Every exercise, whether preset or custom, **automatically gets its own mastery profile** the first time it is logged
- Custom exercises are stored locally alongside presets and appear in the same selection UI

---

### Preset Exercise List

#### Chest
- Bench Press, Incline Bench Press, Decline Bench Press, Dumbbell Fly, Cable Fly, Push-Up, Dips,Pec-dec,Dumbbell bench press,Incline dumbbell bench press,Decline dumbbell bench press

#### Back
- Pull-Up, Chin-Up, Barbell Row, Dumbbell Row, Lat Pulldown, Seated Cable Row, Deadlift, Face Pull,Chest Supported Row, Lat prayers,T-Bar Row,Single Arm Dumbbell Row

#### Shoulders
- Overhead Press, Dumbbell Shoulder Press, Front Raise, Shrugs, Reverse Fly,Dumbbell Lateral Raise,Dumbbell Front Raise,Dumbbell Shrugs,Dumbbell Reverse Fly

#### Legs
- Squat, Front Squat, Leg Press, Romanian Deadlift, Bulgarian Split Squat, Lunges, Leg Curl, Leg Extension, Calf Raise,Goblet Squat,Dumbbell Lunges,Dumbbell Calf Raise,Dumbbell Romanian Deadlift,Hacksquat

#### Arms
- Barbell Curl, Dumbbell Curl, Hammer Curl, Preacher Curl, Tricep Pushdown, Skull Crusher, Overhead Tricep Extension,Dumbbell Hammer Curl,Dumbbell Preacher Curl,Dumbbell Tricep Pushdown,Dumbbell Skull Crusher,Dumbbell Overhead Tricep Extension, Single arm Tricep pushdown, Single arm tricep overhead extension,Wrist curls,Reverse Wrist curls

#### Core
- Plank, Crunch, Hanging Leg Raise, Cable Crunch, Russian Twist, Ab Wheel Rollout,Leg Raises

#### Cardio *(these also get mastery profiles)*
- Running, Cycling, Swimming, Jump Rope, Walking, Rowing Machine, Stair Climber, HIIT

---

### Custom Exercise Flow
1. User taps **"+ Add Custom Exercise"** in the exercise picker
2. Enters: name, muscle group (from dropdown), and equipment type (optional)
3. Exercise is saved to local storage and appears in the list immediately
4. A fresh mastery profile is created for it automatically (starts at Novice, 0 XP)

```ts
// Custom Exercise shape (stored in exercises.ts constants + local DB)
{
  id: "custom_uuid",
  name: "Zercher Squat",
  muscleGroup: "Legs",
  equipment: "Barbell",
  isCustom: true
}
```

---



```js
// User Profile
{
  name: "Anish",
  totalXP: 24792,
  level: 10,
  rank: "Bronze",
  exerciseMastery: {
    "Bench Press": { xp: 5200, tier: 3, tierName: "Skilled" },
    "Squat":       { xp: 980,  tier: 1, tierName: "Novice"  },
    "Running":     { xp: 3100, tier: 2, tierName: "Apprentice" }
  },
  muscleGroupXP: {       // summed from all mapped exercises
    "Chest":       { xp: 8200, lastTrained: "2026-03-24" },
    "Quads":       { xp: 980,  lastTrained: "2026-03-20" },
    "Lats":        { xp: 4100, lastTrained: "2026-03-25" }
    // ...one entry per muscle group
  }
}

// Workout Log Entry
{
  id: "uuid",
  date: "2026-03-25",
  type: "strength" | "cardio",
  exercises: [
    {
      name: "Bench Press",
      sets: 3,
      reps: 10,
      weightKg: 60,
      baseXP: 450,
      masteryMultiplier: 1.25,  // Skilled tier bonus
      xpEarned: 562             // after multiplier
    }
  ],
  totalXP: 225   // sum of all xpEarned in this session
}
```

---

## 🛠️ Tech Stack

| Layer        | Choice                          |
|--------------|---------------------------------|
| Framework    | React Native (Expo)             |
| Navigation   | React Navigation (Stack + Tabs) |
| Storage      | AsyncStorage or expo-sqlite     |
| Animations   | React Native Reanimated         |
| Icons        | Expo Vector Icons               |
| Notifications | expo-notifications + expo-task-manager |

---

## 📂 Folder Structure (Suggested)

```
/app
  /screens
    HomeScreen.tsx
    WorkoutScreen.tsx
    CardioScreen.tsx
    ExercisePickerScreen.tsx  // preset list + custom exercise creator
    BodyHeatmapScreen.tsx     // front + back swipeable SVG view
    AlarmScreen.tsx           // list, create, edit workout alarms
    ProfileScreen.tsx
  /components
    StreakCalendar.tsx
    XPBar.tsx
    RankBadge.tsx
    ExerciseCard.tsx
    MasteryBadge.tsx
    ExerciseXPBar.tsx
    BodyFront.tsx             // SVG front body with named muscle paths
    BodyBack.tsx              // SVG back body with named muscle paths
    MuscleTooltip.tsx         // tap-to-show XP card per muscle
  /store
    useUserStore.ts
    useWorkoutStore.ts
  /utils
    xpCalculator.ts           // base XP + mastery multiplier logic
    levelCalculator.ts        // formula-based level from total XP
    muscleHeatmap.ts          // getMuscleColour(), shouldGlow(), group XP aggregation
    notificationScheduler.ts  // schedule alarms, 15-min warnings, missed workout checks
    dateHelpers.ts
  /constants
    colors.ts
    ranks.ts
    exercises.ts              // preset list + muscle group mappings
```

---

## ✅ MVP Checklist

- [ ] Alarm screen — create, edit, toggle, delete alarms
- [ ] 15-minute warning notification before each alarm
- [ ] On-time alarm notification
- [ ] Next-morning missed workout notification (missed day OR missed scheduled alarm)
- [ ] Cancel missed-workout notification when workout is logged
- [ ] Background task for 8 AM morning check (expo-task-manager)
- [ ] Monthly streak heatmap calendar with 4 tile states (empty / workout / rest / missed)
- [ ] Rest Day button on home screen
- [ ] Rest day marks streak as active (blue tile, streak preserved)
- [ ] Max 2 consecutive rest days enforced before streak breaks
- [ ] Undo rest day before midnight
- [ ] Suppress missed workout notification on rest days
- [ ] Body heatmap — front + back swipeable SVG
- [ ] Muscle group fill colour driven by total XP (6-tier ramp)
- [ ] Pulse glow on muscles trained within last 7 days
- [ ] Tap muscle → show XP, mastery summary, last trained date
- [ ] Muscle group XP auto-aggregated from mapped exercises
- [ ] Preset exercise library organised by muscle group
- [ ] Custom exercise creator (name + muscle group)
- [ ] Auto-create mastery profile on first log of any exercise
- [ ] Strength workout logger (exercise → sets/reps/weight)
- [ ] Cardio workout logger (type + duration)
- [ ] Base XP calculation on save
- [ ] Dual XP award — global pool + per-exercise pool
- [ ] Mastery tier calculation per exercise (5 tiers)
- [ ] Mastery bonus multiplier applied to XP
- [ ] Mastery badge shown on exercise card
- [ ] Formula-based unlimited leveling (BASE × level^1.8)
- [ ] Persistent XP, level, and mastery tracking
- [ ] Rank title display with level-up animation
- [ ] Black & red theme applied globally

---

## 🚀 Nice-to-Haves (Post-MVP)

- Workout history / past sessions log
- Weekly XP chart (bar graph)
- Rest timer between sets
- Custom exercise creator
- Motivational quotes on home screen
- Haptic feedback on level-up