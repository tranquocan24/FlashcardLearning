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
import { SafeAreaView } from 'react-native-safe-area-context';
import { ColorTheme } from '../../../constants/theme';
import { flashcardsAPI } from '../../api/flashcards';
import { useTheme } from '../../context/ThemeContext';
import { HomeStackParamList } from '../../navigation/types';
import { generateUUID } from '../../utils/uuid';

type AddFlashcardScreenRouteProp = RouteProp<HomeStackParamList, 'AddFlashcard'>;
type AddFlashcardScreenNavigationProp = NativeStackNavigationProp<
    HomeStackParamList,
    'AddFlashcard'
>;

export default function AddFlashcardScreen() {
    const navigation = useNavigation<AddFlashcardScreenNavigationProp>();
    const route = useRoute<AddFlashcardScreenRouteProp>();
    const { deckId } = route.params;
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [word, setWord] = useState('');
    const [meaning, setMeaning] = useState('');
    const [example, setExample] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    const sound = useRef<Audio.Sound | null>(null);
    const translationTimeout = useRef<NodeJS.Timeout | null>(null);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (sound.current) {
                sound.current.unloadAsync();
            }
            if (translationTimeout.current) {
                clearTimeout(translationTimeout.current);
            }
        };
    }, []);

    // Auto-translate with debounce
    useEffect(() => {
        if (translationTimeout.current) {
            clearTimeout(translationTimeout.current);
        }

        if (word.trim() && word.length > 0) {
            translationTimeout.current = setTimeout(() => {
                translateWord(word.trim());
            }, 1000);
        }

        return () => {
            if (translationTimeout.current) {
                clearTimeout(translationTimeout.current);
            }
        };
    }, [word]);

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

    const handlePlayPronunciation = async () => {
        if (!word.trim()) {
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

    const translateWord = async (text: string) => {
        if (!text || meaning.trim()) {
            // Don't auto-translate if user already typed something
            return;
        }

        setIsTranslating(true);
        try {
            // Using MyMemory Translation API (free, no API key required)
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`
            );

            if (!response.ok) {
                throw new Error('Translation service unavailable');
            }

            const data = await response.json();

            if (data.responseStatus === 200 && data.responseData?.translatedText) {
                const translatedText = data.responseData.translatedText;

                // Only set if user hasn't started typing in meaning field
                if (!meaning.trim()) {
                    setMeaning(translatedText);
                }
            }
        } catch (error: any) {
            console.error('Translation error:', error);
            // Silently fail - don't show error to user for auto-translation
        } finally {
            setIsTranslating(false);
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

        setIsLoading(true);
        try {
            const newFlashcard = {
                id: generateUUID(),
                deck_id: deckId,
                word: word.trim(),
                meaning: meaning.trim(),
                example: example.trim() || undefined,
                media_url: undefined,
            };

            await flashcardsAPI.createFlashcard(newFlashcard);

            Alert.alert('Success', 'Flashcard added successfully!', [
                {
                    text: 'Add Another',
                    onPress: () => {
                        setWord('');
                        setMeaning('');
                        setExample('');
                    },
                },
                {
                    text: 'Done',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            console.error('Error creating flashcard:', error);
            Alert.alert('Error', 'Failed to add flashcard. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (word.trim() || meaning.trim() || example.trim()) {
            Alert.alert(
                'Discard Changes',
                'Are you sure you want to discard this flashcard?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
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
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>New Flashcard</Text>
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
                                    style={styles.iconButton}
                                    onPress={handlePlayPronunciation}
                                    disabled={!word.trim() || isPlayingAudio}
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
                                editable={!isLoading}
                                autoFocus
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="default"
                            />
                            <Text style={styles.hint}>{word.length}/100</Text>
                        </View>

                        <View style={styles.field}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>
                                    Meaning / Definition <Text style={styles.required}>*</Text>
                                </Text>
                                {isTranslating && (
                                    <View style={styles.translatingIndicator}>
                                        <ActivityIndicator size="small" color={colors.primary} />
                                        <Text style={styles.translatingText}>Translating...</Text>
                                    </View>
                                )}
                            </View>
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
                                editable={!isLoading}
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
                                editable={!isLoading}
                                autoCapitalize="sentences"
                                autoCorrect={false}
                                keyboardType="default"
                            />
                            <Text style={styles.hint}>{example.length}/300</Text>
                        </View>

                        <View style={styles.tipBox}>
                            <Text style={styles.tipTitle}>💡 Tip</Text>
                            <Text style={styles.tipText}>
                                Add an example sentence to help you remember the word in context
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Save Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            (!word.trim() || !meaning.trim() || isLoading) && styles.saveButtonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={!word.trim() || !meaning.trim() || isLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.saveButtonText,
                            (!word.trim() || !meaning.trim() || isLoading) && styles.saveButtonTextDisabled
                        ]}>
                            {isLoading ? 'Saving...' : 'Save Flashcard'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ColorTheme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.card,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
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
    translatingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    translatingText: {
        fontSize: 12,
        color: colors.primary,
        fontStyle: 'italic',
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
    tipBox: {
        backgroundColor: colors.secondaryBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    tipText: {
        fontSize: 13,
        color: colors.secondaryText,
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        paddingBottom: 20,
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
    saveButtonTextDisabled: {
        color: colors.tertiaryText,
    },
});
