import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const buttonStyle = [
    styles.button,
    variant === "primary" && { backgroundColor: colors.primary },
    variant === "secondary" && { backgroundColor: colors.secondary },
    variant === "outline" && { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.primary },
    styles[`button_${size}`],
    fullWidth ? styles.fullWidth : null,
    disabled || loading ? styles.disabled : null,
    style,
  ].filter(Boolean);

  const textStyle: TextStyle[] = [
    styles.text,
    variant === "outline" ? { color: colors.primary } : { color: colors.card },
    styles[`text_${size}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? colors.primary : colors.card} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  button_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  button_large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
});
