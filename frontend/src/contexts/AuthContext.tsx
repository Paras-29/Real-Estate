import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../lib/api';
import api from '../lib/api';
import { useToast } from "@/components/ui/use-toast";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: 'agent' | 'company' | 'admin';
  companyName?: string;
  address?: string;
  licenseNumber?: string;
  level: number;
  referralCode: string;
  referredBy?: string;
  personalSalesVolume: number;
  teamSalesVolume: number;
  personalSalesCount: number;
  teamSalesCount: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  panNumber?: string;
  aadharNumber?: string;
  experience?: number;
  specialization?: string;
  languages?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  alternatePhone?: string;
  bloodGroup?: string;
  streetAddress?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  documents?: {
    panCard?: string;
    aadharCard?: string;
    aadharCardFront?: string;
    aadharCardBack?: string;
    addressProof?: string;
    profilePhoto?: string;
    licenseDocument?: string;
  };
  holderName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserInContext: (updatedUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateUserData = (userData: any): User => {
    const requiredFields = ['_id', 'firstName', 'lastName', 'email', 'phone', 'userType'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Ensure userType is valid
    if (!['agent', 'company', 'admin'].includes(userData.userType)) {
      throw new Error(`Invalid user type: ${userData.userType}`);
    }

    return {
      _id: userData._id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      userType: userData.userType,
      companyName: userData.companyName,
      address: userData.address,
      licenseNumber: userData.licenseNumber,
      level: userData.level || 1,
      referralCode: userData.referralCode || '',
      referredBy: userData.referredBy,
      personalSalesVolume: userData.personalSalesVolume || 0,
      teamSalesVolume: userData.teamSalesVolume || 0,
      personalSalesCount: userData.personalSalesCount || 0,
      teamSalesCount: userData.teamSalesCount || 0,
      bankName: userData.bankName || '',
      accountNumber: userData.accountNumber || '',
      ifscCode: userData.ifscCode || '',
      panNumber: userData.panNumber || '',
      aadharNumber: userData.aadharNumber || '',
      experience: userData.experience || 0,
      specialization: userData.specialization || '',
      languages: userData.languages || '',
      bio: userData.bio || '',
      dateOfBirth: userData.dateOfBirth || '',
      gender: userData.gender || '',
      alternatePhone: userData.alternatePhone || '',
      bloodGroup: userData.bloodGroup || '',
      streetAddress: userData.streetAddress || '',
      landmark: userData.landmark || '',
      city: userData.city || '',
      state: userData.state || '',
      pincode: userData.pincode || '',
      country: userData.country || 'India',
      documents: userData.documents || {},
      holderName: userData.holderName || '',
    };
  };

  const fetchUserData = async (token: string, isInitialLoad = false) => {
    try {
      console.log('DEBUG - AuthContext - Fetching user data');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const res = await api.get('/users/me');
      console.log('DEBUG - AuthContext - User data response:', res.data);
      
      if (!res.data || !res.data.data) {
        throw new Error('Invalid response format from server');
      }

      const validatedUser = validateUserData(res.data.data);
      setUser(validatedUser);
      return validatedUser;
    } catch (err: any) {
      console.error('DEBUG - AuthContext - Error fetching user:', err);
      
      // Handle auth errors by clearing the token silently - NO NAVIGATION
      if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
        console.log('DEBUG - AuthContext - Auth error detected, clearing token silently');
        // Clear token without any navigation
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        return null;
      } else {
        // Network error, server error, etc. - DON'T clear token, DON'T throw error
        console.error('Non-auth error during user fetch:', err);
        if (!isInitialLoad) {
          toast({
            title: "Connection Error",
            description: "Unable to verify session. Please check your connection.",
            variant: "destructive",
          });
        }
        return null;
      }
    }
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('DEBUG - AuthContext - No token found');
          setLoading(false);
          return;
        }

        console.log('DEBUG - AuthContext - Found token, attempting to verify');
        const userData = await fetchUserData(token, true);
        
        if (userData) {
          console.log('DEBUG - AuthContext - Token verification successful');
        } else {
          console.log('DEBUG - AuthContext - Token verification failed, cleared silently');
        }
      } catch (err) {
        console.error('DEBUG - AuthContext - Auth initialization failed:', err);
        // Silently handle any initialization errors
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('DEBUG - AuthContext - Login attempt for:', email);
      const res = await loginUser({ email, password });
      console.log('DEBUG - AuthContext - Login response received:', res);
      
      if (!res.data || !res.data.token) {
        console.error('DEBUG - AuthContext - Invalid response structure:', res);
        throw new Error('Login failed: Invalid server response.');
      }

      const token = res.data.token;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const userData = await fetchUserData(token);

      if (userData) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.firstName}!`, 
        });
        navigate('/'); // Redirect to home page after successful login
      } else {
        throw new Error('Failed to fetch user data after login.');
      }
    } catch (err: any) {
      console.error('DEBUG - AuthContext - Login function caught error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        toast({
          title: "Invalid Credentials",
          description: "Please check your email and password",
          variant: "destructive",
        });
      } else if (err.response?.status === 400) {
        toast({
          title: "Validation Error",
          description: err.response?.data?.message || "Please check your input",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: err.response?.data?.message || err.message || "Login failed",
          variant: "destructive",
        });
      }
      
      // Only clear auth state for login errors (don't navigate)
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      
      throw err;
    }
  };

  const updateUserInContext = (updatedUserData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      // Deep merge documents to prevent overwriting
      const documents = {
        ...prevUser.documents,
        ...updatedUserData.documents,
      };

      const newUser = {
        ...prevUser,
        ...updatedUserData,
        documents,
      };

      console.log('DEBUG - AuthContext - Updating user context:', { prevUser, updatedUserData, newUser });
      return newUser;
    });
  };

  // Only navigate to login when user explicitly clicks logout
  const logout = () => {
    console.log('DEBUG - AuthContext - Logout initiated');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    
    toast({
      title: "Success",
      description: "Logged out successfully",
      variant: "default",
    });
    
    // Only navigate to login on explicit logout
    navigate('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, updateUserInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};