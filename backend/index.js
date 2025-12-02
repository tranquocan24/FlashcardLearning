// backend/index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const { generateToken, authenticateToken } = require('./middleware/auth');
const { hashPassword, comparePassword } = require('./utils/password');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối database PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.stack);
    } else {
        console.log('✅ Database connected successfully');
        release();
    }
});

// Test API
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
        res.json({
            success: true,
            message: 'Backend is running',
            database: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==================== AUTHENTICATION APIs ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    const { id, username, email, password } = req.body;

    try {
        if (!id || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Check if email already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert new user with hashed password
        const result = await pool.query(
            'INSERT INTO users (id, username, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, username, email, avatar_url',
            [id, username, email, hashedPassword]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            user: user,
            token: token,
            message: 'User registered successfully'
        });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const result = await pool.query(
            'SELECT id, username, email, avatar_url, password FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Verify password with bcrypt
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Remove password from response
        delete user.password;

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            success: true,
            user: user,
            token: token
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Google Sign-In
app.post('/api/auth/google', async (req, res) => {
    const { googleId, email, name, photo } = req.body;

    try {
        if (!googleId || !email || !name) {
            return res.status(400).json({
                success: false,
                error: 'Google ID, email, and name are required'
            });
        }

        // Check if user exists by email or google_id
        let result = await pool.query(
            'SELECT id, username, email, avatar_url, google_id FROM users WHERE email = $1 OR google_id = $2',
            [email, googleId]
        );

        let user;

        if (result.rows.length > 0) {
            // User exists, update google_id if not set
            user = result.rows[0];

            if (!user.google_id) {
                await pool.query(
                    'UPDATE users SET google_id = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3',
                    [googleId, photo || user.avatar_url, user.id]
                );
                user.google_id = googleId;
                if (photo) user.avatar_url = photo;
            }
        } else {
            // Create new user with Google info
            const { v4: uuidv4 } = require('uuid');
            const newUserId = uuidv4();

            result = await pool.query(
                'INSERT INTO users (id, username, email, google_id, avatar_url, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id, username, email, avatar_url, google_id',
                [newUserId, name, email, googleId, photo, ''] // Empty password for Google users
            );

            user = result.rows[0];
        }

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url
            },
            token: token,
            message: user.google_id ? 'Login successful' : 'Account created successfully'
        });
    } catch (err) {
        console.error('Error with Google sign-in:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all decks (public hoặc của user cụ thể)
app.get('/decks', authenticateToken, async (req, res) => {
    try {
        // Use authenticated user's ID
        const userId = req.user.id;

        let query = `
            SELECT d.*, u.username as owner_name, u.email as owner_email,
                   (SELECT COUNT(*) FROM flashcards WHERE deck_id = d.id) as flashcard_count
            FROM decks d
            LEFT JOIN users u ON d.owner_id = u.id
            WHERE d.is_public = true OR d.owner_id = $1
            ORDER BY d.created_at DESC
        `;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching decks:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get deck by ID
app.get('/decks/:deckId', async (req, res) => {
    const { deckId } = req.params;
    try {
        const result = await pool.query(`
            SELECT d.*, u.username as owner_name,
                   (SELECT COUNT(*) FROM flashcards WHERE deck_id = d.id) as flashcard_count
            FROM decks d
            LEFT JOIN users u ON d.owner_id = u.id
            WHERE d.id = $1
        `, [deckId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Deck not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching deck:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create new deck
app.post('/decks', authenticateToken, async (req, res) => {
    const { id, title, description, is_public } = req.body;

    try {
        // Use authenticated user's ID as owner
        const result = await pool.query(
            'INSERT INTO decks (id, title, description, owner_id, is_public, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
            [id, title, description, req.user.id, is_public || false]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating deck:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update deck
app.put('/decks/:deckId', authenticateToken, async (req, res) => {
    const { deckId } = req.params;
    const { title, description, is_public } = req.body;

    try {
        // Verify ownership before updating
        const ownerCheck = await pool.query('SELECT owner_id FROM decks WHERE id = $1', [deckId]);
        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Deck not found' });
        }
        if (ownerCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to update this deck' });
        }

        const result = await pool.query(
            'UPDATE decks SET title = COALESCE($1, title), description = COALESCE($2, description), is_public = COALESCE($3, is_public), updated_at = NOW() WHERE id = $4 RETURNING *',
            [title, description, is_public, deckId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Deck not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating deck:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete deck
app.delete('/decks/:deckId', authenticateToken, async (req, res) => {
    const { deckId } = req.params;

    try {
        // Verify ownership before deleting
        const ownerCheck = await pool.query('SELECT owner_id FROM decks WHERE id = $1', [deckId]);
        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Deck not found' });
        }
        if (ownerCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to delete this deck' });
        }

        const result = await pool.query('DELETE FROM decks WHERE id = $1 RETURNING id', [deckId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Deck not found' });
        }

        res.json({ success: true, message: 'Deck deleted successfully' });
    } catch (err) {
        console.error('Error deleting deck:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==================== FLASHCARD APIs ====================

// Get flashcards by deck ID
app.get('/flashcards/:deckId', async (req, res) => {
    const { deckId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM flashcards WHERE deck_id = $1 ORDER BY created_at ASC',
            [deckId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching flashcards:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create new flashcard
app.post('/flashcards', authenticateToken, async (req, res) => {
    const { id, deck_id, word, meaning, example, media_url } = req.body;

    try {
        // Verify user owns the deck before creating flashcard
        const deckCheck = await pool.query('SELECT owner_id FROM decks WHERE id = $1', [deck_id]);
        if (deckCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Deck not found' });
        }
        if (deckCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to add flashcards to this deck' });
        }

        const result = await pool.query(
            'INSERT INTO flashcards (id, deck_id, word, meaning, example, media_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
            [id, deck_id, word, meaning, example, media_url]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating flashcard:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update flashcard
app.put('/flashcards/:flashcardId', authenticateToken, async (req, res) => {
    const { flashcardId } = req.params;
    const { word, meaning, example, media_url } = req.body;

    try {
        // Verify user owns the deck that contains this flashcard
        const flashcardCheck = await pool.query(
            'SELECT f.deck_id, d.owner_id FROM flashcards f JOIN decks d ON f.deck_id = d.id WHERE f.id = $1',
            [flashcardId]
        );
        if (flashcardCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Flashcard not found' });
        }
        if (flashcardCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to update this flashcard' });
        }

        const result = await pool.query(
            'UPDATE flashcards SET word = COALESCE($1, word), meaning = COALESCE($2, meaning), example = COALESCE($3, example), media_url = COALESCE($4, media_url), updated_at = NOW() WHERE id = $5 RETURNING *',
            [word, meaning, example, media_url, flashcardId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Flashcard not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating flashcard:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete flashcard
app.delete('/flashcards/:flashcardId', authenticateToken, async (req, res) => {
    const { flashcardId } = req.params;

    try {
        // Verify user owns the deck that contains this flashcard
        const flashcardCheck = await pool.query(
            'SELECT f.deck_id, d.owner_id FROM flashcards f JOIN decks d ON f.deck_id = d.id WHERE f.id = $1',
            [flashcardId]
        );
        if (flashcardCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Flashcard not found' });
        }
        if (flashcardCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to delete this flashcard' });
        }

        const result = await pool.query('DELETE FROM flashcards WHERE id = $1 RETURNING id', [flashcardId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Flashcard not found' });
        }

        res.json({ success: true, message: 'Flashcard deleted successfully' });
    } catch (err) {
        console.error('Error deleting flashcard:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==================== PROGRESS & SESSION APIs ====================

// ==================== USER APIs ====================

// Get all users (for testing)
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, avatar_url FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get user by ID
app.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update user profile
app.put('/users/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { username, email, avatar_url } = req.body;

    try {
        // Verify user can only update their own profile
        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        // Check if email is being changed and if it's already taken
        if (email) {
            const existingUser = await pool.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, userId]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        const result = await pool.query(
            'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), avatar_url = COALESCE($3, avatar_url), updated_at = NOW() WHERE id = $4 RETURNING id, username, email, avatar_url',
            [username, email, avatar_url, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: err.message });
    }
});

// Change password
app.put('/users/:userId/password', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        // Verify user can only change their own password
        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'You can only change your own password' });
        }

        // Verify current password
        const user = await pool.query(
            'SELECT password FROM users WHERE id = $1',
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password with bcrypt
        const isPasswordValid = await comparePassword(currentPassword, user.rows[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update password
        await pool.query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
            [hashedNewPassword, userId]
        );

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==================== DECK APIs ====================

// Get user progress for a deck
app.get('/progress/:userId/:deckId', authenticateToken, async (req, res) => {
    const { userId, deckId } = req.params;
    try {
        // Verify user can only access their own progress
        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'You can only access your own progress' });
        }

        const result = await pool.query(`
            SELECT p.*, f.word, f.meaning 
            FROM progress p
            JOIN flashcards f ON p.flashcard_id = f.id
            WHERE p.user_id = $1 AND f.deck_id = $2
        `, [userId, deckId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching progress:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update progress
app.post('/progress', authenticateToken, async (req, res) => {
    const { id, user_id, flashcard_id, ease, interval, next_review_at, times_seen } = req.body;

    try {
        // Use authenticated user's ID instead of req.body.user_id
        const user_id = req.user.id;

        // Check if progress exists
        const existing = await pool.query(
            'SELECT id FROM progress WHERE user_id = $1 AND flashcard_id = $2',
            [user_id, flashcard_id]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing progress
            result = await pool.query(
                'UPDATE progress SET ease = COALESCE($1, ease), interval = COALESCE($2, interval), next_review_at = COALESCE($3, next_review_at), times_seen = COALESCE($4, times_seen), updated_at = NOW() WHERE user_id = $5 AND flashcard_id = $6 RETURNING *',
                [ease, interval, next_review_at, times_seen, user_id, flashcard_id]
            );
        } else {
            // Insert new progress
            result = await pool.query(
                'INSERT INTO progress (id, user_id, flashcard_id, ease, interval, next_review_at, times_seen, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
                [id, user_id, flashcard_id, ease || 2.5, interval || 0, next_review_at, times_seen || 1]
            );
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating progress:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get sessions by user
app.get('/sessions/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    try {
        // Verify user can only access their own sessions
        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'You can only access your own sessions' });
        }

        const result = await pool.query(`
            SELECT s.*, d.title as deck_title
            FROM sessions s
            JOIN decks d ON s.deck_id = d.id
            WHERE s.user_id = $1
            ORDER BY s.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create new session
app.post('/sessions', authenticateToken, async (req, res) => {
    const { id, user_id, deck_id, session_type, score, total_cards } = req.body;

    // Debug logging
    console.log('Received session data:', { id, user_id, deck_id, session_type, score, total_cards });

    // Validate required fields
    if (!id || !deck_id || !session_type || score === undefined || total_cards === undefined) {
        console.error('Missing required fields:', { id, deck_id, session_type, score, total_cards });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Use authenticated user's ID
        const result = await pool.query(
            'INSERT INTO sessions (id, user_id, deck_id, type, total, correct, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
            [id, req.user.id, deck_id, session_type, total_cards, score]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating session:', err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend running on port ${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`\n  Auth:`);
    console.log(`   POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   POST http://localhost:${PORT}/api/auth/google`);
    console.log(`\n  Users:`);
    console.log(`   GET  http://localhost:${PORT}/users`);
    console.log(`   GET  http://localhost:${PORT}/users/:userId`);
    console.log(`   PUT  http://localhost:${PORT}/users/:userId`);
    console.log(`   PUT  http://localhost:${PORT}/users/:userId/password`);
    console.log(`\n  Decks:`);
    console.log(`   GET  http://localhost:${PORT}/decks`);
    console.log(`   GET  http://localhost:${PORT}/decks/:deckId`);
    console.log(`   POST http://localhost:${PORT}/decks`);
    console.log(`   PUT  http://localhost:${PORT}/decks/:deckId`);
    console.log(`   DEL  http://localhost:${PORT}/decks/:deckId`);
    console.log(`\n  Flashcards:`);
    console.log(`   GET  http://localhost:${PORT}/flashcards/:deckId`);
    console.log(`   POST http://localhost:${PORT}/flashcards`);
    console.log(`   PUT  http://localhost:${PORT}/flashcards/:flashcardId`);
    console.log(`   DEL  http://localhost:${PORT}/flashcards/:flashcardId`);
    console.log(`\n  Progress & Sessions:`);
    console.log(`   GET  http://localhost:${PORT}/progress/:userId/:deckId`);
    console.log(`   POST http://localhost:${PORT}/progress`);
    console.log(`   GET  http://localhost:${PORT}/sessions/:userId`);
    console.log(`   POST http://localhost:${PORT}/sessions\n`);
});



