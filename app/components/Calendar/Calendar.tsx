import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface CalendarProps {
  isOpen: boolean
  onClose: () => void
}

export function Calendar({ isOpen, onClose }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const today = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Generate year options (current year ± 50 years)
  const currentYearValue = new Date().getFullYear()
  const yearOptions = []
  for (let year = currentYearValue - 50; year <= currentYearValue + 50; year++) {
    yearOptions.push(year)
  }

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Generate calendar days
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleMonthChange = (monthIndex: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), monthIndex, 1))
  }

  const handleYearChange = (year: number) => {
    setCurrentDate(prev => new Date(year, prev.getMonth(), 1))
  }

  const selectDate = (date: Date) => {
    setSelectedDate(date)
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
          {/* Header */}
          <div className="bg-gray-800 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-white" />
                <h2 className="text-lg font-medium text-white">Calendar</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Close calendar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            {/* Navigation Arrows */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <h3 className="text-lg font-medium text-gray-900">
                {months[currentMonth]} {currentYear}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Month and Year Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="month-select" className="block text-xs font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  id="month-select"
                  value={currentMonth}
                  onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year-select" className="block text-xs font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  id="year-select"
                  value={currentYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Calendar Body */}
          <div className="p-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map(day => (
                <div
                  key={day}
                  className="p-2 text-center text-xs font-medium text-gray-500 uppercase"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => (
                <div key={index} className="aspect-square">
                  {date ? (
                    <button
                      onClick={() => selectDate(date)}
                      className={`
                        w-full h-full rounded-lg text-sm font-medium transition-colors
                        ${isToday(date)
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : isSelected(date)
                          ? 'bg-blue-100 text-blue-900 border-2 border-blue-500'
                          : 'hover:bg-gray-100 text-gray-900'
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Today's Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Today: {formatDate(today)}
              </p>
            </div>

            {/* Selected Date Info */}
            {selectedDate && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 text-center">
                  Selected: {formatDate(selectedDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 