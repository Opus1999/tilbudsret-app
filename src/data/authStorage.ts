import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  email: string;
  postalCode: string;
  cityName: string;
  adults: number;
  children: number;
  diets: string[];
}

const KEYS = {
  AUTH_USER: 'auth_user',
  AUTH_TOKEN: 'auth_token',
} as const;

export async function saveUser(user: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
  await AsyncStorage.setItem(KEYS.AUTH_TOKEN, 'mock_token_' + Date.now());
}

export async function loadUser(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.AUTH_USER);
  return raw ? JSON.parse(raw) : null;
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  return token !== null;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.AUTH_USER, KEYS.AUTH_TOKEN]);
}
