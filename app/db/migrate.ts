import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 })
  const db = drizzle(migrationClient)
  
  try {
    await migrate(db, {
      migrationsFolder: './drizzle',
      migrationsTable: 'drizzle_migrations'
    })
  } catch (error) {
    console.error('Error running migrations:', error)
    process.exit(1)
  } finally {
    await migrationClient.end()
  }
}

runMigrations() 