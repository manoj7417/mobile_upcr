-- Create enums first (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE announcement_category AS ENUM ('PROJECT & CONSTRUCTION RESOURCES', 'BUSINESS RESOURCES', 'STUDENT RESOURCES');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE announcement_type AS ENUM ('scroll', 'flip');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE announcement_status AS ENUM ('active', 'inactive', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deal_status AS ENUM ('active', 'completed', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('Land', 'Machines', 'Material', 'Equipment', 'Tools', 'Manpower');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_log_action AS ENUM ('CREATE', 'UPDATE', 'DEACTIVATE', 'ACTIVATE', 'DELETE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_log_entity_type AS ENUM ('ANNOUNCEMENT', 'PRODUCT', 'GIG', 'PORTFOLIO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS resources TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS primary_resource TEXT[] DEFAULT '{}';

-- Update sellers table
ALTER TABLE sellers
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Create portfolios table if not exists
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES sellers(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create gigs table if not exists
CREATE TABLE IF NOT EXISTS gigs (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES sellers(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Update announcements table
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS category announcement_category,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS ad_type announcement_type DEFAULT 'scroll';

-- Create deals table if not exists
CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status deal_status DEFAULT 'active',
    sender_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create dms table if not exists
CREATE TABLE IF NOT EXISTS dms (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    deal_id INTEGER REFERENCES deals(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT false
);

-- Create products table if not exists
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES sellers(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    category product_category NOT NULL,
    brand_name TEXT,
    model TEXT,
    material TEXT,
    color TEXT,
    packaging_details TEXT,
    delivery_info TEXT,
    supply_ability TEXT,
    moq INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create audit_logs table if not exists
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    seller_id INTEGER NOT NULL REFERENCES sellers(id),
    entity_type audit_log_entity_type NOT NULL,
    entity_id INTEGER NOT NULL,
    action audit_log_action NOT NULL,
    changes TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Update existing users to have is_admin = false
UPDATE users SET is_admin = false WHERE is_admin IS NULL; 