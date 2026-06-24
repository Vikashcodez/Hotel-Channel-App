import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getHotels, deleteHotel } from '../services/hotelService'
import HotelList from '../components/Hotels/HotelList'
import HotelForm from '../components/Hotels/HotelForm'
import { PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Hotels = () => {
  const { isSuperAdmin } = useAuth()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHotel, setEditingHotel] = useState(null)

  useEffect(() => {
    if (isSuperAdmin) {
      fetchHotels()
    }
  }, [isSuperAdmin])

  const fetchHotels = async () => {
    try {
      const data = await getHotels()
      setHotels(data)
    } catch (error) {
      toast.error('Failed to fetch hotels')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await deleteHotel(id)
        toast.success('Hotel deleted successfully')
        fetchHotels()
      } catch (error) {
        toast.error('Failed to delete hotel')
      }
    }
  }

  const handleEdit = (hotel) => {
    setEditingHotel(hotel)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingHotel(null)
    fetchHotels()
  }

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">You don't have permission to view this page.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
          <p className="text-gray-600 mt-1">Manage hotels in the system</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Hotel</span>
        </button>
      </div>

      <HotelList
        hotels={hotels}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <HotelForm
          hotel={editingHotel}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

export default Hotels