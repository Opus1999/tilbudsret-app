import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { AuthScreen } from './src/screens/AuthScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RecipeScreen } from './src/screens/RecipeScreen';
import { ShoppingListScreen } from './src/screens/ShoppingListScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

type InitialRoute = 'Auth' | 'Onboarding' | 'Home';

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const [initialRoute, setInitialRoute] = useState<InitialRoute | null>(null);

  useEffect(() => {
    // DEV: skip auth and onboarding, go straight to Home
    setInitialRoute('Home');
  }, []);

  if (!fontsLoaded || initialRoute === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Auth"         component={AuthScreen} />
        <Stack.Screen name="Onboarding"   component={OnboardingScreen} />
        <Stack.Screen name="Home"         component={HomeScreen} />
        <Stack.Screen name="Recipe"        component={RecipeScreen} />
        <Stack.Screen name="ShoppingList"  component={ShoppingListScreen} />
        <Stack.Screen name="Profile"       component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
