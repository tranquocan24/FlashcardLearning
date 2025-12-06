import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
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
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // Animation values
    const flipAnim = useRef(new Animated.Value(0)).current;
    const swipeAnim = useRef(new Animated.ValueXY()).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const sound = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        fetchFlashcards();

        return () => {
            if (sound.current) {
                sound.current.unloadAsync();
            }
        };
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

    const findAudioUrl = (data: any[]): string | null => {
        // First pass: look for US pronunciation
        for (const entry of data) {
            if (!entry.phonetics) continue;

            const usAudio = entry.phonetics.find((p: any) =>
                p.audio && (p.audio.includes('-us.mp3') || p.audio.includes('-US.mp3'))
            );
            if (usAudio) return usAudio.audio;
        }

        // Second pass: accept any audio
        for (const entry of data) {
            if (!entry.phonetics) continue;

            const anyAudio = entry.phonetics.find((p: any) => p.audio);
            if (anyAudio) return anyAudio.audio;
        }

        return null;
    };

    const playPronunciation = async (word: string) => {
        if (!word.trim()) {
            return;
        }

        setIsPlayingAudio(true);
        try {
            // Unload previous sound if exists
            if (sound.current) {
                await sound.current.unloadAsync();
                sound.current = null;
            }

            // Fetch audio from Free Dictionary API
            const response = await fetch(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`
            );

            if (!response.ok) {
                throw new Error('Word not found or no pronunciation available');
            }

            const data = await response.json();
            const audioUrl = findAudioUrl(data);

            if (!audioUrl) {
                throw new Error('No pronunciation audio available for this word');
            }

            // Play audio
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );

            sound.current = newSound;

            // Auto cleanup when finished
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setIsPlayingAudio(false);
                }
            });

        } catch (error: any) {
            console.error('Audio error:', error);
            // Silently fail in study mode - don't interrupt learning
        } finally {
            setIsPlayingAudio(false);
        }
    };

    const handlePrevious = () => {
        if (currentIndex <= 0) return;

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setCurrentIndex(currentIndex - 1);
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

    const handleContinue = () => {
        goToNext();
    };

    const goToNext = () => {
        if (currentIndex >= flashcards.length - 1) {
            // Finished all cards
            navigation.replace('Result', {
                type: 'FLASHCARD',
                total: flashcards.length,
                correct: flashcards.length, // All cards reviewed
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
                    // Swipe right - Continue
                    Animated.timing(swipeAnim, {
                        toValue: { x: SCREEN_WIDTH, y: 0 },
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => {
                        handleContinue();
                        swipeAnim.setValue({ x: 0, y: 0 });
                    });
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    // Swipe left - Previous
                    Animated.timing(swipeAnim, {
                        toValue: { x: -SCREEN_WIDTH, y: 0 },
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => {
                        handlePrevious();
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
                    {/* Audio Button - Top Right */}
                    <TouchableOpacity
                        style={styles.audioButtonFloating}
                        onPress={() => playPronunciation(currentCard.word)}
                        disabled={isPlayingAudio}
                        activeOpacity={0.7}
                    >
                        {isPlayingAudio ? (
                            <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                            <Ionicons
                                name="volume-high"
                                size={28}
                                color="#007AFF"
                            />
                        )}
                    </TouchableOpacity>

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
                    <Text style={styles.hintLeft}>← Previous</Text>
                    <Text style={styles.hintRight}>Continue →</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.previousButton]}
                    onPress={handlePrevious}
                    disabled={currentIndex === 0}
                >
                    <Text style={styles.actionButtonText}>← Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.continueButton]}
                    onPress={handleContinue}
                >
                    <Text style={styles.actionButtonText}>Continue →</Text>
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
    audioButtonFloating: {
        position: 'absolute',
        top: -50,
        right: 10,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 999,
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
        color: '#8E8E93',
        fontWeight: '500',
    },
    hintRight: {
        fontSize: 14,
        color: '#007AFF',
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
    previousButton: {
        backgroundColor: '#8E8E93',
    },
    continueButton: {
        backgroundColor: '#007AFF',
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
