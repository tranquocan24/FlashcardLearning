import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { progressAPI } from '../../api/progress';
import { useAuth } from '../../hooks/useAuth';
import { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Result'>;

export default function ResultScreen({ navigation, route }: Props) {
    const { type, total, correct, deckId } = route.params;
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const scaleAnim = new Animated.Value(1); // Start at 1 to show immediately

    useEffect(() => {
        // Entrance animation - subtle bounce
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();

        // Save session to backend
        saveSession();
    }, []);

    const saveSession = async () => {
        console.log('🔍 Attempting to save session...');
        console.log('👤 User:', user);
        console.log('📦 Session data:', { type, total, correct, deckId });

        if (!user?.id) {
            console.error('❌ Cannot save session: user.id is missing');
            return;
        }

        try {
            setIsSaving(true);
            console.log('💾 Calling progressAPI.saveSession...');
            await progressAPI.saveSession({
                user_id: user.id,
                deck_id: deckId,
                session_type: type,
                score: correct,
                total_cards: total,
            });
            console.log('✅ Session saved successfully');
        } catch (error) {
            console.error('❌ Failed to save session:', error);
            // Don't show error to user, just log it
        } finally {
            setIsSaving(false);
        }
    };

    const percentage = Math.round((correct / total) * 100);

    const getTitle = () => {
        switch (type) {
            case 'FLASHCARD':
                return 'Flashcard Study Complete!';
            case 'QUIZ':
                return 'Quiz Complete!';
            case 'MATCH':
                return 'Match Game Complete!';
            default:
                return 'Complete!';
        }
    };

    const getMessage = () => {
        if (percentage === 100) {
            return 'Perfect! 🎉';
        } else if (percentage >= 80) {
            return 'Great job! 👏';
        } else if (percentage >= 60) {
            return 'Good work! 👍';
        } else if (percentage >= 40) {
            return 'Keep practicing! 💪';
        } else {
            return 'Don\'t give up! 📚';
        }
    };

    const getScoreColor = () => {
        if (percentage >= 80) return '#34C759';
        if (percentage >= 60) return '#FF9500';
        return '#FF3B30';
    };

    const handleRestart = () => {
        navigation.replace('LearningMode', { deckId });
    };

    const handleGoHome = () => {
        navigation.navigate('HomeScreen');
    };

    const handleReview = () => {
        navigation.navigate('DeckDetail', { deckId });
    };

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

            <Animated.View
                style={[
                    styles.content,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                {/* Title */}
                <Text style={styles.title}>{getTitle()}</Text>
                <Text style={styles.message}>{getMessage()}</Text>

                {/* Score Circle */}
                <View style={styles.scoreContainer}>
                    <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
                        <Text style={[styles.scorePercentage, { color: getScoreColor() }]}>
                            {percentage}%
                        </Text>
                        <Text style={styles.scoreLabel}>Score</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{correct}</Text>
                        <Text style={styles.statLabel}>Correct</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{total - correct}</Text>
                        <Text style={styles.statLabel}>Incorrect</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                </View>

                {/* Encouragement based on score */}
                <View style={styles.tipContainer}>
                    {percentage < 60 && (
                        <>
                            <Text style={styles.tipIcon}>💡</Text>
                            <Text style={styles.tipText}>
                                Review the flashcards and try again to improve your score!
                            </Text>
                        </>
                    )}
                    {percentage >= 60 && percentage < 100 && (
                        <>
                            <Text style={styles.tipIcon}>🎯</Text>
                            <Text style={styles.tipText}>
                                You&apos;re doing well! Practice more to reach 100%!
                            </Text>
                        </>
                    )}
                    {percentage === 100 && (
                        <>
                            <Text style={styles.tipIcon}>🏆</Text>
                            <Text style={styles.tipText}>
                                Excellent! You&apos;ve mastered this deck!
                            </Text>
                        </>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.reviewButton]}
                        onPress={handleReview}
                    >
                        <Text style={styles.reviewButtonText}>Review Deck</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.restartButton]}
                        onPress={handleRestart}
                    >
                        <Text style={styles.restartButtonText}>Try Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.homeButton]}
                        onPress={handleGoHome}
                    >
                        <Text style={styles.homeButtonText}>Go Home</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingTop: 50,
    },
    backButtonContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#FFF',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        alignSelf: 'flex-start',
    },
    backIcon: {
        fontSize: 24,
        color: '#007AFF',
        marginRight: 4,
    },
    backText: {
        fontSize: 17,
        color: '#007AFF',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 18,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 20,
    },
    scoreContainer: {
        marginVertical: 20,
    },
    scoreCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    scorePercentage: {
        fontSize: 48,
        fontWeight: '700',
    },
    scoreLabel: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#8E8E93',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E5EA',
        marginHorizontal: 12,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
        width: '100%',
        borderWidth: 1,
        borderColor: '#B3E0FF',
    },
    tipIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#0055A5',
        lineHeight: 20,
    },
    actionsContainer: {
        width: '100%',
        marginTop: 20,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    reviewButton: {
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    reviewButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#007AFF',
    },
    restartButton: {
        backgroundColor: '#007AFF',
    },
    restartButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
    homeButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    homeButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#8E8E93',
    },
});
