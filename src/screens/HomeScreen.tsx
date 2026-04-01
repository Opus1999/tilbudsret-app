import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { DishCard } from '../components/DishCard';
import { StoreCard } from '../components/StoreCard';
import { SkeletonDishCard, SkeletonStoreCard } from '../components/SkeletonCard';
import { useRecipes } from '../hooks/useRecipes';
import { colors, fonts, spacing } from '../theme';
import { HomeScreenNavigationProp } from '../navigation/types';

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { dishes, stores, loading, isLive, status } = useRecipes();

  const weekNumber = getWeekNumber(new Date());

  const totalSavings = dishes.reduce(
    (sum, d) => sum + (d.originalPrice - d.pricePerPerson) * (d.servings ?? 4),
    0
  );

  const totalOriginal = dishes.reduce(
    (sum, d) => sum + d.originalPrice * (d.servings ?? 4),
    0
  );

  const savingsPct = totalOriginal > 0
    ? Math.round((totalSavings / totalOriginal) * 100)
    : 0;

  const totalItems = stores.reduce((n, s) => n + s.itemsOnSale, 0);

  const handleShoppingList = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('ShoppingList');
  };

  const handleProfile = () => {
    Haptics.selectionAsync();
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View>
            <Text style={styles.logo}>Tilbudsret</Text>
            <Text style={styles.logoTagline}>Uge {weekNumber} · Billigste middagsretter</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfile}
              activeOpacity={0.7}
            >
              <Text style={styles.profileButtonText}>👤</Text>
            </TouchableOpacity>
            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>UGE{'\n'}{weekNumber}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Status banner */}
        {isLive && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.liveBanner}>
            <Text style={styles.liveDot}>●</Text>
            <Text style={styles.liveText}>Live tilbud fra Netto, Bilka & Føtex</Text>
          </Animated.View>
        )}
        {status === 'scraper_running' && (
          <View style={styles.generatingBanner}>
            <Text style={styles.generatingText}>⏳ Henter tilbud fra butikkerne...</Text>
          </View>
        )}
        {status === 'generating_recipes' && !isLive && (
          <View style={styles.generatingBanner}>
            <Text style={styles.generatingText}>✨ AI sammensætter opskrifter fra ugens tilbud...</Text>
          </View>
        )}
        {status === 'offline' && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>📴 Server ikke fundet — viser eksempel-data</Text>
          </View>
        )}

        {/* Hero banner */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.heroWrapper}>
          <LinearGradient
            colors={[colors.green, '#1a4a35', '#0f2d20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />

            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>Ugens totale besparelse</Text>
              <Text style={styles.heroSavings}>{Math.round(totalSavings)} kr</Text>
              <Text style={styles.heroSub}>
                på {dishes.length} middage for {dishes[0]?.servings ?? 4} pers.
              </Text>

              <View style={styles.heroPills}>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>🏪 {stores.length} butikker</Text>
                </View>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>🍽️ {dishes.length} retter</Text>
                </View>
              </View>
            </View>

            <View style={styles.heroRight}>
              <Text style={styles.heroEmojiBig}>🛍️</Text>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>-{savingsPct}%</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Ugens retter */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ugens 3 bedste retter</Text>
            <Text style={styles.sectionSubtitle}>
              {isLive ? 'Genereret fra ugens tilbud' : 'Sorteret efter pris pr. person'}
            </Text>
          </Animated.View>

          {loading
            ? [1, 2, 3].map((i) => <SkeletonDishCard key={i} />)
            : dishes.map((dish, index) => (
                <DishCard key={dish.id} dish={dish} rank={index + 1} />
              ))}
        </View>

        {/* Billigste butikker */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Billigst denne uge</Text>
            <Text style={styles.sectionSubtitle}>
              {isLive ? `${totalItems} varer på tilbud` : 'Baseret på ugens tilbud'}
            </Text>
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storesRow}
          >
            {loading
              ? [1, 2, 3].map((i) => <SkeletonStoreCard key={i} />)
              : stores.map((store, index) => (
                  <StoreCard key={store.id} store={store} index={index} />
                ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed bottom CTA */}
      <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.bottomBar}>
        <Pressable
          style={styles.ctaButton}
          onPress={handleShoppingList}
          onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <LinearGradient
            colors={[colors.red, '#c0242f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaIcon}>🛒</Text>
            <Text style={styles.ctaText}>Se indkøbsliste</Text>
            <View style={styles.ctaBadge}>
              <Text style={styles.ctaBadgeText}>{totalItems > 0 ? totalItems : 23}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
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
  safeArea: { flex: 1, backgroundColor: colors.cream },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  profileButtonText: { fontSize: 18 },
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

  // Live / offline banners
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(45,106,79,0.08)',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  liveDot: {
    fontSize: 8,
    color: colors.green,
  },
  liveText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.green,
  },
  generatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(230,57,70,0.07)',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  generatingText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.red,
  },
  offlineBanner: {
    marginBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  offlineText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.grey,
  },

  // Hero
  heroWrapper: {
    marginBottom: spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroCard: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 150,
    position: 'relative',
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60,
    right: -40,
  },
  heroCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -40,
    right: 60,
  },
  heroLeft: { flex: 1 },
  heroLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroSavings: {
    fontFamily: fonts.bold,
    fontSize: 48,
    color: colors.white,
    lineHeight: 52,
    letterSpacing: -2,
  },
  heroSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: spacing.md,
  },
  heroPills: { flexDirection: 'row', gap: spacing.sm },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },
  heroRight: { alignItems: 'center', gap: spacing.sm },
  heroEmojiBig: { fontSize: 52 },
  heroBadge: {
    backgroundColor: colors.red,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },

  // Sections
  section: { marginBottom: spacing.xl },
  sectionHeader: { marginBottom: spacing.md },
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
  storesRow: { paddingRight: spacing.md },

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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ctaIcon: { fontSize: 20 },
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
