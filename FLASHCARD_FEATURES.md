# Flashcard Creation Features

## Overview
Added two advanced features to the Add Flashcard screen to enhance the learning experience:

1. **Audio Pronunciation** - Play word pronunciation with a single tap
2. **Auto-Translation** - Automatically translate English terms to Vietnamese

---

## 1. Audio Pronunciation Feature

### How It Works
- **Speaker Icon Button**: Appears next to the "Word / Term" field
- **API**: Uses Free Dictionary API (https://dictionaryapi.dev/)
- **Audio Priority**: Prefers US pronunciation, falls back to any available audio
- **Loading State**: Shows activity indicator while fetching/playing audio

### User Experience
1. User enters a word in the "Word / Term" field
2. Click the speaker icon 🔊 to hear pronunciation
3. Audio plays automatically once fetched
4. Button is disabled when empty or already playing

### Error Handling
- **Word not found**: Shows alert "Word not found or no pronunciation available"
- **No audio available**: Shows alert "No pronunciation audio available for this word"
- **Network errors**: Generic error message with retry suggestion
- Audio is automatically cleaned up when:
  - Component unmounts
  - New audio is played (old audio unloaded first)
  - Playback finishes (auto cleanup via status listener)

### Technical Details
```typescript
// Free Dictionary API endpoint
GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}

// Response contains phonetics array with audio URLs
{
  phonetics: [
    { audio: "https://.../pronunciation-us.mp3" }
  ]
}
```

---

## 2. Auto-Translation Feature

### How It Works
- **Debounced Translation**: 1-second delay after user stops typing
- **API**: MyMemory Translation API (free, no API key required)
- **Language Pair**: English → Vietnamese (en|vi)
- **Smart Update**: Only auto-fills if meaning field is empty

### User Experience
1. User types word in "Word / Term" field
2. After 1 second of no typing, translation begins
3. "Translating..." indicator appears next to "Meaning / Definition" label
4. Vietnamese translation auto-fills the meaning field
5. User can edit or replace the auto-translation freely

### Smart Behavior
- ✅ Only translates if meaning field is **empty**
- ✅ Respects user input - won't overwrite if user already typed
- ✅ Cancels previous translation if user keeps typing
- ✅ Silent failure - doesn't show errors (non-intrusive)

### Technical Details
```typescript
// MyMemory Translation API endpoint
GET https://api.mymemory.translated.net/get?q={text}&langpair=en|vi

// Response format
{
  responseStatus: 200,
  responseData: {
    translatedText: "từ được dịch"
  }
}
```

### Debounce Logic
```typescript
// Clears previous timeout when user types
useEffect(() => {
  if (translationTimeout.current) {
    clearTimeout(translationTimeout.current);
  }
  
  if (word.trim()) {
    translationTimeout.current = setTimeout(() => {
      translateWord(word.trim());
    }, 1000); // 1-second delay
  }
}, [word]);
```

---

## Dependencies

### New Package Installed
```bash
npx expo install expo-av
```

### Imports Added
```typescript
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ActivityIndicator } from 'react-native';
```

---

## UI Components

### Audio Button (Speaker Icon)
```tsx
<TouchableOpacity
  style={styles.audioButton}
  onPress={playPronunciation}
  disabled={isPlayingAudio || !word.trim()}
>
  {isPlayingAudio ? (
    <ActivityIndicator size="small" color="#007AFF" />
  ) : (
    <Ionicons 
      name="volume-high" 
      size={24} 
      color={word.trim() ? "#007AFF" : "#CCC"} 
    />
  )}
</TouchableOpacity>
```

### Translation Indicator
```tsx
{isTranslating && (
  <View style={styles.translatingIndicator}>
    <ActivityIndicator size="small" color="#007AFF" />
    <Text style={styles.translatingText}>Translating...</Text>
  </View>
)}
```

---

## State Management

### New State Variables
```typescript
const [isPlayingAudio, setIsPlayingAudio] = useState(false);
const [isTranslating, setIsTranslating] = useState(false);
const sound = useRef<Audio.Sound | null>(null);
const translationTimeout = useRef<NodeJS.Timeout | null>(null);
```

### Cleanup
```typescript
useEffect(() => {
  return () => {
    // Cleanup audio
    if (sound.current) {
      sound.current.unloadAsync();
    }
    // Cleanup timeout
    if (translationTimeout.current) {
      clearTimeout(translationTimeout.current);
    }
  };
}, []);
```

---

## Testing Recommendations

### Audio Feature
1. Test with common words: "hello", "apple", "computer"
2. Test with uncommon words: "serendipity", "ephemeral"
3. Test with non-existent words to verify error handling
4. Test rapidly clicking speaker icon (should handle gracefully)
5. Test playing audio then immediately typing new word

### Translation Feature
1. Type word and wait 1 second - should auto-translate
2. Type word, then immediately type in meaning field - should not overwrite
3. Test with various English words to verify Vietnamese translations
4. Test network offline scenario (should fail silently)
5. Type rapidly - should only translate once after stopping

---

## API Limitations & Fallbacks

### Free Dictionary API
- **Rate Limit**: None officially, but should avoid abuse
- **Coverage**: Most common English words
- **Fallback**: Shows user-friendly error if word not found

### MyMemory Translation API
- **Rate Limit**: 1000 requests/day (anonymous)
- **Quality**: Good for common words, may vary for complex phrases
- **Fallback**: Silently fails, user can manually enter meaning

---

## Future Enhancements (Optional)

1. **Offline Caching**: Cache pronunciations and translations locally
2. **Multiple Languages**: Support more translation pairs
3. **Phonetic Display**: Show IPA phonetic notation alongside audio
4. **Definition Import**: Import full definition from dictionary API
5. **Context Examples**: Auto-suggest usage examples from API
6. **Voice Input**: Allow recording custom pronunciation

---

## Files Modified

- `src/screens/flashcard/AddFlashcardScreen.tsx`
  - Added audio playback functionality
  - Added debounced auto-translation
  - Added UI components for both features
  - Added proper cleanup and error handling

---

## Success Criteria ✅

✅ Audio pronunciation works with speaker icon button  
✅ Loading indicator shows while fetching/playing audio  
✅ Error handling with user-friendly messages  
✅ Auto-translation with 1-second debounce  
✅ Translation indicator during API call  
✅ Smart update - respects user input  
✅ No errors or warnings in code  
✅ Proper cleanup on component unmount  
✅ Free APIs with no authentication required  

---

**Implementation Date**: January 2025  
**Developer**: Hau Nguyen  
**Status**: ✅ Complete and Ready for Testing
