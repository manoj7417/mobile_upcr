import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../../db'
import { tenders } from '../../db/schema'
import { engineeringCategoryEnum } from '../../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { validateAccessToken } from './auth'
import { createTenderNotifications } from './notifications'

// Define the validation schema
const createTenderSchema = z.object({
  engineering_category: z.enum(engineeringCategoryEnum.enumValues),
  specialization: z.string().min(1, 'Specialization is required'),
  tender_name: z.string().min(1, 'Tender name is required'),
  location: z.string().min(1, 'Location is required'),
  scope: z.string().min(1, 'Scope is required'),
  estimated_value: z.string().min(1, 'Estimated value is required'),
  collection_date: z.string().min(1, 'Collection date is required'),
  submission_date: z.string().min(1, 'Submission date is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_number: z.string().min(1, 'Contact number is required'),
  contact_email: z.string().email('Valid email is required'),
  address: z.string().min(1, 'Address is required'),
  document_urls: z.array(z.string()).optional().default([]),
})

type CreateTenderInput = z.infer<typeof createTenderSchema>

// Generate unique UPC reference
const generateUPCRef = async (): Promise<string> => {
  let upcRef: string
  let isUnique = false
  let attempts = 0
  const maxAttempts = 10

  while (!isUnique && attempts < maxAttempts) {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    upcRef = `UPC-${timestamp}-${random}`

    // Check if UPC already exists
    const existing = await db
      .select()
      .from(tenders)
      .where(eq(tenders.upc_ref, upcRef))
      .limit(1)

    if (existing.length === 0) {
      isUnique = true
      return upcRef
    }
    attempts++
  }

  throw new Error('Failed to generate unique UPC reference')
}

// Get all tenders with optional filters
export const getTenders = createServerFn({
  method: 'GET',
  response: 'data',
})
  .validator((data: { category?: string; status?: string }) => {
    return z.object({
      category: z.enum(engineeringCategoryEnum.enumValues).optional(),
      status: z.enum(['active', 'inactive', 'pending', 'expired']).optional()
    }).parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const whereConditions = []
      
      // Add filters if specified
      if (data.category) {
        whereConditions.push(eq(tenders.engineering_category, data.category))
      }
      if (data.status) {
        whereConditions.push(eq(tenders.status, data.status))
      } else {
        // Default to active tenders only
        whereConditions.push(eq(tenders.status, 'active'))
      }
      
      const query = await db
        .select()
        .from(tenders)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        )
        .orderBy(desc(tenders.created_at))

      return {
        success: true,
        tenders: query
      }
    } catch (error) {
      console.error('Error fetching tenders:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tenders'
      }
    }
  })

// Get a single tender by ID
export const getTender = createServerFn({
  method: 'GET',
  response: 'data',
})
  .validator((data: { id: string }) => {
    return z.object({
      id: z.string()
    }).parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const tenderId = parseInt(data.id)
      if (isNaN(tenderId)) {
        return {
          success: false,
          error: 'Invalid tender ID'
        }
      }

      const tender = await db
        .select()
        .from(tenders)
        .where(eq(tenders.id, tenderId))
        .limit(1)
      
      if (!tender.length) {
        return {
          success: false,
          error: 'Tender not found'
        }
      }

      return {
        success: true,
        tender: tender[0]
      }
    } catch (error) {
      console.error('Error fetching tender:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tender'
      }
    }
  })

// Get tender by UPC reference
export const getTenderByUPC = createServerFn({
  method: 'GET',
  response: 'data',
})
  .validator((data: { upcRef: string }) => {
    return z.object({
      upcRef: z.string().min(1, 'UPC reference is required')
    }).parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const tender = await db
        .select()
        .from(tenders)
        .where(eq(tenders.upc_ref, data.upcRef))
        .limit(1)
      
      if (!tender.length) {
        return {
          success: false,
          error: 'Tender not found'
        }
      }

      return {
        success: true,
        tender: tender[0]
      }
    } catch (error) {
      console.error('Error fetching tender by UPC:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tender'
      }
    }
  })

// Get user's tenders
export const getUserTenders = createServerFn({
  method: 'GET',
  response: 'data',
})
  .handler(async () => {
    try {
      // Validate user token
      const authResult = await validateAccessToken()
      if (!authResult.success || !authResult.user) {
        return { success: false, error: 'Unauthorized' }
      }

      const userTenders = await db
        .select()
        .from(tenders)
        .where(eq(tenders.user_id, authResult.user.id))
        .orderBy(desc(tenders.created_at))
      
      return {
        success: true,
        tenders: userTenders
      }
    } catch (error) {
      console.error('Error fetching user tenders:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user tenders'
      }
    }
  })

// Create new tender
export const createTender = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: CreateTenderInput) => {
    return createTenderSchema.parse(data)
  })
  .handler(async ({ data }) => {
    try {
      // Validate user token
      const authResult = await validateAccessToken()
      if (!authResult.success || !authResult.user) {
        return { success: false, error: 'Unauthorized' }
      }

      // Generate unique UPC reference
      const upcRef = await generateUPCRef()

      // Convert string dates to Date objects
      const collectionDate = new Date(data.collection_date)
      const submissionDate = new Date(data.submission_date)

      // Validate dates
      if (isNaN(collectionDate.getTime()) || isNaN(submissionDate.getTime())) {
        return {
          success: false,
          error: 'Invalid date format'
        }
      }

      if (submissionDate <= collectionDate) {
        return {
          success: false,
          error: 'Submission date must be after collection date'
        }
      }

      const result = await db.insert(tenders).values({
        user_id: authResult.user.id,
        upc_ref: upcRef,
        engineering_category: data.engineering_category,
        specialization: data.specialization,
        tender_name: data.tender_name,
        location: data.location,
        scope: data.scope,
        estimated_value: data.estimated_value,
        collection_date: collectionDate,
        submission_date: submissionDate,
        contact_name: data.contact_name,
        contact_number: data.contact_number,
        contact_email: data.contact_email,
        address: data.address,
        document_urls: data.document_urls || [],
        status: 'active'
      }).returning()

      // Create notifications for users with 'tender' as primary resource
      try {
        await createTenderNotifications({
          data: {
            tenderId: result[0].id,
            tenderName: data.tender_name,
            category: data.engineering_category
          }
        })
      } catch (notificationError) {
        console.error('Error creating notifications:', notificationError)
        // Don't fail the tender creation if notification fails
      }

      return {
        success: true,
        tender: result[0]
      }
    } catch (error) {
      console.error('Error creating tender:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create tender'
      }
    }
  })

// Update tender
export const updateTender = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: CreateTenderInput & { id: number }) => {
    return createTenderSchema.extend({
      id: z.number().int().positive('Tender ID is required for update')
    }).parse(data)
  })
  .handler(async ({ data }) => {
    try {
      // Validate user token
      const authResult = await validateAccessToken()
      if (!authResult.success || !authResult.user) {
        return { success: false, error: 'Unauthorized' }
      }

      // Check if tender exists and belongs to user
      const existingTender = await db
        .select()
        .from(tenders)
        .where(
          and(
            eq(tenders.id, data.id),
            eq(tenders.user_id, authResult.user.id)
          )
        )
        .limit(1)

      if (!existingTender.length) {
        return {
          success: false,
          error: 'Tender not found or access denied'
        }
      }

      // Convert string dates to Date objects
      const collectionDate = new Date(data.collection_date)
      const submissionDate = new Date(data.submission_date)

      // Validate dates
      if (isNaN(collectionDate.getTime()) || isNaN(submissionDate.getTime())) {
        return {
          success: false,
          error: 'Invalid date format'
        }
      }

      if (submissionDate <= collectionDate) {
        return {
          success: false,
          error: 'Submission date must be after collection date'
        }
      }

      const result = await db
        .update(tenders)
        .set({
          engineering_category: data.engineering_category,
          specialization: data.specialization,
          tender_name: data.tender_name,
          location: data.location,
          scope: data.scope,
          estimated_value: data.estimated_value,
          collection_date: collectionDate,
          submission_date: submissionDate,
          contact_name: data.contact_name,
          contact_number: data.contact_number,
          contact_email: data.contact_email,
          address: data.address,
          document_urls: data.document_urls || [],
          updated_at: new Date()
        })
        .where(eq(tenders.id, data.id))
        .returning()

      return {
        success: true,
        tender: result[0]
      }
    } catch (error) {
      console.error('Error updating tender:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update tender'
      }
    }
  })

// Delete/Deactivate tender
export const deleteTender = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: { id: number }) => {
    return z.object({
      id: z.number().int().positive('Tender ID is required')
    }).parse(data)
  })
  .handler(async ({ data }) => {
    try {
      // Validate user token
      const authResult = await validateAccessToken()
      if (!authResult.success || !authResult.user) {
        return { success: false, error: 'Unauthorized' }
      }

      // Check if tender exists and belongs to user
      const existingTender = await db
        .select()
        .from(tenders)
        .where(
          and(
            eq(tenders.id, data.id),
            eq(tenders.user_id, authResult.user.id)
          )
        )
        .limit(1)

      if (!existingTender.length) {
        return {
          success: false,
          error: 'Tender not found or access denied'
        }
      }

      // Soft delete by setting status to inactive
      const result = await db
        .update(tenders)
        .set({
          status: 'inactive',
          updated_at: new Date()
        })
        .where(eq(tenders.id, data.id))
        .returning()

      return {
        success: true,
        tender: result[0]
      }
    } catch (error) {
      console.error('Error deleting tender:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete tender'
      }
    }
  })

// Generate new UPC reference (utility function for frontend)
export const generateNewUPCRef = createServerFn({
  method: 'GET',
  response: 'data',
})
  .handler(async () => {
    try {
      const upcRef = await generateUPCRef()
      return {
        success: true,
        upcRef
      }
    } catch (error) {
      console.error('Error generating UPC reference:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate UPC reference'
      }
    }
  }) 