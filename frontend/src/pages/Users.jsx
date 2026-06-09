import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUsers, deleteUser } from '../services/userService'
import { getProperties } from '../services/propertyService'
import UserList from '../components/Users/UserList'
import UserForm from '../components/Users/UserForm'
import { PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Users = () => {
  const { isSuperAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData()
    }
  }, [isSuperAdmin])

  const fetchData = async () => {
    try {
      const [usersData, propertiesData] = await Promise.all([
        getUsers(),
        getProperties()
      ])
      setUsers(usersData)
      setProperties(propertiesData)
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id)
        toast.success('User deleted successfully')
        fetchData()
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingUser(null)
    fetchData()
  }

  if (!isSuperAdmin) {
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      <UserList
        users={users}
        properties={properties}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <UserForm
          user={editingUser}
          properties={properties}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

export default Users