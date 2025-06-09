export interface User {
  id: string
  name: string
  email: string
  profile_image_url?: string | null
  is_admin: boolean
  verified: boolean
  resources?: string[]
  primaryResource?: string[]
  created_at?: Date
  updated_at?: Date
}

export type Product = {
  id: number
  name: string
  description: string
  price: string
  image: string
  category: string
  seller_id: number
  brand_name?: string | null
  model?: string | null
  material?: string | null
  color?: string | null
  packaging_details?: string | null
  delivery_info?: string | null
  supply_ability?: string | null
  moq?: number | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
} 