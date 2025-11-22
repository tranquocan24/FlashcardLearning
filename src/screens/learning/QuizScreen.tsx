import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { flashcardsAPI } from '../../api/flashcards';
import { HomeStackParamList } from '../../navigation/types';
import { Flashcard } from '../../types/models';

type Props = NativeStackScreenProps<HomeStackParamList, 'Quiz'>;

interface QuizQuestion {
    flashcard: Flashcard;
    options: string[];
    correctAnswer: string;
}

export default function QuizScreen({ navigation, route }: Props) {
    const { deckId } = route.params;
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        fetchFlashcards();
    }, []);

    const fetchFlashcards = async () => {
        try {
            setIsLoading(true);
            const response = await flashcardsAPI.getFlashcardsByDeck(deckId);
            const cards = response.data || [];

            if (cards.length < 4) {
                Alert.alert(
                    'Not Enough Cards',
                    'You need at least 4 flashcards to play Quiz.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
                return;
            }

            setFlashcards(cards);
            generateQuestions(cards);
        } catch (error) {
            console.error('Failed to fetch flashcards:', error);
            Alert.alert('Error', 'Failed to load flashcards');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const generateQuestions = (cards: Flashcard[]) => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        const quizQuestions: QuizQuestion[] = [];

        for (const card of shuffled) {
            // Get 3 wrong answers
            const wrongAnswers = cards
                .filter((c) => c.id !== card.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map((c) => c.meaning);

            // Combine with correct answer and shuffle
            const options = [...wrongAnswers, card.meaning].sort(
                () => Math.random() - 0.5
            );

            quizQuestions.push({
                flashcard: card,
                options,
                correctAnswer: card.meaning,
            });
        }

        setQuestions(quizQuestions);
    };

    const handleAnswerSelect = (answer: string) => {
        if (showResult) return; // Prevent changing answer after showing result

        setSelectedAnswer(answer);
        setShowResult(true);

        const isCorrect = answer === questions[currentIndex].correctAnswer;
        if (isCorrect) {
            setCorrectCount(correctCount + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex >= questions.length - 1) {
            // Finished all questions
            navigation.replace('Result', {
                type: 'QUIZ',
                total: questions.length,
                correct: correctCount,
                deckId,
            });
            return;
        }

        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No questions available</Text>
            </View>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <View style={styles.backButtonContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backIcon}>←</Text>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>
                    Question {currentIndex + 1} / {questions.length}
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Question */}
                <View style={styles.questionContainer}>
                    <Text style={styles.questionLabel}>What does this word mean?</Text>
                    <Text style={styles.questionWord}>{currentQuestion.flashcard.word}</Text>
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === currentQuestion.correctAnswer;
                        const showCorrect = showResult && isCorrect;
                        const showWrong = showResult && isSelected && !isCorrect;

                        let buttonStyle = styles.optionButton;
                        if (showCorrect) {
                            buttonStyle = styles.optionButtonCorrect;
                        } else if (showWrong) {
                            buttonStyle = styles.optionButtonWrong;
                        } else if (isSelected) {
                            buttonStyle = styles.optionButtonSelected;
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.option, buttonStyle]}
                                onPress={() => handleAnswerSelect(option)}
                                disabled={showResult}
                                activeOpacity={0.7}
                            >
                                <View style={styles.optionContent}>
                                    <View style={styles.optionNumber}>
                                        <Text style={styles.optionNumberText}>
                                            {String.fromCharCode(65 + index)}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.optionText,
                                            showCorrect && styles.optionTextCorrect,
                                            showWrong && styles.optionTextWrong,
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                    {showCorrect && <Text style={styles.checkmark}>✓</Text>}
                                    {showWrong && <Text style={styles.crossmark}>✗</Text>}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Result Feedback */}
                {showResult && (
                    <View
                        style={[
                            styles.feedback,
                            selectedAnswer === currentQuestion.correctAnswer
                                ? styles.feedbackCorrect
                                : styles.feedbackWrong,
                        ]}
                    >
                        <Text style={styles.feedbackText}>
                            {selectedAnswer === currentQuestion.correctAnswer
                                ? '🎉 Correct!'
                                : '❌ Wrong!'}
                        </Text>
                        {currentQuestion.flashcard.example && (
                            <View style={styles.exampleContainer}>
                                <Text style={styles.exampleLabel}>Example:</Text>
                                <Text style={styles.exampleText}>
                                    {currentQuestion.flashcard.example}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Next Button */}
            {showResult && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>
                            {currentIndex >= questions.length - 1 ? 'Finish' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingTop: 50,
    },
    backButtonContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#FFF',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        alignSelf: 'flex-start',
    },
    backIcon: {
        fontSize: 24,
        color: '#007AFF',
        marginRight: 4,
    },
    backText: {
        fontSize: 17,
        color: '#007AFF',
        fontWeight: '500',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    progressContainer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E5EA',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#34C759',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    questionContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    questionLabel: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 12,
    },
    questionWord: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
    },
    optionsContainer: {
        gap: 12,
    },
    option: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    optionButton: {
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#E5E5EA',
    },
    optionButtonSelected: {
        backgroundColor: '#F0F9FF',
        borderColor: '#007AFF',
    },
    optionButtonCorrect: {
        backgroundColor: '#F0FFF4',
        borderColor: '#34C759',
    },
    optionButtonWrong: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FF3B30',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    optionNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3C3C43',
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    optionTextCorrect: {
        color: '#34C759',
        fontWeight: '600',
    },
    optionTextWrong: {
        color: '#FF3B30',
        fontWeight: '600',
    },
    checkmark: {
        fontSize: 24,
        color: '#34C759',
        marginLeft: 8,
    },
    crossmark: {
        fontSize: 24,
        color: '#FF3B30',
        marginLeft: 8,
    },
    feedback: {
        marginTop: 24,
        borderRadius: 12,
        padding: 16,
    },
    feedbackCorrect: {
        backgroundColor: '#F0FFF4',
        borderWidth: 1,
        borderColor: '#34C759',
    },
    feedbackWrong: {
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    exampleContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    exampleLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 4,
        fontWeight: '600',
    },
    exampleText: {
        fontSize: 14,
        color: '#3C3C43',
        fontStyle: 'italic',
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    nextButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
    },
});