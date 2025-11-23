import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { decksAPI } from '../../api/decks';
import DeckCard from '../../components/deck/DeckCard';
import { useAuth } from '../../hooks/useAuth';
import { HomeStackParamList } from '../../navigation/types';
import { Deck } from '../../types/models';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user, isAuthenticated } = useAuth();

    const [decks, setDecks] = useState<Deck[]>([]);
    const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'my' | 'public'>('all');

    const fetchDecks = useCallback(async () => {
        // Only fetch if user is authenticated
        if (!isAuthenticated || !user) {
            console.log('Skipping fetch - user not authenticated');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Fetching decks...');
            setIsLoading(true);
            const data = await decksAPI.getDecks(user?.id);
            setDecks(data);
        } catch (error) {
            console.error('Error fetching decks:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, isAuthenticated]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDecks();
        setRefreshing(false);
    }, [fetchDecks]);

    // Reload data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchDecks();
        }, [fetchDecks])
    );

    const applyFilters = (
        deckList: Deck[],
        filterType: 'all' | 'my' | 'public',
        query: string
    ) => {
        let filtered = deckList;

        // Apply filter
        if (filterType === 'my') {
            filtered = filtered.filter((deck) => deck.owner_id === user?.id);
        } else if (filterType === 'public') {
            filtered = filtered.filter((deck) => deck.is_public);
        }

        // Apply search
        if (query.trim()) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(
                (deck) =>
                    deck.title.toLowerCase().includes(lowerQuery) ||
                    deck.description?.toLowerCase().includes(lowerQuery)
            );
        }

        setFilteredDecks(filtered);
    };

    const handleFilterChange = (newFilter: 'all' | 'my' | 'public') => {
        setFilter(newFilter);
    };

    // Apply filters when decks, filter, or searchQuery change
    useEffect(() => {
        if (decks.length > 0) {
            applyFilters(decks, filter, searchQuery);
        }
    }, [decks, filter, searchQuery]);

    const handleDeckPress = (deckId: string) => {
        navigation.navigate('DeckDetail', { deckId });
    };

    const renderFilterButton = (
        label: string,
        value: 'all' | 'my' | 'public'
    ) => (
        <TouchableOpacity
            style={[styles.filterButton, filter === value && styles.filterButtonActive]}
            onPress={() => handleFilterChange(value)}
        >
            <Text
                style={[
                    styles.filterButtonText,
                    filter === value && styles.filterButtonTextActive,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (isLoading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Decks</Text>
                <Text style={styles.subtitle}>
                    {filteredDecks.length} {filteredDecks.length === 1 ? 'deck' : 'decks'}
                </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search decks..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="default"
                />
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                {renderFilterButton('All', 'all')}
                {renderFilterButton('My Decks', 'my')}
                {renderFilterButton('Public', 'public')}
            </View>

            {/* Deck List */}
            <FlatList
                data={filteredDecks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <DeckCard deck={item} onPress={() => handleDeckPress(item.id)} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#007AFF"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No decks found</Text>
                        <Text style={styles.emptySubtext}>
                            Create your first deck to get started
                        </Text>
                    </View>
                }
            />
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFF',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    searchInput: {
        height: 44,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    filterButtonTextActive: {
        color: '#FFF',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
    },
});
