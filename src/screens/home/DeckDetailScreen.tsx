import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { decksAPI } from '../../api/decks';
import { flashcardsAPI } from '../../api/flashcards';
import FlashcardList from '../../components/flashcard/FlashcardList';
import { useAuth } from '../../hooks/useAuth';
import { HomeStackParamList } from '../../navigation/types';
import { Deck, Flashcard } from '../../types/models';

type DeckDetailScreenRouteProp = RouteProp<HomeStackParamList, 'DeckDetail'>;
type DeckDetailScreenNavigationProp = NativeStackNavigationProp<
    HomeStackParamList,
    'DeckDetail'
>;

export default function DeckDetailScreen() {
    const navigation = useNavigation<DeckDetailScreenNavigationProp>();
    const route = useRoute<DeckDetailScreenRouteProp>();
    const { user } = useAuth();
    const { deckId } = route.params;

    const [deck, setDeck] = useState<Deck | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isOwner = deck?.owner_id === user?.id;

    const fetchDeckDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const [deckData, flashcardsResponse] = await Promise.all([
                decksAPI.getDeckById(deckId),
                flashcardsAPI.getFlashcardsByDeck(deckId),
            ]);
            setDeck(deckData);
            setFlashcards(flashcardsResponse.data || []);
        } catch (error) {
            console.error('Error fetching deck details:', error);
            Alert.alert('Error', 'Failed to load deck details');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    }, [deckId, navigation]);

    // Reload data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchDeckDetails();
        }, [fetchDeckDetails])
    );

    const handleAddFlashcard = () => {
        navigation.navigate('AddFlashcard', { deckId });
    };

    const handleEditFlashcard = (flashcardId: string) => {
        navigation.navigate('EditFlashcard', { flashcardId, deckId });
    };

    const handleDeleteFlashcard = async (flashcardId: string) => {
        Alert.alert(
            'Delete Flashcard',
            'Are you sure you want to delete this flashcard?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await flashcardsAPI.deleteFlashcard(flashcardId);
                            setFlashcards((prev) => prev.filter((f) => f.id !== flashcardId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete flashcard');
                        }
                    },
                },
            ]
        );
    };

    const handleStartLearning = () => {
        if (flashcards.length === 0) {
            Alert.alert('No Cards', 'Add some flashcards before starting to learn');
            return;
        }
        navigation.navigate('LearningMode', { deckId });
    };

    const handleDeleteDeck = () => {
        Alert.alert(
            'Delete Deck',
            'Are you sure you want to delete this deck? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await decksAPI.deleteDeck(deckId);
                            navigation.navigate('HomeScreen');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete deck');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!deck) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Deck not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <Text style={styles.title}>{deck.title}</Text>
                        {deck.description && (
                            <Text style={styles.description}>{deck.description}</Text>
                        )}
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>
                                {flashcards.length} {flashcards.length === 1 ? 'card' : 'cards'}
                            </Text>
                            {deck.is_public && (
                                <View style={styles.publicBadge}>
                                    <Text style={styles.publicBadgeText}>Public</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.primaryButton, flashcards.length === 0 && styles.disabledButton]}
                        onPress={handleStartLearning}
                        disabled={flashcards.length === 0}
                    >
                        <Text style={styles.primaryButtonText}>Start Learning</Text>
                    </TouchableOpacity>

                    {isOwner && (
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleAddFlashcard}
                        >
                            <Text style={styles.secondaryButtonText}>+ Add Card</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Flashcard List */}
                <View style={styles.flashcardsSection}>
                    <Text style={styles.sectionTitle}>Flashcards</Text>
                    {flashcards.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No flashcards yet</Text>
                            <Text style={styles.emptySubtext}>
                                {isOwner ? 'Add your first flashcard to get started' : 'This deck is empty'}
                            </Text>
                        </View>
                    ) : (
                        <FlashcardList
                            flashcards={flashcards}
                            onEdit={isOwner ? handleEditFlashcard : undefined}
                            onDelete={isOwner ? handleDeleteFlashcard : undefined}
                        />
                    )}
                </View>

                {/* Delete Deck */}
                {isOwner && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteDeck}
                    >
                        <Text style={styles.deleteButtonText}>Delete Deck</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: '#FFF',
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 16,
    },
    backButtonText: {
        fontSize: 28,
        color: '#007AFF',
    },
    headerContent: {
        gap: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    metaText: {
        fontSize: 14,
        color: '#999',
    },
    publicBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    publicBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4CAF50',
    },
    actionContainer: {
        padding: 20,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCC',
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
    secondaryButton: {
        backgroundColor: '#FFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    secondaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#007AFF',
    },
    flashcardsSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#FFF',
        borderRadius: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
    },
    deleteButton: {
        margin: 20,
        marginTop: 40,
        paddingVertical: 14,
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
    },
});
