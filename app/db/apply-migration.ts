import postgres from 'postgres'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env file
dotenv.config()

const applyMigration = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 })
  
  try {
    // Read the migration file
    const migration = fs.readFileSync(
      path.join(process.cwd(), 'drizzle', '0005_add_profile_picture.sql'),
      'utf8'
    )

    // Split the migration into individual statements
    const statements = migration.split(';').filter(stmt => stmt.trim())

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement + ';')
      }
    }

  } catch (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

applyMigration() 