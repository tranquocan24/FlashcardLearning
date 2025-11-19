# 📚 FlashcardLearning

A modern, minimalist flashcard learning application built with React Native and Expo. Learn vocabulary through multiple engaging methods: flashcards, quizzes, and matching games.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB.svg)
![Expo](https://img.shields.io/badge/Expo-51-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg)

---

## ✨ Features

### 🎯 Core Features
- **Deck Management** - Create, edit, and organize flashcard decks
- **Smart Flashcards** - Add words with meanings and examples
- **Multiple Learning Modes**:
  - 📖 **Flashcard Study** - Classic flip-card learning with swipe gestures
  - ✍️ **Quiz Mode** - Multiple choice questions with instant feedback
  - 🎯 **Match Game** - Match words with their meanings
- **Progress Tracking** - Track your learning sessions and scores
- **User Profiles** - Manage your account and settings

### 🎨 Design Philosophy
- **Minimalist UI** - Clean, distraction-free interface
- **User-Friendly** - Intuitive navigation and interactions
- **Responsive** - Smooth animations and transitions
- **Accessible** - Clear typography and consistent spacing

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- PostgreSQL database
- Android Studio / Xcode (for mobile development)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/flashcard_db
   PORT=3000
   ```

4. **Set up database**
   Run the SQL schema to create tables (refer to your database schema file).

5. **Start the backend server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:3000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure API URL**
   Update `src/constants/config.ts` with your backend URL:
   ```typescript
   export const API_URL = 'http://YOUR_IP:3000';
   ```

3. **Start the Expo development server**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web
   - Scan QR code with Expo Go app on your phone

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Database Driver**: node-postgres (pg)

---

## 📁 Project Structure

```
FlashcardLearning/
├── backend/                 # Node.js backend
│   ├── index.js            # Main server file
│   └── package.json        # Backend dependencies
│
├── src/                    # React Native source code
│   ├── api/               # API service layer
│   ├── components/        # Reusable UI components
│   ├── constants/         # App constants
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # App screens
│   │   ├── auth/         # Login & Register
│   │   ├── home/         # Deck list & details
│   │   ├── flashcard/    # Add/Edit flashcards
│   │   ├── learning/     # Learning modes
│   │   └── settings/     # User settings
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
│
├── assets/               # Images, fonts, icons
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

---

## 🎮 How to Use

### 1. Create an Account
- Register with username, email, and password
- Or login if you already have an account

### 2. Create Your First Deck
- Tap the **Create** tab
- Enter deck title and description
- Choose whether to make it public
- Start adding flashcards

### 3. Add Flashcards
- From deck details, tap **Add Card**
- Enter the word/term
- Add meaning/definition
- Optionally add an example sentence

### 4. Start Learning
- Tap **Start Learning** from any deck
- Choose your preferred learning mode:
  - **Flashcard Study**: Flip cards and mark what you know
  - **Quiz**: Test yourself with multiple choice questions
  - **Match Game**: Match words with their meanings

### 5. Track Progress
- View your learning sessions in Settings
- See your scores and improvement over time

---

## 🛠️ Development

### Available Scripts

**Frontend**
```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on Web
```

**Backend**
```bash
npm start          # Start Express server
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /users/:userId` - Get user details
- `PUT /users/:userId` - Update user profile
- `PUT /users/:userId/password` - Change password

### Decks
- `GET /decks` - Get all decks
- `GET /decks/:deckId` - Get deck by ID
- `POST /decks` - Create new deck
- `PUT /decks/:deckId` - Update deck
- `DELETE /decks/:deckId` - Delete deck

### Flashcards
- `GET /flashcards/:deckId` - Get flashcards by deck
- `POST /flashcards` - Create flashcard
- `PUT /flashcards/:flashcardId` - Update flashcard
- `DELETE /flashcards/:flashcardId` - Delete flashcard

### Sessions & Progress
- `GET /sessions/:userId` - Get user sessions
- `POST /sessions` - Save learning session
- `GET /progress/:userId/:deckId` - Get progress
- `POST /progress` - Update progress

---

## 🎨 Design System

### Colors
- **Primary**: `#007AFF` (Blue)
- **Success**: `#34C759` (Green)
- **Warning**: `#FF9500` (Orange)
- **Danger**: `#FF3B30` (Red)
- **Background**: `#F8F9FA` (Light Gray)
- **Text**: `#000000` (Black)
- **Secondary Text**: `#8E8E93` (Gray)

### Typography
- **Large Title**: 32px, Bold
- **Title**: 28px, Bold
- **Headline**: 20px, Semibold
- **Body**: 16px, Regular
- **Caption**: 13px, Regular

### Spacing
- Standard padding: 20px
- Card padding: 16px
- Small gap: 8px
- Medium gap: 12px
- Large gap: 24px

---

## 🔮 Future Features

- [ ] Dark mode support
- [ ] Offline mode with local storage
- [ ] Push notifications for study reminders
- [ ] Statistics dashboard
- [ ] Share decks with friends
- [ ] Import/Export decks
- [ ] Audio pronunciation
- [ ] Spaced repetition algorithm
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Hau Nguyen**

---

## 🙏 Acknowledgments

- React Native community
- Expo team
- All open-source contributors

---

**Made with ❤️ using React Native and Expo**
