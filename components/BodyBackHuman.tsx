import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Ellipse, Circle, Line } from 'react-native-svg';
import { getMuscleColour } from '../utils/muscleHeatmap';

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

export default function BodyBackHuman({ muscleXP, onMusclePress }: Props) {
  const getColor = (group: string) => getMuscleColour(muscleXP[group]?.xp ?? 0);
  const press = (group: string) => onMusclePress?.(group);

  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 220 420" width={BODY_WIDTH} height={BODY_HEIGHT} preserveAspectRatio="xMidYMid meet">
        <G>
          <Ellipse cx="110" cy="38" rx="24" ry="29" fill={BASE_FILL} />
          <Path d="M95 62 C100 76 120 76 125 62 L120 90 L100 90 Z" fill={BASE_FILL} />
          <Path d="M90 78 C75 86 67 101 66 122 C65 149 71 184 79 220 C84 243 91 269 96 296 L104 368 C106 385 102 401 94 412 L104 416 L110 395 L116 416 L126 412 C118 401 114 385 116 368 L124 296 C129 269 136 243 141 220 C149 184 155 149 154 122 C153 101 145 86 130 78 C123 74 117 72 110 72 C103 72 97 74 90 78 Z" fill={BASE_FILL} />
          <Path d="M72 91 C58 99 50 116 50 136 C51 158 58 181 67 203 C73 217 81 224 89 219 C90 190 93 160 96 111 C88 100 81 93 72 91 Z" fill={BASE_FILL} />
          <Path d="M148 91 C162 99 170 116 170 136 C169 158 162 181 153 203 C147 217 139 224 131 219 C130 190 127 160 124 111 C132 100 139 93 148 91 Z" fill={BASE_FILL} />
          <Path d="M67 203 C58 226 54 249 59 270 C64 275 71 273 76 267 C78 245 81 225 88 211 Z" fill={BASE_FILL} />
          <Path d="M153 203 C162 226 166 249 161 270 C156 275 149 273 144 267 C142 245 139 225 132 211 Z" fill={BASE_FILL} />
          <Circle cx="58" cy="274" r="10" fill={BASE_FILL} />
          <Circle cx="162" cy="274" r="10" fill={BASE_FILL} />
          <Path d="M88 372 C82 388 79 403 81 414 L91 418 C95 409 97 397 97 384 Z" fill={BASE_FILL} />
          <Path d="M132 372 C138 388 141 403 139 414 L129 418 C125 409 123 397 123 384 Z" fill={BASE_FILL} />

          <MusclePath d="M93 86 C100 95 120 95 127 86 L122 116 C118 123 114 126 110 126 C106 126 102 123 98 116 Z" fill={getColor('Traps')} onPress={() => press('Traps')} />
          <MusclePath d="M70 109 C58 116 53 132 58 147 C63 158 74 164 84 159 C88 143 91 125 92 111 C84 108 76 107 70 109 Z" fill={getColor('Rear Delts')} onPress={() => press('Rear Delts')} />
          <MusclePath d="M150 109 C162 116 167 132 162 147 C157 158 146 164 136 159 C132 143 129 125 128 111 C136 108 144 107 150 109 Z" fill={getColor('Rear Delts')} onPress={() => press('Rear Delts')} />
          <MusclePath d="M82 110 C74 118 72 132 74 147 C77 166 85 181 97 190 L104 128 C98 119 91 113 82 110 Z" fill={getColor('Rhomboids')} onPress={() => press('Rhomboids')} />
          <MusclePath d="M138 110 C146 118 148 132 146 147 C143 166 135 181 123 190 L116 128 C122 119 129 113 138 110 Z" fill={getColor('Rhomboids')} onPress={() => press('Rhomboids')} />
          <MusclePath d="M73 150 C66 167 67 188 76 208 C82 221 92 228 101 225 L105 191 C96 177 90 163 88 146 C82 146 77 147 73 150 Z" fill={getColor('Lats')} onPress={() => press('Lats')} />
          <MusclePath d="M147 150 C154 167 153 188 144 208 C138 221 128 228 119 225 L115 191 C124 177 130 163 132 146 C138 146 143 147 147 150 Z" fill={getColor('Lats')} onPress={() => press('Lats')} />
          <MusclePath d="M53 144 C47 159 46 177 51 191 C55 201 62 206 69 203 C73 183 77 165 80 149 C71 148 61 146 53 144 Z" fill={getColor('Triceps')} onPress={() => press('Triceps')} />
          <MusclePath d="M167 144 C173 159 174 177 169 191 C165 201 158 206 151 203 C147 183 143 165 140 149 C149 148 159 146 167 144 Z" fill={getColor('Triceps')} onPress={() => press('Triceps')} />
          <MusclePath d="M94 194 C88 201 86 212 87 224 L91 256 C92 267 100 274 110 276 C120 274 128 267 129 256 L133 224 C134 212 132 201 126 194 C122 190 116 188 110 188 C104 188 98 190 94 194 Z" fill={getColor('Lower Back')} onPress={() => press('Lower Back')} />
          <MusclePath d="M83 228 C74 236 72 250 76 266 C80 279 89 286 100 286 C103 271 105 248 103 231 C96 227 89 226 83 228 Z" fill={getColor('Glutes')} onPress={() => press('Glutes')} />
          <MusclePath d="M137 228 C146 236 148 250 144 266 C140 279 131 286 120 286 C117 271 115 248 117 231 C124 227 131 226 137 228 Z" fill={getColor('Glutes')} onPress={() => press('Glutes')} />
          <MusclePath d="M84 287 C76 298 72 316 74 339 L80 374 C83 385 89 391 98 390 C102 355 104 320 103 289 C96 286 89 285 84 287 Z" fill={getColor('Hamstrings')} onPress={() => press('Hamstrings')} />
          <MusclePath d="M136 287 C144 298 148 316 146 339 L140 374 C137 385 131 391 122 390 C118 355 116 320 117 289 C124 286 131 285 136 287 Z" fill={getColor('Hamstrings')} onPress={() => press('Hamstrings')} />
          <MusclePath d="M82 367 C76 382 74 399 78 412 C84 418 91 414 95 405 C99 391 101 371 99 354 C92 355 87 359 82 367 Z" fill={getColor('Calves')} onPress={() => press('Calves')} />
          <MusclePath d="M138 367 C144 382 146 399 142 412 C136 418 129 414 125 405 C121 391 119 371 121 354 C128 355 133 359 138 367 Z" fill={getColor('Calves')} onPress={() => press('Calves')} />

          <Line x1="58" y1="284" x2="52" y2="296" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
          <Line x1="63" y1="286" x2="60" y2="299" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
          <Line x1="68" y1="286" x2="69" y2="299" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
          <Line x1="162" y1="284" x2="168" y2="296" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
          <Line x1="157" y1="286" x2="160" y2="299" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
          <Line x1="152" y1="286" x2="151" y2="299" stroke={BASE_FILL} strokeWidth={3} strokeLinecap="round" />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
