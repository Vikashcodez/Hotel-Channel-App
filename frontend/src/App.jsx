import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import HotelAdminDashboard from './pages/HotelAdminDashboard'
import PropertyAdminDashboard from './pages/PropertyAdminDashboard'
import StaffDashboard from './pages/StaffDashboard'
import Hotels from './pages/Hotels'
import Properties from './pages/Properties'
import Staff from './pages/Staff'
import Roles from './pages/Roles'
import Profile from './pages/Profile'
import Unauthorized from './pages/Unauthorized'
import { useAuth } from './contexts/AuthContext'

function AppRoutes() {
  const { userRole } = useAuth()

  const getDashboard = () => {
    switch(userRole) {
      case 'super_admin':
        return <SuperAdminDashboard />
      case 'hotel_admin':
        return <HotelAdminDashboard />
      case 'property_admin':
        return <PropertyAdminDashboard />
      case 'staff':
        return <StaffDashboard />
      default:
        return <SuperAdminDashboard />
    }
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
          <Route path="/hotels" element={<Hotels />} />
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