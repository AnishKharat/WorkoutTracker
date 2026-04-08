import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Ellipse } from 'react-native-svg';
import { getMuscleColour } from '../utils/muscleHeatmap';

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

export default function BodyBack({ muscleXP, onMusclePress }: Props) {
  const getColor = (group: string) => {
    const xpData = muscleXP[group];
    return getMuscleColour(xpData?.xp ?? 0);
  };
  const press = (g: string) => onMusclePress?.(g);

  return (
    <View style={styles.container}>
      <Svg
        viewBox="0 0 200 400"
        width={BODY_WIDTH}
        height={BODY_HEIGHT}
        preserveAspectRatio="xMidYMid meet"
      >
        <G>
          {/* Head (back) */}
          <Ellipse cx="100" cy="28" rx="18" ry="22" fill="#3A3A3A" />

          {/* Neck */}
          <Path d="M92 48 Q100 54 108 48 L110 58 Q100 62 90 58 Z" fill="#3A3A3A" />

          {/* Traps */}
          <Path
            id="Traps"
            d="M80 58 Q100 70 120 58 L118 80 Q100 85 82 80 Z"
            fill={getColor('Traps')}
            onPress={() => press('Traps')}
          />

          {/* Rear Delts */}
          <Path
            id="Rear Delts"
            d="M68 62 Q55 70 50 85 L62 85 Q68 72 80 68 Z M132 62 Q145 70 150 85 L138 85 Q132 72 120 68 Z"
            fill={getColor('Rear Delts')}
            onPress={() => press('Rear Delts')}
          />

          {/* Lats */}
          <Path
            id="Lats"
            d="M62 82 Q52 110 58 140 L78 138 Q74 110 82 82 Z M138 82 Q148 110 142 140 L122 138 Q126 110 118 82 Z"
            fill={getColor('Lats')}
            onPress={() => press('Lats')}
          />

          {/* Rhomboids / mid back */}
          <Path
            id="Rhomboids"
            d="M82 80 Q100 88 118 80 L116 120 Q100 125 84 120 Z"
            fill={getColor('Rhomboids')}
            onPress={() => press('Rhomboids')}
          />

          {/* Triceps (back) */}
          <Path
            id="Triceps"
            d="M50 85 Q42 108 46 128 L56 124 Q54 105 60 85 Z M150 85 Q158 108 154 128 L144 124 Q146 105 140 85 Z"
            fill={getColor('Triceps')}
            onPress={() => press('Triceps')}
          />

          {/* Forearms */}
          <Path
            d="M46 128 Q44 148 48 164 L58 160 Q56 140 56 124 Z M154 128 Q156 148 152 164 L142 160 Q144 140 144 124 Z"
            fill="#3A3A3A"
          />

          {/* Hands */}
          <Ellipse cx="51" cy="170" rx="7" ry="10" fill="#3A3A3A" />
          <Ellipse cx="149" cy="170" rx="7" ry="10" fill="#3A3A3A" />

          {/* Lower Back */}
          <Path
            id="Lower Back"
            d="M78 136 Q100 142 122 136 L120 158 Q100 164 80 158 Z"
            fill={getColor('Lower Back')}
            onPress={() => press('Lower Back')}
          />

          {/* Glutes */}
          <Path
            id="Glutes"
            d="M78 158 Q100 165 122 158 L122 195 Q100 200 78 195 Z"
            fill={getColor('Glutes')}
            onPress={() => press('Glutes')}
          />

          {/* Hamstrings */}
          <Path
            id="Hamstrings"
            d="M78 195 Q68 215 70 240 L88 240 Q88 215 90 198 Z M122 195 Q132 215 130 240 L112 240 Q112 215 110 198 Z"
            fill={getColor('Hamstrings')}
            onPress={() => press('Hamstrings')}
          />

          {/* Calves (back) */}
          <Path
            d="M70 240 Q66 262 70 285 L88 285 Q90 260 88 240 Z M130 240 Q134 262 130 285 L112 285 Q110 260 112 240 Z"
            fill={getColor('Calves')}
            onPress={() => press('Calves')}
          />

          {/* Feet */}
          <Ellipse cx="79" cy="291" rx="12" ry="7" fill="#3A3A3A" />
          <Ellipse cx="121" cy="291" rx="12" ry="7" fill="#3A3A3A" />
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
