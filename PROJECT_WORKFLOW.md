# FlashcardLearning - Project Workflow & Structure

## 📋 Mô tả dự án
Ứng dụng học từ vựng với flashcard, quiz và game nối từ. Người dùng có thể tạo các bộ thẻ (deck), học từ vựng theo nhiều phương pháp khác nhau và theo dõi tiến độ học tập.

---

## 🎯 Các tính năng chính

### 1. Authentication (Xác thực)
- **Login** - Đăng nhập bằng username/email + password
- **Register** - Đăng ký tài khoản (username, email, password, confirm password)
- Validation form, hiển thị lỗi
- Lưu token/session sau khi đăng nhập thành công

### 2. Home - Deck List (Tab 1 - Trang chủ)
- Hiển thị danh sách các bộ flashcard (decks)
- Mỗi deck hiển thị: title, description, số lượng flashcard, ngày tạo
- Filter: My Decks / Public Decks
- Search deck theo tên
- Pull to refresh
- Tap vào deck → chuyển đến Deck Detail

### 3. Deck Detail / Deck Preview
- Hiển thị thông tin chi tiết deck
- Danh sách tất cả flashcard trong deck (word, meaning)
- **Buttons:**
  - **Start Learning** → chọn chế độ học (Flashcard/Quiz/Match)
  - **Add Flashcard** → thêm từ mới
  - **Edit/Delete Deck** (nếu là owner)

### 4. Learning Modes

#### 4.1. Flashcard Study
- Hiển thị flashcard với từ vựng (word)
- Tap để lật thẻ → hiển thị nghĩa (meaning) + example
- Animation xoay thẻ
- Swipe hoặc button:
  - **"Đã nhớ"** → chuyển sang thẻ tiếp, lưu progress
  - **"Học tiếp"** → thẻ sẽ xuất hiện lại sau
- Progress bar hiển thị tiến độ
- Kết thúc → hiển thị kết quả (số thẻ đã học, % đã nhớ)

#### 4.2. Quiz (Multiple Choice)
- Câu hỏi: cho từ vựng, chọn nghĩa đúng
- 4 đáp án (1 đúng, 3 sai từ các flashcard khác)
- Hiển thị đúng/sai ngay lập tức
- Progress bar
- Kết thúc → hiển thị kết quả (điểm số, % correct)
- Lưu session vào database

#### 4.3. Match (Nối từ - nghĩa)
- Giao diện 2 cột: cột Word | cột Meaning
- Người dùng chọn cặp Word-Meaning tương ứng
- UI highlight khi chọn
- Kiểm tra đúng/sai khi ghép xong
- Hiệu ứng animation khi đúng/sai
- Timer (optional)
- Kết thúc → hiển thị kết quả
- Lưu session vào database

### 5. Create Deck (Tab 2 - Thêm Deck)
- Nút **[+]** trong Tab 2
- Form tạo deck mới:
  - Title (required)
  - Description (optional)
  - is_public checkbox
- Sau khi tạo → chuyển đến Deck Detail để thêm flashcard

### 6. Add / Edit Flashcard
- Form thêm/sửa flashcard:
  - Word (required)
  - Meaning (required)
  - Example (optional)
  - Media URL (optional - future: upload image/audio)
- Validate input
- Save → cập nhật danh sách flashcard

### 7. Settings (Tab 3 - Cài đặt)
- Hiển thị thông tin user: avatar, username, email
- Menu options:
  - **Edit Profile** → chỉnh sửa avatar, username
  - **Change Password** → đổi mật khẩu
  - **About** → thông tin ứng dụng
  - **Logout** → đăng xuất

### 8. Edit Profile
- Modal hoặc màn hình riêng
- Chọn/upload avatar mới (image picker)
- Chỉnh username
- Button Save/Cancel

### 9. Change Password
- Form đổi mật khẩu:
  - Current Password
  - New Password
  - Confirm New Password
- Validate, hiển thị lỗi
- Success → thông báo và quay lại Settings

---

## 🗂️ Cấu trúc Project

```
FlashcardLearning/
│
├── backend/                      # Node.js + Express Backend
│   ├── index.js                  # Main server file với API endpoints
│   ├── .env                      # Database connection string
│   ├── package.json              # Dependencies
│   └── test-connection.js        # Test database connection
│
├── src/                          # Source code chính (React Native)
│   ├── api/                      # API service layer
│   │   ├── api.js                # Axios configuration & API calls
│   │   ├── auth.js               # Authentication APIs
│   │   ├── decks.js              # Deck APIs
│   │   ├── flashcards.js         # Flashcard APIs
│   │   ├── progress.js           # Progress & Session APIs
│   │   └── users.js              # User profile APIs
│   │
│   ├── screens/                  # Tất cả các màn hình
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx              # Deck list (Tab 1)
│   │   │   ├── DeckDetailScreen.tsx        # Chi tiết deck
│   │   │   └── CreateDeckScreen.tsx        # Tạo deck mới (Tab 2)
│   │   │
│   │   ├── learning/
│   │   │   ├── LearningModeScreen.tsx      # Chọn chế độ học
│   │   │   ├── FlashcardStudyScreen.tsx    # Flashcard mode
│   │   │   ├── QuizScreen.tsx              # Quiz mode
│   │   │   ├── MatchScreen.tsx             # Match mode
│   │   │   └── ResultScreen.tsx            # Kết quả sau khi học
│   │   │
│   │   ├── flashcard/
│   │   │   ├── AddFlashcardScreen.tsx      # Thêm flashcard
│   │   │   └── EditFlashcardScreen.tsx     # Sửa flashcard
│   │   │
│   │   └── settings/
│   │       ├── SettingsScreen.tsx          # Settings main (Tab 3)
│   │       ├── EditProfileScreen.tsx       # Sửa profile
│   │       └── ChangePasswordScreen.tsx    # Đổi mật khẩu
│   │
│   ├── components/               # Reusable components
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   ├── flashcard/
│   │   │   ├── FlashcardCard.tsx           # Thẻ flashcard có animation
│   │   │   ├── FlashcardList.tsx           # List flashcard trong deck
│   │   │   └── FlashcardItem.tsx           # Item trong list
│   │   │
│   │   ├── deck/
│   │   │   ├── DeckCard.tsx                # Card hiển thị deck
│   │   │   └── DeckList.tsx                # List các deck
│   │   │
│   │   └── quiz/
│   │       ├── QuizQuestion.tsx            # Câu hỏi quiz
│   │       ├── QuizOption.tsx              # Đáp án
│   │       └── MatchPair.tsx               # Component cho match game
│   │
│   ├── navigation/               # Navigation configuration
│   │   ├── AppNavigator.tsx                # Main navigator
│   │   ├── AuthNavigator.tsx               # Auth stack
│   │   ├── MainNavigator.tsx               # Main tab navigator
│   │   └── types.ts                        # Navigation types
│   │
│   ├── context/                  # Context API / State Management
│   │   ├── AuthContext.tsx                 # Authentication state
│   │   ├── DeckContext.tsx                 # Deck management
│   │   └── ThemeContext.tsx                # Theme (dark/light mode)
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useDecks.ts
│   │   ├── useFlashcards.ts
│   │   └── useProgress.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── validation.ts                   # Form validation
│   │   ├── storage.ts                      # AsyncStorage helpers
│   │   ├── dateFormat.ts                   # Date formatting
│   │   └── uuid.ts                         # UUID generator
│   │
│   ├── types/                    # TypeScript types
│   │   ├── models.ts                       # Database models
│   │   ├── api.ts                          # API response types
│   │   └── index.ts
│   │
│   └── constants/                # Constants
│       ├── theme.ts                        # Colors, fonts, spacing
│       ├── config.ts                       # App config (API URL)
│       └── strings.ts                      # Text strings
│
├── app/                          # Expo Router screens (existing)
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # → Sẽ chuyển thành HomeScreen
│   │   └── explore.tsx           # → Sẽ chuyển thành SettingsScreen
│   └── modal.tsx
│
├── assets/                       # Images, fonts, icons
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── .env                          # Environment variables (API URL)
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
└── PROJECT_WORKFLOW.md           # This file

```

---

## 🔀 Navigation Flow

```
App Start
  │
  ├─> Not Logged In
  │     │
  │     ├─> LoginScreen
  │     │     ├─> [Login Success] → Main App (Tabs)
  │     │     └─> [Go to Register] → RegisterScreen
  │     │
  │     └─> RegisterScreen
  │           └─> [Register Success] → LoginScreen or Main App
  │
  └─> Logged In → Main App (Bottom Tabs)
        │
        ├─── Tab 1: Home (Deck List)
        │      │
        │      ├─> DeckDetailScreen
        │      │     ├─> AddFlashcardScreen
        │      │     ├─> EditFlashcardScreen
        │      │     └─> LearningModeScreen (Modal/Screen)
        │      │           ├─> FlashcardStudyScreen → ResultScreen
        │      │           ├─> QuizScreen → ResultScreen
        │      │           └─> MatchScreen → ResultScreen
        │      │
        │      └─> SearchDecks (in HomeScreen)
        │
        ├─── Tab 2: Create Deck
        │      └─> CreateDeckScreen
        │            └─> [Success] → DeckDetailScreen
        │
        └─── Tab 3: Settings
               │
               ├─> EditProfileScreen (Modal)
               ├─> ChangePasswordScreen
               └─> [Logout] → LoginScreen
```

---

## 📊 API Endpoints (Backend)

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất (optional)

### Users
- `GET /api/users/:userId` - Lấy thông tin user
- `PUT /api/users/:userId` - Cập nhật profile
- `PUT /api/users/:userId/password` - Đổi mật khẩu

### Decks
- `GET /api/decks` - Lấy danh sách decks (filter: userId, isPublic)
- `GET /api/decks/:deckId` - Lấy chi tiết 1 deck
- `POST /api/decks` - Tạo deck mới
- `PUT /api/decks/:deckId` - Cập nhật deck
- `DELETE /api/decks/:deckId` - Xoá deck

### Flashcards
- `GET /api/flashcards/:deckId` - Lấy tất cả flashcard trong 1 deck
- `GET /api/flashcards/:flashcardId` - Lấy 1 flashcard
- `POST /api/flashcards` - Tạo flashcard mới
- `PUT /api/flashcards/:flashcardId` - Cập nhật flashcard
- `DELETE /api/flashcards/:flashcardId` - Xoá flashcard

### Progress & Sessions
- `GET /api/progress/:userId/:deckId` - Lấy tiến độ học của user
- `POST /api/progress` - Cập nhật progress
- `GET /api/sessions/:userId` - Lấy lịch sử học tập
- `POST /api/sessions` - Lưu session học tập mới

---

## ✅ Development Checklist

### Phase 1: Setup & Authentication (Week 1)
- [ ] Setup project structure
- [ ] Configure navigation (Auth + Main Tabs)
- [ ] Setup API service layer
- [ ] Implement AuthContext
- [ ] Create LoginScreen
- [ ] Create RegisterScreen
- [ ] Implement authentication logic
- [ ] Add form validation

### Phase 2: Core Features - Decks & Flashcards (Week 2)
- [x] Create HomeScreen (Deck List)
- [x] Create DeckCard component
- [x] Implement deck fetching API
- [x] Create DeckDetailScreen
- [x] Create FlashcardList component
- [x] Create CreateDeckScreen
- [x] Create AddFlashcardScreen
- [x] Create EditFlashcardScreen
- [x] Implement CRUD operations for decks/flashcards

### Phase 3: Learning Modes (Week 3)
- [x] Create LearningModeScreen (chọn mode)
- [x] Implement FlashcardStudyScreen
  - [x] Flip animation
  - [x] Swipe gestures
  - [x] Progress tracking
- [x] Implement QuizScreen
  - [x] Random answer generation
  - [x] Answer validation
  - [x] Score calculation
- [x] Implement MatchScreen
  - [x] Drag & drop or tap matching
  - [x] Match validation
  - [x] Animation effects
- [x] Create ResultScreen (chung cho 3 modes)
- [x] Implement session saving

### Phase 4: User Profile & Settings (Week 4)
- [x] Create SettingsScreen
- [x] Create EditProfileScreen
  - [x] Update profile API
- [x] Create ChangePasswordScreen
- [x] Implement logout functionality

### Phase 5: Polish & Testing (Week 5)
- [x] Add loading states
- [x] Add error handling
- [x] Implement pull-to-refresh
- [x] Add search functionality
- [x] Add filters (My Decks/Public)
- [ ] Improve UI/UX
- [ ] Add animations
- [ ] Testing on Android/iOS
- [ ] Bug fixes

### Phase 6: Optional Features
- [ ] Dark mode
- [ ] Offline mode (AsyncStorage)
- [ ] Notification reminders
- [ ] Statistics dashboard
- [ ] Share decks
- [ ] Export/Import decks
- [ ] Audio pronunciation
- [ ] Spaced repetition algorithm

---

## 🛠️ Technology Stack

### Frontend (React Native)
- **Framework:** React Native + Expo
- **Language:** TypeScript
- **Navigation:** Expo Router / React Navigation
- **State Management:** React Context API (hoặc Redux Toolkit)
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **UI Components:** Custom + React Native Paper (optional)
- **Animations:** Reanimated / Animated API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** pg (node-postgres)
- **Authentication:** JWT (future)
- **Environment:** dotenv

### Development Tools
- **Version Control:** Git + GitHub
- **Package Manager:** npm
- **Code Editor:** VS Code
- **Database Client:** pgAdmin / DBeaver

---

## 📝 Notes

1. **UUID Generation:** Client-side (React Native) generates UUID cho các entity mới
2. **Authentication:** Hiện tại chưa implement JWT, có thể thêm sau
3. **Validation:** Form validation ở cả client và server
4. **Error Handling:** Unified error response format từ backend
5. **Loading States:** Show loading indicator cho mọi async operation
6. **Offline Support:** Future feature - cache data với AsyncStorage

---

## 🎨 UI/UX Guidelines

- **Màu sắc:** Sử dụng theme.ts để quản lý colors
- **Typography:** Fonts rõ ràng, dễ đọc
- **Spacing:** Consistent padding/margin
- **Feedback:** Loading states, success/error messages
- **Accessibility:** Support dark mode, font scaling
- **Animation:** Smooth transitions, không quá phức tạp

---

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
npm install
# Config .env file với DATABASE_URL
npm start
# Server chạy trên http://localhost:3000
```

### Frontend Setup
```bash
npm install
# Config .env file với API_URL
npx expo start
# Press 'a' for Android, 'i' for iOS, 'w' for Web
```

### Database Setup
```sql
-- Chạy schema SQL đã có (users, decks, flashcards, sessions, progress)
-- Insert sample data để test
```

---

**Last Updated:** November 15, 2025
