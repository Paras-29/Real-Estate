import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLeads } from '../lib/api';
import { useAuth } from './AuthContext';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  notes?: string;
  assignedTo?: string | any;
  createdBy?: string | any;
  createdAt: string;
  updatedAt: string;
  lastContacted?: string;
  reminder?: {
    date: string;
    message: string;
  };
  isTransferred?: boolean;
  transferHistory?: Array<{
    transferredTo: any;
    transferredAt: string;
    commissionSplit: {
      type: 'ratio' | 'custom';
      value: string;
    };
    transferredBy: any;
  }>;
  commissionSplit?: {
    type: 'ratio' | 'custom';
    value: string;
  };
  sellingPrice?: number;
  buyerName?: string;
}

interface LeadsContextType {
  leads: Lead[];
  leadsWithReminders: Lead[];
  hasReminders: boolean;
  refreshLeads: () => Promise<void>;
  loading: boolean;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};

interface LeadsProviderProps {
  children: ReactNode;
}

export const LeadsProvider: React.FC<LeadsProviderProps> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const leadsWithReminders = leads.filter(lead => lead.reminder);
  const hasReminders = leadsWithReminders.length > 0;

  const refreshLeads = async () => {
    if (authLoading || !user) return;
    
    try {
      setLoading(true);
      const response = await getLeads();
      const leadsData = response.data || [];
      setLeads(leadsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLeads();
  }, [user, authLoading]);

  const value = {
    leads,
    leadsWithReminders,
    hasReminders,
    refreshLeads,
    loading
  };

  return (
    <LeadsContext.Provider value={value}>
      {children}
    </LeadsContext.Provider>
  );
}; 