import React from 'react'
import { PencilIcon, TrashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

const HotelCard = ({ hotel, onEdit, onDelete }) => {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{hotel.name}</h3>
            <p className="text-sm text-gray-600">{hotel.city}, {hotel.country}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(hotel)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(hotel.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600">{hotel.address}</p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Rooms:</span>
          <span className="font-medium">{hotel.total_rooms || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Rating:</span>
          <span className="font-medium text-yellow-600">★ {hotel.rating || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${hotel.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {hotel.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      {hotel.properties_count > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{hotel.properties_count}</span> properties
          </p>
        </div>
      )}
    </div>
  )
}

export default HotelCard