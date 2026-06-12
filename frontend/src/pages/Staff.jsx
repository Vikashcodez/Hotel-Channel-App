import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getStaff, deleteStaff, resetStaffPassword } from '../services/staffService'
import StaffList from '../components/Staff/StaffList'
import StaffForm from '../components/Staff/StaffForm'
import { PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Staff = () => {
  const { user, isSuperAdmin, isHotelAdmin, isPropertyAdmin } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const params = {}
      if (isPropertyAdmin && user?.property_id) {
        params.property_id = user.property_id
      } else if (isHotelAdmin && user?.hotel_id) {
        params.hotel_id = user.hotel_id
      }
      const data = await getStaff(params)
      setStaff(data)
    } catch (error) {
      toast.error('Failed to fetch staff')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id)
        toast.success('Staff member deleted successfully')
        fetchStaff()
      } catch (error) {
        toast.error('Failed to delete staff member')
      }
    }
  }

  const handleResetPassword = async (id, name) => {
    if (window.confirm(`Reset password for ${name} to default "welcome"?`)) {
      try {
        await resetStaffPassword(id)
        toast.success(`Password reset to "welcome" for ${name}`)
      } catch (error) {
        toast.error('Failed to reset password')
      }
    }
  }

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingStaff(null)
    fetchStaff()
  }

  const canAddStaff = isSuperAdmin || isHotelAdmin || isPropertyAdmin

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">
            {isPropertyAdmin ? 'Manage staff for your property' : 'Manage hotel staff'}
          </p>
        </div>
        {canAddStaff && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Staff</span>
          </button>
        )}
      </div>

      <StaffList
        staff={staff}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        canEdit={canAddStaff}
      />

      {showForm && (
        <StaffForm
          staff={editingStaff}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

export default Staff