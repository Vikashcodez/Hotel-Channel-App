import React from 'react'
import { PencilIcon, TrashIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/24/outline'

const StaffCard = ({ staff, onEdit, onDelete, onResetPassword, canEdit }) => {
  const getRoleBadge = () => {
    if (staff.is_hotel_admin) return { label: 'Hotel Admin', color: 'bg-purple-100 text-purple-800' }
    if (staff.is_property_admin) return { label: 'Property Admin', color: 'bg-blue-100 text-blue-800' }
    return { label: 'Staff', color: 'bg-green-100 text-green-800' }
  }

  const roleBadge = getRoleBadge()

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-100 p-2 rounded-lg">
            <UserCircleIcon className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{staff.name}</h3>
            <p className="text-sm text-gray-600">{staff.email}</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(staff)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onResetPassword(staff.id, staff.name)}
              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
              title="Reset Password"
            >
              <KeyIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(staff.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Role:</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${roleBadge.color}`}>
            {roleBadge.label}
          </span>
        </div>
        
        {staff.employee_code && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Employee Code:</span>
            <span className="font-mono text-sm">{staff.employee_code}</span>
          </div>
        )}
        
        {staff.phone && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phone:</span>
            <span>{staff.phone}</span>
          </div>
        )}
        
        {staff.property_name && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Property:</span>
            <span className="font-medium">{staff.property_name}</span>
          </div>
        )}
        
        {staff.role_name && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Role:</span>
            <span>{staff.role_name}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${staff.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {staff.status}
          </span>
        </div>
        
        <div className="text-xs text-gray-500">
          Joined: {new Date(staff.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

export default StaffCard