import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { loginUser } from './api/auth'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: search.redirect as string | undefined
    }
  }
})

function RouteComponent() {
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPasswordAlert, setShowForgotPasswordAlert] = useState(false)
  const [showWaitingListAlert, setShowWaitingListAlert] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setShowForgotPasswordAlert(false)
    setShowWaitingListAlert(false)
    
    try {
      const result = await loginUser({ data: { email, password } })
      
      if (result.success) {
        let targetPath = '/app';
        let targetSearch = {};

        if (redirect) {
          try {
            const redirectUrl = new URL(redirect, window.location.origin);
            targetPath = redirectUrl.pathname;
            targetSearch = Object.fromEntries(redirectUrl.searchParams.entries());
          } catch (e) {
            console.error("Failed to parse redirect URL, falling back to /app:", redirect, e);
            targetPath = '/app';
            targetSearch = {};
          }
        }

        navigate({ 
          to: targetPath,
          search: targetSearch,
          replace: true
        })
      } else if(result.error === 'Account not verified'){
        setError(null)
        setShowWaitingListAlert(true)
        setTimeout(() => setShowWaitingListAlert(false), 10000)
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    setShowForgotPasswordAlert(true)
    setTimeout(() => setShowForgotPasswordAlert(false), 10000)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-red-200 p-4 sm:p-6 md:p-8">
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="flex items-stretch shadow-2xl rounded-2xl overflow-hidden">
          {/* Left Side - Image */}
          <div className="hidden lg:block lg:w-1/2 xl:w-3/5">
            <img 
              src="https://img.freepik.com/free-vector/online-education-tree-concept-with-e-learning-training-resources-icons-vector-illustration_98292-6759.jpg" 
              alt="Resources Illustration" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 xl:w-2/5 bg-white">
            <div className="px-6 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16 h-full flex flex-col">
              {/* Logo Container */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 sm:mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 order-2 sm:order-1">
                  <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                    Login
                  </span>
                </h1>
                <img 
                  src="/upcr-logo.png" 
                  alt="UPC Resources Logo" 
                  className="h-16 sm:h-20 w-auto order-1 sm:order-2"
                />
              </div>

              {error && (
                <div className="p-3 sm:p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  <p className="font-bold text-base sm:text-lg">Error</p>
                  <p className="text-sm sm:text-base">{error}</p>
                </div>
              )}

              {showWaitingListAlert && (
                <div className="p-3 sm:p-4 mb-6 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
                  <p className="font-bold text-base sm:text-lg">Notification</p>
                  <p className="text-sm sm:text-base">Your account is in waiting list right now pending for verification. Please contact support at upcresources@gmail.com for assistance.</p>
                </div>
              )}

              {showForgotPasswordAlert && (
                <div className="p-3 sm:p-4 mb-6 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
                  <p className="font-bold text-base sm:text-lg">Notification</p>
                  <p className="text-sm sm:text-base">Please contact support at upcresources@gmail.com for password reset assistance.</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 flex-1">
                <div>
                  <label htmlFor="email" className="block text-base sm:text-lg font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-3 sm:px-4 py-2.5 sm:py-3.5 text-base sm:text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-base sm:text-lg font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full px-3 sm:px-4 py-2.5 sm:py-3.5 text-base sm:text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-base sm:text-lg text-red-600 hover:text-red-700 transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2.5 sm:py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base sm:text-lg font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 sm:h-6 w-5 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                </div>

                <div className="text-center mt-4 sm:mt-6">
                  <p className="text-base sm:text-lg text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-medium text-red-600 hover:text-red-700 transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
