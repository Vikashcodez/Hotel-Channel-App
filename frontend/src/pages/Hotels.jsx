import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getHotels } from '../services/hotelService'
import HotelList from '../components/Hotels/HotelList'
import { PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Hotels = () => {
  const { isSuperAdmin, isHotelAdmin } = useAuth()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
        <p className="text-gray-600 mt-1">View all hotels in the system</p>
        <p className="text-sm text-blue-600 mt-1">Note: Super Admin has read-only access to hotels.</p>
      </div>

      <HotelList
        hotels={hotels}
        onEdit={null}
        onDelete={null}
        readOnly={true}
      />
    </div>
  )
}

export default Hotels