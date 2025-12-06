# GEMINI.md

This file provides a comprehensive overview of the FlashcardLearning project, its structure, and how to work with it.

## Project Overview

FlashcardLearning is a mobile application built with React Native and Expo for the frontend, and a Node.js backend. It allows users to create flashcard decks, study them using different modes (flashcards, quizzes, matching games), and track their progress.

**Frontend:**

*   **Framework:** React Native with Expo
*   **Language:** TypeScript
*   **Navigation:** React Navigation
*   **State Management:** React Context API
*   **HTTP Client:** Axios
*   **Storage:** AsyncStorage

**Backend:**

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** PostgreSQL
*   **Authentication:** JWT (JSON Web Tokens)

## Building and Running

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn
*   Expo CLI
*   PostgreSQL database
*   Android Studio / Xcode (for mobile development)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    Create a `.env` file in the `backend` directory with the following content:
    ```
    DATABASE_URL=postgresql://username:password@localhost:5432/flashcard_db
    PORT=3000
    ```
4.  **Start the backend server:**
    ```bash
    npm start
    ```

### Frontend Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Configure API URL:**
    Update `src/constants/config.ts` to point to your backend server. It is recommended to use your local IP address for development.
    ```typescript
    export const API_URL = __DEV__
      ? 'http://<your-local-ip>:3000'
      : 'https://api.flashcardlearning.com';
    ```
3.  **Start the application:**
    ```bash
    npx expo start
    ```
    You can then run the app on a simulator or a physical device.

## Development Conventions

*   **Code Style:** The project uses ESLint to enforce a consistent code style. Run `npm run lint` to check for linting errors.
*   **Branching:** When contributing, create a new branch for your feature or bug fix (e.g., `feature/new-feature` or `fix/bug-fix`).
*   **Commits:** Write clear and descriptive commit messages.
*   **Testing:** (TODO) No testing framework is currently configured.

## Project Structure

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
