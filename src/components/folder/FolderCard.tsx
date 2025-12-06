import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ColorTheme } from '../../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Folder } from '../../types/models';

interface FolderCardProps {
    folder: Folder;
    onPress: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function FolderCard({ folder, onPress, onEdit, onDelete }: FolderCardProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

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
                <Ionicons name="folder" size={40} color={colors.primary} />
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>
                    {folder.name}
                </Text>
                <Text style={styles.deckCount}>
                    {folder.deck_count || 0} {folder.deck_count === 1 ? 'deck' : 'decks'}
                </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
    );
}

const createStyles = (colors: ColorTheme) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: colors.shadow,
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
        color: colors.text,
        marginBottom: 4,
    },
    deckCount: {
        fontSize: 14,
        color: colors.secondaryText,
    },
});
