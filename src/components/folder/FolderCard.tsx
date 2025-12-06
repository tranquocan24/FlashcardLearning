import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../../../constants/theme';
import { Folder } from '../../types/models';

interface FolderCardProps {
    folder: Folder;
    onPress: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function FolderCard({ folder, onPress, onEdit, onDelete }: FolderCardProps) {
    const handleLongPress = () => {
        Alert.alert(
            folder.name,
            'Choose an action',
            [
                {
                    text: 'Edit',
                    onPress: onEdit,
                },
                {
                    text: 'Delete',
                    onPress: () => {
                        Alert.alert(
                            'Delete Folder',
                            `Are you sure you want to delete "${folder.name}"? Decks inside will not be deleted.`,
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: onDelete,
                                },
                            ]
                        );
                    },
                    style: 'destructive',
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            onLongPress={handleLongPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="folder" size={40} color={theme.colors.primary} />
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>
                    {folder.name}
                </Text>
                <Text style={styles.deckCount}>
                    {folder.deck_count || 0} {folder.deck_count === 1 ? 'deck' : 'decks'}
                </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
    },
    deckCount: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
});
