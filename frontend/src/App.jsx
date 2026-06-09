import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Hotels from './pages/Hotels'
import Properties from './pages/Properties'
import Users from './pages/Users'
import PropertyDashboard from './pages/PropertyDashboard'
import Unauthorized from './pages/Unauthorized'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Super Admin & Admin Routes */}
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/users" element={<Users />} />
              
              {/* Property User Dashboard */}
              <Route path="/property-dashboard" element={<PropertyDashboard />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App