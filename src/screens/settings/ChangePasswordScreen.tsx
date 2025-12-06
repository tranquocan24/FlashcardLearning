import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ColorTheme } from '../../../constants/theme';
import { usersAPI } from '../../api/users';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { SettingsStackParamList } from '../../navigation/types';

type ChangePasswordScreenNavigationProp = NativeStackNavigationProp<
    SettingsStackParamList,
    'ChangePassword'
>;

export default function ChangePasswordScreen() {
    const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
    const { user } = useAuth();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async () => {
        // Validation
        if (!currentPassword.trim()) {
            Alert.alert('Required', 'Please enter your current password');
            return;
        }

        if (!newPassword.trim()) {
            Alert.alert('Required', 'Please enter a new password');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Invalid Password', 'Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Passwords Do Not Match', 'Please make sure passwords match');
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert(
                'Same Password',
                'New password must be different from current password'
            );
            return;
        }

        setIsLoading(true);
        try {
            if (!user?.id) {
                throw new Error('User not found');
            }

            console.log('Changing password for user:', user.id);

            await usersAPI.changePassword(user.id, {
                currentPassword: currentPassword.trim(),
                newPassword: newPassword.trim(),
            });

            console.log('Password changed successfully');

            Alert.alert('Success', 'Password changed successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            console.error('Error response:', error.response?.data);
            const message =
                error.response?.data?.error || 'Failed to change password. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (currentPassword || newPassword || confirmPassword) {
            Alert.alert('Discard Changes', 'Are you sure you want to discard your changes?', [
                { text: 'Keep Editing', style: 'cancel' },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } else {
            navigation.goBack();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                    <Text style={styles.headerTitle}>Change Password</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>
                            Current Password <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter current password"
                                placeholderTextColor="#999"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrentPassword}
                                editable={!isLoading}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                <Text style={styles.eyeIcon}>
                                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>
                            New Password <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password (min 6 characters)"
                                placeholderTextColor="#999"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                editable={!isLoading}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowNewPassword(!showNewPassword)}
                            >
                                <Text style={styles.eyeIcon}>
                                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {newPassword.length > 0 && newPassword.length < 6 && (
                            <Text style={styles.errorText}>
                                Password must be at least 6 characters
                            </Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>
                            Confirm New Password <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter new password"
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                editable={!isLoading}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Text style={styles.eyeIcon}>
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                            <Text style={styles.errorText}>Passwords do not match</Text>
                        )}
                    </View>

                    <View style={styles.tipBox}>
                        <Text style={styles.tipTitle}>🔐 Security Tips</Text>
                        <Text style={styles.tipText}>
                            • Use at least 6 characters{'\n'}
                            • Mix uppercase and lowercase letters{'\n'}
                            • Include numbers and special characters{'\n'}
                            • Avoid common words or patterns
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!currentPassword.trim() ||
                            !newPassword.trim() ||
                            !confirmPassword.trim() ||
                            newPassword !== confirmPassword ||
                            newPassword.length < 6 ||
                            isLoading) &&
                        styles.saveButtonDisabled,
                    ]}
                    onPress={handleChangePassword}
                    disabled={
                        !currentPassword.trim() ||
                        !newPassword.trim() ||
                        !confirmPassword.trim() ||
                        newPassword !== confirmPassword ||
                        newPassword.length < 6 ||
                        isLoading
                    }
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? 'Changing...' : 'Change Password'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const createStyles = (colors: ColorTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cancelButton: {
        paddingVertical: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: colors.primary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    placeholder: {
        width: 60,
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
        fontWeight: '600',
        color: colors.text,
    },
    required: {
        color: colors.error,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingRight: 50,
        fontSize: 16,
        color: colors.text,
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        padding: 4,
    },
    eyeIcon: {
        fontSize: 20,
    },
    errorText: {
        fontSize: 13,
        color: colors.error,
        marginTop: -4,
    },
    tipBox: {
        backgroundColor: colors.secondaryBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: colors.secondaryText,
        lineHeight: 20,
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: colors.border,
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
});
