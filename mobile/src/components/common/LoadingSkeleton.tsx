import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = radii.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Greeting Skeleton */}
      <Skeleton width="40%" height={24} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="60%" height={16} style={{ marginBottom: spacing.lg }} />

      {/* Hero Balance Card Skeleton */}
      <Skeleton width="100%" height={180} borderRadius={radii.xl} style={{ marginBottom: spacing.lg }} />

      {/* Analytics Card Skeleton */}
      <Skeleton width="100%" height={80} borderRadius={radii.lg} style={{ marginBottom: spacing.lg }} />

      {/* Chart Skeleton */}
      <Skeleton width="100%" height={220} borderRadius={radii.lg} style={{ marginBottom: spacing.lg }} />

      {/* Recent Transactions Skeleton */}
      <Skeleton width="50%" height={20} style={{ marginBottom: spacing.md }} />
      <Skeleton width="100%" height={68} borderRadius={radii.md} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="100%" height={68} borderRadius={radii.md} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="100%" height={68} borderRadius={radii.md} />
    </View>
  );
};

export const ListSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <Skeleton width="100%" height={110} borderRadius={radii.xl} style={{ marginBottom: spacing.lg }} />
      <Skeleton width="100%" height={72} borderRadius={radii.md} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="100%" height={72} borderRadius={radii.md} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="100%" height={72} borderRadius={radii.md} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="100%" height={72} borderRadius={radii.md} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  skeleton: {
    backgroundColor: '#E4E5F0',
  },
});
