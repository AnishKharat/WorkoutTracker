import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Ellipse, Circle, Line } from 'react-native-svg';
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

const BODY_WIDTH = 180;
const BODY_HEIGHT = 320;
const BASE_FILL = '#3A3A3A';
const DIVIDER = '#F4F4F4';

function MusclePath({
  d,
  fill,
  onPress,
}: {
  d: string;
  fill: string;
  onPress?: () => void;
}) {
  return (
    <Path
      d={d}
      fill={fill}
      stroke={DIVIDER}
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
      onPress={onPress}
    />
  );
}

function GlowRing({ visible, bright }: { visible: boolean; bright: boolean }) {
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withRepeat(
        withTiming(bright ? 0.8 : 0.45, {
          duration: bright ? 500 : 1100,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    } else {
      opacity.value = 0;
    }
  }, [bright, opacity, visible]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, style]} pointerEvents="none">
      <Svg viewBox="0 0 220 420" width={BODY_WIDTH} height={BODY_HEIGHT} preserveAspectRatio="xMidYMid meet">
        <Path d="M69 108 C58 117 54 134 60 149 C66 163 78 168 89 161 C92 143 95 126 92 111 C84 107 76 106 69 108 Z" fill="rgba(255,87,34,0.22)" />
        <Path d="M151 108 C162 117 166 134 160 149 C154 163 142 168 131 161 C128 143 125 126 128 111 C136 107 144 106 151 108 Z" fill="rgba(255,87,34,0.22)" />
        <Path d="M82 102 C76 109 74 122 77 136 C80 148 88 157 99 158 L99 101 C93 99 87 99 82 102 Z" fill="rgba(255,87,34,0.22)" />
        <Path d="M138 102 C144 109 146 122 143 136 C140 148 132 157 121 158 L121 101 C127 99 133 99 138 102 Z" fill="rgba(255,87,34,0.22)" />
        <Path d="M96 159 C88 165 84 177 85 191 L89 236 C90 249 98 258 110 261 C122 258 130 249 131 236 L135 191 C136 177 132 165 124 159 C120 156 115 154 110 154 C105 154 100 156 96 159 Z" fill="rgba(255,87,34,0.22)" />
        <Path d="M85 266 C76 277 72 297 74 322 L81 366 C84 379 91 387 101 385 C105 349 106 311 105 268 C98 265 91 264 85 266 Z" fill="rgba(255,87,34,0.22)" />
        <Path d="M135 266 C144 277 148 297 146 322 L139 366 C136 379 129 387 119 385 C115 349 114 311 115 268 C122 265 129 264 135 266 Z" fill="rgba(255,87,34,0.22)" />
      </Svg>
    </Animated.View>
  );
}

export default function BodyFrontHuman({ muscleXP, onMusclePress }: Props) {
  const getColor = (group: string) => getMuscleColour(muscleXP[group]?.xp ?? 0);
  const press = (group: string) => onMusclePress?.(group);

  const anyGlowing = Object.values(muscleXP).some((muscle) => shouldGlow(muscle?.lastTrained));
  const anyBright = Object.values(muscleXP).some((muscle) => trainedToday(muscle?.lastTrained));

  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 220 420" width={BODY_WIDTH} height={BODY_HEIGHT} preserveAspectRatio="xMidYMid meet">
        <G>
          <Ellipse cx="110" cy="38" rx="24" ry="29" fill={BASE_FILL} />
          <Path d="M95 60 C100 72 120 72 125 60 L121 86 L99 86 Z" fill={BASE_FILL} />
          <Path d="M90 76 C74 84 66 100 65 122 C64 149 71 181 80 222 C85 245 91 270 96 296 L104 368 C106 385 102 401 94 412 L104 416 L110 395 L116 416 L126 412 C118 401 114 385 116 368 L124 296 C129 270 135 245 140 222 C149 181 156 149 155 122 C154 100 146 84 130 76 C123 72 117 70 110 70 C103 70 97 72 90 76 Z" fill={BASE_FILL} />
          <Path d="M72 90 C58 97 49 114 50 133 C51 157 58 182 67 206 C72 219 81 224 89 218 C89 188 91 157 95 110 C87 99 81 92 72 90 Z" fill={BASE_FILL} />
          <Path d="M148 90 C162 97 171 114 170 133 C169 157 162 182 153 206 C148 219 139 224 131 218 C131 188 129 157 125 110 C133 99 139 92 148 90 Z" fill={BASE_FILL} />
          <Path d="M67 206 C58 229 54 252 60 272 C65 277 71 275 76 269 C77 248 80 228 88 214 Z" fill={BASE_FILL} />
          <Path d="M153 206 C162 229 166 252 160 272 C155 277 149 275 144 269 C143 248 140 228 132 214 Z" fill={BASE_FILL} />
          <Circle cx="58" cy="274" r="10" fill={BASE_FILL} />
          <Circle cx="162" cy="274" r="10" fill={BASE_FILL} />
          <Path d="M88 372 C82 388 79 403 81 414 L91 418 C95 409 97 397 97 384 Z" fill={BASE_FILL} />
          <Path d="M132 372 C138 388 141 403 139 414 L129 418 C125 409 123 397 123 384 Z" fill={BASE_FILL} />

          <MusclePath d="M69 108 C58 117 54 134 60 149 C66 163 78 168 89 161 C92 143 95 126 92 111 C84 107 76 106 69 108 Z" fill={getColor('Shoulders')} onPress={() => press('Shoulders')} />
          <MusclePath d="M151 108 C162 117 166 134 160 149 C154 163 142 168 131 161 C128 143 125 126 128 111 C136 107 144 106 151 108 Z" fill={getColor('Shoulders')} onPress={() => press('Shoulders')} />
          <MusclePath d="M82 102 C76 109 74 122 77 136 C80 148 88 157 99 158 L99 101 C93 99 87 99 82 102 Z" fill={getColor('Chest')} onPress={() => press('Chest')} />
          <MusclePath d="M138 102 C144 109 146 122 143 136 C140 148 132 157 121 158 L121 101 C127 99 133 99 138 102 Z" fill={getColor('Chest')} onPress={() => press('Chest')} />
          <MusclePath d="M53 147 C47 161 46 179 51 193 C55 203 62 208 70 205 C74 185 78 167 81 151 C72 151 61 149 53 147 Z" fill={getColor('Biceps')} onPress={() => press('Biceps')} />
          <MusclePath d="M167 147 C173 161 174 179 169 193 C165 203 158 208 150 205 C146 185 142 167 139 151 C148 151 159 149 167 147 Z" fill={getColor('Biceps')} onPress={() => press('Biceps')} />
          <MusclePath d="M81 150 C75 166 70 186 68 205 C74 209 80 210 86 207 C90 189 93 171 94 152 C90 150 86 149 81 150 Z" fill={getColor('Triceps')} onPress={() => press('Triceps')} />
          <MusclePath d="M139 150 C145 166 150 186 152 205 C146 209 140 210 134 207 C130 189 127 171 126 152 C130 150 134 149 139 150 Z" fill={getColor('Triceps')} onPress={() => press('Triceps')} />
          <MusclePath d="M96 159 C88 165 84 177 85 191 L89 236 C90 249 98 258 110 261 C122 258 130 249 131 236 L135 191 C136 177 132 165 124 159 C120 156 115 154 110 154 C105 154 100 156 96 159 Z" fill={getColor('Abs')} onPress={() => press('Abs')} />

          <Line x1="110" y1="160" x2="110" y2="258" stroke={DIVIDER} strokeWidth={2} />
          <Line x1="91" y1="182" x2="129" y2="182" stroke={DIVIDER} strokeWidth={2} />
          <Line x1="90" y1="206" x2="130" y2="206" stroke={DIVIDER} strokeWidth={2} />
          <Line x1="91" y1="230" x2="129" y2="230" stroke={DIVIDER} strokeWidth={2} />

          <MusclePath d="M85 266 C76 277 72 297 74 322 L81 366 C84 379 91 387 101 385 C105 349 106 311 105 268 C98 265 91 264 85 266 Z" fill={getColor('Quads')} onPress={() => press('Quads')} />
          <MusclePath d="M135 266 C144 277 148 297 146 322 L139 366 C136 379 129 387 119 385 C115 349 114 311 115 268 C122 265 129 264 135 266 Z" fill={getColor('Quads')} onPress={() => press('Quads')} />
          <MusclePath d="M83 365 C76 380 74 397 78 412 C84 418 91 414 95 405 C99 390 102 370 101 351 C94 352 88 357 83 365 Z" fill={getColor('Calves')} onPress={() => press('Calves')} />
          <MusclePath d="M137 365 C144 380 146 397 142 412 C136 418 129 414 125 405 C121 390 118 370 119 351 C126 352 132 357 137 365 Z" fill={getColor('Calves')} onPress={() => press('Calves')} />

          <Line x1="58" y1="284" x2="52" y2="296" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
          <Line x1="63" y1="286" x2="60" y2="299" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
          <Line x1="68" y1="286" x2="69" y2="299" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
          <Line x1="162" y1="284" x2="168" y2="296" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
          <Line x1="157" y1="286" x2="160" y2="299" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
          <Line x1="152" y1="286" x2="151" y2="299" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
        </G>
      </Svg>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
