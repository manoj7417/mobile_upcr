import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { TenderForm } from '../components/PostForm/forms/TenderForm'
import { generateNewUPCRef } from './api/tenders'
import { ClipboardList } from 'lucide-react'

export const Route = createFileRoute('/test-tender')({
  component: TestTenderPage,
  loader: async () => {
    try {
      // Generate UPC for testing
      const upcResult = await generateNewUPCRef()
      const generatedUPC = upcResult.success ? upcResult.upcRef : null

      return {
        generatedUPC,
        error: upcResult.success ? null : upcResult.error
      }
    } catch (error) {
      console.error('Error generating UPC:', error)
      return {
        generatedUPC: null,
        error: 'Failed to generate UPC'
      }
    }
  }
})

function TestTenderPage() {
  const { generatedUPC, error } = Route.useLoaderData()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [currentUPC, setCurrentUPC] = useState(generatedUPC)

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

  const handleCloseForm = () => {
    setShowCreateForm(false)
    // Generate new UPC for next tender
    generateNewUPC()
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
                <h1 className="text-2xl font-bold text-gray-900">Test Tender Form</h1>
                <p className="text-gray-600">Test the tender creation functionality</p>
              </div>
            </div>
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
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Test Form with This UPC
                </button>
              </div>
            </div>
          </div>
        )}

        {!currentUPC && !error && (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No UPC Generated</h3>
            <p className="mt-1 text-sm text-gray-500">Try refreshing the page to generate a UPC.</p>
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