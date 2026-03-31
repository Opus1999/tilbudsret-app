import { StyleSheet, Text, View } from 'react-native';
import { Store } from '../data/mockData';
import { colors, fonts, spacing } from '../theme';

interface Props {
  store: Store;
}

export function StoreCard({ store }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.logo}>{store.logo}</Text>
      <Text style={styles.name}>{store.name}</Text>
      <Text style={styles.itemsOnSale}>{store.itemsOnSale} tilbud</Text>
      <View style={styles.savingsContainer}>
        <Text style={styles.savingsLabel}>Spar op til</Text>
        <Text style={styles.savingsAmount}>{store.savings} kr</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginRight: spacing.sm,
    width: 130,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
