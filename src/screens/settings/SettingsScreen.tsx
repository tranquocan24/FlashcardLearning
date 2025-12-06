import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { ColorTheme } from '../../../constants/theme';
import { SettingsStackParamList } from '../../navigation/types';

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

type SettingsScreenNavigationProp = NativeStackNavigationProp<
    SettingsStackParamList,
    'SettingsScreen'
>;

export default function SettingsScreen() {
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark, colors } = useTheme();

    const styles = createStyles(colors);

    const handleEditProfile = () => {
        navigation.navigate('EditProfile');
    };

    const handleChangePassword = () => {
        navigation.navigate('ChangePassword');
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await logout();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to logout');
                    }
                },
            },
        ]);
    };

    const MenuItem = ({
        icon,
        title,
        onPress,
        showArrow = true,
    }: {
        icon: string;
        title: string;
        onPress: () => void;
        showArrow?: boolean;
    }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>{icon}</Text>
                <Text style={styles.menuTitle}>{title}</Text>
            </View>
            {showArrow && <Text style={styles.menuArrow}>›</Text>}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Settings</Text>
                </View>

                {/* User Info Card */}
                <View style={styles.section}>
                    <View style={styles.userCard}>
                        <View style={styles.avatarContainer}>
                            {user?.avatar_url ? (
                                <Image
                                    source={AVATARS[(user.avatar_url.replace('.png', '')) as AvatarKey] || AVATARS.profile}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </Text>
                            )}
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.username}>{user?.username || 'User'}</Text>
                            <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
                        </View>
                    </View>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem
                            icon="👤"
                            title="Edit Profile"
                            onPress={handleEditProfile}
                        />
                        <View style={styles.separator} />
                        <MenuItem
                            icon="🔒"
                            title="Change Password"
                            onPress={handleChangePassword}
                        />
                    </View>
                </View>

                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={styles.menuGroup}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuLeft}>
                                <Text style={styles.menuIcon}>🌙</Text>
                                <Text style={styles.menuTitle}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                                thumbColor="#FFF"
                                ios_backgroundColor="#D1D1D6"
                            />
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <View style={styles.menuGroup}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuLeft}>
                                <Text style={styles.menuIcon}>📱</Text>
                                <Text style={styles.menuTitle}>Version</Text>
                            </View>
                            <Text style={styles.versionText}>1.0.0</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.text,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.tertiaryText,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 15,
        color: colors.secondaryText,
    },
    menuGroup: {
        backgroundColor: colors.card,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: colors.card,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    menuTitle: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    menuArrow: {
        fontSize: 24,
        color: colors.secondaryText,
        fontWeight: '300',
    },
    separator: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginLeft: 48,
    },
    versionText: {
        fontSize: 15,
        color: colors.secondaryText,
    },
    logoutButton: {
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    logoutText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.error,
    },
});
