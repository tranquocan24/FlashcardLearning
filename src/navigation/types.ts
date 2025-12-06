// Navigation types for type safety
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  CreateDeck: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  FolderDetail: { folderId: string };
  DeckDetail: { deckId: string };
  AddFlashcard: { deckId: string };
  EditFlashcard: { flashcardId: string; deckId: string };
  LearningMode: { deckId: string };
  FlashcardStudy: { deckId: string };
  Quiz: { deckId: string };
  Match: { deckId: string };
  Result: {
    type: 'FLASHCARD' | 'QUIZ' | 'MATCH';
    total: number;
    correct: number;
    deckId: string;
  };
};

export type SettingsStackParamList = {
  SettingsScreen: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};
