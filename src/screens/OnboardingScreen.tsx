import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { City, searchCities } from '../data/danishCities';
import { colors, fonts, spacing } from '../theme';
import { OnboardingNavigationProp } from '../navigation/types';

type DietKey = 'alleadere' | 'vegetar' | 'vegan' | 'glutenfri';

const DIETS: { key: DietKey; label: string; emoji: string; description: string }[] = [
  { key: 'alleadere', label: 'Alædere',   emoji: '🍖', description: 'Ingen begrænsninger' },
  { key: 'vegetar',   label: 'Vegetar',   emoji: '🥦', description: 'Ingen kød eller fisk' },
  { key: 'vegan',     label: 'Vegan',     emoji: '🌱', description: 'Ingen animalske produkter' },
  { key: 'glutenfri', label: 'Glutenfri', emoji: '🌾', description: 'Fri for gluten' },
];

export function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Slide 2 state
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [suggestions, setSuggestions] = useState<City[]>([]);

  // Slide 3 state
  const [selectedDiets, setSelectedDiets] = useState<Set<DietKey>>(new Set(['alleadere']));

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setSelectedCity(null);
    setSuggestions(searchCities(text));
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setQuery(`${city.postalCode} ${city.name}`);
    setSuggestions([]);
  };

  const toggleDiet = (key: DietKey) => {
    setSelectedDiets((prev) => {
      const next = new Set(prev);
      if (key === 'alleadere') return new Set(['alleadere']);
      next.delete('alleadere');
      if (next.has(key)) {
        next.delete(key);
        if (next.size === 0) return new Set(['alleadere']);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleNext = () => setCurrentIndex((i) => Math.min(i + 1, 2));
  const handleBack = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const handleFinish = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    if (selectedCity) await AsyncStorage.setItem('user_city', JSON.stringify(selectedCity));
    await AsyncStorage.setItem('user_diets', JSON.stringify(Array.from(selectedDiets)));
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const isLastSlide = currentIndex === 2;
  const canProceed = currentIndex === 1 ? selectedCity !== null : true;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          {currentIndex > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.topBackButton}>
              <Text style={styles.topBackText}>← Tilbage</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.topBackButton} />
          )}
          <TouchableOpacity onPress={handleFinish}>
            <Text style={styles.skipText}>Spring over</Text>
          </TouchableOpacity>
        </View>

        {/* Slide content */}
        <View style={styles.slideContainer}>
          {currentIndex === 0 && <SlideWelcome />}
          {currentIndex === 1 && (
            <SlideLocation
              query={query}
              selectedCity={selectedCity}
              suggestions={suggestions}
              onQueryChange={handleQueryChange}
              onSelectCity={handleSelectCity}
            />
          )}
          {currentIndex === 2 && (
            <SlideDiet selectedDiets={selectedDiets} onToggle={toggleDiet} />
          )}
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, currentIndex === i && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.ctaButton, !canProceed && styles.ctaButtonDisabled]}
            onPress={isLastSlide ? handleFinish : handleNext}
            activeOpacity={0.85}
            disabled={!canProceed}
          >
            <Text style={styles.ctaText}>
              {isLastSlide ? 'Kom i gang 🚀' : 'Næste →'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Slide 1: Velkommen ───────────────────────────────────────────────────────

function SlideWelcome() {
  return (
    <ScrollView contentContainerStyle={slideStyles.container} showsVerticalScrollIndicator={false}>
      <View style={slideStyles.logoCircle}>
        <Text style={slideStyles.bigEmoji}>🛒</Text>
      </View>
      <Text style={slideStyles.logoText}>Tilbudsret</Text>
      <Text style={slideStyles.tagline}>
        Ugens billigste{'\n'}middagsretter — samlet{'\n'}automatisk for dig
      </Text>
      <View style={slideStyles.featureList}>
        {[
          { emoji: '📊', text: 'Sammenligner priser på tværs af butikker' },
          { emoji: '🥘', text: 'Genererer opskrifter baseret på tilbud' },
          { emoji: '📝', text: 'Laver din indkøbsliste klar på sekunder' },
        ].map((f) => (
          <View key={f.text} style={slideStyles.featureRow}>
            <Text style={slideStyles.featureEmoji}>{f.emoji}</Text>
            <Text style={slideStyles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Slide 2: Postnummer ──────────────────────────────────────────────────────

interface SlideLocationProps {
  query: string;
  selectedCity: City | null;
  suggestions: City[];
  onQueryChange: (text: string) => void;
  onSelectCity: (city: City) => void;
}

function SlideLocation({ query, selectedCity, suggestions, onQueryChange, onSelectCity }: SlideLocationProps) {
  return (
    <ScrollView
      contentContainerStyle={slideStyles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={slideStyles.slideEmoji}>📍</Text>
      <Text style={slideStyles.slideTitle}>Hvor bor du?</Text>
      <Text style={slideStyles.slideSubtitle}>
        Vi finder tilbud fra butikker i dit nærområde
      </Text>

      <View style={slideStyles.inputSection}>
        <View style={[slideStyles.inputWrapper, selectedCity !== null && slideStyles.inputWrapperSuccess]}>
          <Text style={slideStyles.inputIcon}>{selectedCity ? '✓' : '🔍'}</Text>
          <TextInput
            style={slideStyles.input}
            placeholder="Postnummer eller by..."
            placeholderTextColor={colors.grey}
            value={query}
            onChangeText={onQueryChange}
            keyboardType="default"
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && !selectedCity && (
            <TouchableOpacity onPress={() => onQueryChange('')}>
              <Text style={slideStyles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {suggestions.length > 0 && (
          <View style={slideStyles.suggestions}>
            {suggestions.map((city, i) => (
              <TouchableOpacity
                key={city.postalCode}
                style={[slideStyles.suggestionRow, i < suggestions.length - 1 && slideStyles.suggestionBorder]}
                onPress={() => onSelectCity(city)}
                activeOpacity={0.7}
              >
                <Text style={slideStyles.suggestionPostal}>{city.postalCode}</Text>
                <Text style={slideStyles.suggestionName}>{city.name}</Text>
                <Text style={slideStyles.suggestionArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedCity && (
          <View style={slideStyles.selectedCityCard}>
            <Text style={slideStyles.selectedCityEmoji}>📍</Text>
            <View>
              <Text style={slideStyles.selectedCityName}>{selectedCity.name}</Text>
              <Text style={slideStyles.selectedCityPostal}>Postnummer {selectedCity.postalCode}</Text>
            </View>
          </View>
        )}

        {!selectedCity && query.length === 0 && (
          <View style={slideStyles.popularCities}>
            <Text style={slideStyles.popularLabel}>Populære byer</Text>
            <View style={slideStyles.popularChips}>
              {[
                { postalCode: '2000', name: 'Frederiksberg' },
                { postalCode: '8000', name: 'Aarhus C' },
                { postalCode: '5000', name: 'Odense C' },
                { postalCode: '9000', name: 'Aalborg' },
              ].map((city) => (
                <TouchableOpacity
                  key={city.postalCode}
                  style={slideStyles.popularChip}
                  onPress={() => onSelectCity(city)}
                >
                  <Text style={slideStyles.popularChipText}>{city.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ─── Slide 3: Kostpræferencer ─────────────────────────────────────────────────

interface SlideDietProps {
  selectedDiets: Set<DietKey>;
  onToggle: (key: DietKey) => void;
}

function SlideDiet({ selectedDiets, onToggle }: SlideDietProps) {
  return (
    <ScrollView
      contentContainerStyle={slideStyles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={slideStyles.slideEmoji}>🥗</Text>
      <Text style={slideStyles.slideTitle}>Kostpræferencer</Text>
      <Text style={slideStyles.slideSubtitle}>
        Vi tilpasser opskrifterne til dig.{'\n'}Du kan altid ændre dette senere.
      </Text>

      <View style={slideStyles.dietGrid}>
        {DIETS.map((diet) => {
          const isSelected = selectedDiets.has(diet.key);
          return (
            <TouchableOpacity
              key={diet.key}
              style={[slideStyles.dietCard, isSelected && slideStyles.dietCardSelected]}
              onPress={() => onToggle(diet.key)}
              activeOpacity={0.8}
            >
              <Text style={slideStyles.dietEmoji}>{diet.emoji}</Text>
              <Text style={[slideStyles.dietLabel, isSelected && slideStyles.dietLabelSelected]}>
                {diet.label}
              </Text>
              <Text style={[slideStyles.dietDescription, isSelected && slideStyles.dietDescriptionSelected]}>
                {diet.description}
              </Text>
              {isSelected && <View style={slideStyles.selectedDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  topBackButton: {
    minWidth: 80,
  },
  topBackText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.red,
  },
  skipText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
  },
  slideContainer: {
    flex: 1,
  },
  bottomControls: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cream,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.red,
  },
  ctaButton: {
    backgroundColor: colors.red,
    borderRadius: 16,
    paddingVertical: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: colors.grey,
  },
  ctaText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.white,
  },
});

const slideStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },

  // Slide 1
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.redLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  bigEmoji: {
    fontSize: 48,
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 40,
    color: colors.red,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing.xl,
  },
  featureList: {
    width: '100%',
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.black,
    flex: 1,
    lineHeight: 20,
  },

  // Slide 2 + 3 shared
  slideEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  slideTitle: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.black,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  slideSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },

  // Slide 2: Location
  inputSection: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 54,
    gap: spacing.sm,
  },
  inputWrapperSuccess: {
    borderColor: colors.green,
  },
  inputIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.black,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.grey,
    padding: spacing.xs,
  },
  suggestions: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionPostal: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.black,
    width: 46,
  },
  suggestionName: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.black,
    flex: 1,
  },
  suggestionArrow: {
    fontSize: 14,
    color: colors.grey,
  },
  selectedCityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.greenLight,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.green,
  },
  selectedCityEmoji: {
    fontSize: 24,
  },
  selectedCityName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.green,
  },
  selectedCityPostal: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.green,
    opacity: 0.8,
    marginTop: 2,
  },
  popularCities: {
    marginTop: spacing.lg,
    width: '100%',
  },
  popularLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.grey,
    marginBottom: spacing.sm,
  },
  popularChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  popularChip: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  popularChipText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.black,
  },

  // Slide 3: Diet
  dietGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    width: '100%',
    justifyContent: 'space-between',
  },
  dietCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  dietCardSelected: {
    borderColor: colors.red,
    backgroundColor: colors.redLight,
  },
  dietEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  dietLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.black,
    marginBottom: 4,
  },
  dietLabelSelected: {
    color: colors.red,
  },
  dietDescription: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.grey,
    textAlign: 'center',
  },
  dietDescriptionSelected: {
    color: colors.red,
    opacity: 0.8,
  },
  selectedDot: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.red,
  },
});
