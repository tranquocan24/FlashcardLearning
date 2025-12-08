import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ColorTheme } from "../../../constants/theme";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../../utils/validation";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleRegister = async () => {
    // Validate all inputs
    const usernameValidation = validateUsername(formData.username);
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordValidation = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    const newErrors = {
      username: usernameValidation.error,
      email: emailValidation.error,
      password: passwordValidation.error,
      confirmPassword: confirmPasswordValidation.error,
    };

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== undefined)) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await register(
        formData.username.trim(),
        formData.email.trim(),
        formData.password
      );
      Alert.alert("Success", "Account created successfully!");
      // Navigation will be handled automatically by auth state change
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Please try again");
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
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start learning</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Username"
            placeholder="Choose a username"
            value={formData.username}
            onChangeText={(text) => updateField("username", text)}
            error={errors.username}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => updateField("email", text)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(text) => updateField("password", text)}
            error={errors.password}
            secureTextEntry
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={(text) => updateField("confirmPassword", text)}
            error={errors.confirmPassword}
            secureTextEntry
          />

          <Button
            title="Register"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            size="large"
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Button
              title="Login"
              onPress={() => navigation.navigate("Login")}
              variant="outline"
              size="small"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
    },
    header: {
      alignItems: "center",
      marginBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.secondaryText,
    },
    form: {
      width: "100%",
    },
    registerButton: {
      marginTop: 8,
    },
    loginContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
    },
    loginText: {
      fontSize: 14,
      color: colors.secondaryText,
    },
  });
