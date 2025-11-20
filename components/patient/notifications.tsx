'use client'

import { Bell, Calendar, MessageSquare, AlertCircle, CheckCircle, Clock, Menu } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PatientNotificationsProps {
  onMobileMenuToggle?: () => void
}

export default function PatientNotifications({ onMobileMenuToggle }: PatientNotificationsProps = {}) {
  const notifications = [
    {
      id: 1,
      type: 'appointment',
      icon: Calendar,
      title: 'Appointment Reminder',
      message: 'Your appointment with Dr. Sarah Johnson is tomorrow at 10:00 AM',
      time: '2 hours ago',
      read: false,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      id: 2,
      type: 'message',
      icon: MessageSquare,
      title: 'New Message',
      message: 'Dr. Chen responded to your query about medication',
      time: '5 hours ago',
      read: false,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      id: 3,
      type: 'alert',
      icon: AlertCircle,
      title: 'Test Results Available',
      message: 'Your blood test results are now available to view',
      time: '1 day ago',
      read: false,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      id: 4,
      type: 'success',
      icon: CheckCircle,
      title: 'Appointment Confirmed',
      message: 'Your appointment for Nov 25 has been confirmed',
      time: '2 days ago',
      read: true,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      id: 5,
      type: 'reminder',
      icon: Clock,
      title: 'Medication Reminder',
      message: 'Time to take your evening medication',
      time: '3 days ago',
      read: true,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ]

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-helix-primary">Notifications</h1>
        <button
          onClick={onMobileMenuToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-helix-primary text-white px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Notifications</h1>
            <p className="text-sm text-white/80">Stay updated on your health journey</p>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/20">
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-3">
        {notifications.map((notification) => {
          const Icon = notification.icon
          return (
            <Card
              key={notification.id}
              className={`${notification.read ? 'opacity-60' : 'border-2 border-helix-primary/20'} hover:shadow-md transition-shadow cursor-pointer`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 ${notification.bg} rounded-full flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${notification.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-slate-500">{notification.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {notifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No notifications yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

