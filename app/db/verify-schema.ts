import postgres from 'postgres'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const verifySchema = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1 })
  
  try {
    // Check users table structure
    const usersColumns = await client`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `

    console.log('\nUsers Table Structure:')
    console.log('----------------------')
    usersColumns.forEach(col => {
      console.log(`${col.column_name}:`)
      console.log(`  Type: ${col.data_type}`)
      console.log(`  Default: ${col.column_default}`)
      console.log(`  Nullable: ${col.is_nullable}`)
    })

    // Check if resources and primary_resource columns exist
    const hasResources = usersColumns.some(col => col.column_name === 'resources')
    const hasPrimaryResource = usersColumns.some(col => col.column_name === 'primary_resource')

    console.log('\nVerification Results:')
    console.log('--------------------')
    console.log(`Resources column exists: ${hasResources ? '✅' : '❌'}`)
    console.log(`Primary Resource column exists: ${hasPrimaryResource ? '✅' : '❌'}`)

    // Check if columns are arrays
    const resourcesIsArray = usersColumns.find(col => col.column_name === 'resources')?.data_type === 'ARRAY'
    const primaryResourceIsArray = usersColumns.find(col => col.column_name === 'primary_resource')?.data_type === 'ARRAY'

    console.log(`Resources is array type: ${resourcesIsArray ? '✅' : '❌'}`)
    console.log(`Primary Resource is array type: ${primaryResourceIsArray ? '✅' : '❌'}`)

    // Check default values
    const resourcesDefault = usersColumns.find(col => col.column_name === 'resources')?.column_default
    const primaryResourceDefault = usersColumns.find(col => col.column_name === 'primary_resource')?.column_default

    console.log(`Resources default value: ${resourcesDefault}`)
    console.log(`Primary Resource default value: ${primaryResourceDefault}`)

  } catch (error) {
    console.error('Error verifying schema:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

verifySchema() 