import React from 'react'
import { PencilIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline'

const UserCard = ({ user, property, onEdit, onDelete }) => {
  const roleColors = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    staff: 'bg-green-100 text-green-800'
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-100 p-2 rounded-lg">
            <UserCircleIcon className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{user.full_name || user.username}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(user)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Role:</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${roleColors[user.role]}`}>
            {user.role?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        {property && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Assigned Property:</span>
            <span className="font-medium">{property.name}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="text-xs text-gray-500">
          Joined: {new Date(user.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

export default UserCard