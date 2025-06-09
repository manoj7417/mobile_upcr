import React, { useState, useEffect } from 'react'
import { X, Clock, Globe, Calendar } from 'lucide-react'

interface TimeZoneProps {
  isOpen: boolean
  onClose: () => void
}

interface TimeZoneData {
  name: string
  code: string
  offset: string
  city: string
  country: string
  flag: string
}

const popularTimeZones: TimeZoneData[] = [
  { name: 'India Standard Time', code: 'Asia/Kolkata', offset: '+05:30', city: 'Mumbai', country: 'India', flag: '🇮🇳' },
  { name: 'Eastern Standard Time', code: 'America/New_York', offset: '-05:00', city: 'New York', country: 'United States', flag: '🇺🇸' },
  { name: 'Pacific Standard Time', code: 'America/Los_Angeles', offset: '-08:00', city: 'Los Angeles', country: 'United States', flag: '🇺🇸' },
  { name: 'Greenwich Mean Time', code: 'Europe/London', offset: '+00:00', city: 'London', country: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Central European Time', code: 'Europe/Paris', offset: '+01:00', city: 'Paris', country: 'France', flag: '🇫🇷' },
  { name: 'Japan Standard Time', code: 'Asia/Tokyo', offset: '+09:00', city: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  { name: 'China Standard Time', code: 'Asia/Shanghai', offset: '+08:00', city: 'Shanghai', country: 'China', flag: '🇨🇳' },
  { name: 'Australian Eastern Time', code: 'Australia/Sydney', offset: '+11:00', city: 'Sydney', country: 'Australia', flag: '🇦🇺' },
  { name: 'Dubai Standard Time', code: 'Asia/Dubai', offset: '+04:00', city: 'Dubai', country: 'UAE', flag: '🇦🇪' },
  { name: 'Singapore Standard Time', code: 'Asia/Singapore', offset: '+08:00', city: 'Singapore', country: 'Singapore', flag: '🇸🇬' },
  { name: 'Central Standard Time', code: 'America/Chicago', offset: '-06:00', city: 'Chicago', country: 'United States', flag: '🇺🇸' },
  { name: 'Mountain Standard Time', code: 'America/Denver', offset: '-07:00', city: 'Denver', country: 'United States', flag: '🇺🇸' },
  { name: 'Brazil Time', code: 'America/Sao_Paulo', offset: '-03:00', city: 'São Paulo', country: 'Brazil', flag: '🇧🇷' },
  { name: 'Argentina Time', code: 'America/Buenos_Aires', offset: '-03:00', city: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷' },
  { name: 'South Africa Time', code: 'Africa/Johannesburg', offset: '+02:00', city: 'Johannesburg', country: 'South Africa', flag: '🇿🇦' },
  { name: 'Moscow Time', code: 'Europe/Moscow', offset: '+03:00', city: 'Moscow', country: 'Russia', flag: '🇷🇺' },
  { name: 'Korea Standard Time', code: 'Asia/Seoul', offset: '+09:00', city: 'Seoul', country: 'South Korea', flag: '🇰🇷' },
  { name: 'Thailand Time', code: 'Asia/Bangkok', offset: '+07:00', city: 'Bangkok', country: 'Thailand', flag: '🇹🇭' },
  { name: 'Indonesia Time', code: 'Asia/Jakarta', offset: '+07:00', city: 'Jakarta', country: 'Indonesia', flag: '🇮🇩' },
  { name: 'Turkey Time', code: 'Europe/Istanbul', offset: '+03:00', city: 'Istanbul', country: 'Turkey', flag: '🇹🇷' }
]

export function TimeZone({ isOpen, onClose }: TimeZoneProps) {
  const [currentTimes, setCurrentTimes] = useState<{ [key: string]: string }>({})
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>('Asia/Kolkata')
  const [activeTab, setActiveTab] = useState<'world-clock' | 'custom-converter'>('world-clock')
  const [customTime, setCustomTime] = useState<string>('')
  const [customTimezone, setCustomTimezone] = useState<string>('Asia/Kolkata')
  const [convertedTimes, setConvertedTimes] = useState<{ [key: string]: string }>({})
  const [selectedCountryModal, setSelectedCountryModal] = useState<TimeZoneData | null>(null)
  const [convertedTimeForModal, setConvertedTimeForModal] = useState<string>('')

  const updateTimes = () => {
    const times: { [key: string]: string } = {}
    popularTimeZones.forEach(tz => {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz.code,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
      times[tz.code] = formatter.format(now)
    })
    setCurrentTimes(times)
  }

  useEffect(() => {
    if (isOpen) {
      updateTimes()
      const interval = setInterval(updateTimes, 1000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

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

  const formatTimeForTimezone = (timezone: string) => {
    const now = new Date()
    const date = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(now)
    
    const time = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(now)
    
    return { date, time }
  }

  const convertTimeForCountry = (targetTimezone: string): string => {
    if (!customTime) return 'No time selected'

    try {
      // Parse the input time
      const [hours, minutes] = customTime.split(':').map(Number)
      
      // Get today's date
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1
      const day = today.getDate()
      
      // Create a datetime string for today at the specified time
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
      
      // The trick: We need to create the time AS IF it exists in the source timezone
      // Method: Use a fixed reference point and calculate the difference
      
      // Create two reference times (right now) in both timezones
      const now = new Date()
      
      // Format "now" in both timezones to get their current representations
      const nowInSourceTZ = new Intl.DateTimeFormat('sv-SE', {
        timeZone: customTimezone,
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(now)
      
      const nowInTargetTZ = new Intl.DateTimeFormat('sv-SE', {
        timeZone: targetTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit', 
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(now)
      
      // Parse these back to Date objects to get the time difference
      const sourceDate = new Date(nowInSourceTZ)
      const targetDate = new Date(nowInTargetTZ)
      
      // Calculate the offset in milliseconds
      const offsetMs = targetDate.getTime() - sourceDate.getTime()
      
      // Create our input time and apply the offset
      const inputDateTime = new Date(`${dateStr}T${timeStr}`)
      const convertedTime = new Date(inputDateTime.getTime() + offsetMs)
      
      // Format the final result
      const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      
      return formatter.format(convertedTime)
      
    } catch (error) {
      console.error('Timezone conversion error:', error)
      return 'Unable to convert time'
    }
  }

  const handleCountryClick = (country: TimeZoneData) => {
    if (!customTime) {
      alert('Please select a time first!')
      return
    }
    
    const convertedTime = convertTimeForCountry(country.code)
    setConvertedTimeForModal(convertedTime)
    setSelectedCountryModal(country)
  }

  useEffect(() => {
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!customTime) {
      const now = new Date()
      const timeString = now.toTimeString().slice(0, 5) // HH:MM format
      setCustomTime(timeString)
    }
  }, [activeTab])

  if (!isOpen) return null

  const selectedTz = popularTimeZones.find(tz => tz.code === selectedTimeZone)
  const selectedTime = selectedTz ? formatTimeForTimezone(selectedTz.code) : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Time Zone Converter</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex">
            <button
              onClick={() => setActiveTab('world-clock')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'world-clock'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              World Clock
            </button>
            <button
              onClick={() => setActiveTab('custom-converter')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'custom-converter'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Custom Converter
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {activeTab === 'world-clock' && (
            <>
              {/* Selected Time Zone Display */}
              {selectedTime && selectedTz && (
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{selectedTz.flag}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedTz.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{selectedTz.city}, {selectedTz.country} ({selectedTz.offset})</p>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{selectedTime.time}</div>
                    <div className="text-sm text-gray-700">{selectedTime.date}</div>
                  </div>
                </div>
              )}

              {/* Time Zone Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularTimeZones.map((tz) => (
                  <button
                    key={tz.code}
                    onClick={() => setSelectedTimeZone(tz.code)}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-left hover:shadow-md
                      ${selectedTimeZone === tz.code
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{tz.flag}</span>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                              {tz.city}
                            </h4>
                            <p className="text-xs text-gray-500">{tz.country}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{tz.offset}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {currentTimes[tz.code]?.split(',')[1]?.split(' ').slice(1, 3).join(' ') || '--:--'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {currentTimes[tz.code]?.split(',')[0] || '---'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  World Clock Information
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Times are updated every second in real-time</p>
                  <p>• Click on any time zone to view detailed information</p>
                  <p>• All times account for Daylight Saving Time automatically</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'custom-converter' && (
            <>
              {/* Custom Time Input */}
              <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Custom Time Converter
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Time (24-hour format)
                    </label>
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Time Zone
                    </label>
                    <select
                      value={customTimezone}
                      onChange={(e) => setCustomTimezone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                      {popularTimeZones.map((tz) => (
                        <option key={tz.code} value={tz.code}>
                          {tz.flag} {tz.city}, {tz.country} ({tz.offset})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <p className="text-sm text-gray-600">
                    <strong>Converting:</strong> {customTime} in {popularTimeZones.find(tz => tz.code === customTimezone)?.city}, {popularTimeZones.find(tz => tz.code === customTimezone)?.country}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Example: If it's {customTime} in {popularTimeZones.find(tz => tz.code === customTimezone)?.city}, what time is it around the world?
                  </p>
                </div>
              </div>

              {/* Country Cards - Click to Convert */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularTimeZones.map((tz) => (
                  <button
                    key={tz.code}
                    onClick={() => handleCountryClick(tz)}
                    className="p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-400 hover:shadow-lg transition-all text-left group"
                    disabled={!customTime}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tz.flag}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {tz.city}
                          </h4>
                          <p className="text-xs text-gray-500">{tz.country}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{tz.offset}</div>
                        <div className="text-xs text-purple-600 group-hover:text-purple-700 mt-1">
                          {customTime ? 'Click to convert' : 'Select time first'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Converter Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  How to Use Custom Converter
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• 1. Enter the time and select source timezone above</p>
                  <p>• 2. Click on any country card to see the converted time</p>
                  <p>• 3. Perfect for scheduling international meetings and calls</p>
                  <p>• 4. All conversions account for Daylight Saving Time automatically</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Country Time Conversion Modal */}
      {selectedCountryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedCountryModal.flag}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedCountryModal.city}</h3>
                  <p className="text-sm text-purple-100">{selectedCountryModal.country}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCountryModal(null)}
                className="text-white hover:text-purple-200 transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center space-y-4">
                {/* Source Time Display */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Original Time</h4>
                  <div className="text-lg font-semibold text-gray-800">
                    {customTime} in {popularTimeZones.find(tz => tz.code === customTimezone)?.city}
                  </div>
                  <div className="text-xs text-gray-500">
                    {popularTimeZones.find(tz => tz.code === customTimezone)?.country}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-6 h-6 text-purple-600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                {/* Converted Time Display */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                  <h4 className="text-sm font-medium text-purple-700 mb-2">Converted Time</h4>
                  <div className="text-2xl font-bold text-purple-800 mb-2">
                    {convertedTimeForModal.includes(' on ') 
                      ? convertedTimeForModal.split(' on ')[0] 
                      : convertedTimeForModal}
                  </div>
                  <div className="text-sm text-purple-600">
                    {convertedTimeForModal.includes(' on ') 
                      ? convertedTimeForModal.split(' on ')[1] 
                      : ''}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {selectedCountryModal.offset} UTC
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedCountryModal(null)}
                  className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 