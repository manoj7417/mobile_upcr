-- Create product status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS status product_status NOT NULL DEFAULT 'active';

-- Update existing products to have 'active' status
UPDATE products SET status = 'active' WHERE status IS NULL; 