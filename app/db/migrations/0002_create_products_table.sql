-- Create product category enum
CREATE TYPE product_category AS ENUM (
  'Land',
  'Machines',
  'Material',
  'Equipment',
  'Tools',
  'Manpower'
);

-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
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
  moq INTEGER, -- Minimum Order Quantity
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on seller_id for faster lookups
CREATE INDEX products_seller_id_idx ON products(seller_id);

-- Create index on category for faster filtering
CREATE INDEX products_category_idx ON products(category);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 