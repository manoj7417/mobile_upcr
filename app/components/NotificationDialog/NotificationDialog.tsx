import React, { useState, useEffect } from 'react'
import { X, Bell, FileText, Calendar, MapPin, DollarSign, User, Phone, Mail, Building, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getUserNotifications, markNotificationAsRead, getTenderForNotification } from '../../routes/api/notifications'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  entity_id: number
  is_read: boolean
  created_at: string
}

interface Tender {
  id: number
  upc_ref: string
  engineering_category: string
  specialization: string
  tender_name: string
  location: string
  scope: string
  estimated_value: string
  collection_date: string
  submission_date: string
  contact_name: string
  contact_number: string
  contact_email: string
  address: string
  status: string
  created_at: string
}

interface NotificationDialogProps {
  isOpen: boolean
  onClose: () => void
  onNotificationRead: () => void
}

export function NotificationDialog({ isOpen, onClose, onNotificationRead }: NotificationDialogProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTenderDetails, setShowTenderDetails] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const result = await getUserNotifications()
      if (result.success) {
        setNotifications(result.notifications || [])
      } else {
        toast.error('Failed to load notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read if not already read
      if (!notification.is_read) {
        const markResult = await markNotificationAsRead({ 
          data: { notificationId: notification.id } 
        })
        if (markResult.success) {
          // Update local state
          setNotifications(prev => 
            prev.map(n => 
              n.id === notification.id ? { ...n, is_read: true } : n
            )
          )
          // Notify parent to refresh notification count
          onNotificationRead()
        }
      }

      // If it's a tender notification, show tender details
      if (notification.type === 'tender_post') {
        const tenderResult = await getTenderForNotification({ 
          data: { tenderId: notification.entity_id } 
        })
        if (tenderResult.success) {
          setSelectedTender(tenderResult.tender)
          setShowTenderDetails(true)
        } else {
          toast.error('Failed to load tender details')
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error)
      toast.error('Failed to process notification')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount))
  }

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {showTenderDetails ? 'Tender Details' : 'Notifications'}
            </h2>
          </div>
          <button
            onClick={() => {
              if (showTenderDetails) {
                setShowTenderDetails(false)
                setSelectedTender(null)
              } else {
                onClose()
              }
            }}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-5rem)] overflow-y-auto">
          {showTenderDetails && selectedTender ? (
            /* Tender Details View */
            <div className="space-y-6">
              {/* Tender Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedTender.tender_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {selectedTender.engineering_category}
                      </span>
                      <span className="font-medium">UPC: {selectedTender.upc_ref}</span>
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        selectedTender.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedTender.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Posted</p>
                    <p className="font-medium">{formatDate(selectedTender.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Tender Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Information */}
                <div className="bg-white border rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Project Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Specialization</label>
                      <p className="text-gray-900">{selectedTender.specialization}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {selectedTender.location}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Estimated Value</label>
                      <p className="text-gray-900 flex items-center font-semibold text-green-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatCurrency(selectedTender.estimated_value)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white border rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Important Dates
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Collection Deadline</label>
                      <p className="text-gray-900">{formatDate(selectedTender.collection_date)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Submission Deadline</label>
                      <p className="text-gray-900 font-semibold text-red-600">
                        {formatDate(selectedTender.submission_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white border rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Contact Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Person</label>
                      <p className="text-gray-900">{selectedTender.contact_name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-gray-400" />
                        {selectedTender.contact_number}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        {selectedTender.contact_email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white border rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                    Address
                  </h4>
                  <p className="text-gray-900">{selectedTender.address}</p>
                </div>
              </div>

              {/* Scope */}
              <div className="bg-white border rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Scope</h4>
                <p className="text-gray-700 leading-relaxed">{selectedTender.scope}</p>
              </div>

              {/* Back Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowTenderDetails(false)
                    setSelectedTender(null)
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Back to Notifications
                </button>
              </div>
            </div>
          ) : (
            /* Notifications List View */
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading notifications...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No notifications yet</p>
                  <p className="text-gray-400">You'll see notifications here when new tenders are posted</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                        notification.is_read
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`p-2 rounded-lg ${
                              notification.type === 'tender_post' 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                            {notification.is_read && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-gray-700 mb-3">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {getRelativeTime(notification.created_at)}
                            </span>
                            {notification.type === 'tender_post' && (
                              <span className="text-blue-600 font-medium">
                                Click to view tender details →
                              </span>
                            )}
                          </div>
                        </div>
                        {!notification.is_read && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 