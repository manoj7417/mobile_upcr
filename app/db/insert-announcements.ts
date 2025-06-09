import postgres from 'postgres'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env file
dotenv.config()

const insertAnnouncements = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 })
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(
      path.join(process.cwd(), 'drizzle', 'insert_announcements.sql'),
      'utf8'
    )

    // Execute the SQL
    await sql.unsafe(sqlContent)
    console.log('Successfully inserted announcements')

  } catch (error) {
    console.error('Error inserting announcements:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

insertAnnouncements() 