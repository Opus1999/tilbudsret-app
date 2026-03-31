import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getRecipeById, formatAmount, getScaledPrice } from '../data/recipeData';
import { colors, fonts, spacing } from '../theme';
import { RecipeNavigationProp, RecipeRouteProp } from '../navigation/types';

export function RecipeScreen() {
  const navigation = useNavigation<RecipeNavigationProp>();
  const route = useRoute<RecipeRouteProp>();
  const recipe = getRecipeById(route.params.recipeId);

  const [servings, setServings] = useState(recipe?.baseServings ?? 4);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Opskrift ikke fundet</Text>
      </SafeAreaView>
    );
  }

  const totalIngredientPrice = recipe.ingredients.reduce(
    (sum, ing) => sum + getScaledPrice(ing.price, servings, recipe.baseServings),
    0
  );

  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;

  const handleAddToList = () => {
    Alert.alert(
      'Tilføjet til indkøbsliste 🛒',
      `${recipe.name} (${servings} pers.) er tilføjet til din indkøbsliste.`,
      [
        { text: 'Bliv her', style: 'cancel' },
        { text: 'Se indkøbsliste', onPress: () => navigation.navigate('ShoppingList') },
      ]
    );
  };

  const difficultyColor =
    recipe.difficulty === 'Let' ? colors.green :
    recipe.difficulty === 'Mellem' ? '#E67E22' :
    colors.red;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: recipe.heroColor }]}>
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* Decorative circles */}
          <View style={[styles.heroCircle, styles.heroCircleLarge, { backgroundColor: recipe.heroSecondaryColor }]} />
          <View style={[styles.heroCircle, styles.heroCircleSmall, { backgroundColor: recipe.heroSecondaryColor }]} />

          {/* Content */}
          <View style={styles.heroContent}>
            <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
            <View style={styles.heroTagRow}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>{recipe.tag}</Text>
              </View>
              <View style={[styles.heroTag, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={styles.heroTagText}>{recipe.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{recipe.name}</Text>
            <Text style={styles.heroDescription}>{recipe.description}</Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>{recipe.prepMinutes} min</Text>
            <Text style={styles.statLabel}>Forberedelse</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{recipe.cookMinutes} min</Text>
            <Text style={styles.statLabel}>Tilberedning</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>⏰</Text>
            <Text style={styles.statValue}>{totalMinutes} min</Text>
            <Text style={styles.statLabel}>I alt</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={[styles.statValue, { color: difficultyColor }]}>{recipe.difficulty}</Text>
            <Text style={styles.statLabel}>Sværhed</Text>
          </View>
        </View>

        {/* Servings adjuster */}
        <View style={styles.section}>
          <View style={styles.servingsRow}>
            <View>
              <Text style={styles.sectionTitle}>Antal personer</Text>
              <Text style={styles.servingsPrice}>
                {(totalIngredientPrice / servings).toFixed(0)} kr pr. person ·{' '}
                <Text style={styles.servingsTotalPrice}>{totalIngredientPrice.toFixed(0)} kr i alt</Text>
              </Text>
            </View>
            <View style={styles.servingsControls}>
              <TouchableOpacity
                style={[styles.servingsButton, servings <= 1 && styles.servingsButtonDisabled]}
                onPress={() => setServings((s) => Math.max(1, s - 1))}
                disabled={servings <= 1}
              >
                <Text style={[styles.servingsButtonText, servings <= 1 && styles.servingsButtonTextDisabled]}>−</Text>
              </TouchableOpacity>
              <Text style={styles.servingsCount}>{servings}</Text>
              <TouchableOpacity
                style={[styles.servingsButton, servings >= 12 && styles.servingsButtonDisabled]}
                onPress={() => setServings((s) => Math.min(12, s + 1))}
                disabled={servings >= 12}
              >
                <Text style={[styles.servingsButtonText, servings >= 12 && styles.servingsButtonTextDisabled]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredienser</Text>
          <Text style={styles.sectionSubtitle}>{recipe.ingredients.length} varer</Text>

          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ing, i) => {
              const scaledPrice = getScaledPrice(ing.price, servings, recipe.baseServings);
              const amountStr = formatAmount(ing.amountPerServing, ing.unit, servings, recipe.baseServings);
              const isLast = i === recipe.ingredients.length - 1;
              return (
                <View
                  key={ing.id}
                  style={[styles.ingredientRow, !isLast && styles.ingredientBorder]}
                >
                  <View style={styles.ingredientBullet} />
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>{ing.name}</Text>
                    {ing.store ? (
                      <Text style={styles.ingredientStore}>{ing.store}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.ingredientAmount}>{amountStr}</Text>
                  {scaledPrice > 0 ? (
                    <Text style={styles.ingredientPrice}>
                      {scaledPrice.toFixed(2).replace('.', ',')} kr
                    </Text>
                  ) : (
                    <Text style={styles.ingredientPriceFree}>—</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fremgangsmåde</Text>
          <Text style={styles.sectionSubtitle}>{recipe.steps.length} trin</Text>

          <View style={styles.stepsList}>
            {recipe.steps.map((step, i) => {
              const isLast = i === recipe.steps.length - 1;
              return (
                <View key={step.number} style={styles.stepRow}>
                  {/* Number + connector line */}
                  <View style={styles.stepLeft}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{step.number}</Text>
                    </View>
                    {!isLast && <View style={styles.stepConnector} />}
                  </View>

                  {/* Content */}
                  <View style={[styles.stepContent, !isLast && styles.stepContentMargin]}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      {step.durationMinutes && (
                        <View style={styles.stepDuration}>
                          <Text style={styles.stepDurationText}>{step.durationMinutes} min</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bottom padding for fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleAddToList} activeOpacity={0.85}>
          <Text style={styles.ctaIcon}>🛒</Text>
          <Text style={styles.ctaText}>Tilføj til indkøbsliste</Text>
          <View style={styles.ctaPriceBadge}>
            <Text style={styles.ctaPriceText}>{totalIngredientPrice.toFixed(0)} kr</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
    marginTop: 40,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Hero
  hero: {
    height: 320,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.4,
  },
  heroCircleLarge: {
    width: 280,
    height: 280,
    top: -80,
    right: -60,
  },
  heroCircleSmall: {
    width: 160,
    height: 160,
    top: 60,
    right: 160,
    opacity: 0.2,
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 22,
  },
  heroContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroEmoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  heroTagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroTagText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.white,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 30,
    color: colors.white,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  heroDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statEmoji: {
    fontSize: 18,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.black,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.grey,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  // Section
  section: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
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
    marginBottom: spacing.md,
  },

  // Servings
  servingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  servingsPrice: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.green,
    marginTop: 4,
  },
  servingsTotalPrice: {
    fontFamily: fonts.regular,
    color: colors.grey,
  },
  servingsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  servingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsButtonDisabled: {
    backgroundColor: colors.greyLight,
  },
  servingsButtonText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.white,
    lineHeight: 24,
  },
  servingsButtonTextDisabled: {
    color: colors.grey,
  },
  servingsCount: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.black,
    minWidth: 28,
    textAlign: 'center',
  },

  // Ingredients
  ingredientsList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    gap: spacing.sm,
  },
  ingredientBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientBullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.black,
  },
  ingredientStore: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.grey,
    marginTop: 1,
  },
  ingredientAmount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.grey,
    minWidth: 70,
    textAlign: 'right',
  },
  ingredientPrice: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.black,
    minWidth: 60,
    textAlign: 'right',
  },
  ingredientPriceFree: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.grey,
    minWidth: 60,
    textAlign: 'right',
  },

  // Steps
  stepsList: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepLeft: {
    alignItems: 'center',
    width: 36,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepNumberText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
  },
  stepConnector: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
    minHeight: 20,
  },
  stepContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  stepContentMargin: {
    paddingBottom: spacing.lg,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  stepTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  stepDuration: {
    backgroundColor: colors.greyLight,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  stepDurationText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.grey,
  },
  stepDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
    lineHeight: 22,
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
    backgroundColor: colors.green,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  ctaPriceBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  ctaPriceText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },
});
