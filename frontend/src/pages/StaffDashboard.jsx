import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, HomeModernIcon } from '@heroicons/react/24/outline'

const StaffDashboard = () => {
  const { user } = useAuth()

  const infoCards = [
    { label: 'Full Name', value: user?.name, icon: UserCircleIcon, color: 'bg-blue-100 text-blue-600' },
    { label: 'Email', value: user?.email, icon: EnvelopeIcon, color: 'bg-green-100 text-green-600' },
    { label: 'Phone', value: user?.phone || 'Not provided', icon: PhoneIcon, color: 'bg-purple-100 text-purple-600' },
    { label: 'Employee Code', value: user?.employee_code || 'N/A', icon: BuildingOfficeIcon, color: 'bg-yellow-100 text-yellow-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <p className="mt-2">Welcome, {user?.name}!</p>
        <p className="text-sm opacity-90 mt-1">Employee Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {infoCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center space-x-3">
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Hotel Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Hotel Name:</span>
              <span className="font-medium">{user?.hotel_name || 'N/A'}</span>
            </div>
            {user?.property_name && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Property:</span>
                <span className="font-medium">{user.property_name}</span>
              </div>
            )}
            {user?.role_name && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">{user.role_name}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${user?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user?.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Account Created:</span>
              <span className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">
                {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => window.location.href = '/profile'}
            className="btn-primary text-center"
          >
            Update Profile
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token')
              window.location.href = '/login'
            }}
            className="btn-secondary text-center"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard