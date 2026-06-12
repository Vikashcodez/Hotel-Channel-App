import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  HomeModernIcon, 
  UsersIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const { user, isSuperAdmin, isHotelAdmin, isPropertyAdmin } = useAuth()

  const getNavigation = () => {
    // Super admin navigation (view only, no add buttons in list views)
    if (user?.email === 'admin@gmail.com' || isSuperAdmin) {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Hotels', href: '/hotels', icon: BuildingOfficeIcon },
        { name: 'Properties', href: '/properties', icon: HomeModernIcon },
        { name: 'Staff', href: '/staff', icon: UsersIcon },
        { name: 'Profile', href: '/profile', icon: UserCircleIcon },
      ]
    }
    
    // Hotel admin navigation (full management)
    if (isHotelAdmin) {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Properties', href: '/properties', icon: HomeModernIcon },
        { name: 'Staff', href: '/staff', icon: UsersIcon },
        { name: 'Roles', href: '/roles', icon: UsersIcon },
        { name: 'Profile', href: '/profile', icon: UserCircleIcon },
      ]
    }
    
    // Property admin navigation
    if (isPropertyAdmin) {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Staff', href: '/staff', icon: UsersIcon },
        { name: 'Profile', href: '/profile', icon: UserCircleIcon },
      ]
    }
    
    // Staff navigation
    return [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Profile', href: '/profile', icon: UserCircleIcon },
    ]
  }

  const navigation = getNavigation()

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">PMS System</h1>
        <p className="text-sm text-gray-400 mt-1">Property Management</p>
      </div>
      
      <nav className="flex-1 mt-6">
        {navigation.map((item) => (
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
          <p className="text-white font-medium">{user?.name || user?.full_name || 'User'}</p>
          <p className="text-xs mt-1 capitalize">
            {user?.email === 'admin@gmail.com' ? 'Super Admin' : 
             isHotelAdmin ? 'Hotel Admin' : 
             isPropertyAdmin ? 'Property Admin' : 'Staff'}
          </p>
          {user?.hotel_name && (
            <p className="text-xs mt-1 text-gray-400">Hotel: {user.hotel_name}</p>
          )}
          {user?.property_name && (
            <p className="text-xs text-gray-400">Property: {user.property_name}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar