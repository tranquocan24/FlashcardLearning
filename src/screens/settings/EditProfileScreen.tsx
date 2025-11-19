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
import { usersAPI } from '../../api/users';
import { useAuth } from '../../hooks/useAuth';
import { SettingsStackParamList } from '../../navigation/types';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<
    SettingsStackParamList,
    'EditProfile'
>;

export default function EditProfileScreen() {
    const navigation = useNavigation<EditProfileScreenNavigationProp>();
    const { user, updateUser } = useAuth();

    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        // Validation
        if (!username.trim()) {
            Alert.alert('Required', 'Please enter a username');
            return;
        }

        if (!email.trim()) {
            Alert.alert('Required', 'Please enter an email');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            if (!user?.id) {
                throw new Error('User not found');
            }

            console.log('Updating user:', {
                userId: user.id,
                username: username.trim(),
                email: email.trim(),
            });

            const updatedUser = await usersAPI.updateUser(user.id, {
                username: username.trim(),
                email: email.trim(),
            });

            console.log('Update response:', updatedUser);

            // Update user in context
            updateUser({
                ...user,
                username: updatedUser.username,
                email: updatedUser.email,
            });

            Alert.alert('Success', 'Profile updated successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            console.error('Error response:', error.response?.data);
            const message =
                error.response?.data?.error || 'Failed to update profile. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (username !== user?.username || email !== user?.email) {
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
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {username?.[0]?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.avatarHint}>
                        Your avatar is based on your username
                    </Text>
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

                    <View style={styles.field}>
                        <Text style={styles.label}>
                            Email <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            maxLength={100}
                            editable={!isLoading}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoIcon}>ℹ️</Text>
                        <Text style={styles.infoText}>
                            Changes to your email may require verification
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!username.trim() || !email.trim() || isLoading) &&
                            styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!username.trim() || !email.trim() || isLoading}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
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
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    cancelButton: {
        paddingVertical: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#007AFF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    placeholder: {
        width: 60,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#FFF',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 42,
        fontWeight: '700',
        color: '#FFF',
    },
    avatarHint: {
        fontSize: 13,
        color: '#8E8E93',
        textAlign: 'center',
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
        color: '#000',
    },
    required: {
        color: '#FF3B30',
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
    },
    hint: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#B3E0FF',
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#0055A5',
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#CCC',
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
});
