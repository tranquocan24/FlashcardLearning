-- Migration: Create folders table and add folder_id to decks table
-- Date: 2025-12-05

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add folder_id column to decks table (nullable)
ALTER TABLE decks 
ADD COLUMN IF NOT EXISTS folder_id UUID,
ADD CONSTRAINT fk_decks_folder 
    FOREIGN KEY (folder_id) 
    REFERENCES folders(id) 
    ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_folder_id ON decks(folder_id);
