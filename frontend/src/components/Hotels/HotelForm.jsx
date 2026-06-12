import React, { useState, useEffect } from 'react'
import { createHotel, updateHotel } from '../../services/hotelService'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const HotelForm = ({ hotel, onClose }) => {
  const [formData, setFormData] = useState({
    hotel_name: '',
    hotel_code: '',
    email: '',
    phone: '',
    logo: '',
    status: 'ACTIVE'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (hotel) {
      setFormData({
        hotel_name: hotel.hotel_name,
        hotel_code: hotel.hotel_code,
        email: hotel.email || '',
        phone: hotel.phone || '',
        logo: hotel.logo || '',
        status: hotel.status
      })
    }
  }, [hotel])

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
      if (hotel) {
        await updateHotel(hotel.id, formData)
        toast.success('Hotel updated successfully')
      } else {
        await createHotel(formData)
        toast.success('Hotel created successfully')
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
            {hotel ? 'Edit Hotel' : 'Add New Hotel'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
            <input
              type="text"
              name="hotel_name"
              value={formData.hotel_name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter hotel name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Code *</label>
            <input
              type="text"
              name="hotel_code"
              value={formData.hotel_code}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Unique hotel code"
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
              placeholder="contact@hotel.com"
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
              placeholder="Phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="text"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="input-field"
              placeholder="Logo image URL"
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
              {loading ? 'Saving...' : (hotel ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HotelForm