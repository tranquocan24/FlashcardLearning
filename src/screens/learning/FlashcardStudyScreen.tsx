import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { flashcardsAPI } from '../../api/flashcards';
import { HomeStackParamList } from '../../navigation/types';
import { Flashcard } from '../../types/models';

type Props = NativeStackScreenProps<HomeStackParamList, 'FlashcardStudy'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function FlashcardStudyScreen({ navigation, route }: Props) {
    const { deckId } = route.params;
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState<Set<string>>(new Set());

    // Animation values
    const flipAnim = useRef(new Animated.Value(0)).current;
    const swipeAnim = useRef(new Animated.ValueXY()).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchFlashcards();
    }, []);

    const fetchFlashcards = async () => {
        try {
            setIsLoading(true);
            const response = await flashcardsAPI.getFlashcardsByDeck(deckId);
            const cards = response.data || [];
            const shuffled = [...cards].sort(() => Math.random() - 0.5);
            setFlashcards(shuffled);
        } catch (error) {
            console.error('Failed to fetch flashcards:', error);
            Alert.alert('Error', 'Failed to load flashcards');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const flipCard = () => {
        if (isFlipped) {
            Animated.spring(flipAnim, {
                toValue: 0,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(flipAnim, {
                toValue: 180,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
        }
        setIsFlipped(!isFlipped);
    };

    const handleKnown = () => {
        const currentCard = flashcards[currentIndex];
        const newKnownCards = new Set([...knownCards, currentCard.id]);
        setKnownCards(newKnownCards);
        goToNext(newKnownCards);
    };

    const handleNotKnown = () => {
        goToNext();
    };

    const goToNext = (currentKnownCards?: Set<string>) => {
        if (currentIndex >= flashcards.length - 1) {
            // Finished all cards
            const correct = (currentKnownCards || knownCards).size;
            const total = flashcards.length;
            navigation.replace('Result', {
                type: 'FLASHCARD',
                total,
                correct,
                deckId,
            });
            return;
        }

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
            flipAnim.setValue(0);
            swipeAnim.setValue({ x: 0, y: 0 });
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });
    };

    // Pan responder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                swipeAnim.setValue({ x: gesture.dx, y: 0 });
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    // Swipe right - Known
                    Animated.timing(swipeAnim, {
                        toValue: { x: SCREEN_WIDTH, y: 0 },
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => {
                        handleKnown();
                        swipeAnim.setValue({ x: 0, y: 0 });
                    });
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    // Swipe left - Not known
                    Animated.timing(swipeAnim, {
                        toValue: { x: -SCREEN_WIDTH, y: 0 },
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => {
                        handleNotKnown();
                        swipeAnim.setValue({ x: 0, y: 0 });
                    });
                } else {
                    // Return to center
                    Animated.spring(swipeAnim, {
                        toValue: { x: 0, y: 0 },
                        friction: 5,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (flashcards.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No flashcards available</Text>
            </View>
        );
    }

    const currentCard = flashcards[currentIndex];
    const progress = ((currentIndex + 1) / flashcards.length) * 100;

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    const frontOpacity = flipAnim.interpolate({
        inputRange: [0, 90, 180],
        outputRange: [1, 0, 0],
    });

    const backOpacity = flipAnim.interpolate({
        inputRange: [0, 90, 180],
        outputRange: [0, 0, 1],
    });

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

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>
                    {currentIndex + 1} / {flashcards.length}
                </Text>
            </View>

            {/* Flashcard */}
            <View style={styles.cardContainer}>
                <Animated.View
                    style={[
                        styles.cardWrapper,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateX: swipeAnim.x },
                                {
                                    rotate: swipeAnim.x.interpolate({
                                        inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                                        outputRange: ['-15deg', '0deg', '15deg'],
                                    })
                                },
                            ],
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={flipCard}
                        style={styles.card}
                    >
                        {/* Front Side - Word */}
                        <Animated.View
                            style={[
                                styles.cardFace,
                                styles.cardFront,
                                {
                                    opacity: frontOpacity,
                                    transform: [{ rotateY: frontInterpolate }],
                                },
                            ]}
                        >
                            <Text style={styles.cardLabel}>Word</Text>
                            <Text style={styles.cardWord}>{currentCard.word}</Text>
                            <Text style={styles.tapHint}>Tap to flip</Text>
                        </Animated.View>

                        {/* Back Side - Meaning + Example */}
                        <Animated.View
                            style={[
                                styles.cardFace,
                                styles.cardBack,
                                {
                                    opacity: backOpacity,
                                    transform: [{ rotateY: backInterpolate }],
                                },
                            ]}
                        >
                            <Text style={styles.cardLabel}>Meaning</Text>
                            <Text style={styles.cardMeaning}>{currentCard.meaning}</Text>
                            {currentCard.example && (
                                <>
                                    <View style={styles.divider} />
                                    <Text style={styles.exampleLabel}>Example</Text>
                                    <Text style={styles.cardExample}>{currentCard.example}</Text>
                                </>
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Swipe Hints */}
                <View style={styles.hintsContainer}>
                    <Text style={styles.hintLeft}>← Học tiếp</Text>
                    <Text style={styles.hintRight}>Đã nhớ →</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.notKnownButton]}
                    onPress={handleNotKnown}
                >
                    <Text style={styles.actionButtonText}>Học tiếp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.knownButton]}
                    onPress={handleKnown}
                >
                    <Text style={styles.actionButtonText}>Đã nhớ</Text>
                </TouchableOpacity>
            </View>
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    progressContainer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E5EA',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        fontWeight: '500',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    cardWrapper: {
        width: SCREEN_WIDTH - 40,
        height: 400,
    },
    card: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardFace: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        backgroundColor: '#FFF',
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backfaceVisibility: 'hidden',
    },
    cardFront: {},
    cardBack: {},
    cardLabel: {
        fontSize: 12,
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    cardWord: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginBottom: 16,
    },
    cardMeaning: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 16,
    },
    divider: {
        width: '80%',
        height: 1,
        backgroundColor: '#E5E5EA',
        marginVertical: 16,
    },
    exampleLabel: {
        fontSize: 12,
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    cardExample: {
        fontSize: 16,
        color: '#3C3C43',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    tapHint: {
        fontSize: 14,
        color: '#C7C7CC',
        marginTop: 'auto',
    },
    hintsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
        paddingHorizontal: 20,
    },
    hintLeft: {
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: '500',
    },
    hintRight: {
        fontSize: 14,
        color: '#34C759',
        fontWeight: '500',
    },
    actionsContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notKnownButton: {
        backgroundColor: '#FF3B30',
    },
    knownButton: {
        backgroundColor: '#34C759',
    },
    actionButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
    },
});
