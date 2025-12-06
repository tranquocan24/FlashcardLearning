import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ColorTheme } from '../../../constants/theme';
import { flashcardsAPI } from '../../api/flashcards';
import { useTheme } from '../../context/ThemeContext';
import { HomeStackParamList } from '../../navigation/types';

type EditFlashcardScreenRouteProp = RouteProp<HomeStackParamList, 'EditFlashcard'>;
type EditFlashcardScreenNavigationProp = NativeStackNavigationProp<
    HomeStackParamList,
    'EditFlashcard'
>;

export default function EditFlashcardScreen() {
    const navigation = useNavigation<EditFlashcardScreenNavigationProp>();
    const route = useRoute<EditFlashcardScreenRouteProp>();
    const { flashcardId, deckId } = route.params;
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [word, setWord] = useState('');
    const [meaning, setMeaning] = useState('');
    const [example, setExample] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    const sound = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        loadFlashcard();

        return () => {
            if (sound.current) {
                sound.current.unloadAsync();
            }
        };
    }, [flashcardId]);

    const loadFlashcard = async () => {
        try {
            const response = await flashcardsAPI.getFlashcardsByDeck(deckId);
            const flashcard = response.data.find((f) => f.id === flashcardId);

            if (flashcard) {
                setWord(flashcard.word);
                setMeaning(flashcard.meaning);
                setExample(flashcard.example || '');
            } else {
                Alert.alert('Error', 'Flashcard not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading flashcard:', error);
            Alert.alert('Error', 'Failed to load flashcard');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const findAudioUrl = (data: any[]): string | null => {
        // First pass: look for US pronunciation
        for (const entry of data) {
            if (!entry.phonetics) continue;

            const usAudio = entry.phonetics.find((p: any) =>
                p.audio && (p.audio.includes('-us.mp3') || p.audio.includes('-US.mp3'))
            );
            if (usAudio) return usAudio.audio;
        }

        // Second pass: accept any audio
        for (const entry of data) {
            if (!entry.phonetics) continue;

            const anyAudio = entry.phonetics.find((p: any) => p.audio);
            if (anyAudio) return anyAudio.audio;
        }

        return null;
    };

    const playPronunciation = async (wordText: string) => {
        if (!wordText.trim()) {
            Alert.alert('No Word', 'Please enter a word first');
            return;
        }

        setIsPlayingAudio(true);
        try {
            // Unload previous sound if exists
            if (sound.current) {
                await sound.current.unloadAsync();
                sound.current = null;
            }

            // Fetch audio from Free Dictionary API
            const response = await fetch(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordText.trim())}`
            );

            if (!response.ok) {
                throw new Error('Word not found or no pronunciation available');
            }

            const data = await response.json();
            const audioUrl = findAudioUrl(data);

            if (!audioUrl) {
                throw new Error('No pronunciation audio available for this word');
            }

            // Play audio
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );

            sound.current = newSound;

            // Auto cleanup when finished
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setIsPlayingAudio(false);
                }
            });

        } catch (error: any) {
            console.error('Audio error:', error);
            Alert.alert(
                'Pronunciation Error',
                error.message || 'Could not play pronunciation. Please try again.'
            );
        } finally {
            setIsPlayingAudio(false);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!word.trim()) {
            Alert.alert('Required', 'Please enter a word');
            return;
        }
        if (!meaning.trim()) {
            Alert.alert('Required', 'Please enter the meaning');
            return;
        }

        setIsSaving(true);
        try {
            await flashcardsAPI.updateFlashcard(flashcardId, {
                word: word.trim(),
                meaning: meaning.trim(),
                example: example.trim() || undefined,
            });

            Alert.alert('Success', 'Flashcard updated successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            console.error('Error updating flashcard:', error);
            Alert.alert('Error', 'Failed to update flashcard. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                        disabled={isSaving}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Flashcard</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.field}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>
                                Word / Term <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={styles.audioButton}
                                onPress={() => playPronunciation(word)}
                                disabled={isPlayingAudio || !word.trim()}
                            >
                                {isPlayingAudio ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <Ionicons
                                        name="volume-high"
                                        size={20}
                                        color={word.trim() ? colors.primary : colors.border}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Serendipity"
                            placeholderTextColor={colors.tertiaryText}
                            value={word}
                            onChangeText={setWord}
                            maxLength={100}
                            editable={!isSaving}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="default"
                        />
                        <Text style={styles.hint}>{word.length}/100</Text>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>
                            Meaning / Definition <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="What does it mean?"
                            placeholderTextColor={colors.tertiaryText}
                            value={meaning}
                            onChangeText={setMeaning}
                            maxLength={300}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            editable={!isSaving}
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            keyboardType="default"
                        />
                        <Text style={styles.hint}>{meaning.length}/300</Text>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Example (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="A sentence using this word..."
                            placeholderTextColor={colors.tertiaryText}
                            value={example}
                            onChangeText={setExample}
                            maxLength={300}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            editable={!isSaving}
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            keyboardType="default"
                        />
                        <Text style={styles.hint}>{example.length}/300</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!word.trim() || !meaning.trim() || isSaving) && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!word.trim() || !meaning.trim() || isSaving}
                >
                    <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cancelButton: {
        paddingVertical: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: colors.primary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    placeholder: {
        width: 60,
    },
    form: {
        padding: 20,
        gap: 24,
    },
    field: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    audioButton: {
        padding: 8,
    },
    required: {
        color: colors.error,
    },
    input: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: colors.text,
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    hint: {
        fontSize: 12,
        color: colors.tertiaryText,
        textAlign: 'right',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: colors.border,
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
});
