// Test kết nối database và kiểm tra dữ liệu
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function testConnection() {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    try {
        // Test kết nối cơ bản
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully!');
        console.log('   Current time:', result.rows[0].now);

        // Kiểm tra bảng decks
        console.log('\n📚 Checking decks table...');
        const decksResult = await pool.query('SELECT * FROM decks');
        console.log(`   Found ${decksResult.rows.length} decks:`);
        decksResult.rows.forEach(deck => {
            console.log(`   - ${deck.name} (ID: ${deck.id})`);
        });

        // Kiểm tra bảng flashcards
        console.log('\n📝 Checking flashcards table...');
        const flashcardsResult = await pool.query('SELECT * FROM flashcards');
        console.log(`   Found ${flashcardsResult.rows.length} flashcards`);

        // Kiểm tra flashcards theo từng deck
        for (const deck of decksResult.rows) {
            const deckFlashcards = await pool.query(
                'SELECT * FROM flashcards WHERE deck_id = $1',
                [deck.id]
            );
            console.log(`   Deck "${deck.name}" has ${deckFlashcards.rows.length} flashcards`);
        }

        console.log('\n✨ All checks passed! Database is ready.');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('\n💡 Suggestions:');
        console.error('   1. Make sure PostgreSQL is running');
        console.error('   2. Check DATABASE_URL in .env file');
        console.error('   3. Run init-db.sql to create tables and sample data');
    } finally {
        await pool.end();
    }
}

testConnection();
