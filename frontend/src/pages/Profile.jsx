import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { changePassword } from '../services/auth'
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, isSuperAdmin } = useAuth()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      await changePassword(passwordData.old_password, passwordData.new_password)
      toast.success('Password changed successfully')
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
      setShowPasswordForm(false)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View and manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={user?.phone || 'Not provided'}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                <input
                  type="text"
                  value={user?.employee_code || 'N/A'}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
              {user?.hotel_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
                  <input
                    type="text"
                    value={user.hotel_name}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
              )}
              {user?.property_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                  <input
                    type="text"
                    value={user.property_name}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
              )}
              {user?.role_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={user.role_name}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <input
                  type="text"
                  value={user?.status || 'ACTIVE'}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                <input
                  type="text"
                  value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="text-center mb-6">
              <div className="bg-primary-100 p-4 rounded-full inline-block mb-3">
                <UserCircleIcon className="h-16 w-16 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg">{user?.name}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {user?.is_super_admin ? 'Super Admin' : 
                 user?.is_hotel_admin ? 'Hotel Admin' : 
                 user?.is_property_admin ? 'Property Admin' : 'Staff'}
              </p>
            </div>

            {!isSuperAdmin && (
              <>
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <KeyIcon className="h-5 w-5" />
                    <span>Change Password</span>
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        required
                        className="input-field"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button type="submit" disabled={loading} className="btn-primary flex-1">
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {isSuperAdmin && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-yellow-800">
                  Super admin password can only be changed in the .env file.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile