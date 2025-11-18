import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { HomeStackParamList, MainTabParamList } from "./types";

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
      <HomeStack.Screen name="FlashcardStudy" component={FlashcardStudyScreen} />
      <HomeStack.Screen name="Quiz" component={QuizScreen} />
      <HomeStack.Screen name="Match" component={MatchScreen} />
      <HomeStack.Screen name="Result" component={ResultScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
}

const SettingsScreen = () => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>Settings Screen</Text>
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}
      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
      />
    </View>
  );
};

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
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="CreateDeck"
        component={CreateDeckScreen}
        options={{
          title: "Create",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>➕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    width: "100%",
    maxWidth: 300,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    marginTop: 10,
    minWidth: 200,
  },
});
