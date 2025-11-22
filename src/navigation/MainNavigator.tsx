import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList, MainTabParamList, SettingsStackParamList } from "./types";

// Home Stack Screens
import AddFlashcardScreen from "../screens/flashcard/AddFlashcardScreen";
import EditFlashcardScreen from "../screens/flashcard/EditFlashcardScreen";
import CreateDeckScreen from "../screens/home/CreateDeckScreen";
import DeckDetailScreen from "../screens/home/DeckDetailScreen";
import HomeScreen from "../screens/home/HomeScreen";

// Learning Screens (Phase 3)
import FlashcardStudyScreen from "../screens/learning/FlashcardStudyScreen";
import LearningModeScreen from "../screens/learning/LearningModeScreen";
import MatchScreen from "../screens/learning/MatchScreen";
import QuizScreen from "../screens/learning/QuizScreen";
import ResultScreen from "../screens/learning/ResultScreen";

// Settings Screens (Phase 4)
import ChangePasswordScreen from "../screens/settings/ChangePasswordScreen";
import EditProfileScreen from "../screens/settings/EditProfileScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="DeckDetail" component={DeckDetailScreen} />
      <HomeStack.Screen name="AddFlashcard" component={AddFlashcardScreen} />
      <HomeStack.Screen name="EditFlashcard" component={EditFlashcardScreen} />
      {/* Learning screens - Phase 3 */}
      <HomeStack.Screen name="LearningMode" component={LearningModeScreen} />
      <HomeStack.Screen
        name="FlashcardStudy"
        component={FlashcardStudyScreen}
      />
      <HomeStack.Screen name="Quiz" component={QuizScreen} />
      <HomeStack.Screen name="Match" component={MatchScreen} />
      <HomeStack.Screen
        name="Result"
        component={ResultScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsScreen" component={SettingsScreen} />
      <SettingsStack.Screen name="EditProfile" component={EditProfileScreen} />
      <SettingsStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </SettingsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: "My Decks",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CreateDeck"
        component={CreateDeckScreen}
        options={{
          title: "Create",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
