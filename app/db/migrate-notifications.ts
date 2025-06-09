import { sql } from 'drizzle-orm'
import { db } from './index'

async function migrateNotifications() {
  console.log('🚀 Starting notifications table migration...')

  try {
    // Drop the existing notifications table if it exists (for clean setup)
    await db.execute(sql`DROP TABLE IF EXISTS notifications CASCADE;`)
    console.log('✅ Dropped existing notifications table')

    // Create notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        is_read BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `)
    console.log('✅ notifications table created')

    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    `)
    console.log('✅ Indexes created')

    console.log('🎉 Notifications table migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

export { migrateNotifications }

// Run migration
migrateNotifications()
  .then(() => {
    console.log('Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  }) 