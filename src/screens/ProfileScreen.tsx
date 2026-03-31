import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { loadUser, saveUser, logout, UserProfile } from '../data/authStorage';
import { searchCities, City } from '../data/danishCities';
import { colors, fonts, spacing } from '../theme';
import { ProfileNavigationProp } from '../navigation/types';

type DietKey = 'alleadere' | 'vegetar' | 'vegan' | 'glutenfri';

const DIETS: { key: DietKey; label: string; emoji: string }[] = [
  { key: 'alleadere', label: 'Alædere',   emoji: '🍖' },
  { key: 'vegetar',   label: 'Vegetar',   emoji: '🥦' },
  { key: 'vegan',     label: 'Vegan',     emoji: '🌱' },
  { key: 'glutenfri', label: 'Glutenfri', emoji: '🌾' },
];

function Counter({
  label, value, onDecrement, onIncrement, min = 0, max = 10,
}: { label: string; value: number; onDecrement: () => void; onIncrement: () => void; min?: number; max?: number }) {
  return (
    <View style={counterStyles.row}>
      <Text style={counterStyles.label}>{label}</Text>
      <View style={counterStyles.controls}>
        <TouchableOpacity
          style={[counterStyles.btn, value <= min && counterStyles.btnDisabled]}
          onPress={onDecrement}
          disabled={value <= min}
        >
          <Text style={[counterStyles.btnText, value <= min && counterStyles.btnTextDisabled]}>−</Text>
        </TouchableOpacity>
        <Text style={counterStyles.value}>{value}</Text>
        <TouchableOpacity
          style={[counterStyles.btn, value >= max && counterStyles.btnDisabled]}
          onPress={onIncrement}
          disabled={value >= max}
        >
          <Text style={[counterStyles.btnText, value >= max && counterStyles.btnTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const counterStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.black },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { backgroundColor: colors.greyLight },
  btnText: { fontFamily: fonts.bold, fontSize: 20, color: colors.white, lineHeight: 24 },
  btnTextDisabled: { color: colors.grey },
  value: { fontFamily: fonts.bold, fontSize: 18, color: colors.black, minWidth: 26, textAlign: 'center' },
});

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [adults, setAdults]     = useState(2);
  const [children, setChildren] = useState(0);
  const [diets, setDiets]       = useState<Set<DietKey>>(new Set(['alleadere']));
  const [cityQuery, setCityQuery]       = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUser().then((user) => {
        if (!user) return;
        setName(user.name);
        setEmail(user.email);
        setAdults(user.adults);
        setChildren(user.children);
        setDiets(new Set(user.diets as DietKey[]));
        if (user.postalCode) {
          setSelectedCity({ postalCode: user.postalCode, name: user.cityName });
          setCityQuery(`${user.postalCode} ${user.cityName}`);
        }
      });
    }, [])
  );

  const handleCityQuery = (text: string) => {
    setCityQuery(text);
    setSelectedCity(null);
    setCitySuggestions(searchCities(text));
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setCityQuery(`${city.postalCode} ${city.name}`);
    setCitySuggestions([]);
  };

  const toggleDiet = (key: DietKey) => {
    setDiets((prev) => {
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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Mangler navn', 'Udfyld venligst dit navn.');
      return;
    }
    setSaving(true);
    await saveUser({
      name: name.trim(),
      email,
      postalCode: selectedCity?.postalCode ?? '',
      cityName: selectedCity?.name ?? '',
      adults,
      children,
      diets: Array.from(diets),
    });
    setSaving(false);
    Alert.alert('Gemt', 'Dine oplysninger er opdateret.', [{ text: 'OK' }]);
  };

  const handleLogout = () => {
    Alert.alert('Log ud', 'Er du sikker på, at du vil logge ud?', [
      { text: 'Annuller', style: 'cancel' },
      {
        text: 'Log ud',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        },
      },
    ]);
  };

  const initials = name.trim()
    ? name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backLabel}>Tilbage</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Min profil</Text>
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveHeaderText}>{saving ? '...' : 'Gem'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.avatarName}>{name || 'Tilbudsret bruger'}</Text>
            <Text style={styles.avatarEmail}>{email}</Text>
          </View>

          {/* Personlige oplysninger */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personlige oplysninger</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Navn</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Dit fulde navn"
                  placeholderTextColor={colors.grey}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldDivider} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={[styles.inputWrapper, styles.inputWrapperReadonly]}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={[styles.input, styles.inputReadonly]}
                  value={email}
                  editable={false}
                  placeholder="din@email.dk"
                  placeholderTextColor={colors.grey}
                />
              </View>
            </View>
          </View>

          {/* Husstand */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Husstand</Text>
            <Text style={styles.cardSubtitle}>Vi tilpasser portionsstørrelser efter din husstand</Text>

            <Counter
              label="Voksne"
              value={adults}
              onDecrement={() => setAdults((v) => Math.max(1, v - 1))}
              onIncrement={() => setAdults((v) => Math.min(10, v + 1))}
              min={1}
            />
            <View style={styles.fieldDivider} />
            <Counter
              label="Børn"
              value={children}
              onDecrement={() => setChildren((v) => Math.max(0, v - 1))}
              onIncrement={() => setChildren((v) => Math.min(8, v + 1))}
            />

            <View style={styles.householdSummary}>
              <Text style={styles.householdEmoji}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.householdText}>
                {adults + children} person{adults + children !== 1 ? 'er' : ''} i husstanden
              </Text>
            </View>
          </View>

          {/* Kostpræferencer */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kostpræferencer</Text>
            <Text style={styles.cardSubtitle}>Påvirker hvilke opskrifter du ser</Text>
            <View style={styles.dietGrid}>
              {DIETS.map((d) => {
                const selected = diets.has(d.key);
                return (
                  <TouchableOpacity
                    key={d.key}
                    style={[styles.dietChip, selected && styles.dietChipSelected]}
                    onPress={() => toggleDiet(d.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dietEmoji}>{d.emoji}</Text>
                    <Text style={[styles.dietLabel, selected && styles.dietLabelSelected]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Postnummer */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lokation</Text>
            <Text style={styles.cardSubtitle}>Bruges til at finde butikker i nærheden</Text>

            <View style={[styles.inputWrapper, selectedCity !== null && styles.inputWrapperSuccess]}>
              <Text style={styles.inputIcon}>{selectedCity ? '✓' : '📍'}</Text>
              <TextInput
                style={styles.input}
                value={cityQuery}
                onChangeText={handleCityQuery}
                placeholder="Postnummer eller by..."
                placeholderTextColor={colors.grey}
                returnKeyType="search"
                autoCorrect={false}
              />
              {cityQuery.length > 0 && !selectedCity && (
                <TouchableOpacity onPress={() => { setCityQuery(''); setSelectedCity(null); }}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {citySuggestions.length > 0 && (
              <View style={styles.suggestions}>
                {citySuggestions.map((city, i) => (
                  <TouchableOpacity
                    key={city.postalCode}
                    style={[styles.suggestionRow, i < citySuggestions.length - 1 && styles.suggestionBorder]}
                    onPress={() => handleSelectCity(city)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionPostal}>{city.postalCode}</Text>
                    <Text style={styles.suggestionName}>{city.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Gem knap */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonLoading]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Gemmer...' : '✓  Gem ændringer'}</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log ud</Text>
          </TouchableOpacity>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 80 },
  backArrow: { fontFamily: fonts.regular, fontSize: 20, color: colors.red, lineHeight: 22 },
  backLabel: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.red },
  headerTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.black, flex: 1, textAlign: 'center' },
  saveHeaderBtn: { minWidth: 80, alignItems: 'flex-end' },
  saveHeaderText: { fontFamily: fonts.bold, fontSize: 15, color: colors.green },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.red,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 28, color: colors.white },
  avatarName: { fontFamily: fonts.bold, fontSize: 20, color: colors.black, marginBottom: 4 },
  avatarEmail: { fontFamily: fonts.regular, fontSize: 14, color: colors.grey },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.black, marginBottom: 4 },
  cardSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.grey, marginBottom: spacing.md },

  // Fields
  fieldGroup: { gap: 6 },
  fieldLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.grey },
  fieldDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.cream,
    borderRadius: 12, borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: 50, gap: spacing.sm,
  },
  inputWrapperReadonly: { backgroundColor: colors.greyLight },
  inputWrapperSuccess: { borderColor: colors.green },
  inputIcon: { fontSize: 15 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.black },
  inputReadonly: { color: colors.grey },
  clearIcon: { fontSize: 13, color: colors.grey, padding: spacing.xs },

  // Household
  householdSummary: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.greenLight, borderRadius: 12,
    padding: spacing.sm, marginTop: spacing.sm,
  },
  householdEmoji: { fontSize: 20 },
  householdText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.green },

  // Diet chips
  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dietChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.greyLight,
    borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  dietChipSelected: { backgroundColor: colors.redLight, borderColor: colors.red },
  dietEmoji: { fontSize: 16 },
  dietLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.black },
  dietLabelSelected: { color: colors.red },

  // City suggestions
  suggestions: {
    backgroundColor: colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    marginTop: spacing.xs, overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestionPostal: { fontFamily: fonts.bold, fontSize: 13, color: colors.black, width: 44 },
  suggestionName: { fontFamily: fonts.regular, fontSize: 13, color: colors.black },

  // Save button
  saveButton: {
    backgroundColor: colors.green, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: spacing.md,
  },
  saveButtonLoading: { opacity: 0.7 },
  saveButtonText: { fontFamily: fonts.bold, fontSize: 17, color: colors.white },

  // Logout
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: 14,
    paddingVertical: 15, borderWidth: 1.5, borderColor: '#FFD0D3',
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { fontFamily: fonts.bold, fontSize: 16, color: colors.red },
});
