import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ColorTheme } from '../../../constants/theme';
import { decksAPI } from '../../api/decks';
import { folderAPI } from '../../api/folders';
import DeckCard from '../../components/deck/DeckCard';
import { FolderCard } from '../../components/folder/FolderCard';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { HomeStackParamList } from '../../navigation/types';
import { Deck, Folder } from '../../types/models';
import { generateUUID } from '../../utils/uuid';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user, isAuthenticated } = useAuth();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [decks, setDecks] = useState<Deck[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
    const [unassignedDecks, setUnassignedDecks] = useState<Deck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'my' | 'public'>('all');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [folderNameInput, setFolderNameInput] = useState('');
    const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

    const fetchData = useCallback(async () => {
        // Only fetch if user is authenticated
        if (!isAuthenticated || !user) {
            console.log('Skipping fetch - user not authenticated');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Fetching decks and folders...');
            setIsLoading(true);

            // Fetch decks and folders in parallel
            const [decksData, foldersResponse] = await Promise.all([
                decksAPI.getDecks(user?.id),
                folderAPI.getFolders(),
            ]);

            setDecks(decksData);
            setFolders(foldersResponse.folders || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, isAuthenticated]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [fetchData]);

    // Reload data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
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

        // Separate unassigned decks (those not in any folder)
        const unassigned = filtered.filter((deck) => !deck.folder_id);
        setUnassignedDecks(unassigned);
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

    const handleCreateFolder = () => {
        setFolderNameInput('');
        setShowCreateModal(true);
    };

    const handleCreateFolderSubmit = async () => {
        if (!folderNameInput || !folderNameInput.trim()) {
            Alert.alert('Error', 'Folder name cannot be empty');
            return;
        }

        // Check for duplicate folder names (case-insensitive)
        const normalizedName = folderNameInput.trim().toLowerCase();
        const isDuplicate = folders.some(
            folder => folder.name.toLowerCase() === normalizedName
        );

        if (isDuplicate) {
            Alert.alert('Error', 'A folder with this name already exists. Please choose a different name.');
            return;
        }

        try {
            const folderId = generateUUID();
            await folderAPI.createFolder({
                id: folderId,
                name: folderNameInput.trim(),
            });
            setShowCreateModal(false);
            setFolderNameInput('');
            await fetchData(); // Refresh data
            Alert.alert('Success', 'Folder created successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create folder');
        }
    };

    const handleEditFolder = (folder: Folder) => {
        setEditingFolder(folder);
        setFolderNameInput(folder.name);
        setShowEditModal(true);
    };

    const handleEditFolderSubmit = async () => {
        if (!folderNameInput || !folderNameInput.trim() || !editingFolder) {
            Alert.alert('Error', 'Folder name cannot be empty');
            return;
        }

        // Check for duplicate folder names (excluding current folder, case-insensitive)
        const normalizedName = folderNameInput.trim().toLowerCase();
        const isDuplicate = folders.some(
            folder => folder.id !== editingFolder.id && folder.name.toLowerCase() === normalizedName
        );

        if (isDuplicate) {
            Alert.alert('Error', 'A folder with this name already exists. Please choose a different name.');
            return;
        }

        try {
            await folderAPI.updateFolder(editingFolder.id, { name: folderNameInput.trim() });
            setShowEditModal(false);
            setEditingFolder(null);
            setFolderNameInput('');
            await fetchData();
            Alert.alert('Success', 'Folder renamed successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to rename folder');
        }
    };

    const handleDeleteFolder = async (folder: Folder) => {
        try {
            await folderAPI.deleteFolder(folder.id);
            await fetchData();
            Alert.alert('Success', 'Folder deleted successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete folder');
        }
    };

    const handleFolderPress = (folder: Folder) => {
        navigation.navigate('FolderDetail', { folderId: folder.id });
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
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.title}>My Library</Text>
                        <Text style={styles.subtitle}>
                            {folders.length} {folders.length === 1 ? 'folder' : 'folders'} · {filteredDecks.length} {filteredDecks.length === 1 ? 'deck' : 'decks'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleCreateFolder} style={styles.createButton}>
                        <Ionicons name="folder-outline" size={20} color="#FFF" />
                        <Text style={styles.createButtonText}>New Folder</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search decks..."
                    placeholderTextColor={colors.tertiaryText}
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

            {/* Content */}
            <FlatList
                data={[
                    ...folders.map(f => ({ type: 'folder', item: f })),
                    ...unassignedDecks.map(d => ({ type: 'deck', item: d })),
                ]}
                keyExtractor={(item) => item.type + '-' + item.item.id}
                renderItem={({ item }) => {
                    if (item.type === 'folder') {
                        const folder = item.item as Folder;
                        return (
                            <FolderCard
                                folder={folder}
                                onPress={() => handleFolderPress(folder)}
                                onEdit={() => handleEditFolder(folder)}
                                onDelete={() => handleDeleteFolder(folder)}
                            />
                        );
                    } else {
                        const deck = item.item as Deck;
                        return (
                            <DeckCard
                                deck={deck}
                                onPress={() => handleDeckPress(deck.id)}
                            />
                        );
                    }
                }}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={64} color={colors.secondaryText} />
                        <Text style={styles.emptyText}>No folders or decks yet</Text>
                        <Text style={styles.emptySubtext}>
                            Create a folder or deck to get started
                        </Text>
                    </View>
                }
            />

            {/* Create Folder Modal */}
            <Modal
                visible={showCreateModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCreateModal(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>New Folder</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Folder name"
                            value={folderNameInput}
                            onChangeText={setFolderNameInput}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setShowCreateModal(false)}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={handleCreateFolderSubmit}
                            >
                                <Text style={styles.modalButtonTextConfirm}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Edit Folder Modal */}
            <Modal
                visible={showEditModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEditModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowEditModal(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Rename Folder</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Folder name"
                            value={folderNameInput}
                            onChangeText={setFolderNameInput}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={handleEditFolderSubmit}
                            >
                                <Text style={styles.modalButtonTextConfirm}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const createStyles = (colors: ColorTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: colors.card,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        color: colors.secondaryText,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    createButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchInput: {
        height: 44,
        backgroundColor: colors.secondaryBackground,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.text,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: colors.card,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.secondaryBackground,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.secondaryText,
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
        color: colors.secondaryText,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.tertiaryText,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 16,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        color: colors.text,
        backgroundColor: colors.background,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: colors.secondaryBackground,
    },
    modalButtonConfirm: {
        backgroundColor: colors.primary,
    },
    modalButtonTextCancel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    modalButtonTextConfirm: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});
