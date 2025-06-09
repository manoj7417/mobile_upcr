import postgres from 'postgres'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { hash } from 'bcryptjs'

// Load environment variables from .env file
dotenv.config()

const setupData = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 })
  
  try {
    // 1. Create test users
    console.log('Creating test users...')
    const hashedPassword = await hash('testpassword123', 10)
    const users = await sql`
      INSERT INTO users (name, email, password, verified, is_admin)
      VALUES 
        ('Test User 4', 'user4@test.com', ${hashedPassword}, true, false),
        ('Test User 6', 'user6@test.com', ${hashedPassword}, true, false),
        ('Test User 7', 'user7@test.com', ${hashedPassword}, true, false),
        ('Test User 10', 'user10@test.com', ${hashedPassword}, true, false),
        ('Test User 12', 'user12@test.com', ${hashedPassword}, true, false),
        ('Test User 13', 'user13@test.com', ${hashedPassword}, true, false),
        ('Test User 14', 'user14@test.com', ${hashedPassword}, true, false),
        ('Test User 15', 'user15@test.com', ${hashedPassword}, true, false),
        ('Test User 16', 'user16@test.com', ${hashedPassword}, true, false)
      RETURNING id
    `
    console.log('Created users:', users)

    // 2. Create sellers
    console.log('Creating sellers...')
    const sellers = await sql`
      INSERT INTO sellers (user_id, company_name, business_type, address, phone, is_verified)
      VALUES 
        (${users[0].id}, 'Company 4', 'IT', 'Address 4', '1234567890', true),
        (${users[1].id}, 'Company 6', 'Finance', 'Address 6', '2345678901', true),
        (${users[2].id}, 'Company 7', 'Construction', 'Address 7', '3456789012', true),
        (${users[3].id}, 'Company 10', 'Real Estate', 'Address 10', '4567890123', true),
        (${users[4].id}, 'Company 12', 'Agriculture', 'Address 12', '5678901234', true),
        (${users[5].id}, 'Company 13', 'Manufacturing', 'Address 13', '6789012345', true),
        (${users[6].id}, 'Company 14', 'Construction', 'Address 14', '7890123456', true),
        (${users[7].id}, 'Company 15', 'Food', 'Address 15', '8901234567', true),
        (${users[8].id}, 'Company 16', 'Construction', 'Address 16', '9012345678', true)
      RETURNING id
    `
    console.log('Created sellers:', sellers)

    // 3. Insert announcements
    console.log('Inserting announcements...')
    const announcementsSQL = fs.readFileSync(
      path.join(process.cwd(), 'drizzle', 'insert_announcements.sql'),
      'utf8'
    )
    await sql.unsafe(announcementsSQL)
    console.log('Successfully inserted announcements')

  } catch (error) {
    console.error('Error setting up data:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

setupData() 