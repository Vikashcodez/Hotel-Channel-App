import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getRoles, deleteRole } from '../services/roleService'
import RoleList from '../components/Roles/RoleList'
import RoleForm from '../components/Roles/RoleForm'
import { PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Roles = () => {
  const { user, isSuperAdmin, isHotelAdmin } = useAuth()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState(null)

  useEffect(() => {
    if (isSuperAdmin || isHotelAdmin) {
      fetchRoles()
    }
  }, [isSuperAdmin, isHotelAdmin])

  const fetchRoles = async () => {
    try {
      const params = {}
      if (isHotelAdmin && user?.hotel_id) {
        params.hotel_id = user.hotel_id
      }
      const data = await getRoles(params)
      setRoles(data)
    } catch (error) {
      toast.error('Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(id)
        toast.success('Role deleted successfully')
        fetchRoles()
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to delete role')
      }
    }
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingRole(null)
    fetchRoles()
  }

  if (!isSuperAdmin && !isHotelAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">You don't have permission to view this page.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-gray-600 mt-1">Manage staff roles and permissions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Role</span>
        </button>
      </div>

      <RoleList
        roles={roles}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <RoleForm
          role={editingRole}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

export default Roles