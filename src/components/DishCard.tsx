import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { Dish } from '../data/mockData';
import { colors, fonts, spacing } from '../theme';
import { HomeScreenNavigationProp } from '../navigation/types';

interface Props {
  dish: Dish;
  rank: number;
}

// Unique gradient palette per rank
const GRADIENTS: Record<number, [string, string, string]> = {
  1: ['#fff9f9', '#fff3f3', '#FFFDF9'],
  2: ['#f4faf7', '#edf7f2', '#FFFDF9'],
  3: ['#f4f7ff', '#edf2ff', '#FFFDF9'],
};

const SPRING = { damping: 16, stiffness: 200 };

export function DishCard({ dish, rank }: Props) {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const savings = Math.round(((dish.originalPrice - dish.pricePerPerson) / dish.originalPrice) * 100);
  const gradient = GRADIENTS[rank] ?? GRADIENTS[1];

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.965, SPRING);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING);
  };

  const handlePress = () => {
    navigation.navigate('Recipe', { recipeId: dish.id });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(rank * 120).springify().damping(14).stiffness(100)}
      style={[styles.card, animatedStyle]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Rank badge */}
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>

          {/* Top: emoji + tag */}
          <View style={styles.header}>
            <Text style={styles.emoji}>{dish.emoji}</Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{dish.tag}</Text>
            </View>
          </View>

          <Text style={styles.name}>{dish.name}</Text>
          <Text style={styles.description}>{dish.description}</Text>

          {/* Gradient divider */}
          <LinearGradient
            colors={['transparent', colors.border, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />

          {/* Footer: price + savings */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.priceLabel}>Pris pr. person</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{dish.pricePerPerson} kr</Text>
                <Text style={styles.originalPrice}>{dish.originalPrice} kr</Text>
              </View>
            </View>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsPercent}>-{savings}%</Text>
              <Text style={styles.savingsKr}>
                spar {dish.originalPrice - dish.pricePerPerson} kr
              </Text>
            </View>
          </View>

          {/* Stores row */}
          <View style={styles.storesRow}>
            <Text style={styles.storesLabel}>Billigst hos: </Text>
            <Text style={styles.storesValue}>{dish.stores.join(' · ')}</Text>
            <Text style={styles.arrow}> →</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.md,
  },
  rankBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  rankText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.grey,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 40,
  },
  tagContainer: {
    backgroundColor: colors.greenLight,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.green,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: colors.black,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.grey,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  priceLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.grey,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  price: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.green,
    letterSpacing: -0.5,
  },
  originalPrice: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: colors.red,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  savingsPercent: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.white,
    lineHeight: 18,
  },
  savingsKr: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
  },
  storesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storesLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.grey,
  },
  storesValue: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.black,
  },
  arrow: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.red,
    marginLeft: 'auto',
  },
});
