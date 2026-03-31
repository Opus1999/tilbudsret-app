import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Home: undefined;
  Recipe: { recipeId: string };
  ShoppingList: undefined;
  Profile: undefined;
};

export type AuthNavigationProp         = NativeStackNavigationProp<RootStackParamList, 'Auth'>;
export type OnboardingNavigationProp   = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
export type HomeScreenNavigationProp   = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type RecipeNavigationProp       = NativeStackNavigationProp<RootStackParamList, 'Recipe'>;
export type RecipeRouteProp            = RouteProp<RootStackParamList, 'Recipe'>;
export type ShoppingListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ShoppingList'>;
export type ProfileNavigationProp      = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
