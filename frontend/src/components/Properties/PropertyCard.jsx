import React from 'react'
import { PencilIcon, TrashIcon, HomeModernIcon } from '@heroicons/react/24/outline'

const PropertyCard = ({ property, onEdit, onDelete, canEdit }) => {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <HomeModernIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{property.property_name}</h3>
            <p className="text-sm text-gray-600">Code: {property.property_code}</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(property)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(property.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        {property.is_main_branch && (
          <div className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Main Branch
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">City:</span>
          <span className="font-medium">{property.city || 'N/A'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Floors:</span>
          <span className="font-medium">{property.total_floors || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {property.status}
          </span>
        </div>
      </div>
      
      {property.staff_count > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{property.staff_count}</span> staff members
          </p>
        </div>
      )}
    </div>
  )
}

export default PropertyCard