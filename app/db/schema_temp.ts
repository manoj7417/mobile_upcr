import { pgTable, serial, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core'

// Define the announcement status enum
export const announcementStatusEnum = pgEnum('announcement_status', ['active', 'inactive', 'pending'])

// Define the announcements table
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  seller_id: integer('seller_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  details: text('details').notNull(),
  status: announcementStatusEnum('status').default('pending').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Define the seller table
export const sellers = pgTable('sellers', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().unique(),
  company_name: text('company_name').notNull(),
  business_type: text('business_type').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  website: text('website'),
  description: text('description'),
  is_verified: boolean('is_verified').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}) 