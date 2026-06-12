import React from 'react'
import { PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const RoleCard = ({ role, onEdit, onDelete }) => {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <UserGroupIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{role.role_name}</h3>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(role)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(role.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        {role.description && (
          <p className="text-sm text-gray-600">{role.description}</p>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${role.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {role.status}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Created: {new Date(role.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

export default RoleCard