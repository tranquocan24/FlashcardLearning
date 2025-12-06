import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
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
    const [playingId, setPlayingId] = useState<string | null>(null);
    const sound = useRef<Audio.Sound | null>(null);
    const { colors } = useTheme();

    const findAudioUrl = (data: any[]): string | null => {
        for (const entry of data) {
            if (!entry.phonetics) continue;
            const usAudio = entry.phonetics.find((p: any) =>
                p.audio && (p.audio.includes('-us.mp3') || p.audio.includes('-US.mp3'))
            );
            if (usAudio) return usAudio.audio;
        }
        for (const entry of data) {
            if (!entry.phonetics) continue;
            const anyAudio = entry.phonetics.find((p: any) => p.audio);
            if (anyAudio) return anyAudio.audio;
        }
        return null;
    };

    const playPronunciation = async (word: string, flashcardId: string) => {
        if (!word.trim()) return;

        setPlayingId(flashcardId);
        try {
            if (sound.current) {
                await sound.current.unloadAsync();
                sound.current = null;
            }

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

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );

            sound.current = newSound;

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingId(null);
                }
            });

        } catch (error: any) {
            console.error('Audio error:', error);
            Alert.alert(
                'Pronunciation Error',
                error.message || 'Could not play pronunciation.'
            );
        } finally {
            setPlayingId(null);
        }
    };

    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            {flashcards.map((flashcard, index) => (
                <View key={flashcard.id} style={styles.card}>
                    <View style={styles.content}>
                        <View style={styles.numberBadge}>
                            <Text style={styles.numberText}>{index + 1}</Text>
                        </View>

                        <View style={styles.textContent}>
                            <View style={styles.wordRow}>
                                <Text style={styles.word}>{flashcard.word}</Text>
                                <TouchableOpacity
                                    style={styles.audioButton}
                                    onPress={() => playPronunciation(flashcard.word, flashcard.id)}
                                    disabled={playingId === flashcard.id}
                                    activeOpacity={0.7}
                                >
                                    {playingId === flashcard.id ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <Ionicons
                                            name="volume-high"
                                            size={20}
                                            color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
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

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        gap: 12,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        shadowColor: colors.text,
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
        backgroundColor: colors.secondaryBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.secondaryText,
    },
    textContent: {
        flex: 1,
        gap: 6,
    },
    wordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    word: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    audioButton: {
        padding: 4,
    },
    meaning: {
        fontSize: 15,
        color: colors.secondaryText,
        lineHeight: 20,
    },
    example: {
        fontSize: 13,
        color: colors.tertiaryText,
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
        borderTopColor: colors.borderLight,
    },
    actionButton: {
        paddingVertical: 4,
    },
    editText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    deleteText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.error,
    },
});
