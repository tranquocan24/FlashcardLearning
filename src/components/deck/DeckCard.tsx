import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Deck } from '../../types/models';

interface DeckCardProps {
    deck: Deck;
    onPress: () => void;
    onRemove?: () => void;
    showRemoveButton?: boolean;
}

export default function DeckCard({ deck, onPress, onRemove, showRemoveButton = false }: DeckCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>
                    {deck.title}
                </Text>
                <View style={styles.headerRight}>
                    {deck.is_public && (
                        <View style={styles.publicBadge}>
                            <Text style={styles.publicBadgeText}>Public</Text>
                        </View>
                    )}
                    {showRemoveButton && onRemove && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            style={styles.removeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close-circle" size={24} color="#FF3B30" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {deck.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {deck.description}
                </Text>
            )}

            <View style={styles.footer}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{deck.flashcard_count || 0}</Text>
                    <Text style={styles.statLabel}>
                        {deck.flashcard_count === 1 ? 'card' : 'cards'}
                    </Text>
                </View>

                <Text style={styles.date}>{formatDate(deck.created_at)}</Text>
            </View>

            {deck.owner_name && deck.owner_id !== deck.owner_id && (
                <Text style={styles.owner}>by {deck.owner_name}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginRight: 12,
    },
    removeButton: {
        padding: 4,
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
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 14,
        color: '#999',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    owner: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        fontStyle: 'italic',
    },
});
