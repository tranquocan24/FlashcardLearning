import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../../../constants/theme';
import { decksAPI } from '../../api/decks';
import { folderAPI } from '../../api/folders';
import DeckCard from '../../components/deck/DeckCard';
import { useAuth } from '../../hooks/useAuth';
import { Deck, Folder } from '../../types/models';

export default function FolderDetailScreen({ route, navigation }: any) {
    const { folderId } = route.params;
    const { user } = useAuth();
    const [folder, setFolder] = useState<Folder | null>(null);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddDeckModal, setShowAddDeckModal] = useState(false);
    const [availableDecks, setAvailableDecks] = useState<Deck[]>([]);

    const loadFolderAndDecks = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch all decks and filter by folder_id
            const allDecks = await decksAPI.getDecks(user?.id);
            const folderDecks = allDecks.filter(deck => deck.folder_id === folderId);
            setDecks(folderDecks);

            // Set available decks (those not in any folder)
            const unassignedDecks = allDecks.filter(deck => !deck.folder_id);
            setAvailableDecks(unassignedDecks);

            // Fetch folder info
            const foldersResponse = await folderAPI.getFolders();
            const currentFolder = foldersResponse.folders?.find(f => f.id === folderId);
            if (currentFolder) {
                setFolder(currentFolder);
                navigation.setOptions({ title: currentFolder.name });
            }
        } catch (error: any) {
            console.error('Error loading folder:', error);
            Alert.alert('Error', error.message || 'Failed to load folder');
        } finally {
            setLoading(false);
        }
    }, [folderId, user?.id, navigation]);

    useEffect(() => {
        loadFolderAndDecks();
    }, [loadFolderAndDecks]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadFolderAndDecks();
        setRefreshing(false);
    };

    const handleDeckPress = (deck: Deck) => {
        navigation.navigate('DeckDetail', { deckId: deck.id });
    };

    const handleOpenAddDeck = useCallback(() => {
        console.log('Opening add deck modal...');
        console.log('Available decks:', availableDecks.length);
        setShowAddDeckModal(true);
        console.log('Modal state set to true');
    }, [availableDecks.length]);

    const handleAddDeckToFolder = async (deck: Deck) => {
        try {
            await decksAPI.moveDeckToFolder(deck.id, folderId);
            setShowAddDeckModal(false);
            await loadFolderAndDecks();
            Alert.alert('Success', `"${deck.title}" added to folder`);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add deck to folder');
        }
    };

    const handleRemoveDeckFromFolder = useCallback(async (deck: Deck) => {
        Alert.alert(
            'Remove Deck',
            `Remove "${deck.title}" from this folder?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await decksAPI.moveDeckToFolder(deck.id, null);
                            await loadFolderAndDecks();
                            Alert.alert('Success', 'Deck removed from folder');
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to remove deck from folder');
                        }
                    },
                },
            ]
        );
    }, [loadFolderAndDecks]);

    const handleEditFolder = () => {
        if (!folder) return;

        Alert.prompt(
            'Rename Folder',
            'Enter new folder name',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: async (newName) => {
                        if (!newName || !newName.trim()) {
                            Alert.alert('Error', 'Folder name cannot be empty');
                            return;
                        }

                        try {
                            await folderAPI.updateFolder(folder.id, { name: newName.trim() });
                            setFolder({ ...folder, name: newName.trim() });
                            navigation.setOptions({ title: newName.trim() });
                            Alert.alert('Success', 'Folder renamed successfully');
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to rename folder');
                        }
                    },
                },
            ],
            'plain-text',
            folder.name
        );
    };

    const handleDeleteFolder = useCallback(() => {
        if (!folder) return;

        Alert.alert(
            'Delete Folder',
            `Are you sure you want to delete "${folder.name}"? All decks will be moved out of this folder.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await folderAPI.deleteFolder(folder.id);
                            Alert.alert('Success', 'Folder deleted successfully');
                            navigation.goBack();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete folder');
                        }
                    },
                },
            ]
        );
    }, [folder, navigation]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={handleOpenAddDeck} style={styles.headerButton}>
                        <Ionicons name="add" size={28} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteFolder} style={styles.headerButton}>
                        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, folder, handleOpenAddDeck, handleDeleteFolder]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    console.log('Rendering FolderDetail, showAddDeckModal:', showAddDeckModal);

    return (
        <View style={styles.container}>
            {decks.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="folder-open-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyText}>No decks in this folder</Text>
                    <Text style={styles.emptySubtext}>
                        Create a new deck or move existing ones here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={decks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <DeckCard
                            deck={item}
                            onPress={() => handleDeckPress(item)}
                            onRemove={() => handleRemoveDeckFromFolder(item)}
                            showRemoveButton={true}
                        />
                    )}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Add Deck Modal */}
            <Modal
                visible={showAddDeckModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAddDeckModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowAddDeckModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Deck to Folder</Text>
                            <TouchableOpacity onPress={() => setShowAddDeckModal(false)}>
                                <Ionicons name="close" size={28} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {availableDecks.length === 0 ? (
                            <View style={styles.emptyModalContent}>
                                <Ionicons name="albums-outline" size={48} color={theme.colors.textSecondary} />
                                <Text style={styles.emptyModalText}>No available decks</Text>
                                <Text style={styles.emptyModalSubtext}>
                                    All your decks are already in folders
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={availableDecks}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.deckItem}
                                        onPress={() => handleAddDeckToFolder(item)}
                                    >
                                        <View style={styles.deckItemContent}>
                                            <Text style={styles.deckItemTitle}>{item.title}</Text>
                                            <Text style={styles.deckItemSubtitle}>
                                                {item.flashcard_count || 0} cards
                                            </Text>
                                        </View>
                                        <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={styles.modalList}
                            />
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerButtons: {
        flexDirection: 'row',
        marginRight: 8,
    },
    headerButton: {
        padding: 8,
        marginLeft: 8,
    },
    listContent: {
        padding: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    modalList: {
        padding: 16,
    },
    emptyModalContent: {
        padding: 40,
        alignItems: 'center',
    },
    emptyModalText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginTop: 12,
    },
    emptyModalSubtext: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    deckItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        marginBottom: 12,
    },
    deckItemContent: {
        flex: 1,
    },
    deckItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
    },
    deckItemSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
});
