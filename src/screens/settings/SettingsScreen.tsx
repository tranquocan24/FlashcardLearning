import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";

// Avatar images mapping
const AVATARS = {
  boy: require("../../resources/images/boy.png"),
  cat: require("../../resources/images/cat.png"),
  gamer: require("../../resources/images/gamer.png"),
  hacker: require("../../resources/images/hacker.png"),
  man: require("../../resources/images/man.png"),
  profile: require("../../resources/images/profile.png"),
  woman: require("../../resources/images/woman.png"),
};

type AvatarKey = keyof typeof AVATARS;

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

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

  const getAvatarSource = (avatarUrl?: string) => {
    if (!avatarUrl) return AVATARS.profile;
    const avatarKey = avatarUrl.replace(".png", "") as AvatarKey;
    return AVATARS[avatarKey] || AVATARS.profile;
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={getAvatarSource(user?.avatar_url)}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user?.username || "User"}</Text>
        <Text style={styles.email}>{user?.email || "email@example.com"}</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>EP</Text>
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>PW</Text>
            </View>
            <Text style={styles.menuText}>Change Password</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Alert.alert(
              "About",
              "FlashcardLearning v1.0.0\n\nA flashcard learning app with quiz and match games.\n\nDeveloped with React Native + Expo",
              [{ text: "OK" }]
            );
          }}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>i</Text>
            </View>
            <Text style={styles.menuText}>About</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  profileSection: {
    backgroundColor: "#FFF",
    alignItems: "center",
    paddingVertical: 40,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: "#E0E0E0",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  menuSection: {
    backgroundColor: "#FFF",
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 20,
    color: "#007AFF",
    fontWeight: "600",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  menuArrow: {
    fontSize: 24,
    color: "#999",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: 60,
  },
  logoutButton: {
    backgroundColor: "#FFF",
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});
