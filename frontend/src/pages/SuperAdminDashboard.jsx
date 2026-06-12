import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getHotels } from '../services/hotelService'
import { getProperties } from '../services/propertyService'
import { getStaff } from '../services/staffService'
import { 
  BuildingOfficeIcon, 
  HomeModernIcon, 
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const SuperAdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    hotels: 0,
    properties: 0,
    staff: 0,
    activeProperties: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentHotels, setRecentHotels] = useState([])
  const [recentProperties, setRecentProperties] = useState([])
  const [showHotelAdminForm, setShowHotelAdminForm] = useState(false)
  const [hotelAdminData, setHotelAdminData] = useState({
    name: '',
    email: '',
    phone: '',
    hotel_id: ''
  })
  const [hotels, setHotels] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchHotels()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [hotels, properties, staff] = await Promise.all([
        getHotels(),
        getProperties(),
        getStaff()
      ])
      setStats({
        hotels: hotels.length,
        properties: properties.length,
        staff: staff.length,
        activeProperties: properties.filter(p => p.status === 'ACTIVE').length
      })
      setRecentHotels(hotels.slice(0, 5))
      setRecentProperties(properties.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHotels = async () => {
    try {
      const data = await getHotels()
      setHotels(data)
    } catch (error) {
      toast.error('Failed to fetch hotels')
    }
  }

  const handleCreateHotelAdmin = async (e) => {
    e.preventDefault()
    try {
      const { createHotelAdmin } = await import('../services/staffService')
      await createHotelAdmin(hotelAdminData)
      toast.success('Hotel admin created successfully')
      setShowHotelAdminForm(false)
      setHotelAdminData({ name: '', email: '', phone: '', hotel_id: '' })
      fetchDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create hotel admin')
    }
  }

  const statCards = [
    { name: 'Total Hotels', value: stats.hotels, icon: BuildingOfficeIcon, color: 'bg-blue-500', link: '/hotels' },
    { name: 'Total Properties', value: stats.properties, icon: HomeModernIcon, color: 'bg-green-500', link: '/properties' },
    { name: 'Total Staff', value: stats.staff, icon: UsersIcon, color: 'bg-purple-500', link: '/staff' },
    { name: 'Active Properties', value: stats.activeProperties, icon: ChartBarIcon, color: 'bg-yellow-500', link: '/properties' },
  ]

  const chartData = recentProperties.map((prop) => ({
    name: prop.property_name?.substring(0, 10),
    floors: prop.total_floors || 0
  }))

  const pieData = [
    { name: 'Active', value: stats.activeProperties, color: '#10B981' },
    { name: 'Inactive', value: stats.properties - stats.activeProperties, color: '#EF4444' }
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome, {user?.name}! You have full system viewing access.</p>
        <p className="text-sm text-blue-600 mt-1">Note: You can only create Hotel Admins. Properties, Roles, and Staff are managed by Hotel Admins.</p>
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

      {/* Create Hotel Admin Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create Hotel Admin</h3>
          <button
            onClick={() => setShowHotelAdminForm(!showHotelAdminForm)}
            className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Hotel Admin</span>
          </button>
        </div>
        
        {showHotelAdminForm && (
          <form onSubmit={handleCreateHotelAdmin} className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={hotelAdminData.name}
                  onChange={(e) => setHotelAdminData({ ...hotelAdminData, name: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Enter hotel admin name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={hotelAdminData.email}
                  onChange={(e) => setHotelAdminData({ ...hotelAdminData, email: e.target.value })}
                  required
                  className="input-field"
                  placeholder="admin@hotel.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={hotelAdminData.phone}
                  onChange={(e) => setHotelAdminData({ ...hotelAdminData, phone: e.target.value })}
                  className="input-field"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Hotel *</label>
                <select
                  value={hotelAdminData.hotel_id}
                  onChange={(e) => setHotelAdminData({ ...hotelAdminData, hotel_id: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">Select Hotel</option>
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>{hotel.hotel_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowHotelAdminForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Hotel Admin
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Property Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recentHotels.length > 0 && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Hotels</h3>
              <Link to="/hotels" className="text-primary-600 text-sm hover:underline flex items-center space-x-1">
                <EyeIcon className="h-4 w-4" />
                <span>View All</span>
              </Link>
            </div>
            <div className="space-y-3">
              {recentHotels.map((hotel) => (
                <div key={hotel.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{hotel.hotel_name}</p>
                    <p className="text-sm text-gray-600">{hotel.hotel_code}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${hotel.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {hotel.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentProperties.length > 0 && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Properties</h3>
              <Link to="/properties" className="text-primary-600 text-sm hover:underline flex items-center space-x-1">
                <EyeIcon className="h-4 w-4" />
                <span>View All</span>
              </Link>
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
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">📋 System Overview</h4>
        <p className="text-sm text-blue-700">
          As Super Admin, you have read-only access to all properties and staff. 
          You can create Hotel Admins who will manage their respective hotels including properties, roles, and staff.
        </p>
      </div>
    </div>
  )
}

export default SuperAdminDashboard