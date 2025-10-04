import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on auth errors
      localStorage.removeItem('token');
      // No direct redirect here. AuthContext or ProtectedRoute will handle navigation.
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw error;
  }
};

export const registerAgent = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}) => {
  try {
    const response = await api.post('/users/registerAgent', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        // Check specifically for referral code error
        if (error.response?.data?.message?.includes('Invalid referral code')) {
          throw new Error('Referral code does not exist. Please check and try again.');
        }
        throw new Error(error.response?.data?.message || 'Invalid registration data');
      }
      if (error.response?.status === 409) {
        throw new Error('User already exists');
      }
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
    throw error;
  }
};

export const registerCompany = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  companyName: string;
  address: string;
  licenseNumber: string;
  referralCode?: string;
}) => {
  try {
    const response = await api.post('/users/registerCompany', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        // Check specifically for referral code error
        if (error.response?.data?.message?.includes('Invalid referral code')) {
          throw new Error('Referral code does not exist. Please check and try again.');
        }
        throw new Error(error.response?.data?.message || 'Invalid registration data');
      }
      if (error.response?.status === 409) {
        throw new Error('User or company already exists');
      }
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
    throw error;
  }
};

// User API functions
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Please log in to continue');
      }
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
    throw error;
  }
};

export const updateUserProfile = async (data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  address?: string;
  licenseNumber?: string;
}) => {
  try {
    const response = await api.patch('/users/profile', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid profile data');
      }
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
    throw error;
  }
};

// Property API functions
export const getProperties = async () => {
  try {
    const response = await axios.get('https://kamaaupoot.com/api/properties');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch properties');
    }
    throw error;
  }
};

// Lead Management API functions
export const getLeads = async () => {
  try {
    const response = await api.get('/leads');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leads');
    }
    throw error;
  }
};

export const createLead = async (data: {
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  notes?: string;
  assignedTo?: string;
}) => {
  try {
    const response = await api.post('/leads', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create lead');
    }
    throw error;
  }
};

export const deleteLead = async (id: string) => {
  try {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete lead');
    }
    throw error;
  }
};

export const transferLead = async (
  leadId: string,
  newAgentId: string,
  commissionSplit: { type: 'ratio' | 'custom'; value: string; }
) => {
  try {
    const response = await api.patch(`/leads/${leadId}/transfer`, { newAgentId, commissionSplit });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to transfer lead');
    }
    throw error;
  }
};

// Team Management API functions
export const getTeams = async () => {
  try {
    const response = await api.get('/teams');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch teams');
    }
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
    throw error;
  }
};

// Commission and Sales API functions
export const getCommissions = async () => {
  try {
    const response = await api.get('/commissions');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch commissions');
    }
    throw error;
  }
};

export const getMySales = async () => {
  try {
    const response = await api.get('/teams/my-sales');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sales');
    }
    throw error;
  }
};

export const getMyCommissions = async () => {
  try {
    const response = await api.get('/commissions/my-commissions');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch commissions');
    }
    throw error;
  }
};

export const getCompanySales = async () => {
  try {
    const response = await api.get('/my-commissions');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company sales');
    }
    throw error;
  }
};

export const getMyDownline = async () => {
  try {
    const response = await api.get('/teams/my-downline');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch downline');
    }
    throw error;
  }
};

// Export the api instance for other API calls
export default api;