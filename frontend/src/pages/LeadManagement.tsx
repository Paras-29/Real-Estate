import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Filter,
  Phone,
  Mail,
  User,
  ArrowUpDown,
  Search,
  Plus,
  Trash2,
  MoreVertical,
  Bell,
  CheckCircle,
  Banknote,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  Target,
  Users,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLeads, createLead, deleteLead, getUsers, transferLead } from "../lib/api"; // Update import
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { useLeads } from "@/contexts/LeadsContext"; // Import useLeads
import api from '../lib/api';
import { useToast } from "@/components/ui/use-toast"; // Import useToast

// Define Lead interface to match backend data structure
interface Agent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Reminder {
  date: string;
  message: string;
}

interface Lead {
  _id: string;
  name: string; // Changed from firstName and lastName
  email: string;
  phone: string;
  status: string;
  source: string;
  notes?: string;
  assignedTo?: string | Agent;
  createdBy?: string | Agent;
  createdAt: string;
  updatedAt: string;
  lastContacted?: string;
  reminder?: Reminder;
  isTransferred?: boolean;
  transferHistory?: Array<{
    transferredTo: Agent;
    transferredAt: string;
    commissionSplit: {
      type: 'ratio' | 'custom';
      value: string;
    };
    transferredBy: Agent;
  }>;
  commissionSplit?: {
    type: 'ratio' | 'custom';
    value: string;
  };
  sellingPrice?: number;
  buyerName?: string;
}

interface UserFromBackend {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: 'agent' | 'company' | 'admin';
}

interface FormData {
  name: string; // Combined field for first and last name
  email: string;
  phone: string;
  source: string;
  status: string;
  notes: string;
  assignedTo: string;
}

const LeadManagement = () => {
  const { leads, refreshLeads } = useLeads(); // Use leads from context
  const { user, loading: authLoading } = useAuth(); // Get authLoading state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [addLeadDialogOpen, setAddLeadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedLeadForReminder, setSelectedLeadForReminder] = useState<Lead | null>(null);
  const [reminder, setReminder] = useState({
    date: '',
    message: ''
  });
  const [commissionSplitType, setCommissionSplitType] = useState<'ratio' | 'custom'>('ratio');
  const [customCommissionPercentage, setCustomCommissionPercentage] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<number | '' >('');
  const [buyerName, setBuyerName] = useState<string>('');
  const [showClosedFields, setShowClosedFields] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'new',
    notes: '',
    assignedTo: ''
  });

  const { toast } = useToast(); // Initialize useToast
  const navigate = useNavigate(); // Initialize useNavigate

  // Helper function to calculate commission percentages
  const getCommissionDisplay = (commissionSplit: any, isCreator: boolean) => {
    if (!commissionSplit) return null;
    
    if (commissionSplit.type === 'ratio') {
      // For ratio like "70-30", show 70% for creator, 30% for assigned
      const parts = commissionSplit.value.split('-');
      if (parts.length === 2) {
        const creatorPercent = parseInt(parts[0]);
        const assignedPercent = parseInt(parts[1]);
        return isCreator ? `Commission: ${creatorPercent}%` : `Commission: ${assignedPercent}%`;
      }
      return `Commission: ${commissionSplit.value}`;
    } else if (commissionSplit.type === 'custom') {
      // For custom percentage, show the percentage for the assigned agent
      // And the remaining for the creator
      const customValue = parseInt(commissionSplit.value);
      return isCreator ? `Commission: ${100 - customValue}%` : `Commission: ${customValue}%`;
    }
    return null;
  };

  // Add debug logging
  useEffect(() => {
    console.log("DEBUG - LeadManagement - Current user:", user);
    console.log("DEBUG - LeadManagement - User type:", user?.userType);
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !user) {
        console.log("DEBUG - LeadManagement - Skipping fetchData: authLoading or no user", { authLoading, user });
        return;
      }

      try {
        console.log("DEBUG - LeadManagement - Fetching data...");
        setLoading(true);
        
        // Fetch leads - this is now handled by the context
        console.log("DEBUG - LeadManagement - Leads from context:", leads);
        
        // Fetch agents if user is a company or admin
        const usersResponse = await getUsers();
        console.log("DEBUG - LeadManagement - Users response:", usersResponse);
        const agentsData = usersResponse
          .data.filter((u: UserFromBackend) => u.userType === 'agent')
          .map((u: UserFromBackend) => ({
            _id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            phone: u.phone || ''
          }));
        setAgents(agentsData);
        console.log("DEBUG - LeadManagement - Agents data set:", agentsData);
      } catch (err: any) {
        console.error("DEBUG - LeadManagement - Error fetching data:", err);
        toast({
          title: "Error",
          description: err.message || "Failed to fetch data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading, leads]);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Please log in to view leads.</div>;
  }

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      await refreshLeads(); // Refresh leads from API
      setDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Lead deleted successfully!",
      });
    } catch (err: any) {
      console.error("Error deleting lead:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete lead.",
        variant: "destructive",
      });
    }
  };

  const handleTransferLead = async () => {
    if (!selectedLead || !selectedAgentId) {
      toast({ title: "Error", description: "Please select both a lead and an agent to transfer to.", variant: "destructive" });
      return;
    }

    // Prepare commission split object
    const commissionSplit = {
      type: commissionSplitType, // This will be 'ratio' or 'custom'
      value: customCommissionPercentage // This will be "50-50", "70-30", "80-20", or "65"
    };

    try {
      setLoading(true);
      const response = await transferLead(selectedLead._id, selectedAgentId, commissionSplit);
      
      // Refresh leads from API
      await refreshLeads();
      
      // Close dialog and show success message
      setTransferDialogOpen(false);
      setSelectedAgentId("");
      setCustomCommissionPercentage(''); // Clear custom commission after transfer
      setCommissionSplitType('ratio'); // Reset to default
      toast({
        title: "Success",
        description: "Lead transferred successfully!",
      });
    } catch (err: any) {
      console.error("Error transferring lead:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to transfer lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    if (newStatus === 'closed') {
      setShowClosedFields(true);
      // Don't submit yet, just show the fields
        return;
      }
    
    try {
      // Logic for non-closed status updates...
      await api.updateLead(leadId, { status: newStatus });
      toast({ title: "Success", description: "Lead status updated successfully." });
      refreshLeads();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update lead status.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLeadDetails = async () => {
    if (!selectedLead) return;

    try {
      const updatePayload: Partial<Lead> = {
        status: 'closed',
        sellingPrice: Number(sellingPrice),
        buyerName,
      };

      await api.updateLead(selectedLead._id, updatePayload);
      toast({ title: "Success", description: "Lead updated to closed." });
      refreshLeads();
      setViewDetailsDialogOpen(false);
      setShowClosedFields(false); // Reset for next time
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update lead.",
        variant: "destructive",
      });
    }
  };

  const handleSetReminder = async (leadId: string) => {
    try {
      if (!selectedLeadForReminder) return;

      const updatedLead = await api.patch(`/leads/${leadId}/reminder`, reminder);
      await refreshLeads(); // Refresh leads from API
      setReminderDialogOpen(false);
      toast({
        title: "Success",
        description: "Reminder set successfully!",
      });
    } catch (err: any) {
      console.error("Error setting reminder:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to set reminder.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
    if (value === 'closed') {
      setShowClosedFields(true);
    } else {
      setShowClosedFields(false);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setReminder(prev => ({ ...prev, date: date.toISOString().slice(0, 16) })); // Format to YYYY-MM-DDTHH:MM
    }
  };

  const handleTimeChange = (time: string) => {
    setReminder(prev => {
      const datePart = prev.date ? prev.date.slice(0, 10) : '';
      return { ...prev, date: `${datePart}T${time}` };
    });
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const leadData: any = { ...formData };
      if (formData.status === 'closed') {
        leadData.sellingPrice = Number(sellingPrice);
        leadData.buyerName = buyerName;
      }
      await createLead(leadData);
      setAddLeadDialogOpen(false);
      refreshLeads();
      toast({
        title: "Success!",
        description: "New lead has been created.",
      });
    } catch (err: any) {
      toast({
        title: "Error Creating Lead",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const filteredLeads = leads.filter(lead =>
    (lead.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (lead.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (lead.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (lead.status?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (lead.source?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Filtered leads: if a lead is closed, only show the closed version
  const dedupedLeads = filteredLeads.filter((lead, idx, arr) => {
    if (lead.status === 'closed') {
      // Only show the closed version for this lead (by unique name/email/phone)
      return (
        arr.findIndex(l => l.name === lead.name && l.email === lead.email && l.phone === lead.phone && l.status === 'closed') === idx
      );
    } else {
      // Only show non-closed if there is no closed version for this lead
      return !arr.some(l => l.name === lead.name && l.email === lead.email && l.phone === lead.phone && l.status === 'closed');
    }
  });

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading leads...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="bg-estate-green text-white py-8">
        <div className="page-container flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold mb-2 animate-fade-in">Lead Management</h1>
            <p className="animate-fade-in" style={{ animationDelay: "0.1s" }}>Manage and track your leads efficiently.</p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Dialog open={addLeadDialogOpen} onOpenChange={setAddLeadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-estate-gold text-black hover:bg-estate-gold/90 w-full sm:w-auto">
                <Plus className="h-5 w-5 mr-2" />
                Add New Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto p-4 bg-white rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Plus className="h-6 w-6 text-green-600" />
                  Add New Lead
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">
                  Enter the details of the new lead below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLead} className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-700">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter lead's name"
                    required
                  />
                </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter lead's email"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-gray-700">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter lead's phone number"
                    required
                  />
                </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="source" className="text-gray-700">Source</Label>
                  <Select
                    name="source"
                    value={formData.source}
                      onValueChange={(value) => handleInputChange({ target: { name: "source", value } } as React.ChangeEvent<HTMLSelectElement>)}
                      disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="status" className="text-gray-700">Status</Label>
                    <Select onValueChange={handleFormStatusChange} defaultValue={formData.status}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {showClosedFields && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sellingPrice">Selling Price</Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(Number(e.target.value))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyerName">Buyer Name</Label>
                      <Input
                        id="buyerName"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)} 
                      />
                    </div>
                  </>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="notes" className="text-gray-700">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any relevant notes"
                  />
                </div>
                
                {(user?.userType === 'admin' || user?.userType === 'company') && (
                  <div className="grid gap-2">
                    <Label htmlFor="assignedTo" className="text-gray-700">Assign To (Optional)</Label>
                    <Select
                      name="assignedTo"
                      value={formData.assignedTo}
                      onValueChange={(value) => handleInputChange({ target: { name: "assignedTo", value } } as React.ChangeEvent<HTMLSelectElement>)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent._id} value={agent._id}>
                            {`${agent.firstName || ''} ${agent.lastName || ''}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4 sticky bottom-0 bg-white border-t">
                  <Button type="button" variant="outline" onClick={() => setAddLeadDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    {loading ? 'Adding...' : 'Add Lead'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-bold mb-2 text-gray-800">Your Leads</CardTitle>
              <CardDescription className="text-gray-600">Overview of all your managed leads.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search leads..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          </div>
          </CardHeader>
          <CardContent>
            <Table className="min-w-full bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Lead Name
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Source
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Created By
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Assigned To
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Reminder
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <MoreVertical className="h-4 w-4" />
                      Actions
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dedupedLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No leads found.
                    </TableCell>
                  </TableRow>
                ) : (
                  dedupedLeads.map((lead) => (
                    <TableRow key={lead._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {lead.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={(() => {
                                  switch (lead.status) {
                                    case 'new': return 'outline';
                            case 'Hot': return 'destructive';
                            case 'Warm': return 'warning';
                                    case 'Cold': return 'info';
                            case 'Closed': return 'default';
                                    default: return 'outline';
                                  }
                        })()}>
                                {lead.status}
                              </Badge>
                        {lead.isTransferred && <Badge variant="outline" className="ml-2 text-xs">Transferred</Badge>}
                        {lead.status === 'Closed' && ( // Display selling price and buyer name on lead list
                          <div className="text-xs text-gray-500 mt-1">
                            <Banknote className="h-3 w-3 inline mr-1" />
                            ₹{lead.sellingPrice?.toLocaleString()} | {lead.buyerName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.source}
                      </TableCell>
                      <TableCell>
                        {typeof lead.createdBy === 'object' && lead.createdBy
                          ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">{`${lead.createdBy.firstName || ''} ${lead.createdBy.lastName || ''}`}</span>
                              </div>
                              <div className="flex items-center gap-2 ml-6">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span className="text-sm text-gray-600">{lead.createdBy.email || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 ml-6">
                                <Phone className="h-3 w-3 text-gray-500" />
                                <span className="text-sm text-gray-500">{lead.createdBy.phone || 'N/A'}</span>
                              </div>
                              {lead.commissionSplit && (
                                <div className="flex items-center gap-2 ml-6 mt-1">
                                  <Banknote className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-500">
                                  {getCommissionDisplay(lead.commissionSplit, false)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                          : (
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-400">N/A</span>
                            </div>
                          )}
                      </TableCell>
                      <TableCell>
                        {typeof lead.assignedTo === 'object' && lead.assignedTo
                          ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-orange-600" />
                                <span className="font-medium">{`${lead.assignedTo.firstName || ''} ${lead.assignedTo.lastName || ''}`}</span>
                              </div>
                              <div className="flex items-center gap-2 ml-6">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span className="text-sm text-gray-600">{lead.assignedTo.email || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 ml-6">
                                <Phone className="h-3 w-3 text-gray-500" />
                                <span className="text-sm text-gray-500">{lead.assignedTo.phone || 'N/A'}</span>
                              </div>
                              {lead.commissionSplit && (
                                <div className="flex items-center gap-2 ml-6 mt-1">
                                  <Banknote className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-500">
                                  {getCommissionDisplay(lead.commissionSplit, true)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                          : (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-400">Unassigned</span>
                            </div>
                          )}
                      </TableCell>
                      <TableCell>
                        {lead.reminder ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Bell className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(lead.reminder.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 ml-5">
                              <Clock className="h-3 w-3 text-gray-600" />
                              <span className="text-xs text-gray-600">
                                {new Date(lead.reminder.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 ml-5">
                              <FileText className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-500 truncate max-w-[150px]" title={lead.reminder.message}>
                                {lead.reminder.message}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-400">No reminder</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.status === 'closed' ? (
                          // Only show delete action for closed leads
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedLead(lead); setDeleteDialogOpen(true); }}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          // Show all actions for non-closed leads, but only allow close if user is creator or assignee
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {((user._id === (typeof lead.createdBy === 'object' ? lead.createdBy._id : lead.createdBy)) ||
                                (user._id === (typeof lead.assignedTo === 'object' ? lead.assignedTo._id : lead.assignedTo))) && (
                                <DropdownMenuItem onClick={() => { setSelectedLead(lead); setViewDetailsDialogOpen(true); }}>
                                  <CheckCircle className="h-4 w-4 mr-2" /> Close Lead
                                </DropdownMenuItem>
                              )}
                              {/* Other actions (edit, transfer, etc.) can go here as before */}
                              <DropdownMenuItem onClick={() => { setSelectedLead(lead); setDeleteDialogOpen(true); }}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Lead Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Transfer Lead
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Transfer "{selectedLead?.name}" to a different agent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newAgent" className="text-gray-700">Select Agent</Label>
              {agents.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No agents available for transfer.
                </div>
              ) : (
                <Select
                  value={selectedAgentId}
                  onValueChange={setSelectedAgentId}
                  disabled={loading}
                >
                  <SelectTrigger id="newAgent">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {`${agent.firstName || ''} ${agent.lastName || ''}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {/* Commission Distribution Options */}
            <div className="grid gap-2">
              <Label htmlFor="commissionSplitType" className="text-gray-700">Commission Split</Label>
              <Select
                value={commissionSplitType}
                onValueChange={(value: 'ratio' | 'custom') => setCommissionSplitType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select commission split" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ratio">Ratio (50-50, 70-30, 80-20)</SelectItem>
                  <SelectItem value="custom">Custom Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {commissionSplitType === 'custom' && (
              <div className="grid gap-2">
                <Label htmlFor="customCommission" className="text-gray-700">Custom Percentage for Transferred Agent</Label>
                <Input
                  id="customCommission"
                  name="customCommission"
                  type="number"
                  value={customCommissionPercentage}
                  onChange={(e) => setCustomCommissionPercentage(e.target.value)}
                  placeholder="e.g., 30"
                  min="0"
                  max="100"
                />
                <p className="text-sm text-muted-foreground">
                  This agent will receive {customCommissionPercentage || 0}% commission.
                  Your commission will be {100 - (parseInt(customCommissionPercentage) || 0)}%.
                </p>
              </div>
            )}
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setTransferDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} onClick={handleTransferLead} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                {loading ? 'Transferring...' : 'Transfer Lead'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-6 bg-white rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-600" />
              Lead Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Detailed information about {selectedLead?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name:</p>
                  <p className="text-lg">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email:</p>
                  <p className="text-lg">{selectedLead.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone:</p>
                  <p className="text-lg">{selectedLead.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status:</p>
                  <Badge variant={(() => {
                            switch (selectedLead.status) {
                              case 'new': return 'outline';
                      case 'Hot': return 'destructive';
                      case 'Warm': return 'warning';
                      case 'Cold': return 'secondary';
                      case 'Closed': return 'default';
                              default: return 'outline';
                            }
                  })()}>
                          {selectedLead.status}
                        </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Source:</p>
                  <p className="text-lg">{selectedLead.source}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned To:</p>
                  <p className="text-lg">
                    {typeof selectedLead.assignedTo === 'object' 
                      ? `${selectedLead.assignedTo.firstName || ''} ${selectedLead.assignedTo.lastName || ''}`
                      : 'Unassigned'}
                  </p>
                  {selectedLead.commissionSplit && (
                      <p className="text-xs text-gray-500 mt-1">
                        {getCommissionDisplay(selectedLead.commissionSplit, false)}
                      </p>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Created By:</p>
                  <p className="text-lg">
                    {typeof selectedLead.createdBy === 'object'
                      ? `${selectedLead.createdBy.firstName || ''} ${selectedLead.createdBy.lastName || ''}`
                      : 'N/A'}
                  </p>
                  {selectedLead.commissionSplit && (
                      <p className="text-xs text-gray-500 mt-1">
                        {getCommissionDisplay(selectedLead.commissionSplit, true)}
                      </p>
                    )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Created At:</p>
                  <p className="text-lg">{new Date(selectedLead.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {selectedLead.lastContacted && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Contacted:</p>
                  <p className="text-lg">{new Date(selectedLead.lastContacted).toLocaleString()}</p>
                </div>
              )}
              {selectedLead.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Notes:</p>
                  <p className="text-lg">{selectedLead.notes}</p>
                </div>
              )}
              {selectedLead.status === 'Closed' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Selling Price:</p>
                      <p className="text-lg">₹{selectedLead.sellingPrice?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Buyer's Name / Customer Name:</p>
                      <p className="text-lg">{selectedLead.buyerName}</p>
                    </div>
                  </div>
                  {selectedLead.transferHistory && selectedLead.transferHistory.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Transfer History:</p>
                      {selectedLead.transferHistory.map((transfer, index) => (
                        <div key={index} className="ml-4 mt-2 p-2 border rounded-md">
                          <p className="text-sm">Transferred To: {typeof transfer.transferredTo === 'object' ? `${transfer.transferredTo.firstName || ''} ${transfer.transferredTo.lastName || ''}` : 'N/A'}</p>
                          <p className="text-sm">Transferred At: {new Date(transfer.transferredAt).toLocaleString()}</p>
                          <p className="text-sm">Commission Split: {transfer.commissionSplit.type === 'ratio' ? transfer.commissionSplit.value : `${transfer.commissionSplit.value}%`}</p>
                          <p className="text-sm">Transferred By: {typeof transfer.transferredBy === 'object' ? `${transfer.transferredBy.firstName || ''} ${transfer.transferredBy.lastName || ''}` : 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {selectedLead.reminder && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Reminder:</p>
                  <p className="text-lg">Date: {new Date(selectedLead.reminder.date).toLocaleString()}</p>
                  <p className="text-lg">Message: {selectedLead.reminder.message}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {showClosedFields || selectedLead?.status === 'closed' ? (
              <Button onClick={handleUpdateLeadDetails}>Save & Close Lead</Button>
            ) : (
            <Button onClick={() => setViewDetailsDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Lead Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead 
              <span className="font-bold">"{selectedLead?.name}"</span>
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedLead && handleDeleteLead(selectedLead._id)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-blue-600" />
              Set Reminder
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Set a reminder for "{selectedLeadForReminder?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reminderDate" className="text-gray-700">Date</Label>
              <Input
                id="reminderDate"
                name="date"
                type="datetime-local"
                value={reminder.date}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reminderMessage" className="text-gray-700">Message</Label>
              <Textarea
                id="reminderMessage"
                name="message"
                value={reminder.message}
                onChange={(e) => setReminder(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter reminder message"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReminderDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} onClick={() => selectedLeadForReminder && handleSetReminder(selectedLeadForReminder._id)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              {loading ? 'Setting...' : 'Set Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default LeadManagement;