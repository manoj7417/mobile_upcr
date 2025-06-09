import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { getProduct } from '../routes/api/product'
import { useState, useEffect } from 'react'
import { productCategoryEnum } from '../db/schema'

interface Product {
  id: number
  name: string
  description: string
  price: string
  image: string
  category: typeof productCategoryEnum.enumValues[number]
  brand_name: string | null
  model: string | null
  material: string | null
  color: string | null
  packaging_details: string | null
  delivery_info: string | null
  supply_ability: string | null
  moq: number | null
  seller_id: number
  created_at: Date
  updated_at: Date
}

export const Route = createFileRoute('/product/$productId')({
  component: ProductPage,
})

function ProductPage() {
  const { productId } = useParams({ from: '/product/$productId' })
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await getProduct({ data: { id: productId } })
        if (result.success && result.product) {
          setProduct(result.product as Product)
        } else {
          setError(result.error || 'Failed to fetch product')
        }
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested product could not be found.'}</p>
          <button 
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            onClick={() => navigate({ to: '/' })}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const attributes = [
    { label: 'Brand Name', value: product.brand_name || 'N/A' },
    { label: 'Model', value: product.model || 'N/A' },
    { label: 'Material', value: product.material || 'N/A' },
    { label: 'Color', value: product.color || 'N/A' },
  ]

  const packaging = [
    { label: 'Packaging Details', value: product.packaging_details || 'N/A' },
    { label: 'Delivery', value: product.delivery_info || 'N/A' },
  ]

  const supply = [
    { label: 'Supply Ability', value: product.supply_ability || 'N/A' },
    { label: 'MOQ', value: product.moq ? `${product.moq} units` : 'N/A' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-6 sm:pt-10">
        <button 
          className="mb-6 text-blue-600 hover:underline"
          onClick={() => navigate({ to: '/' })}
        >
          &larr; Back
        </button>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Product Images and Info */}
          <div className="flex-1 min-w-0">
            {/* Main Image */}
            <div className="w-full aspect-square sm:aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
              <img 
                src={product.image} 
                alt={product.name} 
                className="object-contain w-full h-full"
              />
            </div>

            {/* About this item */}
            <div className="mb-6">
              <div className="font-bold text-lg text-gray-900 mb-2">About this Item</div>
              <p className="text-gray-700 text-sm">{product.description}</p>
            </div>

            {/* Key Attributes */}
            <div className="mb-6">
              <div className="font-bold text-lg text-gray-900 mb-2">Key Attributes</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attributes.map(attr => (
                  <div key={attr.label} className="bg-gray-100 rounded p-2 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{attr.label}</span>
                    <span className="text-gray-600">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Packaging and Delivery */}
            <div className="mb-6">
              <div className="font-bold text-lg text-gray-900 mb-2">Packaging & Delivery</div>
              <div className="grid grid-cols-1 gap-2">
                {packaging.map(attr => (
                  <div key={attr.label} className="bg-gray-100 rounded p-2 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{attr.label}</span>
                    <span className="text-gray-600">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supply Ability */}
            <div className="mb-6">
              <div className="font-bold text-lg text-gray-900 mb-2">Supply Ability</div>
              <div className="grid grid-cols-1 gap-2">
                {supply.map(attr => (
                  <div key={attr.label} className="bg-gray-100 rounded p-2 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{attr.label}</span>
                    <span className="text-gray-600">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sticky Order Box */}
          <div className="w-full lg:w-96 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
            {/* Order Box */}
            <div className="bg-white rounded-2xl shadow p-5 mb-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Price</span>
                <span className="text-blue-600 font-bold text-xl">₹{product.price}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-500">Quantity</span>
                <input 
                  type="number" 
                  min={product.moq || 1} 
                  defaultValue={product.moq || 1} 
                  className="w-16 border rounded px-2 py-1 text-center" 
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                Enquire Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 