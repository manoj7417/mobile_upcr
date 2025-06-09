import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { logoutUser } from '../../routes/api/auth'

// Define User type here since it's not available in types
type User = {
  id: string
  name: string
  email: string
  profile_image_url?: string | null
  is_admin?: boolean
}

type SidebarProps = {
  user: User
  activeTab: 'seller' | 'profile' | 'audit-logs' | 'dashboard'
  onTabChange: (tab: 'seller' | 'profile' | 'audit-logs' | 'dashboard') => void
}

export function Sidebar({ user, activeTab, onTabChange }: SidebarProps) {
  const navigate = useNavigate()

  const handleTabClick = (tab: 'seller' | 'profile' | 'audit-logs' | 'dashboard') => {
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  const handleLogout = async () => {
    try {
      const result = await logoutUser()
      if (result.success) {
        navigate({ to: '/' })
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
            {user.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              (user.name?.[0] || user.email?.[0] || 'P').toUpperCase()
            )}
          </div>
          <div>
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
              activeTab === 'seller'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
            onClick={() => handleTabClick('seller')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Seller Dashboard
          </button>
          <button
            className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
            onClick={() => handleTabClick('profile')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>
          {user.is_admin && (
            <button
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                activeTab === 'audit-logs'
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
              onClick={() => handleTabClick('audit-logs')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Audit Logs
            </button>
          )}
          <Link
            to="/"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </Link>
        </div>
      </div>

      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
} 