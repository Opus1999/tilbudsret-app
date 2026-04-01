import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing } from '../theme';

function SkeletonBox({ width, height, style }: { width: number | string; height: number; style?: object }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1100 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.45, 1]),
  }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: 8, backgroundColor: colors.border }, animatedStyle, style]}
    />
  );
}

export function SkeletonDishCard() {
  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <SkeletonBox width={48} height={48} style={{ borderRadius: 12 }} />
        <SkeletonBox width={90} height={22} />
      </View>

      {/* Title */}
      <SkeletonBox width="75%" height={20} style={{ marginBottom: 8 }} />
      <SkeletonBox width="90%" height={14} style={{ marginBottom: 4 }} />
      <SkeletonBox width="60%" height={14} style={{ marginBottom: spacing.md }} />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer row */}
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <SkeletonBox width={60} height={12} style={{ marginBottom: 6 }} />
          <SkeletonBox width={90} height={28} />
        </View>
        <SkeletonBox width={52} height={32} style={{ borderRadius: 8 }} />
      </View>

      <SkeletonBox width="55%" height={12} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

export function SkeletonStoreCard() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1100 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.45, 1]),
  }));

  return (
    <Animated.View style={[styles.storeCard, animatedStyle]}>
      <SkeletonBox width={40} height={40} style={{ borderRadius: 20, marginBottom: 8 }} />
      <SkeletonBox width={70} height={16} style={{ marginBottom: 4 }} />
      <SkeletonBox width={50} height={12} style={{ marginBottom: 10 }} />
      <SkeletonBox width="100%" height={36} style={{ borderRadius: 8 }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeft: {
    gap: 6,
  },
  storeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginRight: spacing.sm,
    width: 130,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
});
