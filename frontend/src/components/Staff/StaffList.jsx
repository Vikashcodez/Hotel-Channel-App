import React from 'react'
import StaffCard from './StaffCard'

const StaffList = ({ staff, onEdit, onDelete, onResetPassword, canEdit }) => {
  if (staff.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500">No staff members found. Click "Add Staff" to create one.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {staff.map((staffMember) => (
        <StaffCard
          key={staffMember.id}
          staff={staffMember}
          onEdit={onEdit}
          onDelete={onDelete}
          onResetPassword={onResetPassword}
          canEdit={canEdit}
        />
      ))}
    </div>
  )
}

export default StaffList