import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getProperty } from '../services/propertyService'
import { getStaff } from '../services/staffService'
import { 
  HomeModernIcon, 
  UsersIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const PropertyAdminDashboard = () => {
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.property_id) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [propertyData, staffData] = await Promise.all([
        getProperty(user.property_id),
        getStaff({ property_id: user.property_id })
      ])
      setProperty(propertyData)
      setStaff(staffData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No property assigned to you.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Property Admin Dashboard</h1>
        <p className="mt-2">Welcome, {user?.name}!</p>
        <p className="text-sm opacity-90 mt-1">Managing: {property.property_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Property Name</p>
              <p className="text-xl font-bold mt-2">{property.property_name}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <HomeModernIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Staff Count</p>
              <p className="text-3xl font-bold mt-2">{staff.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Floors</p>
              <p className="text-3xl font-bold mt-2">{property.total_floors || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Property Details</h3>
          <Link to="/profile" className="text-primary-600 text-sm hover:underline">Edit Profile</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Property Code</p>
            <p className="font-medium">{property.property_code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`px-2 py-1 text-xs rounded-full ${property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {property.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Main Branch</p>
            <p>{property.is_main_branch ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">GST Number</p>
            <p>{property.gst_number || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Address</p>
            <p>{property.address}, {property.city}, {property.state} - {property.pincode}</p>
            <p>{property.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p>{property.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p>{property.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      {staff.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Staff Members</h3>
            <Link to="/staff" className="btn-primary text-sm py-1 px-3">Manage Staff</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.is_property_admin ? 'Property Admin' : 'Staff'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Link to="/staff" className="btn-primary text-center">Add Staff Member</Link>
        </div>
      </div>
    </div>
  )
}

export default PropertyAdminDashboard