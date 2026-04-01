import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Store } from '../data/mockData';
import { colors, fonts, spacing } from '../theme';

interface Props {
  store: Store;
  index: number;
}

const SPRING = { damping: 16, stiffness: 200 };

export function StoreCard({ store, index }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify().damping(14).stiffness(100)}
      style={[styles.card, animatedStyle]}
    >
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.94, SPRING); }}
        onPressOut={() => { scale.value = withSpring(1, SPRING); }}
        style={styles.inner}
      >
        <Text style={styles.logo}>{store.logo}</Text>
        <Text style={styles.name}>{store.name}</Text>
        <Text style={styles.itemsOnSale}>{store.itemsOnSale} tilbud</Text>
        <Animated.View style={styles.savingsContainer}>
          <Text style={styles.savingsLabel}>Spar op til</Text>
          <Text style={styles.savingsAmount}>{store.savings} kr</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginRight: spacing.sm,
    width: 130,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  inner: {
    padding: spacing.md,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.black,
    marginBottom: 2,
  },
  itemsOnSale: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.grey,
    marginBottom: spacing.sm,
  },
  savingsContainer: {
    backgroundColor: colors.greenLight,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    width: '100%',
  },
  savingsLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.green,
  },
  savingsAmount: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.green,
  },
});
