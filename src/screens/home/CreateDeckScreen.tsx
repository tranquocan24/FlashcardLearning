import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { decksAPI } from '../../api/decks';
import { useAuth } from '../../hooks/useAuth';
import { MainTabParamList } from '../../navigation/types';
import { generateUUID } from '../../utils/uuid';

type CreateDeckScreenNavigationProp = BottomTabNavigationProp<
    MainTabParamList,
    'CreateDeck'
>;

export default function CreateDeckScreen() {
    const navigation = useNavigation<CreateDeckScreenNavigationProp>();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        // Validation
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a title for your deck');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'You must be logged in to create a deck');
            return;
        }

        setIsLoading(true);
        try {
            const newDeck = {
                id: generateUUID(),
                title: title.trim(),
                description: description.trim() || undefined,
                owner_id: user.id,
                is_public: isPublic,
            };

            const createdDeck = await decksAPI.createDeck(newDeck);

            // Reset form
            setTitle('');
            setDescription('');
            setIsPublic(false);

            Alert.alert('Success', 'Deck created successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Navigate to My Decks tab
                        navigation.navigate('Home');
                    },
                },
            ]);
        } catch (error) {
            console.error('Error creating deck:', error);
            Alert.alert('Error', 'Failed to create deck. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (title.trim() || description.trim()) {
            Alert.alert(
                'Discard Changes',
                'Are you sure you want to discard this deck?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => {
                            setTitle('');
                            setDescription('');
                            setIsPublic(false);
                            navigation.navigate('Home');
                        },
                    },
                ]
            );
        } else {
            navigation.navigate('Home');
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
                    <Text style={styles.headerTitle}>New Deck</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>
                            Title <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., IELTS Vocabulary"
                            placeholderTextColor="#999"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                            editable={!isLoading}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="default"
                        />
                        <Text style={styles.hint}>{title.length}/100</Text>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="What is this deck about?"
                            placeholderTextColor="#999"
                            value={description}
                            onChangeText={setDescription}
                            maxLength={300}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            editable={!isLoading}
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            keyboardType="default"
                        />
                        <Text style={styles.hint}>{description.length}/300</Text>
                    </View>

                    <View style={styles.switchField}>
                        <View style={styles.switchInfo}>
                            <Text style={styles.switchLabel}>Make this deck public</Text>
                            <Text style={styles.switchDescription}>
                                Other users can view and study this deck
                            </Text>
                        </View>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                            thumbColor="#FFF"
                            disabled={isLoading}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Create Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        (!title.trim() || isLoading) && styles.createButtonDisabled,
                    ]}
                    onPress={handleCreate}
                    disabled={!title.trim() || isLoading}
                >
                    <Text style={styles.createButtonText}>
                        {isLoading ? 'Creating...' : 'Create Deck'}
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
        height: 120,
        paddingTop: 14,
    },
    hint: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    switchField: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
    },
    switchInfo: {
        flex: 1,
        marginRight: 16,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    switchDescription: {
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
    createButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    createButtonDisabled: {
        backgroundColor: '#CCC',
    },
    createButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
});
