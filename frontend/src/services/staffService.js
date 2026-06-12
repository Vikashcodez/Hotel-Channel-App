import api from './api'

export const getStaff = async (params = {}) => {
  const response = await api.get('/staff', { params })
  return response.data
}

export const getStaffMember = async (id) => {
  const response = await api.get(`/staff/${id}`)
  return response.data
}

export const createStaff = async (staffData) => {
  const response = await api.post('/staff', staffData)
  return response.data
}

export const createHotelAdmin = async (staffData) => {
  const response = await api.post('/staff/hotel-admin', staffData)
  return response.data
}

export const createPropertyAdmin = async (staffData) => {
  const response = await api.post('/staff/property-admin', staffData)
  return response.data
}

export const updateStaff = async (id, staffData) => {
  const response = await api.put(`/staff/${id}`, staffData)
  return response.data
}

export const deleteStaff = async (id) => {
  const response = await api.delete(`/staff/${id}`)
  return response.data
}

export const resetStaffPassword = async (id) => {
  const response = await api.post(`/staff/${id}/reset-password`)
  return response.data
}