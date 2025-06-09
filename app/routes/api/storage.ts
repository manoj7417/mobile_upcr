import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Initialize S3 client with Supabase storage credentials
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/s3`,
  credentials: {
    accessKeyId: import.meta.env.VITE_SUPABASE_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_SUPABASE_SECRET_ACCESS_KEY
  },
  forcePathStyle: true
})

// Upload schema
const uploadSchema = z.object({
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    data: z.string() // base64 encoded file data
  }),
  userId: z.string()
})

type UploadProfileImageData = z.infer<typeof uploadSchema>

// Delete schema
const deleteSchema = z.object({
  url: z.string()
})

type DeleteProfileImageData = z.infer<typeof deleteSchema>

// Upload schema for announcement images
const uploadAnnouncementImageSchema = z.object({
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    data: z.string() // base64 encoded file data
  }),
  sellerId: z.string()
})

type UploadAnnouncementImageData = z.infer<typeof uploadAnnouncementImageSchema>

// Create server function for uploading profile images
export const uploadProfileImage = createServerFn({
  method: 'POST',
  response: 'data'
})
  .validator((data: unknown) => uploadSchema.parse(data))
  .handler(async (ctx) => {
    try {
      // Get the access token from cookies
      const accessToken = getCookie('accessToken')
      if (!accessToken) {
        return { success: false, error: 'Unauthorized' }
      }

      const { file, userId } = ctx.data

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Invalid file type. Only images are allowed.' }
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File size too large. Maximum size is 5MB.' }
      }

      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `profile/${fileName}`

      // Convert base64 to buffer
      const base64Data = file.data.split(',')[1]
      if (!base64Data) {
        return { success: false, error: 'Invalid base64 data' }
      }
      const buffer = Buffer.from(base64Data, 'base64')

      // Upload to S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: 'upcr',
          Key: filePath,
          Body: buffer,
          ContentType: file.type,
          ACL: 'public-read'
        })
      )

      // Construct the public URL
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/upcr/${filePath}`

      return {
        success: true,
        url: publicUrl
      }
    } catch (error) {
      console.error('Error uploading profile image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload profile image'
      }
    }
  })

// Create server function for deleting profile images
export const deleteProfileImage = createServerFn({
  method: 'POST',
  response: 'data'
})
  .validator((data: unknown) => deleteSchema.parse(data))
  .handler(async (ctx) => {
    try {
      // Get the access token from cookies
      const accessToken = getCookie('accessToken')
      if (!accessToken) {
        return { success: false, error: 'Unauthorized' }
      }

      // Extract the file path from the URL
      const url = new URL(ctx.data.url)
      const filePath = url.pathname.split('/storage/v1/object/public/upcr/')[1]

      if (!filePath) {
        return { success: false, error: 'Invalid file URL' }
      }

      // Delete from S3
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: 'upcr',
          Key: filePath
        })
      )

      return {
        success: true
      }
    } catch (error) {
      console.error('Error deleting profile image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete profile image'
      }
    }
  })

// Create server function for uploading announcement images
export const uploadAnnouncementImage = createServerFn({
  method: 'POST',
  response: 'data'
})
  .validator((data: unknown) => uploadAnnouncementImageSchema.parse(data))
  .handler(async (ctx) => {
    try {
      // Get the access token from cookies
      const accessToken = getCookie('accessToken')
      if (!accessToken) {
        return { success: false, error: 'Unauthorized' }
      }

      const { file, sellerId } = ctx.data

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Invalid file type. Only images are allowed.' }
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File size too large. Maximum size is 5MB.' }
      }

      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${sellerId}-${Date.now()}.${fileExt}`
      const filePath = `ads/${fileName}`

      // Convert base64 to buffer
      const base64Data = file.data.split(',')[1]
      if (!base64Data) {
        return { success: false, error: 'Invalid base64 data' }
      }
      const buffer = Buffer.from(base64Data, 'base64')

      // Upload to S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: 'upcr',
          Key: filePath,
          Body: buffer,
          ContentType: file.type,
          ACL: 'public-read'
        })
      )

      // Construct the public URL
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/upcr/${filePath}`

      return {
        success: true,
        url: publicUrl
      }
    } catch (error) {
      console.error('Error uploading announcement image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload announcement image'
      }
    }
  }) 