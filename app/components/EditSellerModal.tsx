import { useState } from 'react'
import { updateSellerProfile } from '../routes/api/seller'
import { uploadProfileImage } from '../routes/api/storage'
import { Modal } from './Modal'

type EditSellerModalProps = {
  seller: {
    id: number
    company_name: string
    business_type: string
    address: string
    phone: string
    website?: string | null
    description?: string | null
    profile_picture_url?: string | null
    aadhar_url?: string | null
    gst_certificate_url?: string | null
    work_photos_urls?: string[] | null
    owner_photos_urls?: string[] | null
  }
  onSuccess?: () => void
}

export function EditSellerModal({ seller, onSuccess }: EditSellerModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'documents' | 'photos'>('basic')
  const [formData, setFormData] = useState({
    company_name: seller.company_name,
    business_type: seller.business_type,
    address: seller.address,
    phone: seller.phone,
    website: seller.website || '',
    description: seller.description || '',
  })

  // State for file uploads
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(seller.profile_picture_url || null)
  const [aadhar, setAadhar] = useState<File | null>(null)
  const [gstCertificate, setGstCertificate] = useState<File | null>(null)
  const [workPhotos, setWorkPhotos] = useState<File[]>([])
  const [ownerPhotos, setOwnerPhotos] = useState<File[]>([])

  // State for preview URLs
  const [aadharPreview, setAadharPreview] = useState<string | null>(seller.aadhar_url || null)
  const [gstPreview, setGstPreview] = useState<string | null>(seller.gst_certificate_url || null)
  const [workPhotosPreview, setWorkPhotosPreview] = useState<string[]>(seller.work_photos_urls || [])
  const [ownerPhotosPreview, setOwnerPhotosPreview] = useState<string[]>(seller.owner_photos_urls || [])

  // State for upload progress
  const [uploadProgress, setUploadProgress] = useState<{
    profile?: number
    aadhar?: number
    gst?: number
    work?: number
    owner?: number
  }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files
    if (!files) return

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const invalidFiles = Array.from(files).filter(file => file.size > maxSize)
    if (invalidFiles.length > 0) {
      setError(`Some files exceed the 5MB size limit: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    if (field === 'work_photos' || field === 'owner_photos') {
      const newFiles = Array.from(files)
      const previews = await Promise.all(
        newFiles.map(file => URL.createObjectURL(file))
      )

      if (field === 'work_photos') {
        setWorkPhotos(newFiles)
        setWorkPhotosPreview(prev => [...prev, ...previews])
      } else {
        setOwnerPhotos(newFiles)
        setOwnerPhotosPreview(prev => [...prev, ...previews])
      }
    } else {
      const file = files[0]
      if (!file) return
      const preview = URL.createObjectURL(file)

      if (field === 'profile_picture') {
        setProfilePicture(file)
        setProfilePicturePreview(preview)
      } else if (field === 'aadhar') {
        setAadhar(file)
        setAadharPreview(preview)
      } else if (field === 'gst_certificate') {
        setGstCertificate(file)
        setGstPreview(preview)
      }
    }
  }

  const removePhoto = (index: number, type: 'work' | 'owner') => {
    if (type === 'work') {
      setWorkPhotos(prev => prev.filter((_, i) => i !== index))
      setWorkPhotosPreview(prev => prev.filter((_, i) => i !== index))
    } else {
      setOwnerPhotos(prev => prev.filter((_, i) => i !== index))
      setOwnerPhotosPreview(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsSuccess(false)
    setError(null)

    try {
      // Validate website URL if provided
      let websiteUrl = formData.website
      if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        websiteUrl = `https://${websiteUrl}`
      }

      console.log('Starting file uploads...')
      
      // Helper function to convert file to base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => {
            const result = reader.result
            if (typeof result === 'string') {
              resolve(result)
            } else {
              reject(new Error('Failed to read file'))
            }
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
        })
      }

      // Upload files if they exist
      const [profilePictureUrl, aadharUrl, gstUrl, workPhotoUrls, ownerPhotoUrls] = await Promise.all([
        profilePicture ? (async () => {
          setUploadProgress(prev => ({ ...prev, profile: 0 }))
          const base64Data = await fileToBase64(profilePicture)
          setUploadProgress(prev => ({ ...prev, profile: 50 }))
          const result = await uploadProfileImage({
            data: {
              file: {
                name: profilePicture.name,
                type: profilePicture.type,
                size: profilePicture.size,
                data: base64Data
              },
              userId: String(seller.id)
            }
          })
          setUploadProgress(prev => ({ ...prev, profile: 100 }))
          return result.success ? result.url : null
        })() : Promise.resolve(seller.profile_picture_url || null),
        
        aadhar ? (async () => {
          setUploadProgress(prev => ({ ...prev, aadhar: 0 }))
          const base64Data = await fileToBase64(aadhar)
          setUploadProgress(prev => ({ ...prev, aadhar: 50 }))
          const result = await uploadProfileImage({
            data: {
              file: {
                name: aadhar.name,
                type: aadhar.type,
                size: aadhar.size,
                data: base64Data
              },
              userId: String(seller.id)
            }
          })
          setUploadProgress(prev => ({ ...prev, aadhar: 100 }))
          return result.success ? result.url : null
        })() : Promise.resolve(seller.aadhar_url || null),
        
        gstCertificate ? (async () => {
          setUploadProgress(prev => ({ ...prev, gst: 0 }))
          const base64Data = await fileToBase64(gstCertificate)
          setUploadProgress(prev => ({ ...prev, gst: 50 }))
          const result = await uploadProfileImage({
            data: {
              file: {
                name: gstCertificate.name,
                type: gstCertificate.type,
                size: gstCertificate.size,
                data: base64Data
              },
              userId: String(seller.id)
            }
          })
          setUploadProgress(prev => ({ ...prev, gst: 100 }))
          return result.success ? result.url : null
        })() : Promise.resolve(seller.gst_certificate_url || null),
        
        workPhotos.length > 0 ? Promise.all(workPhotos.map(async (file, index) => {
          setUploadProgress(prev => ({ ...prev, work: (index / workPhotos.length) * 100 }))
          const base64Data = await fileToBase64(file)
          const result = await uploadProfileImage({
            data: {
              file: {
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64Data
              },
              userId: String(seller.id)
            }
          })
          return result.success ? result.url : null
        })) : Promise.resolve(seller.work_photos_urls || []),
        
        ownerPhotos.length > 0 ? Promise.all(ownerPhotos.map(async (file, index) => {
          setUploadProgress(prev => ({ ...prev, owner: (index / ownerPhotos.length) * 100 }))
          const base64Data = await fileToBase64(file)
          const result = await uploadProfileImage({
            data: {
              file: {
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64Data
              },
              userId: String(seller.id)
            }
          })
          return result.success ? result.url : null
        })) : Promise.resolve(seller.owner_photos_urls || []),
      ])

      // Filter out any null values from the arrays
      const filteredWorkPhotoUrls = workPhotoUrls?.filter((url): url is string => url !== null && url !== undefined) || null
      const filteredOwnerPhotoUrls = ownerPhotoUrls?.filter((url): url is string => url !== null && url !== undefined) || null

      console.log('File uploads completed:', {
        profilePictureUrl: profilePictureUrl?.substring(0, 20) + '...',
        aadharUrl: aadharUrl?.substring(0, 20) + '...',
        gstUrl: gstUrl?.substring(0, 20) + '...',
        workPhotoUrls: filteredWorkPhotoUrls?.map(url => url.substring(0, 20) + '...'),
        ownerPhotoUrls: filteredOwnerPhotoUrls?.map(url => url.substring(0, 20) + '...'),
      })

      // Update seller profile
      const response = await updateSellerProfile({
        data: {
          sellerId: seller.id,
          ...formData,
          website: websiteUrl || null,
          profile_picture_url: profilePictureUrl || null,
          aadhar_url: aadharUrl || null,
          gst_certificate_url: gstUrl || null,
          work_photos_urls: filteredWorkPhotoUrls || null,
          owner_photos_urls: filteredOwnerPhotoUrls || null,
        }
      })

      if (response.success) {
        setIsSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          onSuccess?.()
        }, 1000)
      } else {
        setError(response.error || 'Failed to update seller profile')
      }
    } catch (error) {
      console.error('Failed to update seller profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to update seller profile')
    } finally {
      setIsLoading(false)
      setUploadProgress({})
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit Profile
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Seller Profile">
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-12 px-4">
              <button
                onClick={() => setActiveTab('basic')}
                className={`${
                  activeTab === 'basic'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Basic Information
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`${
                  activeTab === 'documents'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`${
                  activeTab === 'photos'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Photos
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 px-6">
          {activeTab === 'basic' && (
            <div className="space-y-8">
              {/* Profile Picture Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                <div className="flex items-center gap-8">
                  <div className="relative">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-indigo-100"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-lg ring-2 ring-indigo-100">
                        <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    {profilePicturePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfilePicture(null)
                          setProfilePicturePreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                      Upload Profile Picture
                    </label>
                    <input
                      type="file"
                      id="profile_picture"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profile_picture')}
                      className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Recommended: Square image, at least 400x400 pixels
                    </p>
                    {uploadProgress.profile !== undefined && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress.profile}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="business_type" className="block text-sm font-medium text-gray-700">
                    Business Type
                  </label>
                  <input
                    type="text"
                    id="business_type"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
                    required
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700">
                    Aadhar Card (Optional)
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      type="file"
                      id="aadhar"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'aadhar')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                    />
                    {aadharPreview && (
                      <div className="relative">
                        <img src={aadharPreview} alt="Aadhar preview" className="h-20 w-auto rounded-lg object-cover ring-2 ring-indigo-100" />
                        <button
                          type="button"
                          onClick={() => {
                            setAadhar(null)
                            setAadharPreview(null)
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {uploadProgress.aadhar !== undefined && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.aadhar}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="gst_certificate" className="block text-sm font-medium text-gray-700">
                    GST Certificate (Optional)
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      type="file"
                      id="gst_certificate"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'gst_certificate')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                    />
                    {gstPreview && (
                      <div className="relative">
                        <img src={gstPreview} alt="GST preview" className="h-20 w-auto rounded-lg object-cover ring-2 ring-indigo-100" />
                        <button
                          type="button"
                          onClick={() => {
                            setGstCertificate(null)
                            setGstPreview(null)
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {uploadProgress.gst !== undefined && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.gst}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="work_photos" className="block text-sm font-medium text-gray-700">
                    Photos of Work Done (Optional)
                  </label>
                  <div className="mt-2 space-y-4">
                    <input
                      type="file"
                      id="work_photos"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'work_photos')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                    />
                    {workPhotosPreview.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {workPhotosPreview.map((url, index) => (
                          <div key={index} className="relative">
                            <img src={url} alt={`Work photo ${index + 1}`} className="h-20 w-full rounded-lg object-cover ring-2 ring-indigo-100" />
                            <button
                              type="button"
                              onClick={() => removePhoto(index, 'work')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadProgress.work !== undefined && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress.work}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="owner_photos" className="block text-sm font-medium text-gray-700">
                    Owner Photos (Optional)
                  </label>
                  <div className="mt-2 space-y-4">
                    <input
                      type="file"
                      id="owner_photos"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'owner_photos')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                    />
                    {ownerPhotosPreview.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {ownerPhotosPreview.map((url, index) => (
                          <div key={index} className="relative">
                            <img src={url} alt={`Owner photo ${index + 1}`} className="h-20 w-full rounded-lg object-cover ring-2 ring-indigo-100" />
                            <button
                              type="button"
                              onClick={() => removePhoto(index, 'owner')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadProgress.owner !== undefined && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress.owner}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`px-5 py-2.5 rounded-lg transition-colors duration-200 inline-flex items-center font-medium ${
                isSuccess 
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSuccess ? (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved Successfully
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
} 