import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Flashcard } from '../../types/models';

interface FlashcardListProps {
    flashcards: Flashcard[];
    onEdit?: (flashcardId: string) => void;
    onDelete?: (flashcardId: string) => void;
}

export default function FlashcardList({
    flashcards,
    onEdit,
    onDelete,
}: FlashcardListProps) {
    return (
        <View style={styles.container}>
            {flashcards.map((flashcard, index) => (
                <View key={flashcard.id} style={styles.card}>
                    <View style={styles.content}>
                        <View style={styles.numberBadge}>
                            <Text style={styles.numberText}>{index + 1}</Text>
                        </View>

                        <View style={styles.textContent}>
                            <Text style={styles.word}>{flashcard.word}</Text>
                            <Text style={styles.meaning}>{flashcard.meaning}</Text>
                            {flashcard.example && (
                                <Text style={styles.example}>"{flashcard.example}"</Text>
                            )}
                        </View>
                    </View>

                    {(onEdit || onDelete) && (
                        <View style={styles.actions}>
                            {onEdit && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => onEdit(flashcard.id)}
                                >
                                    <Text style={styles.editText}>Edit</Text>
                                </TouchableOpacity>
                            )}
                            {onDelete && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => onDelete(flashcard.id)}
                                >
                                    <Text style={styles.deleteText}>Delete</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    content: {
        flexDirection: 'row',
        gap: 12,
    },
    numberBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    textContent: {
        flex: 1,
        gap: 6,
    },
    word: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    meaning: {
        fontSize: 15,
        color: '#666',
        lineHeight: 20,
    },
    example: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionButton: {
        paddingVertical: 4,
    },
    editText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    deleteText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF3B30',
    },
});
