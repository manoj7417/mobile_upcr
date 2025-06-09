import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { createUser } from './api/auth'
import { z } from 'zod'

// Define the types for our data structure
interface Segment {
  name: string
  color: string
  icon: string
}

interface Section {
  title: string
  startAngle: number
  endAngle: number
  background: string
  segments: Segment[]
}

// Define the sections and their segments
const SECTIONS: Section[] = [
  {
    title: "PROJECT & CONSTRUCTION RESOURCES",
    startAngle: 180,
    endAngle: 360,
    background: "#aed581", 
    segments: [
      { name: "Land", color: "#F44336", icon: "🗺" },
      { name: "Machines", color: "#0D47A1", icon: "🏗" },
      { name: "Material", color: "#29B6F6", icon: "🛠" },
      { name: "Equipment", color: "#29B6F6", icon: "⚙️" },
      { name: "Tools", color: "#29B6F6", icon: "🔧" },
      { name: "Manpower", color: "#29B6F6", icon: "👥" }
    ]
  },
  {
    title: "BUSINESS RESOURCES",
    startAngle: 0,
    endAngle: 120,
    background: "#ffd180", 
    segments: [
      { name: "Finance", color: "#9C27B0", icon: "💰" },
      { name: "Tenders", color: "#FFC107", icon: "📋" },
      { name: "Showcase", color: "#FF9800", icon: "🎯" },
      { name: "Auction", color: "#4CAF50", icon: "🔨" }
    ]
  },
  {
    title: "STUDENT RESOURCES",
    startAngle: 120,
    endAngle: 180,
    background: "#64b5f6",
    segments: [
      { name: "Jobs", color: "#009688", icon: "💼" },
      { name: "E-Stores", color: "#009688", icon: "🛍" }
    ]
  }
]

// Get all available resources from sections
const AVAILABLE_RESOURCES = SECTIONS.flatMap(section => 
  section.segments.map(segment => ({
    name: segment.name,
    category: section.title,
    icon: segment.icon
  }))
)

// Add this after the SECTIONS constant
const RESOURCE_CATEGORIES = SECTIONS.map(section => ({
  title: section.title,
  resources: section.segments.map(segment => ({
    name: segment.name,
    icon: segment.icon
  }))
}))

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string()
    .email('Invalid email address')
    .refine((email) => {
      const domain = email.split('@')[1]
      return domain && domain.includes('.')
    }, 'Email must have a valid domain (e.g., example.com)')
    .refine((email) => {
      const domain = email.split('@')[1]
      return domain && domain.length >= 3
    }, 'Email domain must be at least 3 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  resources: z.array(z.string()).min(1, 'Select a resource category'),
  primaryResource: z.array(z.string()).min(1, 'Select a primary resource')
})

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    resources: [] as string[],
    primaryResource: [] as string[],
    selectedCategory: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategory: category,
      resources: [category],
      primaryResource: []
    }))
  }

  // Handle primary resource selection
  const handlePrimaryResourceChange = (resource: string) => {
    setFormData(prev => ({
      ...prev,
      primaryResource: [resource]
    }))
  }
  
  // Validate the form using Zod
  const validateForm = () => {
    try {
      // For step 1, only validate name, email, and password
      if (step === 1) {
        const step1Schema = z.object({
          name: formSchema.shape.name,
          email: formSchema.shape.email,
          password: formSchema.shape.password
        })
        step1Schema.parse({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      } else {
        // For step 2, validate everything
        formSchema.parse(formData)
      }
      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {}
        error.errors.forEach((err) => {
          const path = err.path[0] as string
          if (!errors[path]) {
            errors[path] = []
          }
          errors[path].push(err.message)
        })
        setFormErrors(errors)
      }
      return false
    }
  }

  // Handle next step
  const handleNext = () => {
    if (validateForm()) {
      setStep(2)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    setStep(1)
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (validateForm()) {
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await createUser({ data: formData })
        
        if (result.success) {
          navigate({ to: '/login', search: { redirect: undefined } })
        } else {
          setError(result.error || 'Signup failed')
        }
      } catch (error) {
        console.error('Signup error:', error)
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Render step 1 - Basic Information
  const renderStep1 = () => (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <label htmlFor="name" className="block text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-1.5 sm:mb-2">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          onBlur={validateForm}
          required
          className="block w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          placeholder="Enter your full name"
        />
        {formErrors.name && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.name.join(', ')}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-1.5 sm:mb-2">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={validateForm}
          required
          className="block w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          placeholder="Enter your email"
        />
        {formErrors.email && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.email.join(', ')}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-1.5 sm:mb-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={validateForm}
          required
          className="block w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          placeholder="Create a secure password"
        />
        <div className="mt-2 sm:mt-3 bg-gray-50 p-2.5 sm:p-3 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600">
            <p className="font-medium text-gray-700">Password must contain:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pl-4 sm:pl-5 mt-1.5 sm:mt-2">
              <li className={`list-disc ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'} transition-colors duration-200`}>
                Uppercase letter
              </li>
              <li className={`list-disc ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'} transition-colors duration-200`}>
                Lowercase letter
              </li>
              <li className={`list-disc ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'} transition-colors duration-200`}>
                Number
              </li>
              <li className={`list-disc ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'} transition-colors duration-200`}>
                Special character
              </li>
              <li className={`list-disc ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'} transition-colors duration-200`}>
                8+ characters
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-2 sm:pt-3">
        <button
          type="button"
          onClick={handleNext}
          className="w-full flex justify-center py-2 sm:py-2.5 md:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
        >
          Next Step
        </button>
      </div>
    </div>
  )

  // Render step 2 - Resource Selection
  const renderStep2 = () => (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <label htmlFor="resource_category" className="block text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-1.5 sm:mb-2">
          Select Resource Category
        </label>
        <select
          id="resource_category"
          name="selectedCategory"
          value={formData.selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          required
          className="block w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Select a resource category</option>
          {RESOURCE_CATEGORIES.map((category) => (
            <option key={category.title} value={category.title}>
              {category.title}
            </option>
          ))}
        </select>
      </div>

      {formData.selectedCategory && (
        <div>
          <label htmlFor="primary_resource" className="block text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Select Primary Resource
          </label>
          <select
            id="primary_resource"
            name="primaryResource"
            value={formData.primaryResource[0] || ''}
            onChange={(e) => handlePrimaryResourceChange(e.target.value)}
            required
            className="block w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Select a primary resource</option>
            {RESOURCE_CATEGORIES.find(cat => cat.title === formData.selectedCategory)?.resources.map((resource) => (
              <option key={resource.name} value={resource.name}>
                {resource.icon} {resource.name}
              </option>
            ))}
          </select>
          {formErrors.primaryResource && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.primaryResource.join(', ')}</p>
          )}
        </div>
      )}

      <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-3">
        <button
          type="button"
          onClick={handlePrevious}
          className="flex-1 py-2 sm:py-2.5 md:py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 flex justify-center py-2 sm:py-2.5 md:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </div>
  )
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-red-200 p-4 sm:p-6 md:p-8">
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-stretch shadow-2xl rounded-2xl overflow-hidden">
          <div className="w-full lg:w-1/2 xl:w-2/5 bg-white order-2 lg:order-1">
            <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-12 lg:py-16 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-12">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 order-2 sm:order-1">
                  <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                    Sign Up
                  </span>
                </h1>
                <img 
                  src="/upcr-logo.png" 
                  alt="UPC Resources Logo" 
                  className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto order-1 sm:order-2"
                />
              </div>

              {error && (
                <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  <p className="font-bold text-sm sm:text-base md:text-lg">Error</p>
                  <p className="text-xs sm:text-sm md:text-base">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8 flex-1">
                {step === 1 ? renderStep1() : renderStep2()}

                <div className="text-center mt-4 sm:mt-6">
                  <p className="text-sm sm:text-base md:text-lg text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      search={{ redirect: undefined }}
                      className="font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Login
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          <div className="hidden lg:block lg:w-1/2 xl:w-3/5 order-1 lg:order-2">
            <img 
              src="https://img.freepik.com/free-vector/sign-concept-illustration_114360-125.jpg" 
              alt="Sign Up Illustration" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 