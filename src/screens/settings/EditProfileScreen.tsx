import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usersAPI } from "../../api/users";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { validateUsername } from "../../utils/validation";

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

const AVATAR_OPTIONS: AvatarKey[] = [
  "profile",
  "boy",
  "man",
  "woman",
  "cat",
  "gamer",
  "hacker",
];

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey>(
    (user?.avatar_url?.replace(".png", "") as AvatarKey) || "profile"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    // Validate username
    const validation = validateUsername(username);
    if (!validation.isValid) {
      setError(validation.error || "Invalid username");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const avatarUrl = `${selectedAvatar}.png`;

      // Call API to update profile
      const updatedUser = await usersAPI.updateProfile(user.id, {
        username: username.trim(),
        avatar_url: avatarUrl,
      });

      // Update local user state
      updateUser({
        ...user,
        username: updatedUser.username,
        avatar_url: updatedUser.avatar_url,
      });

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Current Avatar Preview */}
        <View style={styles.avatarPreviewSection}>
          <Text style={styles.sectionTitle}>Current Avatar</Text>
          <Image
            source={AVATARS[selectedAvatar]}
            style={styles.avatarPreview}
          />
        </View>

        {/* Avatar Selection */}
        <View style={styles.avatarSection}>
          <Text style={styles.sectionTitle}>Choose Avatar</Text>
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((avatarKey) => (
              <TouchableOpacity
                key={avatarKey}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatarKey && styles.avatarOptionSelected,
                ]}
                onPress={() => setSelectedAvatar(avatarKey)}
              >
                <Image source={AVATARS[avatarKey]} style={styles.avatarImage} />
                {selectedAvatar === avatarKey && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Username Input */}
        <View style={styles.inputSection}>
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError("");
            }}
            error={error}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Save Button */}
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isLoading}
          fullWidth
          size="large"
          style={styles.saveButton}
        />

        {/* Cancel Button */}
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          fullWidth
          size="large"
          disabled={isLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 20,
  },
  avatarPreviewSection: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
  },
  avatarSection: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  avatarOption: {
    width: "30%",
    aspectRatio: 1,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    padding: 8,
    position: "relative",
  },
  avatarOptionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  selectedBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  inputSection: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  saveButton: {
    marginBottom: 12,
  },
});
