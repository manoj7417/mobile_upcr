// app/routes/__root.tsx
import { Outlet, createRootRoute, HeadContent, Scripts, Link, useRouter } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar/Navbar'
import { validateAccessToken } from './api/auth'
import { CategoryProvider } from '../context/CategoryContext'
import { Toaster } from 'react-hot-toast'

export type User = {
  id: string
  name: string
  email: string
  verified: boolean
  profile_image_url: string | null
}

export const Route = createRootRoute({
  component: RootComponent,
  beforeLoad: async () => {
    const result = await validateAccessToken()
    return { user: result.success ? result.user : null }
  },
  errorComponent: ({ error }) => {
    return (
      <RootDocument>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-6">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-red-600">Oops! Something went wrong</h1>
              <p className="mt-2 text-gray-600">{error?.message || 'An unexpected error occurred'}</p>
              <Link 
                to="/"
                className="mt-4 inline-block text-blue-600 hover:text-blue-500"
              >
                Return to home
              </Link>
            </div>
          </div>
        </div>
      </RootDocument>
    )
  }
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>UPCR</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/assets/ssr.css" />
        <link rel="icon" type="image/png" href="/upcr-logo.png" />
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white">
        <div id="app-content">
          {children}
        </div>
        <Toaster position="top-right" />
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  const { state: { location } } = useRouter()
  const isHomePage = location.pathname === '/'

  return (
    <CategoryProvider>
      <RootDocument>
        <Navbar />
        <div className={'pt-16' }>
          <Outlet />
        </div>
      </RootDocument>
    </CategoryProvider>
  )
}