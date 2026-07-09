import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { BellIcon, UserCircleIcon, ChevronDownIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

const Header = () => {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Live clock for the front desk
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <header className="bg-stone-50 border-b border-stone-200 sticky top-0 z-30 font-sans">
      <div className="flex justify-between items-center px-8 lg:px-12 py-5">
        
        {/* Left Side - Welcome Message */}
        <div className="flex flex-col">
          <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-1">Dashboard</p>
          <h2 className="font-serif text-2xl text-stone-900 tracking-tight">
            Welcome back, {user?.full_name || user?.username || 'Guest'}
          </h2>
        </div>

        {/* Center - Live Front Desk Clock (Hidden on smaller screens) */}
        <div className="hidden lg:flex flex-col items-center absolute left-1/2 -translate-x-1/2">
          <div className="text-2xl font-light text-stone-900 tracking-wider tabular-nums">
            {formattedTime}
          </div>
          <div className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">
            {formattedDate}
          </div>
        </div>
        
        {/* Right Side - Actions */}
        <div className="flex items-center space-x-6">
          
          {/* Notifications */}
          <button className="relative p-2 rounded-full text-stone-500 hover:text-amber-500 hover:bg-stone-100 transition-colors duration-200">
            <BellIcon className="h-6 w-6" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 border border-stone-50"></span>
          </button>
          
          {/* Account Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-3 p-1.5 pr-2 rounded-full border border-transparent hover:border-stone-200 hover:bg-white transition-all duration-200">
              <div className="p-1 rounded-full bg-stone-200 text-stone-700">
                <UserCircleIcon className="h-6 w-6" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-stone-800 leading-none">{user?.email || 'Account'}</p>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-1">Profile</p>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-stone-400 group-hover:text-stone-600 transition-colors" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-3 w-60 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
              <div className="p-4 border-b border-stone-800">
                <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">Signed in as</p>
                <p className="text-sm text-stone-100 font-medium truncate mt-1">{user?.email || 'Unknown'}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-stone-300 hover:text-amber-500 hover:bg-stone-800 rounded-lg transition-colors duration-200 group/item"
                >
                  <span>Sign Out</span>
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-stone-500 group-hover/item:text-amber-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header