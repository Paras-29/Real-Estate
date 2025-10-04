import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, Users, Star, Mail, Phone, MapPin, UserCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface Agent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  personalSalesCount?: number;
}

interface Company {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  licenseNumber?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return '';
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

const GlobalAgents = () => {
  const [tab, setTab] = useState<'all' | 'top'>('all');
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [topAgents, setTopAgents] = useState<Agent[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ city: '', state: '', country: '' });

  // Fetch all agents with filters
  const fetchAllAgents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.city) params.city = filters.city;
      if (filters.state) params.state = filters.state;
      if (filters.country) params.country = filters.country;
      const res = await axios.get(`${API_BASE}/api/users/all-agents`, { params });
      setAllAgents(res.data.data);
    } catch (err) {
      setAllAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch top agents
  const fetchTopAgents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/users/top-agents`);
      setTopAgents(res.data.data);
    } catch (err) {
      setTopAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all companies with filters
  const fetchAllCompanies = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.city) params.city = filters.city;
      if (filters.state) params.state = filters.state;
      if (filters.country) params.country = filters.country;
      const res = await axios.get(`${API_BASE}/api/users/all-companies`, { params });
      setAllCompanies(res.data.data);
    } catch (err) {
      setAllCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'all') {
      fetchAllAgents();
      fetchAllCompanies();
    }
    if (tab === 'top') fetchTopAgents();
    // eslint-disable-next-line
  }, [tab, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full bg-estate-green text-white py-8 shadow-md">
        <div className="page-container flex justify-between items-center">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold animate-fade-in">Global Agents</h1>
            <p className="text-lg opacity-90 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Browse and connect with agents worldwide.
            </p>
          </div>
        </div>
      </div>
      <main className="flex-1 page-container py-8">
        <Card className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto animate-fade-in shadow-xl rounded-2xl border-0 px-2 md:px-6 lg:px-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-estate-green">
              <Users className="h-6 w-6" />
              Global Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={v => setTab(v as 'all' | 'top')}>
              <TabsList className="mb-8 w-full flex flex-wrap gap-2">
                <TabsTrigger value="all" className="flex-1 min-w-[120px]">All Agents</TabsTrigger>
                <TabsTrigger value="top" className="flex-1 min-w-[120px]">Top Agents</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="min-w-full">
                <div className="min-h-[400px]">
                  <h2 className="text-lg font-semibold mb-2 text-estate-green mt-14 sm:mt-4">All Agents</h2>
                  <div className="mb-4 flex flex-col md:flex-row flex-wrap gap-2 items-center w-full">
                    <div className="relative w-full md:w-56">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        className="pl-10 pr-4 py-2 w-full sm:w-56"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                    <Input name="city" placeholder="City" value={filters.city} onChange={handleFilterChange} className="w-full md:w-32" />
                    <Input name="state" placeholder="State" value={filters.state} onChange={handleFilterChange} className="w-full md:w-32" />
                    <Input name="country" placeholder="Country" value={filters.country} onChange={handleFilterChange} className="w-full md:w-32" />
                    <Button onClick={fetchAllAgents} size="sm" className="w-full md:w-auto">Filter</Button>
                  </div>
                  <div className="space-y-4">
                    {loading ? <div>Loading...</div> :
                      [...allAgents
                        .filter(agent =>
                          !search ||
                          agent.firstName?.toLowerCase().includes(search.toLowerCase()) ||
                          agent.lastName?.toLowerCase().includes(search.toLowerCase()) ||
                          agent.email?.toLowerCase().includes(search.toLowerCase()) ||
                          agent.phone?.toLowerCase().includes(search.toLowerCase())
                        ),
                        ...allCompanies
                          .filter(company =>
                            !search ||
                            company.companyName?.toLowerCase().includes(search.toLowerCase()) ||
                            company.email?.toLowerCase().includes(search.toLowerCase()) ||
                            company.phone?.toLowerCase().includes(search.toLowerCase())
                          )
                          .map(company => ({ ...company, isCompany: true }))
                      ]
                        .map((item: any) => (
                          <div key={item._id} className="group border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold border-2 ${item.isCompany ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-estate-green/10 text-estate-green border-estate-green/20'}`}> 
                                {item.isCompany ? <Building2 className="h-7 w-7 md:h-8 md:w-8 text-estate-blue" /> : getInitials(item.firstName, item.lastName) || <UserCircle2 className="h-7 w-7 md:h-8 md:w-8 text-estate-green/30" />}
                              </div>
                              <div>
                                <div className="font-bold text-base md:text-lg text-estate-green flex items-center gap-2">
                                  {item.isCompany ? item.companyName : `${item.firstName} ${item.lastName}`}
                                  {item.isCompany && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-yellow-200 text-estate-blue font-semibold">Company</span>}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600">
                                  <Mail className="h-4 w-4" /> {item.email}
                                  <Phone className="h-4 w-4 ml-2" /> {item.phone}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  <MapPin className="h-4 w-4" />
                                  {[item.address, item.city, item.state, item.country].filter(Boolean).join(', ')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    }
                    {!loading && allAgents.length === 0 && allCompanies.length === 0 && <div>No agents or companies found.</div>}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="top" className="min-w-full">
                <div className="min-h-[400px]">
                  <h2 className="text-lg font-semibold mb-2 mt-14 sm:mt-4 text-estate-green flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 " /> Top Agents & Companies
                  </h2>
                  {/* Add invisible spacer div to match the filter section height */}
                  <div className="mb-4 invisible">
                    <div className="flex flex-col md:flex-row flex-wrap gap-2 items-center w-full">
                      <div className="relative w-full md:w-56">
                        <Input className="pl-10 pr-4 py-2 w-full sm:w-56" />
                      </div>
                      <Input className="w-full md:w-32" />
                      <Input className="w-full md:w-32" />
                      <Input className="w-full md:w-32" />
                      <Button size="sm" className="w-full md:w-auto">Filter</Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {loading ? <div>Loading...</div> :
                      [...topAgents.map(agent => ({ ...agent, isCompany: false })),
                       ...allCompanies.map(company => ({ ...company, isCompany: true }))]
                        .map((item: any, idx: number) => (
                          <div key={item._id} className="group border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold border-2 ${item.isCompany ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}`}> 
                                {item.isCompany ? <Building2 className="h-7 w-7 md:h-8 md:w-8 text-estate-blue" /> : getInitials(item.firstName, item.lastName) || <UserCircle2 className="h-7 w-7 md:h-8 md:w-8 text-yellow-300" />}
                              </div>
                              <div>
                                <div className="font-bold text-base md:text-lg text-estate-green flex items-center gap-2">
                                  {item.isCompany ? item.companyName : `${item.firstName} ${item.lastName}`}
                                  {item.isCompany && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-yellow-200 text-estate-blue font-semibold">Company</span>}
                                  {!item.isCompany && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-yellow-200 text-yellow-800 font-semibold">Top Agent</span>}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600">
                                  <Mail className="h-4 w-4" /> {item.email}
                                  <Phone className="h-4 w-4 ml-2" /> {item.phone}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  <MapPin className="h-4 w-4" />
                                  {[item.address, item.city, item.state, item.country].filter(Boolean).join(', ')}
                                </div>
                              </div>
                            </div>
                            {!item.isCompany && (
                              <div className="text-right flex flex-col items-end mt-2 md:mt-0">
                                <div className="text-xs text-gray-500">Sales</div>
                                <div className="font-bold text-lg text-green-700">{item.personalSalesCount || 0}</div>
                                {idx === 0 && <span className="mt-1 px-2 py-0.5 text-xs rounded bg-green-200 text-green-800 font-semibold">#1</span>}
                              </div>
                            )}
                          </div>
                        ))
                    }
                    {!loading && topAgents.length === 0 && allCompanies.length === 0 && <div>No top agents or companies found.</div>}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default GlobalAgents;