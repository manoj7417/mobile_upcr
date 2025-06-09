import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Check for required environment variable
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create the connection
const client = postgres(DATABASE_URL)

// Create the database instance
export const db = drizzle(client, { schema }) 