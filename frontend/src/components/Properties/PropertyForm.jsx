import React, { useState, useEffect } from 'react'
import { createProperty, updateProperty } from '../../services/propertyService'
import { useAuth } from '../../contexts/AuthContext'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const PropertyForm = ({ property, hotels, onClose }) => {
  const { user, isHotelAdmin, isSuperAdmin } = useAuth()
  const [formData, setFormData] = useState({
    property_name: '',
    property_code: '',
    is_main_branch: false,
    gst_number: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    total_floors: 0,
    hotel_id: '',
    status: 'ACTIVE'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (property) {
      setFormData({
        property_name: property.property_name,
        property_code: property.property_code,
        is_main_branch: property.is_main_branch || false,
        gst_number: property.gst_number || '',
        email: property.email || '',
        phone: property.phone || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        country: property.country || '',
        pincode: property.pincode || '',
        total_floors: property.total_floors || 0,
        hotel_id: property.hotel_id,
        status: property.status
      })
    } else if (isHotelAdmin && user?.hotel_id) {
      setFormData(prev => ({ ...prev, hotel_id: user.hotel_id }))
    }
  }, [property, isHotelAdmin, user])

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
      if (property) {
        await updateProperty(property.id, formData)
        toast.success('Property updated successfully')
      } else {
        await createProperty(formData)
        toast.success('Property created successfully')
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
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSuperAdmin && hotels && hotels.length > 0 && (
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
                {hotels.map(hotel => (
                  <option key={hotel.id} value={hotel.id}>{hotel.hotel_name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
              <input
                type="text"
                name="property_name"
                value={formData.property_name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Code *</label>
              <input
                type="text"
                name="property_code"
                value={formData.property_code}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  name="is_main_branch"
                  checked={formData.is_main_branch}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Main Branch</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
              <input
                type="number"
                name="total_floors"
                value={formData.total_floors}
                onChange={handleChange}
                min="0"
                className="input-field"
              />
            </div>
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
              {loading ? 'Saving...' : (property ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PropertyForm