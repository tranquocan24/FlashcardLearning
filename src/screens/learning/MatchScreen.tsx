import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { flashcardsAPI } from '../../api/flashcards';
import { HomeStackParamList } from '../../navigation/types';
import { Flashcard } from '../../types/models';

type Props = NativeStackScreenProps<HomeStackParamList, 'Match'>;

interface MatchPair {
    id: string;
    type: 'word' | 'meaning';
    content: string;
    flashcardId: string;
    matched: boolean;
}

export default function MatchScreen({ navigation, route }: Props) {
    const { deckId } = route.params;
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pairs, setPairs] = useState<MatchPair[]>([]);
    const [selectedWord, setSelectedWord] = useState<MatchPair | null>(null);
    const [selectedMeaning, setSelectedMeaning] = useState<MatchPair | null>(null);
    const [matchedCount, setMatchedCount] = useState(0);
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        fetchFlashcards();
    }, []);

    const fetchFlashcards = async () => {
        try {
            setIsLoading(true);
            const response = await flashcardsAPI.getFlashcardsByDeck(deckId);
            const cards = response.data || [];

            if (cards.length < 4) {
                Alert.alert(
                    'Not Enough Cards',
                    'You need at least 4 flashcards to play Match game.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
                return;
            }

            // Take up to 8 cards for matching
            const selectedCards = cards.slice(0, Math.min(8, cards.length));
            setFlashcards(selectedCards);
            generatePairs(selectedCards);
        } catch (error) {
            console.error('Failed to fetch flashcards:', error);
            Alert.alert('Error', 'Failed to load flashcards');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const generatePairs = (cards: Flashcard[]) => {
        const wordPairs: MatchPair[] = cards.map((card) => ({
            id: `word-${card.id}`,
            type: 'word',
            content: card.word,
            flashcardId: card.id,
            matched: false,
        }));

        const meaningPairs: MatchPair[] = cards.map((card) => ({
            id: `meaning-${card.id}`,
            type: 'meaning',
            content: card.meaning,
            flashcardId: card.id,
            matched: false,
        }));

        // Shuffle meanings
        const shuffledMeanings = [...meaningPairs].sort(() => Math.random() - 0.5);

        setPairs([...wordPairs, ...shuffledMeanings]);
    };

    const handlePairPress = (pair: MatchPair) => {
        if (pair.matched) return;

        if (pair.type === 'word') {
            if (selectedWord?.id === pair.id) {
                setSelectedWord(null);
            } else {
                setSelectedWord(pair);
            }
        } else {
            if (selectedMeaning?.id === pair.id) {
                setSelectedMeaning(null);
            } else {
                setSelectedMeaning(pair);
            }
        }
    };

    useEffect(() => {
        if (selectedWord && selectedMeaning) {
            setAttempts(attempts + 1);
            checkMatch(selectedWord, selectedMeaning);
        }
    }, [selectedWord, selectedMeaning]);

    const checkMatch = (word: MatchPair, meaning: MatchPair) => {
        if (word.flashcardId === meaning.flashcardId) {
            // Correct match
            setTimeout(() => {
                setPairs((prevPairs) =>
                    prevPairs.map((p) =>
                        p.id === word.id || p.id === meaning.id ? { ...p, matched: true } : p
                    )
                );
                setMatchedCount(matchedCount + 1);
                setSelectedWord(null);
                setSelectedMeaning(null);

                // Check if all matched
                if (matchedCount + 1 === flashcards.length) {
                    setTimeout(() => {
                        navigation.replace('Result', {
                            type: 'MATCH',
                            total: flashcards.length,
                            correct: flashcards.length,
                            deckId,
                        });
                    }, 500);
                }
            }, 300);
        } else {
            // Wrong match
            setTimeout(() => {
                setSelectedWord(null);
                setSelectedMeaning(null);
            }, 800);
        }
    };

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

    const wordPairs = pairs.filter((p) => p.type === 'word');
    const meaningPairs = pairs.filter((p) => p.type === 'meaning');
    const progress = (matchedCount / flashcards.length) * 100;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>
                        Matched: {matchedCount}/{flashcards.length}
                    </Text>
                    <Text style={styles.statsText}>Attempts: {attempts}</Text>
                </View>
            </View>

            <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                    Tap a word and its matching meaning
                </Text>
            </View>

            {/* Matching Grid */}
            <View style={styles.gridContainer}>
                {/* Words Column */}
                <View style={styles.column}>
                    <Text style={styles.columnHeader}>Words</Text>
                    {wordPairs.map((pair) => (
                        <TouchableOpacity
                            key={pair.id}
                            style={[
                                styles.pairButton,
                                pair.matched && styles.pairButtonMatched,
                                selectedWord?.id === pair.id && styles.pairButtonSelected,
                            ]}
                            onPress={() => handlePairPress(pair)}
                            disabled={pair.matched}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.pairText,
                                    pair.matched && styles.pairTextMatched,
                                    selectedWord?.id === pair.id && styles.pairTextSelected,
                                ]}
                                numberOfLines={2}
                            >
                                {pair.content}
                            </Text>
                            {pair.matched && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Meanings Column */}
                <View style={styles.column}>
                    <Text style={styles.columnHeader}>Meanings</Text>
                    {meaningPairs.map((pair) => (
                        <TouchableOpacity
                            key={pair.id}
                            style={[
                                styles.pairButton,
                                pair.matched && styles.pairButtonMatched,
                                selectedMeaning?.id === pair.id && styles.pairButtonSelected,
                            ]}
                            onPress={() => handlePairPress(pair)}
                            disabled={pair.matched}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.pairText,
                                    pair.matched && styles.pairTextMatched,
                                    selectedMeaning?.id === pair.id && styles.pairTextSelected,
                                ]}
                                numberOfLines={2}
                            >
                                {pair.content}
                            </Text>
                            {pair.matched && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Wrong Match Feedback */}
            {selectedWord && selectedMeaning && selectedWord.flashcardId !== selectedMeaning.flashcardId && (
                <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackText}>❌ Try again!</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    header: {
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
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF9500',
        borderRadius: 3,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statsText: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
    instructionContainer: {
        padding: 16,
        backgroundColor: '#FFF9E6',
        borderBottomWidth: 1,
        borderBottomColor: '#FFE066',
    },
    instructionText: {
        fontSize: 14,
        color: '#856404',
        textAlign: 'center',
        fontWeight: '500',
    },
    gridContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    column: {
        flex: 1,
    },
    columnHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3C3C43',
        marginBottom: 12,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pairButton: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        minHeight: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    pairButtonSelected: {
        backgroundColor: '#F0F9FF',
        borderColor: '#007AFF',
        transform: [{ scale: 1.02 }],
    },
    pairButtonMatched: {
        backgroundColor: '#F0FFF4',
        borderColor: '#34C759',
        opacity: 0.6,
    },
    pairText: {
        fontSize: 14,
        color: '#000',
        textAlign: 'center',
        fontWeight: '500',
    },
    pairTextSelected: {
        color: '#007AFF',
        fontWeight: '600',
    },
    pairTextMatched: {
        color: '#34C759',
    },
    checkmark: {
        fontSize: 20,
        color: '#34C759',
        position: 'absolute',
        top: 4,
        right: 4,
    },
    feedbackContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#FF3B30',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    feedbackText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
    },
});
