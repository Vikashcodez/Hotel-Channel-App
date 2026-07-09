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
    // Super admin navigation
    if (user?.email === 'admin@gmail.com' || isSuperAdmin) {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Tenants', href: '/hotels', icon: BuildingOfficeIcon },
        
      ]
    }
    
    // Tenant admin navigation
    if (isHotelAdmin) {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Properties', href: '/properties', icon: HomeModernIcon },
        { name: 'Roles', href: '/roles', icon: UsersIcon },
        { name: 'Staff', href: '/staff', icon: UsersIcon },
        
        
      ]
    }
    
    // Property admin navigation
    if (isPropertyAdmin) {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Roles', href: '/roles', icon: UsersIcon },
        { name: 'Staff', href: '/staff', icon: UsersIcon },
        
      ]
    }
    
    // Staff navigation
    return [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Profile', href: '/profile', icon: UserCircleIcon },
    ]
  }

  const navigation = getNavigation()

  // Determine role label
  const userRole = user?.email === 'admin@gmail.com' ? 'Super Admin' : 
                   isHotelAdmin ? 'Hotel Admin' : 
                   isPropertyAdmin ? 'Property Admin' : 'Staff';

  return (
    <div className="w-64 bg-stone-900 text-stone-300 flex flex-col border-r border-stone-800 font-sans">
      
      {/* Header / Branding */}
      <div className="p-8 border-b border-stone-800">
        <h1 className="font-serif text-2xl text-stone-100 tracking-tight">Aurora PMS</h1>
        <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-[0.2em]">Management Suite</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mt-8 px-4">
        <p className="px-4 mb-4 text-[10px] text-stone-500 uppercase tracking-[0.2em]">Operations</p>
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3 text-sm tracking-wide transition-all duration-200 border-l-2 ${
                  isActive 
                    ? 'border-amber-500 bg-stone-800/50 text-amber-500' 
                    : 'border-transparent text-stone-400 hover:text-stone-100 hover:bg-stone-800/30'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 mr-4 transition-colors duration-200 ${isActive ? 'text-amber-500' : 'text-stone-500 group-hover:text-stone-300'}`} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      
      {/* Footer / User Info */}
      <div className="p-6 border-t border-stone-800 bg-stone-950/30">
        <div className="flex flex-col space-y-1">
          <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">Session</p>
          <p className="text-stone-100 font-medium text-sm tracking-wide">
            {user?.name || user?.full_name || 'User'}
          </p>
          <p className="text-amber-500 text-[11px] uppercase tracking-wider mt-1 font-medium">
            {userRole}
          </p>
          
          <div className="pt-4 mt-2 border-t border-stone-800 space-y-1.5">
            {user?.hotel_name && (
              <div className="flex items-center text-xs text-stone-500">
                <span className="text-stone-600 mr-2">Hotel:</span> 
                <span className="text-stone-400 truncate">{user.hotel_name}</span>
              </div>
            )}
            {user?.property_name && (
              <div className="flex items-center text-xs text-stone-500">
                <span className="text-stone-600 mr-2">Prop:</span> 
                <span className="text-stone-400 truncate">{user.property_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar