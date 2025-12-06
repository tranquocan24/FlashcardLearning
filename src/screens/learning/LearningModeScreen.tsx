import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ColorTheme } from '../../../constants/theme';
import { flashcardsAPI } from '../../api/flashcards';
import { useTheme } from '../../context/ThemeContext';
import { HomeStackParamList } from '../../navigation/types';
import { Flashcard } from '../../types/models';

type Props = NativeStackScreenProps<HomeStackParamList, 'LearningMode'>;

interface ModeOption {
    id: 'FLASHCARD' | 'QUIZ' | 'MATCH';
    title: string;
    description: string;
    icon: string;
    color: string;
}

const modes: ModeOption[] = [
    {
        id: 'FLASHCARD',
        title: 'Flashcard Study',
        description: 'Lật thẻ để xem nghĩa và ví dụ',
        icon: '🃏',
        color: 'primary' as const,
    },
    {
        id: 'QUIZ',
        title: 'Quiz',
        description: 'Trắc nghiệm 4 đáp án',
        icon: '✍️',
        color: 'success' as const,
    },
    {
        id: 'MATCH',
        title: 'Match Game',
        description: 'Nối từ với nghĩa tương ứng',
        icon: '🎯',
        color: 'warning' as const,
    },
];

export default function LearningModeScreen({ navigation, route }: Props) {
    const { deckId } = route.params;
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { colors } = useTheme();
    const styles = createStyles(colors);

    useEffect(() => {
        fetchFlashcards();
    }, []);

    const fetchFlashcards = async () => {
        try {
            setIsLoading(true);
            const response = await flashcardsAPI.getFlashcardsByDeck(deckId);
            const cards = response.data || [];
            setFlashcards(cards);
        } catch (error) {
            console.error('Failed to fetch flashcards:', error);
            Alert.alert('Error', 'Failed to load flashcards');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModeSelect = (mode: 'FLASHCARD' | 'QUIZ' | 'MATCH') => {
        if (flashcards.length === 0) {
            Alert.alert('No Flashcards', 'This deck has no flashcards yet.');
            return;
        }

        if (mode === 'QUIZ' && flashcards.length < 4) {
            Alert.alert(
                'Not Enough Cards',
                'You need at least 4 flashcards to play Quiz mode.'
            );
            return;
        }

        if (mode === 'MATCH' && flashcards.length < 4) {
            Alert.alert(
                'Not Enough Cards',
                'You need at least 4 flashcards to play Match game.'
            );
            return;
        }

        switch (mode) {
            case 'FLASHCARD':
                navigation.navigate('FlashcardStudy', { deckId });
                break;
            case 'QUIZ':
                navigation.navigate('Quiz', { deckId });
                break;
            case 'MATCH':
                navigation.navigate('Match', { deckId });
                break;
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <View style={styles.backButtonContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backIcon}>←</Text>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>Choose Learning Mode</Text>
                <Text style={styles.subtitle}>
                    {flashcards.length} {flashcards.length === 1 ? 'card' : 'cards'} in
                    this deck
                </Text>
            </View>

            <View style={styles.modesContainer}>
                {modes.map((mode) => {
                    let borderColor = colors.primary;
                    if (mode.color === 'success') borderColor = colors.success;
                    else if (mode.color === 'warning') borderColor = colors.warning;

                    return (
                        <TouchableOpacity
                            key={mode.id}
                            style={[styles.modeCard, { borderLeftColor: borderColor }]}
                            onPress={() => handleModeSelect(mode.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.modeIconContainer}>
                                <Text style={styles.modeIcon}>{mode.icon}</Text>
                            </View>
                            <View style={styles.modeContent}>
                                <Text style={styles.modeTitle}>{mode.title}</Text>
                                <Text style={styles.modeDescription}>{mode.description}</Text>
                            </View>
                            <View style={styles.modeArrow}>
                                <Text style={styles.arrowText}>›</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {flashcards.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No flashcards yet</Text>
                    <Text style={styles.emptySubtext}>
                        Add some flashcards to start learning
                    </Text>
                </View>
            )}
        </View>

    );
}

const createStyles = (colors: ColorTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 50, // Thêm padding để tránh camera notch
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    backButtonContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: colors.card,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        alignSelf: 'flex-start',
    },
    backIcon: {
        fontSize: 24,
        color: colors.primary,
        marginRight: 4,
    },
    backText: {
        fontSize: 17,
        color: colors.primary,
        fontWeight: '500',
    },
    header: {
        padding: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        color: colors.secondaryText,
    },
    modesContainer: {
        padding: 16,
    },
    modeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    modeIconContainer: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.secondaryBackground,
        borderRadius: 10,
        marginRight: 12,
    },
    modeIcon: {
        fontSize: 24,
    },
    modeContent: {
        flex: 1,
    },
    modeTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    modeDescription: {
        fontSize: 14,
        color: colors.secondaryText,
    },
    modeArrow: {
        marginLeft: 8,
    },
    arrowText: {
        fontSize: 28,
        color: colors.tertiaryText,
        fontWeight: '300',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 15,
        color: colors.secondaryText,
        textAlign: 'center',
    },
});
