import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { MainTabParamList } from "./types";

// Placeholder screens - will be created in Phase 2
import { StyleSheet, Text, View } from "react-native";

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

const SettingsScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.text}>Settings Screen (Coming in Phase 4)</Text>
  </View>
);

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
  },
  text: {
    fontSize: 18,
    color: "#666",
  },
});
