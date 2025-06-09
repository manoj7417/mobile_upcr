import { createFileRoute, useRouteContext, useNavigate } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import type { User } from './__root'

interface ScheduleItem {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  date: string
  color: string
}

function TimeManagementPage() {
  const { user } = useRouteContext({ from: '__root__' }) as { user: User | null }
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])

  // Load data from localStorage on component mount (only if user is logged in)
  useEffect(() => {
    if (!user) {
      // Clear any existing items if user is not logged in
      setScheduleItems([])
      return
    }

    const savedItems = localStorage.getItem('timeManagementItems')
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems)
        // Handle both old and new data structures
        if (Array.isArray(parsedItems)) {
          setScheduleItems(parsedItems)
        } else if (parsedItems.daily || parsedItems.weekly || parsedItems.monthly) {
          // Convert old structure to new unified structure
          const unifiedItems = [
            ...(parsedItems.daily || []),
            ...(parsedItems.weekly || []),
            ...(parsedItems.monthly || [])
          ]
          setScheduleItems(unifiedItems)
        }
      } catch (error) {
        console.error('Error loading saved items:', error)
      }
    }
  }, [user])

  // Save data to localStorage whenever scheduleItems changes (only if user is logged in)
  useEffect(() => {
    // Only save if user is logged in and scheduleItems is not empty
    if (user && scheduleItems.length > 0) {
      localStorage.setItem('timeManagementItems', JSON.stringify(scheduleItems))
      
      // Show save notification briefly
      setShowSaveNotification(true)
      const timer = setTimeout(() => {
        setShowSaveNotification(false)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [scheduleItems, user])
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
  const [selectedTask, setSelectedTask] = useState<ScheduleItem | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    color: '#3B82F6'
  })
  const [showSaveNotification, setShowSaveNotification] = useState(false)

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

    // Check if user is logged in before saving task
    if (!user) {
      // Show alert and redirect to login
      alert('Please login to save tasks to your account!')
      navigate({ 
        to: '/login',
        search: { redirect: '/time-management' }
      })
      return
    }

    const item: ScheduleItem = {
      id: Date.now().toString(),
      title: newScheduleItem.title,
      description: newScheduleItem.description,
      startTime: selectedTimeSlot.time,
      endTime: newScheduleItem.endTime,
      date: selectedTimeSlot.date,
      color: newScheduleItem.color
    }

    setScheduleItems(prev => [...prev, item])

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
    // Check if user is logged in before deleting task
    if (!user) {
      alert('Please login to delete tasks!')
      navigate({ 
        to: '/login',
        search: { redirect: '/time-management' }
      })
      return
    }

    setScheduleItems(prev => prev.filter(item => item.id !== itemId))
    setIsTaskModalOpen(false)
    setSelectedTask(null)
  }

  const handleTaskClick = (task: ScheduleItem) => {
    setSelectedTask(task)
    setEditingTask({
      title: task.title,
      description: task.description,
      startTime: task.startTime,
      endTime: task.endTime,
      color: task.color
    })
    setIsTaskModalOpen(true)
  }

  const updateScheduleItem = () => {
    if (!selectedTask || !editingTask.title.trim()) return

    // Check if user is logged in before updating task
    if (!user) {
      alert('Please login to modify tasks!')
      navigate({ 
        to: '/login',
        search: { redirect: '/time-management' }
      })
      return
    }

    setScheduleItems(prev => prev.map(item =>
      item.id === selectedTask.id
        ? {
            ...item,
            title: editingTask.title,
            description: editingTask.description,
            startTime: editingTask.startTime,
            endTime: editingTask.endTime,
            color: editingTask.color
          }
        : item
    ))

    setIsTaskModalOpen(false)
    setSelectedTask(null)
  }

  const closeTaskModal = () => {
    setIsTaskModalOpen(false)
    setSelectedTask(null)
  }

  const getDaysOfWeek = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
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
    // Use local timezone to avoid date shifting issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getScheduleItemsForDate = (date: string) => {
    return scheduleItems.filter(item => item.date === date)
  }

  const getScheduleItemsForDateRange = (startDate: Date, endDate: Date) => {
    const start = formatDate(startDate)
    const end = formatDate(endDate)
    return scheduleItems.filter(item => item.date >= start && item.date <= end)
  }

  const getScheduleItemsForWeek = (date: Date) => {
    const weekDays = getDaysOfWeek()
    const startDate = weekDays[0]
    const endDate = weekDays[6]
    return getScheduleItemsForDateRange(startDate, endDate)
  }

  const getScheduleItemsForMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    return getScheduleItemsForDateRange(startDate, endDate)
  }

  const handleTimeSlotClick = (date: string, time: string) => {
    setSelectedTimeSlot({ date, time })
    setNewScheduleItem(prev => ({ ...prev, startTime: time }))
  }

  const renderDailyView = () => {
    const today = formatDate(currentDate)
    const todayItems = getScheduleItemsForDate(today)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
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
              className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
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

        <div className="grid grid-cols-1 gap-1 border rounded-lg max-h-[calc(100vh-300px)] overflow-y-auto">
          {timeSlots.map(time => {
            const itemsAtTime = todayItems.filter(item => item.startTime === time)
            return (
              <div
                key={time}
                className={`flex items-center gap-4 p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedTimeSlot?.time === time && selectedTimeSlot?.date === today 
                    ? 'bg-blue-50 border-blue-200' 
                    : ''
                }`}
                onClick={() => handleTimeSlotClick(today, time)}
              >
                <div className="w-20 text-sm font-mono text-gray-500 font-medium">{time}</div>
                <div className="flex-1 min-h-[50px] flex items-center gap-2">
                  {itemsAtTime.map(item => (
                    <div
                      key={item.id}
                      className="flex-1 p-3 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: item.color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTaskClick(item)
                      }}
                    >
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm opacity-90">{item.startTime} - {item.endTime}</div>
                      {item.description && (
                        <div className="text-xs opacity-75 mt-1 truncate">{item.description}</div>
                      )}
                      <div className="text-xs opacity-75 mt-1">Click to view details</div>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Week of {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
              className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
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
            <div className="p-3 font-medium text-sm text-gray-600 border-r">Time</div>
            {weekDays.map(day => (
              <div key={day.toISOString()} className="p-3 font-medium text-sm text-gray-600 text-center border-r last:border-r-0">
                <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="text-xs text-gray-500">{day.getDate()}</div>
              </div>
            ))}
          </div>
          
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="p-3 text-sm font-mono text-gray-500 border-r bg-gray-50 font-medium">
                  {time}
                </div>
                {weekDays.map(day => {
                  const dateStr = formatDate(day)
                  const itemsAtTime = getScheduleItemsForDate(dateStr).filter(item => item.startTime === time)
                  return (
                    <div
                      key={`${dateStr}-${time}`}
                      className={`p-2 min-h-[60px] border-r last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedTimeSlot?.date === dateStr && selectedTimeSlot?.time === time 
                          ? 'bg-blue-50' 
                          : ''
                      }`}
                      onClick={() => handleTimeSlotClick(dateStr, time)}
                    >
                      {itemsAtTime.map(item => (
                        <div
                          key={item.id}
                          className="p-2 rounded text-xs text-white mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: item.color }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTaskClick(item)
                          }}
                        >
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-xs opacity-90">{item.startTime}-{item.endTime}</div>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
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
              className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
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
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="p-4 font-medium text-sm text-gray-600 text-center border-r last:border-r-0">
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
                  className={`min-h-[140px] p-3 border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
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
                        className="p-1 rounded text-xs text-white cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: item.color }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTaskClick(item)
                        }}
                      >
                        <div className="truncate font-medium">{item.title}</div>
                        <div className="truncate text-xs opacity-90">{item.startTime}</div>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Time Management</h1>
              <p className="text-gray-600">Schedule your tasks and manage your time effectively</p>
              {!user && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-700">
                    <button 
                      onClick={() => navigate({ to: '/login', search: { redirect: '/time-management' } })}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Login
                    </button> to save your tasks permanently
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white rounded-lg p-1 shadow-sm">
            {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-6 text-sm font-medium transition-colors relative rounded-lg ${
                  activeTab === tab
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Schedule
                {(() => {
                  let count = 0
                  if (tab === 'daily') {
                    count = getScheduleItemsForDate(formatDate(currentDate)).length
                  } else if (tab === 'weekly') {
                    count = getScheduleItemsForWeek(currentDate).length
                  } else if (tab === 'monthly') {
                    count = getScheduleItemsForMonth(currentDate).length
                  }
                  return count > 0 && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      activeTab === tab
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )
                })()}
              </button>
            ))}
          </div>
        </div>

        {/* Save Notification */}
        {showSaveNotification && (
          <div className="fixed top-24 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-pulse">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Tasks saved automatically
          </div>
        )}

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
            {activeTab === 'daily' && renderDailyView()}
            {activeTab === 'weekly' && renderWeeklyView()}
            {activeTab === 'monthly' && renderMonthlyView()}
          </div>

          {/* Sidebar for adding items */}
          {selectedTimeSlot && (
            <div className="w-80 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-900">
                Add Schedule Item
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time
                  </label>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                    {new Date(selectedTimeSlot.date).toLocaleDateString()} at {selectedTimeSlot.time}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newScheduleItem.title}
                    onChange={(e) => setNewScheduleItem(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Meeting, Task, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newScheduleItem.description}
                    onChange={(e) => setNewScheduleItem(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <select
                    value={newScheduleItem.endTime}
                    onChange={(e) => setNewScheduleItem(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Category
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewScheduleItem(prev => ({ ...prev, color }))}
                        className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                          newScheduleItem.color === color ? 'border-gray-400 ring-2 ring-gray-300' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={addScheduleItem}
                    disabled={!newScheduleItem.title.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => setSelectedTimeSlot(null)}
                    className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task Details Modal */}
        {isTaskModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: selectedTask.color }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedTask.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeTaskModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Task Info Display */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Start Time:</span>
                        <div className="mt-1 font-mono text-lg">{selectedTask.startTime}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">End Time:</span>
                        <div className="mt-1 font-mono text-lg">{selectedTask.endTime}</div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Title
                      </label>
                      <input
                        type="text"
                        value={editingTask.title}
                        onChange={(e) => setEditingTask(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        placeholder="Task title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingTask.description}
                        onChange={(e) => setEditingTask(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                        rows={4}
                        placeholder="Task description..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <select
                          value={editingTask.startTime}
                          onChange={(e) => setEditingTask(prev => ({ ...prev, startTime: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <select
                          value={editingTask.endTime}
                          onChange={(e) => setEditingTask(prev => ({ ...prev, endTime: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Category
                      </label>
                      <div className="grid grid-cols-8 gap-2">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            onClick={() => setEditingTask(prev => ({ ...prev, color }))}
                            className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                              editingTask.color === color ? 'border-gray-400 ring-2 ring-gray-300' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-3">
                  <button
                    onClick={updateScheduleItem}
                    disabled={!editingTask.title.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Update Task
                  </button>
                  <button
                    onClick={() => deleteScheduleItem(selectedTask.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={closeTaskModal}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/time-management')({
  component: TimeManagementPage,
}) 