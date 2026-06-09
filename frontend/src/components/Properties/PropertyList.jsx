import React from 'react'
import PropertyCard from './PropertyCard'

const PropertyList = ({ properties, onEdit, onDelete, canEdit }) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500">No properties found. Click "Add Property" to create one.</p>
      </div>
    )
  }

  // Sort properties by priority (higher priority first)
  const sortedProperties = [...properties].sort((a, b) => b.priority - a.priority)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedProperties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
        />
      ))}
    </div>
  )
}

export default PropertyList