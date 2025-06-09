-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- Update existing users to have is_admin = false
UPDATE users SET is_admin = false WHERE is_admin IS NULL; 