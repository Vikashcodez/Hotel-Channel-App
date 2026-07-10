import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import HotelAdminDashboard from './pages/HotelAdminDashboard'
import PropertyAdminDashboard from './pages/PropertyAdminDashboard'
import StaffDashboard from './pages/StaffDashboard'
import Tenants from './pages/Hotels'
import Properties from './pages/Properties'
import Staff from './pages/Staff'
import Roles from './pages/Roles'
import Profile from './pages/Profile'
import Unauthorized from './pages/Unauthorized'

function AppRoutes() {
  const { user, userRole, isSuperAdmin, isHotelAdmin, isPropertyAdmin } = useAuth()
  
  console.log('User Role:', userRole)
  console.log('User Data:', user)
  console.log('isSuperAdmin:', isSuperAdmin)
  console.log('isHotelAdmin:', isHotelAdmin)
  console.log('isPropertyAdmin:', isPropertyAdmin)

  const getDashboard = () => {
    // Check by is_super_admin flag from backend
    if (isSuperAdmin) {
      return <SuperAdminDashboard />
    }
    // Check for tenant admin (hotel admin)
    if (isHotelAdmin) {
      return <HotelAdminDashboard />
    }
    // Check for property admin
    if (isPropertyAdmin) {
      return <PropertyAdminDashboard />
    }
    // Default to staff dashboard
    return <StaffDashboard />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={getDashboard()} />
          
          {/* Super Admin Routes */}
          <Route path="/hotels" element={<Tenants />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App