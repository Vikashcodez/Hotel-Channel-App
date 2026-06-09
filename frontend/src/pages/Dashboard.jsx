import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getHotels } from '../services/hotelService'
import { getProperties } from '../services/propertyService'
import { getUsers } from '../services/userService'
import { 
  BuildingOfficeIcon, 
  HomeModernIcon, 
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const { user, isSuperAdmin, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    hotels: 0,
    properties: 0,
    users: 0,
    activeProperties: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentProperties, setRecentProperties] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (isSuperAdmin) {
        const [hotels, properties, users] = await Promise.all([
          getHotels(),
          getProperties(),
          getUsers()
        ])
        setStats({
          hotels: hotels.length,
          properties: properties.length,
          users: users.length,
          activeProperties: properties.filter(p => p.is_active).length
        })
        setRecentProperties(properties.slice(0, 5))
      } else if (isAdmin && user.property_id) {
        const properties = await getProperties()
        setStats({
          hotels: 0,
          properties: properties.length,
          users: 0,
          activeProperties: properties.filter(p => p.is_active).length
        })
        setRecentProperties(properties.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { name: 'Total Hotels', value: stats.hotels, icon: BuildingOfficeIcon, color: 'bg-blue-500', show: isSuperAdmin },
    { name: 'Total Properties', value: stats.properties, icon: HomeModernIcon, color: 'bg-green-500', show: true },
    { name: 'Total Users', value: stats.users, icon: UsersIcon, color: 'bg-purple-500', show: isSuperAdmin },
    { name: 'Active Properties', value: stats.activeProperties, icon: ChartBarIcon, color: 'bg-yellow-500', show: true },
  ]

  const chartData = recentProperties.map((prop, index) => ({
    name: prop.name.substring(0, 10),
    priority: prop.priority,
    units: prop.total_units
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your property management dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.filter(card => card.show).map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.name}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Property Priority Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="priority" fill="#3B82F6" name="Priority" />
              <Bar dataKey="units" fill="#10B981" name="Total Units" />
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

      {recentProperties.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Properties</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentProperties.map((property) => (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{property.property_type || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{property.priority}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${property.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {property.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard