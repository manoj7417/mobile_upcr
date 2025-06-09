import { useState } from 'react'
import { createProduct } from '../routes/api/product'
import { productCategoryEnum } from '../db/schema'
import { uploadProfileImage } from '../routes/api/storage'

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  sellerId: number
  onSuccess: () => void
}

export function CreateProductModal({ isOpen, onClose, sellerId, onSuccess }: CreateProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: productCategoryEnum.enumValues[0] as typeof productCategoryEnum.enumValues[number],
    brand_name: '',
    model: '',
    material: '',
    color: '',
    packaging_details: '',
    delivery_info: '',
    supply_ability: '',
    moq: '',
    image: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploadingImage(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      const base64Data = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
      })

      const result = await uploadProfileImage({
        data: {
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data
          },
          userId: String(sellerId)
        }
      })

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Failed to upload image')
      }

      return result.url
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Please enter a product name')
        setIsLoading(false)
        return
      }

      if (!formData.description.trim()) {
        setError('Please enter a product description')
        setIsLoading(false)
        return
      }

      if (!formData.price.trim()) {
        setError('Please enter a product price')
        setIsLoading(false)
        return
      }

      // Validate that an image is selected
      if (!selectedImage && !formData.image) {
        setError('Please select a product image')
        setIsLoading(false)
        return
      }

      // Upload image if selected
      let imageUrl = formData.image
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage)
      }

      // Format the data according to the API schema
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price.trim(),
        image: imageUrl,
        category: formData.category,
        seller_id: sellerId,
        brand_name: formData.brand_name?.trim() || undefined,
        model: formData.model?.trim() || undefined,
        material: formData.material?.trim() || undefined,
        color: formData.color?.trim() || undefined,
        packaging_details: formData.packaging_details?.trim() || undefined,
        delivery_info: formData.delivery_info?.trim() || undefined,
        supply_ability: formData.supply_ability?.trim() || undefined,
        moq: formData.moq?.trim() || undefined
      }

      const result = await createProduct({ data: productData })

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        // Handle specific API errors
        if (result.error?.includes('ZodError')) {
          const errorMessage = result.error.match(/message": "([^"]+)"/)?.[1]
          setError(errorMessage || 'Please check all required fields')
        } else {
          setError(result.error || 'Failed to create product. Please try again.')
        }
      }
    } catch (err) {
      console.error('Error creating product:', err)
      setError('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Create New Product</h2>
            <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe your product"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof productCategoryEnum.enumValues[number] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {productCategoryEnum.enumValues.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="block w-full pl-7 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter brand name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter model number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter material type"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter color"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter minimum order quantity"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Image *</label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {imagePreview && (
                    <div className="relative w-20 h-20">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Upload a high-quality image (max 5MB)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Packaging Details</label>
                <textarea
                  value={formData.packaging_details}
                  onChange={(e) => setFormData({ ...formData, packaging_details: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter packaging details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Information</label>
                <textarea
                  value={formData.delivery_info}
                  onChange={(e) => setFormData({ ...formData, delivery_info: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter delivery information"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Supply Ability</label>
                <textarea
                  value={formData.supply_ability}
                  onChange={(e) => setFormData({ ...formData, supply_ability: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter supply ability details"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Previous
              </button>
            ) : (
              <div />
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || isUploadingImage}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Product'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 