import { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { saveUser } from '../data/authStorage';
import { colors, fonts, spacing } from '../theme';
import { AuthNavigationProp } from '../navigation/types';

type Mode = 'login' | 'signup';

export function AuthScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const [mode, setMode] = useState<Mode>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Mangler oplysninger', 'Udfyld venligst email og adgangskode.');
      return;
    }
    if (!isLogin && !name.trim()) {
      Alert.alert('Mangler navn', 'Skriv venligst dit navn.');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Adgangskoder matcher ikke', 'De to adgangskoder er ikke ens.');
      return;
    }

    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    await saveUser({
      name: name || email.split('@')[0],
      email,
      postalCode: '',
      cityName: '',
      adults: 2,
      children: 0,
      diets: ['alleadere'],
    });

    setLoading(false);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handleGoogle = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    await saveUser({
      name: 'Google Bruger',
      email: 'bruger@gmail.com',
      postalCode: '',
      cityName: '',
      adults: 2,
      children: 0,
      diets: ['alleadere'],
    });
    setLoading(false);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handleForgotPassword = () => {
    Alert.alert('Nulstil adgangskode', 'Vi sender dig et link til at nulstille din adgangskode.', [
      { text: 'OK' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🛒</Text>
            </View>
            <Text style={styles.logoText}>Tilbudsret</Text>
            <Text style={styles.logoTagline}>
              {isLogin ? 'Velkommen tilbage' : 'Opret din konto'}
            </Text>
          </View>

          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeTab, isLogin && styles.modeTabActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.modeTabText, isLogin && styles.modeTabTextActive]}>
                Log ind
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, !isLogin && styles.modeTabActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.modeTabText, !isLogin && styles.modeTabTextActive]}>
                Opret konto
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Google button */}
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogle} activeOpacity={0.85}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Fortsæt med Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>eller</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Name field (signup only) */}
            {!isLogin && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Navn</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Dit fulde navn"
                    placeholderTextColor={colors.grey}
                    value={name}
                    onChangeText={setName}
                    autoComplete="name"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="din@email.dk"
                  placeholderTextColor={colors.grey}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Adgangskode</Text>
                {isLogin && (
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotText}>Glemt adgangskode?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 tegn"
                  placeholderTextColor={colors.grey}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete={isLogin ? 'password' : 'new-password'}
                  returnKeyType={isLogin ? 'done' : 'next'}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Text style={styles.showPassword}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm password (signup only) */}
            {!isLogin && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Gentag adgangskode</Text>
                <View style={[
                  styles.inputWrapper,
                  confirmPassword.length > 0 && password !== confirmPassword && styles.inputWrapperError,
                  confirmPassword.length > 0 && password === confirmPassword && styles.inputWrapperSuccess,
                ]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Gentag adgangskode"
                    placeholderTextColor={colors.grey}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  {confirmPassword.length > 0 && (
                    <Text style={styles.matchIcon}>
                      {password === confirmPassword ? '✓' : '✗'}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonLoading]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? '...' : isLogin ? 'Log ind' : 'Opret konto'}
              </Text>
            </TouchableOpacity>

            {/* Terms (signup only) */}
            {!isLogin && (
              <Text style={styles.termsText}>
                Ved at oprette en konto accepterer du vores{' '}
                <Text style={styles.termsLink}>betingelser</Text> og{' '}
                <Text style={styles.termsLink}>privatlivspolitik</Text>.
              </Text>
            )}
          </View>

          {/* Switch mode */}
          <TouchableOpacity
            style={styles.switchMode}
            onPress={() => setMode(isLogin ? 'signup' : 'login')}
          >
            <Text style={styles.switchModeText}>
              {isLogin ? 'Har du ikke en konto? ' : 'Har du allerede en konto? '}
              <Text style={styles.switchModeLink}>
                {isLogin ? 'Opret konto' : 'Log ind'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.redLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoEmoji: { fontSize: 36 },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.red,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  logoTagline: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.grey,
  },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.greyLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.xl,
  },
  modeTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.grey,
  },
  modeTabTextActive: {
    color: colors.black,
  },

  // Form
  form: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  // Google button
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  googleIcon: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: '#4285F4',
    width: 24,
    textAlign: 'center',
  },
  googleText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.black,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.grey,
  },

  // Fields
  fieldGroup: { gap: 6 },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.black,
  },
  forgotText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.red,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
  },
  inputWrapperError: {
    borderColor: colors.red,
  },
  inputWrapperSuccess: {
    borderColor: colors.green,
  },
  inputIcon: { fontSize: 16 },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.black,
  },
  showPassword: { fontSize: 16 },
  matchIcon: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.green,
  },

  // Submit
  submitButton: {
    backgroundColor: colors.red,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonLoading: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.white,
  },

  // Terms
  termsText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontFamily: fonts.semiBold,
    color: colors.red,
  },

  // Switch mode
  switchMode: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  switchModeText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
  },
  switchModeLink: {
    fontFamily: fonts.bold,
    color: colors.red,
  },
});
