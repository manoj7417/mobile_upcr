import { createClient } from '@supabase/supabase-js'

// This should only be used on the server side
export const createSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url) {
    console.error('Missing SUPABASE_URL environment variable')
    throw new Error('Missing SUPABASE_URL environment variable')
  }

  if (!key) {
    console.error('Missing SUPABASE_ANON_KEY environment variable')
    throw new Error('Missing SUPABASE_ANON_KEY environment variable')
  }

  // console.log('Initializing Supabase client with URL:', url)
  const client = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })

  // Removed connection test query that was here, as it runs before authentication
  // and may fail with RLS or restricted anon permissions.

  return client
}

// Export a singleton instance
export const supabase = createSupabaseClient()

// Types for our tables
export type Deal = {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  sender_id: number
  type: 'incoming' | 'outgoing'
  created_at: string
  updated_at: string
  metadata: any | null
  isDeleted: boolean
}

// Real-time subscription types
export type DealChange = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Deal | null
  old: Deal | null
} 