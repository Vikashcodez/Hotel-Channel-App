import api from './api'

export const login = async (email, password) => {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)
  
  const response = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

export const changePassword = async (oldPassword, newPassword) => {
  const response = await api.post('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword
  })
  return response.data
}

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

export const logout = async () => {
  localStorage.removeItem('token')
  return { success: true }
}