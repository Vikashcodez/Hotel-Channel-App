import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getProperties, deleteProperty } from '../services/propertyService'
import { getHotels } from '../services/hotelService'
import PropertyList from '../components/Properties/PropertyList'
import PropertyForm from '../components/Properties/PropertyForm'
import { PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Properties = () => {
  const { user, isSuperAdmin, isHotelAdmin, isPropertyAdmin } = useAuth()
  const [properties, setProperties] = useState([])
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [filterHotelId, setFilterHotelId] = useState('')

  useEffect(() => {
    fetchData()
  }, [filterHotelId])

  const fetchData = async () => {
    try {
      let propertiesData, hotelsData = []
      
      if (isSuperAdmin) {
        propertiesData = await getProperties(filterHotelId || null)
        hotelsData = await getHotels()
      } else if (isHotelAdmin && user?.hotel_id) {
        propertiesData = await getProperties(user.hotel_id)
      } else if (isPropertyAdmin && user?.property_id) {
        propertiesData = await getProperties()
        propertiesData = propertiesData.filter(p => p.id === user.property_id)
      } else {
        propertiesData = await getProperties()
      }
      
      setProperties(propertiesData)
      setHotels(hotelsData)
    } catch (error) {
      toast.error('Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id)
        toast.success('Property deleted successfully')
        fetchData()
      } catch (error) {
        toast.error('Failed to delete property')
      }
    }
  }

  const handleEdit = (property) => {
    setEditingProperty(property)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProperty(null)
    fetchData()
  }

  const canAddProperty = isSuperAdmin || isHotelAdmin
  const canEditProperty = isSuperAdmin || isHotelAdmin

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-1">
            {isPropertyAdmin ? 'View your assigned property' : 'Manage your property portfolio'}
          </p>
        </div>
        {canAddProperty && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Property</span>
          </button>
        )}
      </div>

      {isSuperAdmin && hotels.length > 0 && (
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Hotel</label>
          <select
            value={filterHotelId}
            onChange={(e) => setFilterHotelId(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Hotels</option>
            {hotels.map(hotel => (
              <option key={hotel.id} value={hotel.id}>{hotel.hotel_name}</option>
            ))}
          </select>
        </div>
      )}

      <PropertyList
        properties={properties}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canEditProperty}
      />

      {showForm && (
        <PropertyForm
          property={editingProperty}
          hotels={hotels}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

export default Properties