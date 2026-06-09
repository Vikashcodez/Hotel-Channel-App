import api from './api'

export const getProperties = async (hotelId = null) => {
  const params = hotelId ? { hotel_id: hotelId } : {}
  const response = await api.get('/properties', { params })
  return response.data
}

export const getProperty = async (id) => {
  const response = await api.get(`/properties/${id}`)
  return response.data
}

export const createProperty = async (propertyData) => {
  const response = await api.post('/properties', propertyData)
  return response.data
}

export const updateProperty = async (id, propertyData) => {
  const response = await api.put(`/properties/${id}`, propertyData)
  return response.data
}

export const deleteProperty = async (id) => {
  const response = await api.delete(`/properties/${id}`)
  return response.data
}