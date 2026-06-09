import React from 'react'
import UserCard from './UserCard'

const UserList = ({ users, properties, onEdit, onDelete }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500">No users found. Click "Add User" to create one.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => {
        const property = properties.find(p => p.id === user.property_id)
        return (
          <UserCard
            key={user.id}
            user={user}
            property={property}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      })}
    </div>
  )
}

export default UserList