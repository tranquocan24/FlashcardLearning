const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'flashcard_db',
});

async function runMigration() {
    try {
        console.log('Reading migration file...');
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', '001_create_folders.sql'),
            'utf8'
        );

        console.log('Executing migration...');
        await pool.query(migrationSQL);
        console.log('✅ Migration completed successfully!');

        // Check tables
        const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        console.log('\nCurrent tables:');
        result.rows.forEach(row => console.log(`  - ${row.table_name}`));

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

runMigration();
