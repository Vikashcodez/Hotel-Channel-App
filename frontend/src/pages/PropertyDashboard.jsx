import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getProperty } from '../services/propertyService'
import { HomeModernIcon, UsersIcon, ChartBarIcon, StarIcon } from '@heroicons/react/24/outline'

const PropertyDashboard = () => {
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.property_id) {
      fetchProperty()
    }
  }, [user])

  const fetchProperty = async () => {
    try {
      const data = await getProperty(user.property_id)
      setProperty(data)
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading property data...</div>
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No property assigned to you yet.</p>
      </div>
    )
  }

  const stats = [
    { name: 'Property Name', value: property.name, icon: HomeModernIcon },
    { name: 'Total Units', value: property.total_units || 0, icon: ChartBarIcon },
    { name: 'Priority Level', value: property.priority, icon: StarIcon },
    { name: 'Users Assigned', value: property.users_count || 0, icon: UsersIcon },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">{property.name}</h1>
        <p className="mt-2 opacity-90">{property.property_type || 'Property Dashboard'}</p>
        <p className="mt-1 text-sm opacity-75">{property.address}, {property.city}, {property.country}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.name}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <stat.icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Property Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Property Type:</span>
              <span className="font-medium">{property.property_type || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{property.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{property.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${property.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {property.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {property.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium mt-1">{property.address}</p>
            <p className="text-gray-600">{property.city}, {property.state} {property.zip_code}</p>
            <p className="text-gray-600">{property.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Contact Details</p>
            {property.phone && <p className="mt-1">📞 {property.phone}</p>}
            {property.email && <p>✉️ {property.email}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDashboard