import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Ellipse } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { getMuscleColour, shouldGlow, trainedToday } from '../utils/muscleHeatmap';

interface MuscleXP {
  xp: number;
  lastTrained?: string;
}

interface Props {
  muscleXP: Record<string, MuscleXP>;
  onMusclePress?: (muscle: string) => void;
}

const BODY_WIDTH = 150;
const BODY_HEIGHT = 300;

/** Pulsing glow overlay shown on the body when muscles are recently trained */
function GlowRing({ visible, bright }: { visible: boolean; bright: boolean }) {
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withRepeat(
        withTiming(bright ? 0.9 : 0.55, {
          duration: bright ? 500 : 1100,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    } else {
      opacity.value = 0;
    }
  }, [visible, bright]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) return null;
  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, style]}
      pointerEvents="none"
    >
      <Svg viewBox="0 0 200 400" width={BODY_WIDTH} height={BODY_HEIGHT} preserveAspectRatio="xMidYMid meet">
        {/* Warm orange-red tint over trained muscle regions */}
        <Path d="M80 65 Q100 72 120 65 L118 95 Q100 100 82 95 Z" fill="rgba(255,87,34,0.35)" />
        <Path d="M68 62 Q55 65 48 80 L58 85 Q65 70 80 68 Z M132 62 Q145 65 152 80 L142 85 Q135 70 120 68 Z" fill="rgba(255,87,34,0.35)" />
        <Path d="M60 88 Q52 100 54 120 L63 118 Q62 100 68 90 Z M140 88 Q148 100 146 120 L137 118 Q138 100 132 90 Z" fill="rgba(255,87,34,0.35)" />
        <Path d="M82 95 Q100 100 118 95 L116 150 Q100 154 84 150 Z" fill="rgba(255,87,34,0.35)" />
        <Path d="M78 165 Q68 180 70 220 L88 220 Q88 180 90 168 Z M122 165 Q132 180 130 220 L112 220 Q112 180 110 168 Z" fill="rgba(255,87,34,0.35)" />
        <Path d="M68 233 Q66 260 70 285 L88 285 Q90 258 90 233 Z M132 233 Q134 260 130 285 L112 285 Q110 258 110 233 Z" fill="rgba(255,87,34,0.35)" />
      </Svg>
    </Animated.View>
  );
}

export default function BodyFront({ muscleXP, onMusclePress }: Props) {
  const getColor = (group: string) => getMuscleColour(muscleXP[group]?.xp ?? 0);
  const press = (g: string) => onMusclePress?.(g);

  const anyGlowing = Object.values(muscleXP).some(m => shouldGlow(m?.lastTrained));
  const anyBright  = Object.values(muscleXP).some(m => trainedToday(m?.lastTrained));

  return (
    <View style={styles.container}>
      <Svg
        viewBox="0 0 200 400"
        width={BODY_WIDTH}
        height={BODY_HEIGHT}
        preserveAspectRatio="xMidYMid meet"
      >
        <G>
          {/* Head */}
          <Ellipse cx="100" cy="28" rx="18" ry="22" fill="#3A3A3A" />

          {/* Neck */}
          <Path d="M92 48 Q100 54 108 48 L110 58 Q100 62 90 58 Z" fill="#3A3A3A" />

          {/* Shoulders */}
          <Path
            d="M68 62 Q55 65 48 80 L58 85 Q65 70 80 68 Z M132 62 Q145 65 152 80 L142 85 Q135 70 120 68 Z"
            fill={getColor('Shoulders')}
            onPress={() => press('Shoulders')}
          />

          {/* Chest */}
          <Path
            d="M80 65 Q100 72 120 65 L118 95 Q100 100 82 95 Z"
            fill={getColor('Chest')}
            onPress={() => press('Chest')}
          />

          {/* Biceps */}
          <Path
            d="M60 88 Q52 100 54 120 L63 118 Q62 100 68 90 Z M140 88 Q148 100 146 120 L137 118 Q138 100 132 90 Z"
            fill={getColor('Biceps')}
            onPress={() => press('Biceps')}
          />

          {/* Triceps (front-visible portion) */}
          <Path
            d="M47 88 Q40 105 44 122 L54 118 Q51 100 56 88 Z M153 88 Q160 105 156 122 L146 118 Q149 100 144 88 Z"
            fill={getColor('Triceps')}
            onPress={() => press('Triceps')}
          />

          {/* Forearms */}
          <Path
            d="M54 120 Q50 140 52 158 L60 156 Q58 136 63 118 Z M146 120 Q150 140 148 158 L140 156 Q142 136 137 118 Z"
            fill="#3A3A3A"
          />

          {/* Hands */}
          <Ellipse cx="55" cy="164" rx="7" ry="10" fill="#3A3A3A" />
          <Ellipse cx="145" cy="164" rx="7" ry="10" fill="#3A3A3A" />

          {/* Abs */}
          <Path
            d="M82 95 Q100 100 118 95 L116 150 Q100 154 84 150 Z"
            fill={getColor('Abs')}
            onPress={() => press('Abs')}
          />

          {/* Hip area */}
          <Path d="M80 148 Q100 155 120 148 L122 165 Q100 170 78 165 Z" fill="#3A3A3A" />

          {/* Quads */}
          <Path
            d="M78 165 Q68 180 70 220 L88 220 Q88 180 90 168 Z M122 165 Q132 180 130 220 L112 220 Q112 180 110 168 Z"
            fill={getColor('Quads')}
            onPress={() => press('Quads')}
          />

          {/* Knees */}
          <Ellipse cx="79" cy="225" rx="11" ry="8" fill="#3A3A3A" />
          <Ellipse cx="121" cy="225" rx="11" ry="8" fill="#3A3A3A" />

          {/* Calves */}
          <Path
            d="M68 233 Q66 260 70 285 L88 285 Q90 258 90 233 Z M132 233 Q134 260 130 285 L112 285 Q110 258 110 233 Z"
            fill={getColor('Calves')}
            onPress={() => press('Calves')}
          />

          {/* Feet */}
          <Ellipse cx="79" cy="292" rx="12" ry="7" fill="#3A3A3A" />
          <Ellipse cx="121" cy="292" rx="12" ry="7" fill="#3A3A3A" />
        </G>
      </Svg>

      {/* Animated glow overlay — shows when any muscle was trained recently */}
      <GlowRing visible={anyGlowing} bright={anyBright} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
