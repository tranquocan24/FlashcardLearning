import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usersAPI } from "../../api/users";
import { useAuth } from "../../hooks/useAuth";
import { SettingsStackParamList } from "../../navigation/types";

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

type EditProfileScreenNavigationProp = NativeStackNavigationProp<
  SettingsStackParamList,
  "EditProfile"
>;

export default function EditProfileScreen() {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey>(
    (user?.avatar_url?.replace(".png", "") as AvatarKey) || "profile"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert("Required", "Please enter a username");
      return;
    }

    if (username.trim().length < 3) {
      Alert.alert("Invalid", "Username must be at least 3 characters");
      return;
    }

    setIsLoading(true);
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const avatarUrl = `${selectedAvatar}.png`;

      console.log("Updating user:", {
        userId: user.id,
        username: username.trim(),
        avatar_url: avatarUrl,
      });

      const updatedUser = await usersAPI.updateUser(user.id, {
        username: username.trim(),
        avatar_url: avatarUrl,
      });

      console.log("Update response:", updatedUser);

      // Update user in context
      updateUser({
        ...user,
        username: updatedUser.username,
        avatar_url: updatedUser.avatar_url,
      });

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      console.error("Error response:", error.response?.data);
      const message =
        error.response?.data?.error ||
        "Failed to update profile. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges =
      username !== user?.username ||
      selectedAvatar !== user?.avatar_url?.replace(".png", "");

    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarPreview}>
            <Image
              source={AVATARS[selectedAvatar]}
              style={styles.avatarImage}
            />
          </View>
          <Text style={styles.avatarHint}>Tap avatars below to change</Text>
        </View>

        {/* Avatar Selection Grid */}
        <View style={styles.avatarSelectionSection}>
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
                disabled={isLoading}
              >
                <Image
                  source={AVATARS[avatarKey]}
                  style={styles.avatarOptionImage}
                />
                {selectedAvatar === avatarKey && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>
              Username <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              maxLength={50}
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />
            <Text style={styles.hint}>{username.length}/50</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Change your avatar and username</Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !username.trim() && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!username.trim() || isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: {
    width: 60,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFF",
    marginBottom: 20,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#E0E0E0",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarHint: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
  },
  avatarSelectionSection: {
    backgroundColor: "#FFF",
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
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
    overflow: "hidden",
    position: "relative",
  },
  avatarOptionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  avatarOptionImage: {
    width: "100%",
    height: "100%",
  },
  selectedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
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
  form: {
    padding: 20,
    gap: 24,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  infoBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#B3E0FF",
  },
  infoText: {
    fontSize: 13,
    color: "#0055A5",
    lineHeight: 18,
    textAlign: "center",
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#CCC",
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFF",
  },
});
