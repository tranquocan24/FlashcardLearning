import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ColorTheme } from "../../../constants/theme";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import GoogleAuthService from "../../services/GoogleAuthService";
import { validateEmail, validatePassword } from "../../utils/validation";

export default function LoginScreen({ navigation }: any) {
  const { login, loginWithGoogle } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async () => {
    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setErrors({
        email: emailValidation.error,
        password: passwordValidation.error,
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      // Navigation will be handled automatically by auth state change
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await GoogleAuthService.signIn();

      console.log("Google Sign-In result:", JSON.stringify(result, null, 2));

      if (result.success && result.data) {
        console.log("Google data structure:", JSON.stringify(result, null, 2));

        // Extract user info from Google Sign-In result
        // The structure is: result.data.data.user (nested data)
        const googleData = result.data.data || result.data;

        // Type guard: Check if googleData has user property
        if (!googleData || typeof googleData !== 'object' || !('user' in googleData)) {
          Alert.alert("Error", "Invalid response structure from Google");
          console.error("Full result:", result);
          return;
        }

        const googleUser = googleData.user;

        if (!googleUser?.id || !googleUser?.email) {
          Alert.alert("Error", "Incomplete user data from Google");
          console.error("User data:", googleUser);
          return;
        }

        console.log("Calling loginWithGoogle with user data...");
        console.log("User data:", {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          photo: googleUser.photo,
        });

        // Use AuthContext's loginWithGoogle with user data
        await loginWithGoogle({
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name || googleUser.givenName || googleUser.email.split('@')[0],
          photo: googleUser.photo || undefined,
        });

        Alert.alert("Welcome!", "Signed in successfully with Google");
      } else {
        Alert.alert("Sign-In Failed", result.error || "Could not sign in with Google");
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      Alert.alert(
        "Sign-In Error",
        error.message || "An error occurred during Google sign-in"
      );
    } finally {
      setIsGoogleLoading(false);
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
          <Text style={styles.title}>Flashcard Learning</Text>
          <Text style={styles.subtitle}>Login to continue learning</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            secureTextEntry
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            size="large"
            style={styles.loginButton}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don&apos;t have an account?{" "}
            </Text>
            <Button
              title="Register"
              onPress={() => navigation.navigate("Register")}
              variant="outline"
              size="small"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorTheme) => StyleSheet.create({
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
    marginBottom: 40,
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
  loginButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.tertiaryText,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  registerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
});
