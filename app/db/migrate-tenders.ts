import { db } from './index'

async function migrateTenders() {
  try {
    console.log('Creating tenders table...')
    
    // Create engineering_category enum if it doesn't exist
    await db.execute(`
      DO $$ BEGIN
        CREATE TYPE "engineering_category" AS ENUM('civil', 'mechanical', 'electrical', 'chemical', 'environmental');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    
    // Create tenders table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "tenders" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id"),
        "upc_ref" text NOT NULL UNIQUE,
        "engineering_category" "engineering_category" NOT NULL,
        "specialization" text NOT NULL,
        "tender_name" text NOT NULL,
        "location" text NOT NULL,
        "scope" text NOT NULL,
        "estimated_value" text NOT NULL,
        "collection_date" timestamp NOT NULL,
        "submission_date" timestamp NOT NULL,
        "contact_name" text NOT NULL,
        "contact_number" text NOT NULL,
        "contact_email" text NOT NULL,
        "address" text NOT NULL,
        "document_urls" text[] DEFAULT '{}' NOT NULL,
        "status" text DEFAULT 'active' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `)
    
    console.log('✅ Tenders table created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating tenders table:', error)
    throw error
  }
}

// Run the migration
migrateTenders()
  .then(() => {
    console.log('Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  }) 