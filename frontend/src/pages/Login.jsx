import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  BuildingOffice2Icon, 
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const { login } = useAuth()
  const navigate = useNavigate()

  // Live clock for the front desk
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const success = await login(email, password)
    setLoading(false)
    if (success) {
      navigate('/dashboard')
    }
  }

  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen flex bg-stone-100 font-sans">
      
      {/* LEFT PANEL - 50% WIDTH - MINIMAL BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-stone-200 relative overflow-hidden justify-center items-center flex-col p-16">
        
        {/* Subtle Architectural Background Lines */}
        <div className="absolute inset-0 flex">
          <div className="w-1/4 h-full bg-stone-300/40 backdrop-blur-sm border-r border-stone-300/50"></div>
          <div className="w-1/2 h-full bg-stone-100/40 backdrop-blur-sm border-r border-stone-300/50"></div>
          <div className="w-1/4 h-full bg-stone-300/40 backdrop-blur-sm"></div>
        </div>
        
        {/* Main Text */}
        <div className="relative z-10 text-center">
          <h2 className="font-serif text-6xl text-stone-800 tracking-tight mb-6">Hotel PMS & Channel Manager</h2>
          <div className="w-16 h-[1px] bg-amber-600 mx-auto mb-6"></div>
          <p className="text-stone-500 tracking-[0.3em] uppercase text-sm">© 2026</p>
        </div>
      </div>

      {/* RIGHT PANEL - 50% WIDTH - THE LOGIN FORM */}
      <div className="w-full lg:w-1/2 bg-stone-900 flex flex-col p-10 lg:p-16 relative justify-center">
        
        {/* Top Branding & Clock */}
        <div className="absolute top-0 left-0 p-10 lg:p-16 flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <BuildingOffice2Icon className="h-7 w-7 text-amber-500" />
            <span className="text-lg font-medium text-stone-100 tracking-widest uppercase">Hotel PMS</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-light text-stone-100 tracking-wider tabular-nums">{formattedTime}</div>
            <div className="text-[10px] text-stone-500 uppercase tracking-widest">{formattedDate}</div>
          </div>
        </div>

        {/* Login Form Area (Vertically Centered) */}
        <div className="w-full max-w-md mx-auto py-12">
          <h1 className="font-serif text-4xl text-stone-100 mb-2 tracking-tight">Sign In</h1>
          <p className="text-stone-500 mb-12 text-sm">Secure access for authorized personnel.</p>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Email Input */}
            <div className="relative group">
              <label className="block text-xs font-medium text-stone-400 mb-3 uppercase tracking-widest">Email ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full bg-transparent border-b border-stone-700 text-stone-100 py-3 pl-0 pr-4 focus:outline-none focus:border-amber-500 transition-colors text-lg placeholder-stone-600"
                placeholder="admin@hotel.com"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label className="block text-xs font-medium text-stone-400 mb-3 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full bg-transparent border-b border-stone-700 text-stone-100 py-3 pl-0 pr-10 focus:outline-none focus:border-amber-500 transition-colors text-lg placeholder-stone-600"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full inline-flex items-center justify-center px-8 py-4 overflow-hidden bg-amber-500 text-stone-900 font-medium uppercase tracking-widest text-sm transition-all duration-300 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-stone-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRightIcon className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Copyright (Hidden on large screens since it's on the left panel) */}
        <div className="absolute bottom-0 left-0 p-10 lg:p-16 w-full text-center lg:hidden">
           <p className="text-xs text-stone-600 tracking-widest uppercase">© 2026 Hotel PMS Manager</p>
        </div>
      </div>
    </div>
  )
}

export default Login