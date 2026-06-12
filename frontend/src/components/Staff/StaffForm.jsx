import React, { useState, useEffect } from 'react'
import { createStaff, createHotelAdmin, createPropertyAdmin, updateStaff } from '../../services/staffService'
import { getProperties } from '../../services/propertyService'
import { getRoles } from '../../services/roleService'
import { useAuth } from '../../contexts/AuthContext'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const StaffForm = ({ staff, onClose }) => {
  const { user, isSuperAdmin, isHotelAdmin, isPropertyAdmin } = useAuth()
  const [properties, setProperties] = useState([])
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employee_code: '',
    hotel_id: '',
    property_id: '',
    role_id: '',
    is_hotel_admin: false,
    is_property_admin: false,
    status: 'ACTIVE'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOptions()
    if (staff) {
      setFormData({
        name: staff.name,
        email: staff.email,
        phone: staff.phone || '',
        employee_code: staff.employee_code || '',
        hotel_id: staff.hotel_id,
        property_id: staff.property_id || '',
        role_id: staff.role_id || '',
        is_hotel_admin: staff.is_hotel_admin,
        is_property_admin: staff.is_property_admin,
        status: staff.status
      })
    } else if (isHotelAdmin && user?.hotel_id) {
      setFormData(prev => ({ ...prev, hotel_id: user.hotel_id }))
    } else if (isPropertyAdmin && user?.property_id) {
      setFormData(prev => ({ ...prev, property_id: user.property_id, hotel_id: user.hotel_id }))
    }
  }, [staff, isHotelAdmin, isPropertyAdmin, user])

  const fetchOptions = async () => {
    try {
      if (isHotelAdmin && user?.hotel_id) {
        const [propertiesData, rolesData] = await Promise.all([
          getProperties(user.hotel_id),
          getRoles(user.hotel_id)
        ])
        setProperties(propertiesData)
        setRoles(rolesData)
      } else if (isSuperAdmin && formData.hotel_id) {
        const [propertiesData, rolesData] = await Promise.all([
          getProperties(formData.hotel_id),
          getRoles(formData.hotel_id)
        ])
        setProperties(propertiesData)
        setRoles(rolesData)
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  useEffect(() => {
    if (formData.hotel_id && isSuperAdmin) {
      fetchOptions()
    }
  }, [formData.hotel_id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const submitData = { ...formData }
      if (!submitData.property_id) delete submitData.property_id
      if (!submitData.role_id) delete submitData.role_id
      if (!submitData.employee_code) delete submitData.employee_code
      
      if (staff) {
        await updateStaff(staff.id, submitData)
        toast.success('Staff member updated successfully')
      } else {
        if (submitData.is_hotel_admin && isSuperAdmin) {
          await createHotelAdmin(submitData)
          toast.success('Hotel admin created successfully')
        } else if (submitData.is_property_admin && (isSuperAdmin || isHotelAdmin)) {
          await createPropertyAdmin(submitData)
          toast.success('Property admin created successfully')
        } else {
          await createStaff(submitData)
          toast.success('Staff member created successfully')
        }
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
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSuperAdmin && !staff && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotel *</label>
              <select
                name="hotel_id"
                value={formData.hotel_id}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select Hotel</option>
                {/* Hotels list would be passed as prop */}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
            <input
              type="text"
              name="employee_code"
              value={formData.employee_code}
              onChange={handleChange}
              placeholder="Auto-generated if left empty"
              className="input-field"
            />
          </div>
          
          {(isHotelAdmin || isSuperAdmin) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Property</label>
                <select
                  name="property_id"
                  value={formData.property_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">None</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.property_name} ({property.property_code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">None</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          {isSuperAdmin && !staff && (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_hotel_admin"
                  checked={formData.is_hotel_admin}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Make this user a Hotel Admin</span>
              </label>
            </div>
          )}
          
          {(isSuperAdmin || isHotelAdmin) && !staff && (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_property_admin"
                  checked={formData.is_property_admin}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Make this user a Property Admin</span>
              </label>
            </div>
          )}
          
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
          
          {!staff && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                Default password will be: <strong>welcome</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                User can change password after first login.
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : (staff ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StaffForm