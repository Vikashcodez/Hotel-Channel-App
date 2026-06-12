import React, { useState, useEffect } from 'react'
import { createRole, updateRole } from '../../services/roleService'
import { useAuth } from '../../contexts/AuthContext'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const RoleForm = ({ role, onClose }) => {
  const { user, isHotelAdmin, isSuperAdmin } = useAuth()
  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    hotel_id: '',
    status: 'ACTIVE'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (role) {
      setFormData({
        role_name: role.role_name,
        description: role.description || '',
        hotel_id: role.hotel_id,
        status: role.status
      })
    } else if (isHotelAdmin && user?.hotel_id) {
      setFormData(prev => ({ ...prev, hotel_id: user.hotel_id }))
    }
  }, [role, isHotelAdmin, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (role) {
        await updateRole(role.id, formData)
        toast.success('Role updated successfully')
      } else {
        await createRole(formData)
        toast.success('Role created successfully')
      }
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {role ? 'Edit Role' : 'Add New Role'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
            <input
              type="text"
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              required
              placeholder="e.g., Front Desk Manager"
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe the role responsibilities..."
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : (role ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RoleForm