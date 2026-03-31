import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DishCard } from '../components/DishCard';
import { StoreCard } from '../components/StoreCard';
import { cheapestStores, weeklyDishes } from '../data/mockData';
import { colors, fonts, spacing } from '../theme';
import { HomeScreenNavigationProp } from '../navigation/types';

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const today = new Date();
  const weekNumber = getWeekNumber(today);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Tilbudsret</Text>
            <Text style={styles.logoTagline}>Uge {weekNumber} · Billigste middagsretter</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.profileButtonText}>👤</Text>
            </TouchableOpacity>
            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>UGE{'\n'}{weekNumber}</Text>
            </View>
          </View>
        </View>

        {/* Hero summary */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🛍️</Text>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Ugens bedste tilbud er fundet</Text>
            <Text style={styles.heroSubtitle}>
              Spar op til <Text style={styles.heroHighlight}>87 kr</Text> på ugens middage
            </Text>
          </View>
        </View>

        {/* Ugens retter */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ugens 3 bedste retter</Text>
            <Text style={styles.sectionSubtitle}>Sorteret efter pris pr. person</Text>
          </View>

          {weeklyDishes.map((dish, index) => (
            <DishCard key={dish.id} dish={dish} rank={index + 1} />
          ))}
        </View>

        {/* Billigste butikker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Billigst denne uge</Text>
            <Text style={styles.sectionSubtitle}>Baseret på ugens tilbud</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storesRow}
          >
            {cheapestStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </ScrollView>
        </View>

        {/* Bottom padding for the fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={() => navigation.navigate('ShoppingList')}>
          <Text style={styles.ctaIcon}>🛒</Text>
          <Text style={styles.ctaText}>Se indkøbsliste</Text>
          <View style={styles.ctaBadge}>
            <Text style={styles.ctaBadgeText}>23</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.red,
    letterSpacing: -0.5,
  },
  logoTagline: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.grey,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonText: {
    fontSize: 18,
  },
  weekBadge: {
    backgroundColor: colors.red,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  weekBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 17,
  },

  // Hero card
  heroCard: {
    backgroundColor: colors.green,
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  heroHighlight: {
    fontFamily: fonts.bold,
    color: colors.white,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.black,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.grey,
  },

  // Stores
  storesRow: {
    paddingRight: spacing.md,
  },

  // Bottom CTA
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaButton: {
    backgroundColor: colors.red,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ctaIcon: {
    fontSize: 20,
  },
  ctaText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
    marginLeft: -28,
  },
  ctaBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.white,
  },
});
