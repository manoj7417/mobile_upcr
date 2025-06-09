import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db'
import { notifications, users, tenders } from '../../db/schema'
import { eq, and, count, desc } from 'drizzle-orm'
import { validateAccessToken } from './auth'

// Get unread notification count for current user
export const getUnreadNotificationCount = createServerFn({
  method: 'GET',
  response: 'data',
})
  .handler(async () => {
    try {
      // Validate user authentication
      const authResult = await validateAccessToken()
      if (!authResult.success || !authResult.user) {
        return { success: false, error: 'Unauthorized' }
      }

      const userId = parseInt(authResult.user.id)

      // Get count of unread notifications
      const result = await db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.user_id, userId),
            eq(notifications.is_read, false)
          )
        )

      const unreadCount = result[0]?.count || 0

      return { 
        success: true, 
        count: unreadCount 
      }

    } catch (error) {
      console.error('Error getting notification count:', error)
      return { success: false, error: 'Failed to get notification count' }
    }
  })

// Get all notifications for current user
export const getUserNotifications = createServerFn({
  method: 'GET',
  response: 'data',
})
  .handler(async () => {
    try {
      // Validate user authentication
      const authResult = await validateAccessToken()
      if (!authResult.success || !authResult.user) {
        return { success: false, error: 'Unauthorized' }
      }

      const userId = parseInt(authResult.user.id)

      // Get all notifications for the user, ordered by newest first
      const userNotifications = await db
        .select({
          id: notifications.id,
          title: notifications.title,
          message: notifications.message,
          type: notifications.type,
          entity_id: notifications.entity_id,
          is_read: notifications.is_read,
          created_at: notifications.created_at
        })
        .from(notifications)
        .where(eq(notifications.user_id, userId))
        .orderBy(desc(notifications.created_at))

      return { 
        success: true, 
        notifications: userNotifications 
      }

    } catch (error) {
      console.error('Error getting user notifications:', error)
      return { success: false, error: 'Failed to get notifications' }
    }
  })

// Mark notification as read
export const markNotificationAsRead = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: { notificationId: number }) => data)
  .handler(async ({ data }) => {
    try {
      // Validate user authentication
      const authResult = await validateAccessToken()
      if (!authResult.success || !authResult.user) {
        return { success: false, error: 'Unauthorized' }
      }

      const userId = parseInt(authResult.user.id)
      const { notificationId } = data

      // Update notification to mark as read (only if it belongs to the user)
      const result = await db
        .update(notifications)
        .set({ is_read: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.user_id, userId)
          )
        )
        .returning()

      if (result.length === 0) {
        return { success: false, error: 'Notification not found or access denied' }
      }

      return { 
        success: true, 
        message: 'Notification marked as read' 
      }

    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: 'Failed to mark notification as read' }
    }
  })

// Get tender details for notification
export const getTenderForNotification = createServerFn({
  method: 'GET',
  response: 'data',
})
  .validator((data: { tenderId: number }) => data)
  .handler(async ({ data }) => {
    try {
      const { tenderId } = data

      // Get tender details
      const tender = await db
        .select({
          id: tenders.id,
          upc_ref: tenders.upc_ref,
          engineering_category: tenders.engineering_category,
          specialization: tenders.specialization,
          tender_name: tenders.tender_name,
          location: tenders.location,
          scope: tenders.scope,
          estimated_value: tenders.estimated_value,
          collection_date: tenders.collection_date,
          submission_date: tenders.submission_date,
          contact_name: tenders.contact_name,
          contact_number: tenders.contact_number,
          contact_email: tenders.contact_email,
          address: tenders.address,
          status: tenders.status,
          created_at: tenders.created_at
        })
        .from(tenders)
        .where(eq(tenders.id, tenderId))
        .limit(1)

      if (tender.length === 0) {
        return { success: false, error: 'Tender not found' }
      }

      return { 
        success: true, 
        tender: tender[0] 
      }

    } catch (error) {
      console.error('Error getting tender details:', error)
      return { success: false, error: 'Failed to get tender details' }
    }
  })

// Create notifications for tender posts
export const createTenderNotifications = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: { tenderId: number; tenderName: string; category: string }) => data)
  .handler(async ({ data }) => {
    try {
      console.log('🔔 Creating notifications for tender:', data.tenderName)

      // Validate user authentication
      const authResult = await validateAccessToken()
      if (!authResult.success || !authResult.user) {
        return { success: false, error: 'Unauthorized' }
      }

      const { tenderId, tenderName, category } = data

      // Find all users - we'll filter in JavaScript
      const allUsers = await db
        .select({ 
          id: users.id, 
          email: users.email,
          name: users.name,
          primaryResource: users.primaryResource 
        })
        .from(users)

      // Filter users who have 'tender' in their primary resources
      const currentUserId = parseInt(authResult.user.id)
      const targetUsers = allUsers.filter(user => {
        // Skip the current user who posted the tender
        if (user.id === currentUserId) {
          return false
        }
        
        // Check if 'tender' is in their primary resources (case insensitive, plural/singular)
        const hasTenderResource = user.primaryResource && (
          user.primaryResource.includes('Tenders') ||
          user.primaryResource.includes('tender') ||
          user.primaryResource.some(resource => resource.toLowerCase().includes('tender'))
        )
        
        return hasTenderResource
      })

      console.log(`🎯 Found ${targetUsers.length} users to notify:`, targetUsers.map(u => u.email))

      // Create notifications for each target user
      const notificationsToCreate = targetUsers.map(user => ({
        user_id: user.id,
        title: 'New Tender Posted',
        message: `A new tender "${tenderName}" has been posted in ${category} category.`,
        type: 'tender_post',
        entity_id: tenderId,
        is_read: false
      }))

      // Batch insert notifications
      if (notificationsToCreate.length > 0) {
        const insertResult = await db.insert(notifications).values(notificationsToCreate).returning()
        console.log('✅ Notifications created successfully:', insertResult.length)
      } else {
        console.log('⚠️  No matching users found for notifications')
      }

      return { 
        success: true, 
        created_count: notificationsToCreate.length,
        message: `Notifications sent to ${notificationsToCreate.length} users`
      }

    } catch (error) {
      console.error('❌ Error creating notifications:', error)
      return { success: false, error: 'Failed to create notifications' }
    }
  }) 