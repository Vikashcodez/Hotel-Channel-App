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
            <h3 className="font-semibold text-lg text-gray-900">{hotel.hotel_name}</h3>
            <p className="text-sm text-gray-600">Code: {hotel.hotel_code}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(hotel)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(hotel.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {hotel.email && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium truncate ml-2">{hotel.email}</span>
          </div>
        )}
        {hotel.phone && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{hotel.phone}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${hotel.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {hotel.status}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Created: {new Date(hotel.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

export default HotelCard