import { pgTable, serial, text, timestamp, boolean, integer, pgEnum, decimal, uuid, varchar, numeric } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Define the user table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  verified: boolean('verified').default(false).notNull(),
  is_admin: boolean('is_admin').default(false).notNull(),
  profile_image_url: text('profile_image_url'),
  resources: text('resources').array().default([]),
  primaryResource: text('primary_resource').array().default([]),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Define the seller table
export const sellers = pgTable('sellers', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull().unique(),
  company_name: text('company_name').notNull(),
  business_type: text('business_type').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  website: text('website'),
  description: text('description'),
  profile_picture_url: text('profile_picture_url'),
  aadhar_url: text('aadhar_url'),
  gst_certificate_url: text('gst_certificate_url'),
  work_photos_urls: text('work_photos_urls').array(),
  owner_photos_urls: text('owner_photos_urls').array(),
  skills: text('skills').array().default([]),
  languages: text('languages').array().default([]),
  average_rating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  total_reviews: integer('total_reviews').default(0),
  is_verified: boolean('is_verified').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Define the portfolio table
export const portfolios = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  seller_id: integer('seller_id').references(() => sellers.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  image_url: text('image_url').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Define the gigs table
export const gigs = pgTable('gigs', {
  id: serial('id').primaryKey(),
  seller_id: integer('seller_id').references(() => sellers.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  image_url: text('image_url').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// --- PostForm Related Schemas ---

// Define enums for PostForm related tables
export const postStatusEnum = pgEnum('post_status', ['active', 'inactive', 'pending', 'expired'])
export const engineeringCategoryEnum = pgEnum('engineering_category', ['civil', 'mechanical', 'electrical', 'chemical', 'environmental'])
export const landTypeEnum = pgEnum('land_type', ['residential', 'commercial', 'agricultural', 'industrial', 'vacant'])
export const conditionEnum = pgEnum('condition', ['new', 'like-new', 'excellent', 'good', 'fair', 'used', 'refurbished', 'needs-repair', 'for-parts'])
export const materialTypeEnum = pgEnum('material_type', ['cement', 'steel', 'bricks', 'sand', 'wood', 'pipes', 'electrical', 'other'])
export const jobTypeEnum = pgEnum('job_type', ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary'])
export const experienceLevelEnum = pgEnum('experience_level', ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'])
export const equipmentCategoryEnum = pgEnum('equipment_category', ['power-tools', 'hand-tools', 'safety', 'measuring', 'lifting', 'cutting', 'drilling', 'other'])
export const toolCategoryEnum = pgEnum('tool_category', ['hand-tools', 'power-tools', 'measuring', 'cutting', 'drilling', 'garden', 'specialty', 'other'])
export const availabilityEnum = pgEnum('availability', ['for-sale', 'for-rent', 'both'])
export const manpowerCategoryEnum = pgEnum('manpower_category', ['construction', 'skilled-labor', 'technical', 'supervisory', 'cleaning', 'security', 'maintenance', 'other'])
export const financialServiceEnum = pgEnum('financial_service', ['construction-loan', 'business-loan', 'equipment-finance', 'working-capital', 'project-finance', 'personal-loan', 'investment', 'insurance', 'other'])
export const projectCategoryEnum = pgEnum('project_category', ['residential', 'commercial', 'infrastructure', 'renovation', 'interior', 'landscaping', 'engineering', 'other'])
export const auctionCategoryEnum = pgEnum('auction_category', ['equipment', 'vehicles', 'machinery', 'tools', 'materials', 'property', 'antiques', 'other'])
export const storeCategoryEnum = pgEnum('store_category', ['construction-supplies', 'tools-equipment', 'building-materials', 'safety-gear', 'electrical', 'plumbing', 'hardware', 'machinery', 'general', 'other'])
export const deliveryOptionEnum = pgEnum('delivery_option', ['pickup', 'delivery', 'both'])
export const unitEnum = pgEnum('unit', ['kg', 'tons', 'bags', 'pieces', 'meters', 'sqft', 'cuft', 'liters'])

// Tenders Table
export const tenders = pgTable('tenders', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  upc_ref: varchar('upc_ref', { length: 100 }).notNull().unique(),
  engineering_category: engineeringCategoryEnum('engineering_category').notNull(),
  specialization: text('specialization').notNull(),
  tender_name: text('tender_name').notNull(),
  location: text('location').notNull(),
  scope: text('scope').notNull(),
  estimated_value: decimal('estimated_value', { precision: 15, scale: 2 }).notNull(),
  collection_date: timestamp('collection_date').notNull(),
  submission_date: timestamp('submission_date').notNull(),
  contact_name: text('contact_name').notNull(),
  contact_number: text('contact_number').notNull(),
  contact_email: text('contact_email').notNull(),
  address: text('address').notNull(),
  document_urls: text('document_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Land Listings Table
export const landListings = pgTable('land_listings', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  location: text('location').notNull(),
  area: decimal('area', { precision: 10, scale: 2 }).notNull(), // in sq. ft
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  land_type: landTypeEnum('land_type').notNull(),
  description: text('description').notNull(),
  image_urls: text('image_urls').array().default([]),
  document_urls: text('document_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Machines Table
export const machines = pgTable('machines', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  condition: conditionEnum('condition').notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  location: text('location').notNull(),
  description: text('description').notNull(),
  image_urls: text('image_urls').array().default([]),
  document_urls: text('document_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Materials Table
export const materials = pgTable('materials', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  type: materialTypeEnum('type').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: unitEnum('unit').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // per unit
  grade: text('grade'),
  location: text('location').notNull(),
  delivery: deliveryOptionEnum('delivery').notNull(),
  description: text('description').notNull(),
  image_urls: text('image_urls').array().default([]),
  certificate_urls: text('certificate_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Jobs Table
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements').notNull(),
  salary: text('salary'),
  location: text('location').notNull(),
  job_type: jobTypeEnum('job_type').notNull(),
  experience: experienceLevelEnum('experience').notNull(),
  industry: text('industry').notNull(),
  document_urls: text('document_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Equipment Table
export const equipment = pgTable('equipment', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  category: equipmentCategoryEnum('category').notNull(),
  type: text('type').notNull(),
  brand: text('brand'),
  model: text('model'),
  year: integer('year'),
  condition: conditionEnum('condition').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  location: text('location').notNull(),
  description: text('description').notNull(),
  image_urls: text('image_urls').array().default([]),
  document_urls: text('document_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Tools Table
export const tools = pgTable('tools', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  category: toolCategoryEnum('category').notNull(),
  type: text('type').notNull(),
  brand: text('brand'),
  condition: conditionEnum('condition').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  location: text('location').notNull(),
  availability: availabilityEnum('availability').notNull(),
  description: text('description').notNull(),
  image_urls: text('image_urls').array().default([]),
  manual_urls: text('manual_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Manpower Services Table
export const manpowerServices = pgTable('manpower_services', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  category: manpowerCategoryEnum('category').notNull(),
  experience: experienceLevelEnum('experience').notNull(),
  availability: availabilityEnum('availability').notNull(),
  hourly_rate: decimal('hourly_rate', { precision: 8, scale: 2 }).notNull(),
  location: text('location').notNull(),
  skills: text('skills').notNull(),
  certification: text('certification'),
  description: text('description').notNull(),
  certificate_urls: text('certificate_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Financial Services Table
export const financialServices = pgTable('financial_services', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  service_type: financialServiceEnum('service_type').notNull(),
  institution: text('institution').notNull(),
  location: text('location').notNull(),
  loan_amount: text('loan_amount'), // range like "$50,000 - $500,000"
  interest_rate: text('interest_rate'), // range like "8.5% - 12% p.a."
  tenure: text('tenure'), // like "1-5 years"
  processing_fee: text('processing_fee'),
  eligibility: text('eligibility').notNull(),
  description: text('description').notNull(),
  brochure_urls: text('brochure_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Project Showcase Table
export const projectShowcase = pgTable('project_showcase', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  category: projectCategoryEnum('category').notNull(),
  description: text('description').notNull(),
  project_date: timestamp('project_date').notNull(),
  location: text('location').notNull(),
  client: text('client'),
  tags: text('tags').array().default([]),
  achievements: text('achievements'),
  image_urls: text('image_urls').array().default([]),
  document_urls: text('document_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Auctions Table
export const auctions = pgTable('auctions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  category: auctionCategoryEnum('category').notNull(),
  description: text('description').notNull(),
  starting_bid: decimal('starting_bid', { precision: 15, scale: 2 }).notNull(),
  reserve_price: decimal('reserve_price', { precision: 15, scale: 2 }),
  auction_start: timestamp('auction_start').notNull(),
  auction_end: timestamp('auction_end').notNull(),
  location: text('location').notNull(),
  condition: conditionEnum('condition').notNull(),
  terms: text('terms'),
  image_urls: text('image_urls').array().default([]),
  document_urls: text('document_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// E-Store Table
export const eStores = pgTable('e_stores', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  store_name: text('store_name').notNull(),
  category: storeCategoryEnum('category').notNull(),
  description: text('description').notNull(),
  products: text('products').notNull(),
  pricing: text('pricing').notNull(),
  shipping_info: text('shipping_info').notNull(),
  location: text('location').notNull(),
  business_hours: text('business_hours'),
  payment_methods: text('payment_methods').notNull(),
  return_policy: text('return_policy').notNull(),
  store_image_urls: text('store_image_urls').array().default([]),
  catalog_urls: text('catalog_urls').array().default([]),
  status: postStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// --- End PostForm Related Schemas ---

// --- Announcement Categories/Subcategories --- 
// Note: These enums are already created in the database, so we just reference them
export const announcementCategoryEnum = pgEnum('announcement_category', ['PROJECT & CONSTRUCTION RESOURCES', 'BUSINESS RESOURCES', 'STUDENT RESOURCES']);

// Define the announcement type enum
export const announcementTypeEnum = pgEnum('announcement_type', ['scroll', 'flip']);

// Note: Subcategories are specific to a category, but for simplicity in the DB schema,
// we'll use a text field. Validation/logic will handle allowed subcategories based on category.
// Alternatively, create separate enums per category if strictness is needed.

// --- End Categories/Subcategories --- 

// Define the announcement status enum
export const announcementStatusEnum = pgEnum('announcement_status', ['active', 'inactive', 'pending']);

// Define the announcements table
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  seller_id: integer('seller_id').references(() => sellers.id).notNull(),
  // --- ADD Category and Subcategory --- 
  category: announcementCategoryEnum('category').notNull(),
  subcategory: text('subcategory').notNull(), 
  // --- END Add --- 
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  details: text('details').notNull(),
  ad_type: announcementTypeEnum('ad_type').notNull().default('scroll'),
  status: announcementStatusEnum('status').default('pending').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Define the deal status enum
export const dealStatusEnum = pgEnum('deal_status', ['active', 'completed', 'pending'])

// Define the deals table with proper foreign key relationship
export const deals = pgTable('deals', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  status: dealStatusEnum('status').default('active').notNull(),
  sender_id: integer('sender_id').references(() => users.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Define the DMs table
export const dms = pgTable('dms', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  sender_id: integer('sender_id').references(() => users.id).notNull(),
  receiver_id: integer('receiver_id').references(() => users.id).notNull(),
  deal_id: integer('deal_id').references(() => deals.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  is_read: boolean('is_read').default(false).notNull(),
})

// Define the product category enum
export const productCategoryEnum = pgEnum('product_category', ['Land', 'Machines', 'Material', 'Equipment', 'Tools', 'Manpower']);

// Define the product status enum
export const productStatusEnum = pgEnum('product_status', ['active', 'inactive']);

// Define the products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  seller_id: integer('seller_id').references(() => sellers.id).notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  image: text('image'),
  category: productCategoryEnum('category').notNull(),
  brand_name: text('brand_name'),
  model: text('model'),
  material: text('material'),
  color: text('color'),
  packaging_details: text('packaging_details'),
  delivery_info: text('delivery_info'),
  supply_ability: text('supply_ability'),
  moq: integer('moq'), // Minimum Order Quantity
  status: productStatusEnum('status').notNull().default('active'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Define the audit log action enum
export const auditLogActionEnum = pgEnum('audit_log_action', [
  'CREATE',
  'UPDATE',
  'DEACTIVATE',
  'ACTIVATE',
  'DELETE'
]);

// Define the audit log entity type enum
export const auditLogEntityTypeEnum = pgEnum('audit_log_entity_type', [
  'ANNOUNCEMENT',
  'PRODUCT',
  'GIG',
  'PORTFOLIO',
  'TENDER',
  'LAND_LISTING',
  'MACHINE',
  'MATERIAL',
  'JOB',
  'EQUIPMENT',
  'TOOL',
  'MANPOWER_SERVICE',
  'FINANCIAL_SERVICE',
  'PROJECT_SHOWCASE',
  'AUCTION',
  'E_STORE'
]);

// Define the notifications table (simple approach)
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'tender_post', 'land_post', etc.
  entity_id: integer('entity_id').notNull(), // ID of the posted item
  is_read: boolean('is_read').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define the audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  seller_id: integer('seller_id').references(() => sellers.id).notNull(),
  entity_type: auditLogEntityTypeEnum('entity_type').notNull(),
  entity_id: integer('entity_id').notNull(),
  action: auditLogActionEnum('action').notNull(),
  changes: text('changes').notNull(), // JSON string of what changed
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.user_id],
    references: [users.id],
  }),
  seller: one(sellers, {
    fields: [auditLogs.seller_id],
    references: [sellers.id],
  }),
})); 

// PostForm Relations
export const tendersRelations = relations(tenders, ({ one }) => ({
  user: one(users, {
    fields: [tenders.user_id],
    references: [users.id],
  }),
}));

export const landListingsRelations = relations(landListings, ({ one }) => ({
  user: one(users, {
    fields: [landListings.user_id],
    references: [users.id],
  }),
}));

export const machinesRelations = relations(machines, ({ one }) => ({
  user: one(users, {
    fields: [machines.user_id],
    references: [users.id],
  }),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
  user: one(users, {
    fields: [materials.user_id],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  user: one(users, {
    fields: [jobs.user_id],
    references: [users.id],
  }),
}));

export const equipmentRelations = relations(equipment, ({ one }) => ({
  user: one(users, {
    fields: [equipment.user_id],
    references: [users.id],
  }),
}));

export const toolsRelations = relations(tools, ({ one }) => ({
  user: one(users, {
    fields: [tools.user_id],
    references: [users.id],
  }),
}));

export const manpowerServicesRelations = relations(manpowerServices, ({ one }) => ({
  user: one(users, {
    fields: [manpowerServices.user_id],
    references: [users.id],
  }),
}));

export const financialServicesRelations = relations(financialServices, ({ one }) => ({
  user: one(users, {
    fields: [financialServices.user_id],
    references: [users.id],
  }),
}));

export const projectShowcaseRelations = relations(projectShowcase, ({ one }) => ({
  user: one(users, {
    fields: [projectShowcase.user_id],
    references: [users.id],
  }),
}));

export const auctionsRelations = relations(auctions, ({ one }) => ({
  user: one(users, {
    fields: [auctions.user_id],
    references: [users.id],
  }),
}));

export const eStoresRelations = relations(eStores, ({ one }) => ({
  user: one(users, {
    fields: [eStores.user_id],
    references: [users.id],
  }),
}));

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id],
  }),
})); 