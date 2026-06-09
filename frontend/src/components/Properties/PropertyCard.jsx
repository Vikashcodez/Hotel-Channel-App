import React from 'react'
import { PencilIcon, TrashIcon, HomeModernIcon } from '@heroicons/react/24/outline'

const PropertyCard = ({ property, onEdit, onDelete, canEdit }) => {
  const priorityColor = () => {
    if (property.priority >= 80) return 'bg-red-100 text-red-800'
    if (property.priority >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <HomeModernIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{property.name}</h3>
            <p className="text-sm text-gray-600">{property.city}, {property.country}</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(property)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(property.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Priority:</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColor()}`}>
            {property.priority}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium">{property.property_type || 'N/A'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Units:</span>
          <span className="font-medium">{property.total_units || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${property.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {property.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      {property.users_count > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{property.users_count}</span> users assigned
          </p>
        </div>
      )}
    </div>
  )
}

export default PropertyCard