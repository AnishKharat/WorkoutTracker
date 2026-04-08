import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconName = 'home' | 'workout' | 'cardio' | 'rest' | 'heatmap' | 'alarm' | 'profile';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function AppIcon({
  name,
  size = 24,
  color = '#FFFFFF',
  strokeWidth = 2.2,
}: Props) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 10.5L12 3l9 7.5" {...common} />
          <Path d="M5.5 9.5V20h13V9.5" {...common} />
          <Path d="M10 20v-5h4v5" {...common} />
        </Svg>
      );

    case 'workout':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="1.5" y="8.25" width="2.2" height="7.5" rx="0.9" fill={color} />
          <Rect x="4.5" y="6.4" width="2.5" height="11.2" rx="1" fill={color} />
          <Rect x="7.8" y="10.45" width="8.4" height="3.1" rx="1.2" fill={color} />
          <Rect x="17" y="6.4" width="2.5" height="11.2" rx="1" fill={color} />
          <Rect x="20.3" y="8.25" width="2.2" height="7.5" rx="0.9" fill={color} />
        </Svg>
      );

    case 'cardio':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M3.5 16.25c0-1.24 1.01-2.25 2.25-2.25h1.93c.83 0 1.63-.29 2.26-.82l1.88-1.58 1.99 1.24c1.14.71 2.45 1.11 3.79 1.17l1.17.05c1.29.06 2.31 1.12 2.31 2.41V18a1 1 0 0 1-1 1H5.75a2.25 2.25 0 0 1-2.25-2.25Z"
            fill={color}
          />
          <Path
            d="M6.4 11.85c.2-1.24 1.13-2.28 2.35-2.62l2.47-.68c.45-.13.94-.05 1.33.2l2.32 1.5c.47.3 1.02.47 1.58.5l1.05.06a1 1 0 0 1 .94 1v.72h-.79c-1.51 0-2.98-.44-4.23-1.27l-1.62-1.07-1.78 1.48c-.89.74-2.01 1.15-3.17 1.15H6.4Z"
            fill={color}
            opacity="0.8"
          />
        </Svg>
      );

    case 'rest':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3.5" y="11" width="17" height="5.25" rx="1.6" fill={color} />
          <Rect x="5" y="8.3" width="5.7" height="3.4" rx="1.2" fill={color} />
          <Rect x="3.5" y="9.4" width="1.7" height="9.1" rx="0.8" fill={color} />
          <Rect x="18.8" y="13.6" width="1.4" height="4.9" rx="0.7" fill={color} />
          <Rect x="6" y="16.25" width="1.3" height="2.3" rx="0.65" fill={color} />
        </Svg>
      );

    case 'heatmap':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3c1 3-1 4.5-1 6.5 0 1.6 1.2 2.7 2.7 2.7 1.7 0 3.3-1.5 3.3-3.9 2.1 1.9 3.5 4.4 3.5 7 0 3.5-2.9 5.7-6.5 5.7S7.5 18.8 7.5 15.4c0-2.1.9-3.9 2.7-5.8.6-.7 1.7-2.2 1.8-6.6Z" {...common} />
        </Svg>
      );

    case 'alarm':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="13" r="6.5" {...common} />
          <Path d="M12 10v3.5l2 1.5" {...common} />
          <Path d="M8 3.5 5.5 6" {...common} />
          <Path d="M16 3.5 18.5 6" {...common} />
        </Svg>
      );

    case 'profile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="8" r="3.5" {...common} />
          <Path d="M5 19c1.7-3 4.2-4.5 7-4.5S17.3 16 19 19" {...common} />
        </Svg>
      );

    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="5" y="5" width="14" height="14" rx="3" {...common} />
        </Svg>
      );
  }
}
