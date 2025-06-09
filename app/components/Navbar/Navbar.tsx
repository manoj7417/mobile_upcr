import React, { useState } from 'react'
import { Link, useRouteContext, useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import type { User } from '../../routes/__root'
import { Calculator } from '../Calculator/Calculator'
import { Calendar } from '../Calendar/Calendar'
import { Currency } from '../Currency/Currency'
import { TimeZone } from '../TimeZone/TimeZone'


export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
  const [isTimeZoneOpen, setIsTimeZoneOpen] = useState(false)

  const { user } = useRouteContext({ from: '__root__' }) as { user: User | null }
  const navigate = useNavigate()

  const handleUnderConstruction = (e: React.MouseEvent) => {
    e.preventDefault()
    alert('This feature is under construction. Coming soon!')
  }

  const handleCalculatorClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsCalculatorOpen(true)
  }

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsCalendarOpen(true)
  }

  const handleCurrencyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsCurrencyOpen(true)
  }

  const handleTimeZoneClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsTimeZoneOpen(true)
  }

  const handleTimeManagementClick = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate({ to: '/time-management' })
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate({ to: '/app', search: { tab: 'profile' } })
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <img 
                  src="/upcr-logo.png" 
                  alt="UPC Resources Logo" 
                  className="h-8 sm:h-10 w-auto object-contain"
                  loading="eager"
                />
              </Link>
            </div>

            {/* Right side - Search, Navigation Links and Profile */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              {/* Desktop Search Bar */}
              <div className="hidden lg:block">
                <input 
                  type="search" 
                  placeholder="Search for products..." 
                  className="w-[30rem] px-4 py-2.5 border-2 border-gray-200 rounded-full text-sm sm:text-base outline-none transition-colors focus:border-blue-400 bg-gray-50 focus:bg-white"
                  autoComplete="off"
                  aria-label="Search products"
                />
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center gap-4 xl:gap-6">
                <button 
                  onClick={handleCalculatorClick}
                  className="transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg"
                  title="Calculator"
                  aria-label="Calculator"
                >
                  <img 
                    src="/calculator.png" 
                    alt="Calculator" 
                    className="w-10 h-10 object-contain"
                  />
                </button>
                <button 
                  onClick={handleCalendarClick}
                  className="transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg"
                  title="Calendar"
                  aria-label="Calendar"
                >
                  <img 
                    src="/calendar.png" 
                    alt="Calendar" 
                    className="w-10 h-10 object-contain"
                  />
                </button>
                <button 
                  onClick={handleCurrencyClick}
                  className="transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg"
                  title="Currency Converter"
                  aria-label="Currency Converter"
                > 
                  <img 
                    src="/currency.png" 
                    alt="Currency Converter" 
                    className="w-10 h-10 object-contain"
                  />
                </button>
                <button 
                  onClick={handleTimeZoneClick}
                  className="transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg"
                  title="Time Zone Converter"
                  aria-label="Time Zone Converter"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                </button>
                <button 
                  onClick={handleTimeManagementClick}
                  className="transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg"
                  title="Time Management"
                  aria-label="Time Management"
                >
                  <img 
                    src="/time-management.png" 
                    alt="Time Management" 
                    className="w-10 h-10 object-contain"
                  />
                </button>
              </div>

              {/* Tablet Navigation Links */}
              <div className="hidden md:flex lg:hidden items-center gap-2">
                <button 
                  onClick={handleCalculatorClick}
                  className="transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg"
                  title="Calculator"
                  aria-label="Calculator"
                >
                  <img 
                    src="/calculator.png" 
                    alt="Calculator" 
                    className="w-8 h-8 object-contain"
                  />
                </button>
                <button 
                  onClick={handleCalendarClick}
                  className="transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg"
                  title="Calendar"
                  aria-label="Calendar"
                >
                  <img 
                    src="/calendar.png" 
                    alt="Calendar" 
                    className="w-8 h-8 object-contain"
                  />
                </button>
                <button 
                  onClick={handleCurrencyClick}
                  className="transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg"
                  title="Currency Converter"
                  aria-label="Currency Converter"
                >
                  <img 
                    src="/currency.png" 
                    alt="Currency Converter" 
                    className="w-8 h-8 object-contain"
                  />
                </button>
                <button 
                  onClick={handleTimeZoneClick}
                  className="transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg"
                  title="Time Zone Converter"
                  aria-label="Time Zone Converter"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                </button>
                <button 
                  onClick={handleTimeManagementClick}
                  className="transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:shadow-lg"
                  title="Time Management"
                  aria-label="Time Management"
                >
                  <img 
                    src="/time-management.png" 
                    alt="Time Management" 
                    className="w-8 h-8 object-contain"
                  />
                </button>
              </div>

              {/* User Profile/Login */}
              {!user ? (
                <Link 
                  to="/login"
                  search={{ redirect: '/' }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-colors"
                  aria-label="Login"
                >
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">In</span>
                </Link>
              ) : (
                <button
                  onClick={handleProfileClick}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors flex-shrink-0"
                  title={user.name || user.email}
                  aria-label="Profile"
                >
                  {user.profile_image_url ? (
                    <img 
                      src={user.profile_image_url} 
                      alt="Profile" 
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                    />
                  ) : (
                    <span className="text-blue-600 font-medium text-xs sm:text-sm">
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'P'}
                    </span>
                  )}
                </button>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div 
            id="mobile-menu"
            className={`
              md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100
              ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            `}
            aria-hidden={!isMenuOpen}
          >
            <div className="py-4 space-y-3">
              {/* Mobile Search Bar */}
              <div className="px-1">
                <input 
                  type="search" 
                  placeholder="Search for products..." 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-blue-400 bg-gray-50 focus:bg-white"
                  autoComplete="off"
                  aria-label="Search products"
                />
              </div>
              
              {/* Mobile Navigation Links */}
              <div className="grid grid-cols-2 gap-3 px-1">
                <button 
                  onClick={handleCalculatorClick}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all"
                >
                  <img 
                    src="/calculator.png" 
                    alt="Calculator" 
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-blue-700 font-medium">Calculator</span>
                </button>
                <button 
                  onClick={handleCalendarClick}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 hover:from-red-100 hover:to-red-200 transition-all"
                >
                  <img 
                    src="/calendar.png" 
                    alt="Calendar" 
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-red-700 font-medium">Calendar</span>
                </button>
                <button 
                  onClick={handleCurrencyClick}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:from-green-100 hover:to-green-200 transition-all"
                >
                  <img 
                    src="/currency.png" 
                    alt="Currency Converter" 
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-green-700 font-medium">Currency</span>
                </button>
                <button 
                  onClick={handleTimeZoneClick}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <span className="text-orange-700 font-medium">Time Zone</span>
                </button>
                <button 
                  onClick={handleTimeManagementClick}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200 hover:from-indigo-100 hover:to-purple-200 transition-all"
                >
                  <img 
                    src="/time-management.png" 
                    alt="Time Management" 
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-indigo-700 font-medium">Time Management</span>
                </button>
              </div>

              {/* Mobile Login/Profile */}
              {!user ? (
                <div className="px-1 pt-2">
                  <Link 
                    to="/login"
                    search={{ redirect: '/' }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center block"
                    aria-label="Login"
                  >
                    Login to Your Account
                  </Link>
                </div>
              ) : (
                <div className="px-1 pt-2 border-t border-gray-100">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                    title={user.name || user.email}
                    aria-label="Profile"
                  >
                    {user.profile_image_url ? (
                      <img 
                        src={user.profile_image_url} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'P'}
                        </span>
                      </div>
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || 'User Profile'}
                      </div>
                      <div className="text-xs text-gray-500">
                        View profile settings
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <Calculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />

      <Calendar 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
      />

      <Currency 
        isOpen={isCurrencyOpen} 
        onClose={() => setIsCurrencyOpen(false)} 
      />

      <TimeZone 
        isOpen={isTimeZoneOpen} 
        onClose={() => setIsTimeZoneOpen(false)} 
      />


    </>
  )
} 