import { createServerFn } from '@tanstack/react-start'
import { z, ZodIssue } from 'zod'
import { db } from '../../db' // Import Drizzle db instance
import { announcements, announcementCategoryEnum as dbCategoryEnum, announcementTypeEnum as dbAdTypeEnum } from '../../db/schema' // Import schema, alias DB enum
import { validateAccessToken } from './auth' // To verify user session
import { eq, desc, and } from 'drizzle-orm'
import { sellers } from '../../db/schema' // Import sellers schema
import { createAuditLog } from '../../utils/auditLogger'

// --- Define Zod Enum based on DB Enum --- 
const zodCategoryEnum = z.enum(dbCategoryEnum.enumValues);
const zodAdTypeEnum = z.enum(dbAdTypeEnum.enumValues);

// Type for a created announcement (adjusted for final string format)
type Announcement = {
  id: number;
  seller_id: number;
  category: z.infer<typeof zodCategoryEnum>;
  subcategory: string;
  title: string;
  description: string;
  icon: string;
  details: string;
  ad_type: z.infer<typeof zodAdTypeEnum>;
  status: 'active' | 'inactive' | 'pending';
  start_date: string; // Formatted to string before return
  end_date?: string | null; // Formatted to string before return
  created_at: string; // Formatted to string before return
  updated_at: string; // Formatted to string before return
};

// Schema for announcement data validation
const announcementSchema = z.object({
  sellerId: z.number().int().positive('Valid Seller ID is required'),
  category: zodCategoryEnum,
  subcategory: z.string().min(1, 'Subcategory is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon URL/name is required'), // Assuming text for now
  details: z.string().min(1, 'Details are required'),
  ad_type: zodAdTypeEnum.default('scroll'),
  start_date: z.string().datetime({ message: "Invalid start date format" }), // Expect ISO string
  end_date: z.string().datetime({ message: "Invalid end date format" }).optional().or(z.literal('')), // Optional ISO string or empty
  isActive: z.boolean().default(true)
});

type AnnouncementData = z.infer<typeof announcementSchema>

type CreateAnnouncementResponse = 
  | { success: true; announcement: Announcement }
  | { success: false; error: string }

export const createAnnouncement = createServerFn({
  method: 'POST',
  response: 'data',
})
.validator((data: unknown): AnnouncementData => {
  return announcementSchema.parse(data);
})
.handler(async (ctx): Promise<CreateAnnouncementResponse> => {
  try {
    // --- Authorization Check --- 
    const authResult = await validateAccessToken();
    if (!authResult.success || !authResult.user) {
      return { success: false, error: 'Unauthorized: Invalid session' };
    }

    // --- Database Insertion --- 
    const [newAnnouncementData] = await db
      .insert(announcements)
      .values({
        seller_id: ctx.data.sellerId,
        category: ctx.data.category,
        subcategory: ctx.data.subcategory,
        title: ctx.data.title,
        description: ctx.data.description,
        icon: ctx.data.icon,
        details: ctx.data.details,
        ad_type: ctx.data.ad_type,
        start_date: new Date(ctx.data.start_date),
        end_date: ctx.data.end_date ? new Date(ctx.data.end_date) : null,
        status: ctx.data.isActive ? 'active' : 'inactive',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();

    if (!newAnnouncementData) {
      return { success: false, error: 'Failed to create announcement in database.' };
    }

    // --- Adapt Result --- 
    const finalAnnouncement = {
      ...newAnnouncementData,
      category: newAnnouncementData.category,
      subcategory: newAnnouncementData.subcategory,
      ad_type: newAnnouncementData.ad_type,
      start_date: newAnnouncementData.start_date.toISOString(),
      end_date: newAnnouncementData.end_date ? newAnnouncementData.end_date.toISOString() : null,
      created_at: newAnnouncementData.created_at.toISOString(),
      updated_at: newAnnouncementData.updated_at.toISOString(),
    } as Announcement;

    // Create audit log
    await createAuditLog({
      userId: parseInt(authResult.user.id, 10),
      sellerId: ctx.data.sellerId,
      entityType: 'ANNOUNCEMENT',
      entityId: finalAnnouncement.id,
      action: 'CREATE',
      changes: {
        title: ctx.data.title,
        category: ctx.data.category,
        subcategory: ctx.data.subcategory,
        ad_type: ctx.data.ad_type,
        start_date: ctx.data.start_date,
        end_date: ctx.data.end_date
      },
      ipAddress: undefined, // Remove IP address logging for now
      userAgent: undefined // Remove user agent logging for now
    })

    return { success: true, announcement: finalAnnouncement };

  } catch (error) {
    console.error('[createAnnouncement] Error:', error);
    if (error instanceof z.ZodError) {
      const firstIssue = error.errors[0]?.message || 'Invalid data';
      return { success: false, error: `Validation failed: ${firstIssue}` };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}); 

// --- Function to Get Seller Announcements --- 

// Schema for input validation
const getAnnouncementsSchema = z.object({
  sellerId: z.number().int().positive('Valid Seller ID is required'),
});

type GetAnnouncementsInput = z.infer<typeof getAnnouncementsSchema>;

// Define the expected return type (array of Announcements)
type GetAnnouncementsResponse = 
  | { success: true; announcements: Announcement[] }
  | { success: false; error: string };

export const getSellerAnnouncements = createServerFn({
  method: 'POST', // Or GET if preferred, adjust client call accordingly
  response: 'data',
})
.validator((data: unknown): GetAnnouncementsInput => {
  return getAnnouncementsSchema.parse(data);
})
.handler(async ({ data }): Promise<GetAnnouncementsResponse> => {
  try {
    // Optional: Authorization Check - Ensure only the seller or admin can view?
    // const authResult = await validateAccessToken();
    // if (!authResult.success || !authResult.user) {
    //   return { success: false, error: 'Unauthorized: Invalid session' };
    // }
    // Add logic here to check if authResult.user.id matches the owner of sellerId if needed

    const sellerAnnouncements = await db
      .select()
      .from(announcements)
      .where(eq(announcements.seller_id, data.sellerId)) // Use drizzle 'eq' operator
      .orderBy(desc(announcements.created_at)); // Order by creation date descending

    // Adapt results to match the Announcement type (e.g., date formatting)
    const finalAnnouncements = sellerAnnouncements.map(ad => ({
      ...ad,
      category: ad.category, // Category is already correct enum type from DB
      subcategory: ad.subcategory, // Subcategory is text
      start_date: ad.start_date.toISOString(),
      end_date: ad.end_date ? ad.end_date.toISOString() : null,
      created_at: ad.created_at.toISOString(),
      updated_at: ad.updated_at.toISOString(),
    })) as Announcement[];

    return { success: true, announcements: finalAnnouncements };

  } catch (error) {
    console.error('[getSellerAnnouncements] Error:', error);
    if (error instanceof z.ZodError) {
      const firstIssue = error.errors[0]?.message || 'Invalid data';
      return { success: false, error: `Validation failed: ${firstIssue}` };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}); 

// --- Function to Update an Announcement ---

// Schema for update validation (includes announcementId)
// Inherit from announcementSchema but make fields optional for update and add announcementId
const updateAnnouncementSchema = announcementSchema.extend({
  announcementId: z.number().int().positive('Announcement ID is required for update'),
  // Make fields optional for update - user might only update title, etc.
  category: zodCategoryEnum.optional(),
  subcategory: z.string().min(1, 'Subcategory is required').optional(), 
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  icon: z.string().min(1, 'Icon URL/name is required').optional(),
  details: z.string().min(1, 'Details are required').optional(),
  ad_type: zodAdTypeEnum.optional(),
  start_date: z.string().datetime({ message: "Invalid start date format" }).optional(), 
  end_date: z.string().datetime({ message: "Invalid end date format" }).optional().or(z.literal('').optional()),
  isActive: z.boolean().optional()
}).omit({ sellerId: true }); // Remove sellerId from update payload itself

type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

// Define the expected return type (updated Announcement)
type UpdateAnnouncementResponse = 
  | { success: true; announcement: Announcement }
  | { success: false; error: string };

export const updateAnnouncement = createServerFn({
  method: 'POST',
  response: 'data',
})
.validator((data: unknown): UpdateAnnouncementInput => {
  return updateAnnouncementSchema.parse(data);
})
.handler(async (ctx): Promise<UpdateAnnouncementResponse> => {
  try {
    // --- Authorization Check --- 
    const authResult = await validateAccessToken();
    if (!authResult.success || !authResult.user) {
      return { success: false, error: 'Unauthorized: Invalid session' };
    }

    // Fetch the existing announcement to verify ownership
    const existingAnnouncement = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, ctx.data.announcementId))
      .limit(1)
      .then(res => res[0]);

    if (!existingAnnouncement) {
      return { success: false, error: 'Announcement not found.' };
    }
    
    // Check if the seller associated with the auth user owns this announcement
    const seller = await db.select({ id: sellers.id }).from(sellers).where(eq(sellers.user_id, parseInt(authResult.user.id, 10))).limit(1).then(res => res[0]);
    if (!seller || existingAnnouncement.seller_id !== seller.id) {
        return { success: false, error: 'Forbidden: You do not own this announcement.' };
    }

    // --- Prepare Data for Update --- 
    const updateData: Partial<typeof announcements.$inferInsert> = {};
    if (ctx.data.category !== undefined) updateData.category = ctx.data.category;
    if (ctx.data.subcategory !== undefined) updateData.subcategory = ctx.data.subcategory;
    if (ctx.data.title !== undefined) updateData.title = ctx.data.title;
    if (ctx.data.description !== undefined) updateData.description = ctx.data.description;
    if (ctx.data.icon !== undefined) updateData.icon = ctx.data.icon;
    if (ctx.data.details !== undefined) updateData.details = ctx.data.details;
    if (ctx.data.ad_type !== undefined) updateData.ad_type = ctx.data.ad_type;
    if (ctx.data.start_date !== undefined) updateData.start_date = new Date(ctx.data.start_date);
    if (ctx.data.end_date !== undefined) { 
      updateData.end_date = ctx.data.end_date === '' ? null : new Date(ctx.data.end_date);
    }
    if (ctx.data.isActive !== undefined) updateData.status = ctx.data.isActive ? 'active' : 'inactive';
    updateData.updated_at = new Date();

    const [updatedAnnouncementData] = await db
      .update(announcements)
      .set(updateData)
      .where(eq(announcements.id, ctx.data.announcementId))
      .returning();

    if (!updatedAnnouncementData) {
      return { success: false, error: 'Failed to update announcement in database.' };
    }

    // --- Adapt Result --- 
    const finalAnnouncement = {
      ...updatedAnnouncementData,
      category: updatedAnnouncementData.category,
      subcategory: updatedAnnouncementData.subcategory,
      ad_type: updatedAnnouncementData.ad_type,
      start_date: updatedAnnouncementData.start_date.toISOString(),
      end_date: updatedAnnouncementData.end_date ? updatedAnnouncementData.end_date.toISOString() : null,
      created_at: updatedAnnouncementData.created_at.toISOString(),
      updated_at: updatedAnnouncementData.updated_at.toISOString(),
    } as Announcement;

    // Create audit log with changes
    const changes = {
      old: {
        title: existingAnnouncement.title,
        category: existingAnnouncement.category,
        subcategory: existingAnnouncement.subcategory,
        ad_type: existingAnnouncement.ad_type,
        start_date: existingAnnouncement.start_date,
        end_date: existingAnnouncement.end_date,
        icon: existingAnnouncement.icon
      },
      new: {
        title: ctx.data.title,
        category: ctx.data.category,
        subcategory: ctx.data.subcategory,
        ad_type: ctx.data.ad_type,
        start_date: ctx.data.start_date,
        end_date: ctx.data.end_date,
        icon: ctx.data.icon
      }
    }

    await createAuditLog({
      userId: parseInt(authResult.user.id, 10),
      sellerId: existingAnnouncement.seller_id,
      entityType: 'ANNOUNCEMENT',
      entityId: ctx.data.announcementId,
      action: 'UPDATE',
      changes,
      ipAddress: undefined, // Remove IP address logging for now
      userAgent: undefined // Remove user agent logging for now
    })

    return { success: true, announcement: finalAnnouncement };

  } catch (error) {
    console.error('[updateAnnouncement] Error:', error);
    if (error instanceof z.ZodError) {
      const firstIssue = error.errors[0]?.message || 'Invalid data';
      return { success: false, error: `Validation failed: ${firstIssue}` };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}); 

// --- Function to Deactivate an Announcement ---

// Schema for input validation
const deactivateAnnouncementSchema = z.object({
  announcementId: z.number().int().positive('Announcement ID is required'),
});

type DeactivateAnnouncementInput = z.infer<typeof deactivateAnnouncementSchema>;

// Define the expected return type
type DeactivateAnnouncementResponse = 
  | { success: true }
  | { success: false; error: string };

export const deactivateAnnouncement = createServerFn({
  method: 'POST',
  response: 'data',
})
.validator((data: unknown): DeactivateAnnouncementInput => {
  return deactivateAnnouncementSchema.parse(data);
})
.handler(async (ctx): Promise<DeactivateAnnouncementResponse> => {
  try {
    // --- Authorization Check --- 
    const authResult = await validateAccessToken();
    if (!authResult.success || !authResult.user) {
      return { success: false, error: 'Unauthorized: Invalid session' };
    }

    // Fetch the existing announcement to verify ownership
    const existingAnnouncement = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, ctx.data.announcementId))
      .limit(1)
      .then(res => res[0]);

    if (!existingAnnouncement) {
      return { success: false, error: 'Announcement not found.' };
    }
    
    // Check if the seller associated with the auth user owns this announcement
    const seller = await db.select({ id: sellers.id }).from(sellers).where(eq(sellers.user_id, parseInt(authResult.user.id, 10))).limit(1).then(res => res[0]);
    if (!seller || existingAnnouncement.seller_id !== seller.id) {
        return { success: false, error: 'Forbidden: You do not own this announcement.' };
    }

    // --- Database Update --- 
    await db
      .update(announcements)
      .set({
        status: 'inactive',
        updated_at: new Date(),
      })
      .where(eq(announcements.id, ctx.data.announcementId));

    // Create audit log
    await createAuditLog({
      userId: parseInt(authResult.user.id, 10),
      sellerId: existingAnnouncement.seller_id,
      entityType: 'ANNOUNCEMENT',
      entityId: ctx.data.announcementId,
      action: 'DEACTIVATE',
      changes: {
        old_status: existingAnnouncement.status,
        new_status: 'inactive'
      },
      ipAddress: undefined, // Remove IP address logging for now
      userAgent: undefined // Remove user agent logging for now
    })

    return { success: true };

  } catch (error) {
    console.error('[deactivateAnnouncement] Error:', error);
    if (error instanceof z.ZodError) {
      const firstIssue = error.errors[0]?.message || 'Invalid data';
      return { success: false, error: `Validation failed: ${firstIssue}` };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}); 

export const getAllSellerAnnouncements = createServerFn({
  method: 'GET',
})
  .validator((data: { ad_type?: 'scroll' | 'flip' | undefined }) => data)
  .handler(async ({ data })=>{
    try {
      const whereConditions = [eq(announcements.status, 'active')];
      
      // Add ad_type filter if specified
      if (data.ad_type) {
        whereConditions.push(eq(announcements.ad_type, data.ad_type));
      }
      
      const sellerAnnouncements = await db
        .select()
        .from(announcements)
        .where(
          and(...whereConditions)
        )
        .orderBy(desc(announcements.created_at));
  
      return { success: true, announcements: sellerAnnouncements };
  
    } catch (error) {
      console.error('[getSellerAnnouncements] Error:', error);
      if (error instanceof z.ZodError) {
        const firstIssue = error.errors[0]?.message || 'Invalid data';
        return { success: false, error: `Validation failed: ${firstIssue}` };
      }
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      return { success: false, error: errorMessage };
    }
  })
