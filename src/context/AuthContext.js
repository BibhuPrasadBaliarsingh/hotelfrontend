import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('hotelToken') || null,
  loading: true,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGOUT':
      return { ...initialState, token: null, loading: false };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('hotelToken');
    if (token) {
      getMe()
        .then(res => dispatch({ type: 'SET_USER', payload: res.data.user }))
        .catch(() => {
          localStorage.removeItem('hotelToken');
          localStorage.removeItem('hotelUser');
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('hotelToken', token);
    localStorage.setItem('hotelUser', JSON.stringify(user));
    dispatch({ type: 'SET_TOKEN', payload: token });
    dispatch({ type: 'SET_USER', payload: user });
    toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🎉`);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await registerUser(data);
    const { token, user } = res.data;
    localStorage.setItem('hotelToken', token);
    localStorage.setItem('hotelUser', JSON.stringify(user));
    dispatch({ type: 'SET_TOKEN', payload: token });
    dispatch({ type: 'SET_USER', payload: user });
    toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}! 🎉`);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hotelToken');
    localStorage.removeItem('hotelUser');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
