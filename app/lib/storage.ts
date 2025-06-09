import { supabase } from './supabase'

export async function uploadFile(file: File, type: 'aadhar' | 'gst' | 'work' | 'owner' | 'profile'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${type}/${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('seller-documents')
      .upload(fileName, file)

    if (error) {
      console.error('Error uploading file:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('seller-documents')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Error in uploadFile:', error)
    return null
  }
} 