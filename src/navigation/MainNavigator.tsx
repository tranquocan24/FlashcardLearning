import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { MainTabParamList } from "./types";

// Placeholder screens - will be created in Phase 2
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

const HomeScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.text}>Home Screen (Coming in Phase 2)</Text>
  </View>
);

const CreateDeckScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.text}>Create Deck Screen (Coming in Phase 2)</Text>
  </View>
);

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
        headerShown: true,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
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
