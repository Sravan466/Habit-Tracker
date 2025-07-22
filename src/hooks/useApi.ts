import { useAuth } from '../contexts/AuthContext';

export const useApi = () => {
  const { token, logout } = useAuth();
  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://habit-tracker-backend-i0xa.onrender.com' 
    : 'http://localhost:5001/api';

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  return { apiCall };
};