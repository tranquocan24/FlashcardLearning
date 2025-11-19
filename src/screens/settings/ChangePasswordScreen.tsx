import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { usersAPI } from "../../api/users";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { validatePassword } from "../../utils/validation";

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleChangePassword = async () => {
    // Reset errors
    setErrors({});

    // Validate current password
    if (!currentPassword) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: "Current password is required",
      }));
      return;
    }

    // Validate new password
    const newPasswordValidation = validatePassword(newPassword);
    if (!newPasswordValidation.isValid) {
      setErrors((prev) => ({
        ...prev,
        newPassword: newPasswordValidation.error,
      }));
      return;
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "New password must be different from current password",
      }));
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not found");
      return;
    }

    setIsLoading(true);

    try {
      await usersAPI.changePassword(user.id, {
        currentPassword,
        newPassword,
      });

      Alert.alert(
        "Success",
        "Password changed successfully. Please login again with your new password.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formSection}>
          <Input
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              setErrors((prev) => ({ ...prev, currentPassword: undefined }));
            }}
            error={errors.currentPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="New Password"
            placeholder="Enter new password (min 6 characters)"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }}
            error={errors.newPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            title="Change Password"
            onPress={handleChangePassword}
            loading={isLoading}
            fullWidth
            size="large"
            style={styles.changeButton}
          />

          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            fullWidth
            size="large"
            disabled={isLoading}
          />
        </View>
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
  formSection: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
  },
  changeButton: {
    marginBottom: 12,
    marginTop: 8,
  },
});
