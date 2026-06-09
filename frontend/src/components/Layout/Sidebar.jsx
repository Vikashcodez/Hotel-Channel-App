import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  HomeModernIcon, 
  UsersIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const { isSuperAdmin, isAdmin, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Hotels', href: '/hotels', icon: BuildingOfficeIcon, roles: ['super_admin'] },
    { name: 'Properties', href: '/properties', icon: HomeModernIcon, roles: ['super_admin', 'admin'] },
    { name: 'Users', href: '/users', icon: UsersIcon, roles: ['super_admin'] },
  ]

  // Add property dashboard for users assigned to a property
  if (user?.property_id) {
    navigation.push({ 
      name: 'My Property', 
      href: '/property-dashboard', 
      icon: KeyIcon, 
      roles: ['admin', 'staff'] 
    })
  }

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">PMS System</h1>
        <p className="text-sm text-gray-400 mt-1">Property Management</p>
      </div>
      
      <nav className="flex-1 mt-6">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                isActive ? 'bg-gray-800 text-white border-r-4 border-primary-500' : ''
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          <p>Logged in as</p>
          <p className="text-white font-medium">{user?.full_name || user?.username}</p>
          <p className="text-xs mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar