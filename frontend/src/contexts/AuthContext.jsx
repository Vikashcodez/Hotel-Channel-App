import React, { createContext, useState, useContext, useEffect } from 'react'
import { login as apiLogin, getCurrentUser } from '../services/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser()
      console.log('User data from API:', userData) // Debug log
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password)
      const { access_token } = response
      localStorage.setItem('token', access_token)
      setToken(access_token)
      await loadUser()
      toast.success(`Welcome ${response.name}!`)
      return { success: true, role: response.is_super_admin ? 'super_admin' : (response.is_hotel_admin ? 'hotel_admin' : (response.is_property_admin ? 'property_admin' : 'staff')) }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed')
      return { success: false }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const getUserRole = () => {
    if (!user) return null
    // Check for super admin first (by email or is_super_admin flag)
    if (user.email === 'admin@gmail.com' || user.is_super_admin === true) {
      return 'super_admin'
    }
    if (user.is_hotel_admin === true) return 'hotel_admin'
    if (user.is_property_admin === true) return 'property_admin'
    return 'staff'
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    userRole: getUserRole(),
    isSuperAdmin: user?.email === 'admin@gmail.com' || user?.is_super_admin === true,
    isHotelAdmin: user?.is_hotel_admin === true && user?.email !== 'admin@gmail.com',
    isPropertyAdmin: user?.is_property_admin === true && !user?.is_hotel_admin && user?.email !== 'admin@gmail.com',
    isStaff: !user?.is_hotel_admin && !user?.is_property_admin && user?.email !== 'admin@gmail.com' && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}