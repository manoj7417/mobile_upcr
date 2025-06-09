import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../../db'
import { products, sellers } from '../../db/schema'
import { productCategoryEnum } from '../../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { validateAccessToken } from './auth'

// Define the validation schema
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().min(1, 'Price is required'),
  image: z.string().min(1, 'Image URL is required'),
  category: z.enum(productCategoryEnum.enumValues),
  seller_id: z.number(),
  brand_name: z.string().optional(),
  model: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  packaging_details: z.string().optional(),
  delivery_info: z.string().optional(),
  supply_ability: z.string().optional(),
  moq: z.string().optional(),
})

type CreateProductInput = z.infer<typeof createProductSchema>

// Get all products with optional category filter
export const getProducts = createServerFn({
  method: 'GET',
  response: 'data',
})
  .validator((data: { category?: string }) => {
    return z.object({
      category: z.enum(productCategoryEnum.enumValues).optional()
    }).parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const whereConditions = [eq(products.status, 'active')];
      
      // Add category filter if specified
      if (data.category) {
        whereConditions.push(eq(products.category, data.category));
      }
      
      const query = await db
        .select()
        .from(products)
        .where(
          and(...whereConditions)
        )
        .orderBy(desc(products.created_at));

      return {
        success: true,
        products: query
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products'
      }
    }
  })

// Get a single product by ID
export const getProduct = createServerFn({
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
      const productId = parseInt(data.id)
      if (isNaN(productId)) {
        return {
          success: false,
          error: 'Invalid product ID'
        }
      }

      const product = await db.select().from(products).where(eq(products.id, productId)).limit(1)
      
      if (!product.length) {
        return {
          success: false,
          error: 'Product not found'
        }
      }

      return {
        success: true,
        product: product[0]
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product'
      }
    }
  })

// Get products by seller ID
export const getSellerProducts = createServerFn({
  method: 'GET',
  response: 'data',
})
  .validator((data: { sellerId: number }) => {
    return z.object({
      sellerId: z.number()
    }).parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const sellerProducts = await db
        .select()
        .from(products)
        .where(eq(products.seller_id, data.sellerId))
        .orderBy(desc(products.created_at));
      
      return {
        success: true,
        products: sellerProducts
      }
    } catch (error) {
      console.error('Error fetching seller products:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch seller products'
      }
    }
  })

export const createProduct = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: CreateProductInput) => {
    return createProductSchema.parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const result = await db.insert(products).values({
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
        seller_id: data.seller_id,
        brand_name: data.brand_name || null,
        model: data.model || null,
        material: data.material || null,
        color: data.color || null,
        packaging_details: data.packaging_details || null,
        delivery_info: data.delivery_info || null,
        supply_ability: data.supply_ability || null,
        moq: data.moq ? parseInt(data.moq) : null,
      }).returning()

      return {
        success: true,
        product: result[0]
      }
    } catch (error) {
      console.error('Error creating product:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product'
      }
    }
  })

// Define the validation schema for product updates
const updateProductSchema = createProductSchema.extend({
  id: z.number().int().positive('Product ID is required for update')
}).omit({ seller_id: true }) // Remove seller_id from update payload

type UpdateProductInput = z.infer<typeof updateProductSchema>

export const updateProduct = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: unknown) => {
    return updateProductSchema.parse(data)
  })
  .handler(async ({ data }) => {
    try {
      // Validate user token
      const authResult = await validateAccessToken()
      if (!authResult.success || !authResult.user) {
        return { success: false, error: 'Unauthorized' }
      }

      // Get the seller ID for the authenticated user
      const seller = await db
        .select()
        .from(sellers)
        .where(eq(sellers.user_id, parseInt(authResult.user.id, 10)))
        .limit(1)
        .then(res => res[0])

      if (!seller) {
        return { success: false, error: 'Seller profile not found' }
      }

      // Verify product ownership
      const existingProduct = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, data.id),
            eq(products.seller_id, seller.id)
          )
        )
        .limit(1)
        .then(res => res[0])

      if (!existingProduct) {
        return { success: false, error: 'Product not found or unauthorized' }
      }

      // Update the product
      const [updatedProduct] = await db
        .update(products)
        .set({
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image,
          category: data.category,
          brand_name: data.brand_name || null,
          model: data.model || null,
          material: data.material || null,
          color: data.color || null,
          packaging_details: data.packaging_details || null,
          delivery_info: data.delivery_info || null,
          supply_ability: data.supply_ability || null,
          moq: data.moq ? parseInt(data.moq) : null,
          updated_at: new Date()
        })
        .where(eq(products.id, data.id))
        .returning()

      return {
        success: true,
        product: updatedProduct
      }
    } catch (error) {
      console.error('Error updating product:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product'
      }
    }
  }) 