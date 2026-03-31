import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Dish } from '../data/mockData';
import { colors, fonts, spacing } from '../theme';
import { HomeScreenNavigationProp } from '../navigation/types';

interface Props {
  dish: Dish;
  rank: number;
}

export function DishCard({ dish, rank }: Props) {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const savings = Math.round(((dish.originalPrice - dish.pricePerPerson) / dish.originalPrice) * 100);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Recipe', { recipeId: dish.id })}
      activeOpacity={0.85}
    >
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.emoji}>{dish.emoji}</Text>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{dish.tag}</Text>
        </View>
      </View>

      <Text style={styles.name}>{dish.name}</Text>
      <Text style={styles.description}>{dish.description}</Text>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Pris pr. person</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{dish.pricePerPerson} kr</Text>
            <Text style={styles.originalPrice}>{dish.originalPrice} kr</Text>
          </View>
        </View>
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>-{savings}%</Text>
        </View>
      </View>

      <View style={styles.storesRow}>
        <Text style={styles.storesLabel}>Billigst hos: </Text>
        <Text style={styles.storesValue}>{dish.stores.join(' · ')}</Text>
        <Text style={styles.arrow}> →</Text>
      </View>
    </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  rankBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 36,
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
    fontSize: 18,
    color: colors.black,
    marginBottom: 4,
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
    backgroundColor: colors.border,
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
    fontSize: 22,
    color: colors.green,
  },
  originalPrice: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: colors.redLight,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  savingsText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.red,
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
