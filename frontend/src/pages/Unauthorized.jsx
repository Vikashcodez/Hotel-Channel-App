import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldExclamationIcon } from '@heroicons/react/24/outline'

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <ShieldExclamationIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <Link to="/dashboard" className="btn-primary inline-block">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Unauthorized