import React, { useState } from 'react'

interface ScheduleItem {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  date: string
  color: string
}

interface TimeManagementProps {
  isOpen: boolean
  onClose: () => void
}

export function TimeManagement({ isOpen, onClose }: TimeManagementProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [scheduleItems, setScheduleItems] = useState<{
    daily: ScheduleItem[]
    weekly: ScheduleItem[]
    monthly: ScheduleItem[]
  }>({
    daily: [],
    weekly: [],
    monthly: []
  })
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    date: string
    time: string
  } | null>(null)
  const [newScheduleItem, setNewScheduleItem] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '12:00',
    color: '#3B82F6'
  })
  const [currentDate, setCurrentDate] = useState(new Date())

  // Time slots for the schedule (24-hour format)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return `${hour}:00`
  })

  // Color options for schedule items
  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ]

  const addScheduleItem = () => {
    if (!newScheduleItem.title.trim() || !selectedTimeSlot) return

    const item: ScheduleItem = {
      id: Date.now().toString(),
      title: newScheduleItem.title,
      description: newScheduleItem.description,
      startTime: selectedTimeSlot.time,
      endTime: newScheduleItem.endTime,
      date: selectedTimeSlot.date,
      color: newScheduleItem.color
    }

    setScheduleItems(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], item]
    }))

    setNewScheduleItem({
      title: '',
      description: '',
      startTime: '',
      endTime: '12:00',
      color: '#3B82F6'
    })
    setSelectedTimeSlot(null)
  }

  const deleteScheduleItem = (itemId: string) => {
    setScheduleItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(item => item.id !== itemId)
    }))
  }

  const getDaysOfWeek = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    startOfWeek.setDate(diff)

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }

  const getDaysOfMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getScheduleItemsForDate = (date: string) => {
    return scheduleItems[activeTab].filter(item => item.date === date)
  }

  const handleTimeSlotClick = (date: string, time: string) => {
    setSelectedTimeSlot({ date, time })
    setNewScheduleItem(prev => ({ ...prev, startTime: time }))
  }

  const renderDailyView = () => {
    const today = formatDate(currentDate)
    const todayItems = getScheduleItemsForDate(today)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto border rounded-lg">
          {timeSlots.map(time => {
            const itemsAtTime = todayItems.filter(item => item.startTime === time)
            return (
              <div
                key={time}
                className={`flex items-center gap-3 p-2 border-b hover:bg-gray-50 cursor-pointer ${
                  selectedTimeSlot?.time === time && selectedTimeSlot?.date === today 
                    ? 'bg-blue-50 border-blue-200' 
                    : ''
                }`}
                onClick={() => handleTimeSlotClick(today, time)}
              >
                <div className="w-16 text-sm font-mono text-gray-500">{time}</div>
                <div className="flex-1 min-h-[40px] flex items-center gap-2">
                  {itemsAtTime.map(item => (
                    <div
                      key={item.id}
                      className="flex-1 p-2 rounded-lg text-white text-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs opacity-90">{item.startTime} - {item.endTime}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteScheduleItem(item.id)
                        }}
                        className="float-right text-white hover:text-red-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeeklyView = () => {
    const weekDays = getDaysOfWeek()

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
            >
              This Week
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ›
            </button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-8 bg-gray-50">
            <div className="p-2 font-medium text-sm text-gray-600 border-r">Time</div>
            {weekDays.map(day => (
              <div key={day.toISOString()} className="p-2 font-medium text-sm text-gray-600 text-center border-r last:border-r-0">
                <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="text-xs">{day.getDate()}</div>
              </div>
            ))}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="p-2 text-sm font-mono text-gray-500 border-r bg-gray-50">
                  {time}
                </div>
                {weekDays.map(day => {
                  const dateStr = formatDate(day)
                  const itemsAtTime = getScheduleItemsForDate(dateStr).filter(item => item.startTime === time)
                  return (
                    <div
                      key={`${dateStr}-${time}`}
                      className={`p-1 min-h-[50px] border-r last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                        selectedTimeSlot?.date === dateStr && selectedTimeSlot?.time === time 
                          ? 'bg-blue-50' 
                          : ''
                      }`}
                      onClick={() => handleTimeSlotClick(dateStr, time)}
                    >
                      {itemsAtTime.map(item => (
                        <div
                          key={item.id}
                          className="p-1 rounded text-xs text-white mb-1"
                          style={{ backgroundColor: item.color }}
                        >
                          <div className="font-medium truncate">{item.title}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteScheduleItem(item.id)
                            }}
                            className="float-right text-white hover:text-red-200 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderMonthlyView = () => {
    const monthDays = getDaysOfMonth()
    const currentMonth = currentDate.getMonth()

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
            >
              This Month
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ›
            </button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 font-medium text-sm text-gray-600 text-center border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {monthDays.map((day, index) => {
              const dateStr = formatDate(day)
              const dayItems = getScheduleItemsForDate(dateStr)
              const isCurrentMonth = day.getMonth() === currentMonth
              const isToday = dateStr === formatDate(new Date())
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                    !isCurrentMonth ? 'bg-gray-100 text-gray-400' : ''
                  } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => handleTimeSlotClick(dateStr, '09:00')}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map(item => (
                      <div
                        key={item.id}
                        className="p-1 rounded text-xs text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        <div className="truncate font-medium">{item.title}</div>
                        <div className="truncate text-xs opacity-90">{item.startTime}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteScheduleItem(item.id)
                          }}
                          className="float-right text-white hover:text-red-200 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Time Management</h2>
              <p className="text-sm text-gray-600">Schedule your tasks and manage your time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? 'text-indigo-600 bg-white border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Schedule
              {scheduleItems[tab].length > 0 && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === tab
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {scheduleItems[tab].length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
            {activeTab === 'daily' && renderDailyView()}
            {activeTab === 'weekly' && renderWeeklyView()}
            {activeTab === 'monthly' && renderMonthlyView()}
          </div>

          {/* Sidebar for adding items */}
          {selectedTimeSlot && (
            <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                Add Schedule Item
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                    {new Date(selectedTimeSlot.date).toLocaleDateString()} at {selectedTimeSlot.time}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newScheduleItem.title}
                    onChange={(e) => setNewScheduleItem(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Meeting, Task, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newScheduleItem.description}
                    onChange={(e) => setNewScheduleItem(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <select
                    value={newScheduleItem.endTime}
                    onChange={(e) => setNewScheduleItem(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewScheduleItem(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newScheduleItem.color === color ? 'border-gray-400' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addScheduleItem}
                    disabled={!newScheduleItem.title.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => setSelectedTimeSlot(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 