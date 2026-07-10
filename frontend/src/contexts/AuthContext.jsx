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
      console.log('User data from API:', userData)
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
      return { 
        success: true, 
        role: response.is_super_admin ? 'super_admin' : 
              (response.is_tenant_admin ? 'tenant_admin' : 
              (response.is_property_admin ? 'property_admin' : 'staff')) 
      }
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
    
    // Check for super admin by name OR is_super_admin flag
    if (user.name === 'System Super Admin' || user.is_super_admin === true) {
      return 'super_admin'
    }
    
    // Check for tenant admin (hotel admin)
    if (user.is_tenant_admin === true) {
      return 'tenant_admin'
    }
    
    // Check for property admin
    if (user.is_property_admin === true) {
      return 'property_admin'
    }
    
    return 'staff'
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    userRole: getUserRole(),
    isSuperAdmin: user?.name === 'System Super Admin' || user?.is_super_admin === true,
    isHotelAdmin: user?.is_tenant_admin === true,
    isPropertyAdmin: user?.is_property_admin === true && user?.is_tenant_admin !== true && user?.name !== 'System Super Admin',
    isStaff: !user?.is_tenant_admin && !user?.is_property_admin && user?.name !== 'System Super Admin' && !user?.is_super_admin && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}