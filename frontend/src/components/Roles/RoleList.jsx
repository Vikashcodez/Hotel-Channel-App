import React from 'react'
import RoleCard from './RoleCard'

const RoleList = ({ roles, onEdit, onDelete }) => {
  if (roles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500">No roles found. Click "Add Role" to create one.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default RoleList