import React, { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user,
        isAuthenticated: true,
        error: null 
      }
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return { 
        ...state, 
        loading: false, 
        user: null,
        isAuthenticated: false,
        error: action.payload 
      }
    case 'LOGOUT':
      return { 
        ...state, 
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null 
      }
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: true,
        loading: false 
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me', { skipAuthRedirect: true })
        dispatch({ type: 'SET_USER', payload: response.data.data.user })
      } catch (error) {
        dispatch({ type: 'LOGOUT' })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const response = await api.post('/auth/login', { email, password })
      
      // Store token in localStorage
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token)
      }
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data })
      toast.success('Login successful!')
      return response.data.data.user
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: message })
      toast.error(message)
      throw error
    }
  }

  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'REGISTER_START' })
      const response = await api.post('/auth/register', { name, email, password })
      
      // Store token in localStorage
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token)
      }
      
      dispatch({ type: 'REGISTER_SUCCESS', payload: response.data.data })
      toast.success('Registration successful!')
      return response.data.data.user
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      dispatch({ type: 'REGISTER_FAILURE', payload: message })
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear token from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
