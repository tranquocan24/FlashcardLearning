import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
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
import { flashcardsAPI } from '../../api/flashcards';
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

    const [word, setWord] = useState('');
    const [meaning, setMeaning] = useState('');
    const [example, setExample] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                        <Text style={styles.label}>
                            Word / Term <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Serendipity"
                            placeholderTextColor="#999"
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
                        <Text style={styles.label}>
                            Meaning / Definition <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="What does it mean?"
                            placeholderTextColor="#999"
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
                            placeholderTextColor="#999"
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
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? 'Saving...' : 'Save Flashcard'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
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
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    cancelButton: {
        paddingVertical: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#007AFF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
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
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    required: {
        color: '#FF3B30',
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    hint: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    tipBox: {
        backgroundColor: '#FFF9E6',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    tipText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#CCC',
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
});
