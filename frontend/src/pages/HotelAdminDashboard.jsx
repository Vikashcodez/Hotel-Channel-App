import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getProperties } from '../services/propertyService'
import { getStaff } from '../services/staffService'
import { getRoles } from '../services/roleService'
import { 
  HomeModernIcon, 
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

const HotelAdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    properties: 0,
    staff: 0,
    roles: 0,
    activeProperties: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentProperties, setRecentProperties] = useState([])
  const [recentStaff, setRecentStaff] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [properties, staff, roles] = await Promise.all([
        getProperties(),
        getStaff(),
        getRoles()
      ])
      setStats({
        properties: properties.length,
        staff: staff.length,
        roles: roles.length,
        activeProperties: properties.filter(p => p.status === 'ACTIVE').length
      })
      setRecentProperties(properties.slice(0, 5))
      setRecentStaff(staff.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { name: 'Properties', value: stats.properties, icon: HomeModernIcon, color: 'bg-green-500', link: '/properties' },
    { name: 'Staff Members', value: stats.staff, icon: UsersIcon, color: 'bg-purple-500', link: '/staff' },
    { name: 'Roles', value: stats.roles, icon: UserGroupIcon, color: 'bg-blue-500', link: '/roles' },
    { name: 'Active Properties', value: stats.activeProperties, icon: ChartBarIcon, color: 'bg-yellow-500', link: '/properties' },
  ]

  const chartData = recentProperties.map((prop) => ({
    name: prop.property_name?.substring(0, 10),
    floors: prop.total_floors || 0,
    staff: prop.staff_count || 0
  }))

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hotel Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome, {user?.name}! Manage your hotel {user?.hotel_name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link to={stat.link} key={stat.name} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.name}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Property Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="floors" fill="#3B82F6" name="Total Floors" />
            <Bar dataKey="staff" fill="#10B981" name="Staff Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recentProperties.length > 0 && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Properties</h3>
              <Link to="/properties" className="text-primary-600 text-sm hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {recentProperties.map((property) => (
                <div key={property.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{property.property_name}</p>
                    <p className="text-sm text-gray-600">{property.property_code}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {property.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentStaff.length > 0 && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Staff</h3>
              <Link to="/staff" className="text-primary-600 text-sm hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {recentStaff.map((staff) => (
                <div key={staff.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{staff.name}</p>
                    <p className="text-sm text-gray-600">{staff.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${staff.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {staff.is_hotel_admin ? 'Hotel Admin' : staff.is_property_admin ? 'Property Admin' : 'Staff'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/properties" className="btn-primary text-center">Add New Property</Link>
          <Link to="/staff" className="btn-primary text-center">Add Staff Member</Link>
          <Link to="/roles" className="btn-primary text-center">Create Role</Link>
        </div>
      </div>
    </div>
  )
}

export default HotelAdminDashboard