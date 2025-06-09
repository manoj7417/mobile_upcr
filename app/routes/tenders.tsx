import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { TenderForm } from '../components/PostForm/forms/TenderForm'
import { getTenders, generateNewUPCRef } from './api/tenders'
import { validateAccessToken } from './api/auth'
import { ClipboardList, Plus, Calendar, MapPin, DollarSign, Building } from 'lucide-react'

export const Route = createFileRoute('/tenders')({
  component: TendersPage,
  loader: async ({ location }) => {
    try {
      // Check if user is authenticated
      const authResult = await validateAccessToken()
      if (!authResult.success) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        })
      }

      // Generate UPC for new tender if needed
      const upcResult = await generateNewUPCRef()
      const generatedUPC = upcResult.success ? upcResult.upcRef : null

      // Get existing tenders
      const result = await getTenders({ data: {} })
      
      return {
        tenders: result.success ? result.tenders : [],
        error: result.success ? null : result.error,
        user: authResult.user,
        generatedUPC
      }
    } catch (error) {
      // If it's a redirect, let it throw
      if (error && typeof error === 'object' && 'to' in error) {
        throw error
      }
      
      console.error('Error loading tenders:', error)
      return {
        tenders: [],
        error: 'Failed to load tenders',
        user: null,
        generatedUPC: null
      }
    }
  }
})

function TendersPage() {
  const { tenders, error, user, generatedUPC } = Route.useLoaderData()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [currentUPC, setCurrentUPC] = useState(generatedUPC)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount))
  }

  const handleCreateTender = () => {
    setShowCreateForm(true)
  }

  const handleCloseForm = () => {
    setShowCreateForm(false)
    // Generate new UPC for next tender
    generateNewUPCRef().then(result => {
      if (result.success && result.upcRef) {
        setCurrentUPC(result.upcRef)
      }
    })
  }

  const generateNewUPC = async () => {
    try {
      const result = await generateNewUPCRef()
      if (result.success && result.upcRef) {
        setCurrentUPC(result.upcRef)
      }
    } catch (error) {
      console.error('Error generating new UPC:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tenders</h1>
                <p className="text-gray-600">Browse and manage engineering tenders</p>
                {user && (
                  <p className="text-sm text-gray-500">Welcome, {user.name}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleCreateTender}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Tender</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* UPC Reference Section */}
        {currentUPC && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 rounded-full p-2">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ready to Create Tender</h3>
                  <p className="text-sm text-gray-600">Your unique UPC reference number is ready</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">UPC Reference:</p>
                  <p className="text-xl font-mono font-bold text-blue-600">{currentUPC}</p>
                </div>
                <button
                  onClick={generateNewUPC}
                  className="px-3 py-2 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Generate New
                </button>
                <button
                  onClick={handleCreateTender}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Use This UPC
                </button>
              </div>
            </div>
          </div>
        )}

        {tenders.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tenders found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new tender.</p>
            {currentUPC && (
              <p className="mt-2 text-sm text-blue-600 font-medium">
                Your UPC Reference: <span className="font-mono">{currentUPC}</span>
              </p>
            )}
            <div className="mt-6">
              <button
                onClick={handleCreateTender}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Create Tender
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenders.map((tender) => (
              <div key={tender.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-100 bg-blue-500/20 px-2 py-1 rounded-full">
                      {tender.engineering_category.toUpperCase()}
                    </span>
                    <span className="text-xs font-medium text-white bg-white/20 px-2 py-1 rounded-full">
                      {tender.upc_ref}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2 line-clamp-2">
                    {tender.tender_name}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">{tender.specialization}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{tender.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-semibold">{formatCurrency(tender.estimated_value)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Due: {formatDate(tender.submission_date.toString())}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {tender.scope}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tender.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tender.status}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Tender Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <TenderForm 
              onClose={handleCloseForm} 
              prefilledUPC={currentUPC}
            />
          </div>
        </div>
      )}
    </div>
  )
} 