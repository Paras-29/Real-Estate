import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Building2,
  Home,
  Link as LinkIcon,
  ListFilter,
  Plus,
  Share2,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getProperties, getTeams, getMySales, getCompanySales, getCommissions } from "../lib/api";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user, loading: userLoading } = useAuth();
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [pendingPropertiesCount, setPendingPropertiesCount] = useState(0);
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const [totalCommission, setTotalCommission] = useState("$0");
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        let propertiesData: any[] = [];
        let teamsData: any[] = [];
        let commissionsData: any[] = [];

        propertiesData = (await getProperties()).data.properties || [];
        teamsData = (await getTeams()).data.teams || [];
        
        if (user?.userType === 'agent') {
          const salesAndCommissions = await getMySales();
          commissionsData = salesAndCommissions.data?.personalCommissions || [];
        } else if (user?.userType === 'company') {
          const companyData = await getCompanySales();
          commissionsData = companyData.data?.companyCommissions || [];
        } else { // Admin or other user types
          const allCommissions = await getCommissions();
          commissionsData = allCommissions.data?.commissions || [];
        }

        setPropertiesCount(propertiesData.length);
        setPendingPropertiesCount(propertiesData.filter((p: any) => p.status === 'pending').length);
        setTeamMembersCount(teamsData.length); // Assuming teamsData is an array of team members

        // Calculate total commission and sales
        const calculatedCommission = commissionsData.reduce((acc: number, comm: any) => acc + comm.amount, 0);
        setTotalCommission(`$${calculatedCommission.toLocaleString()}`);
        setTotalSales(commissionsData.length); // Assuming each commission record represents a sale

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (!userLoading && user) {
      fetchDashboardData();
    } else if (!userLoading && !user) {
      setLoading(false); // If no user, stop loading and allow error to display if any
      setError("Please log in to view the dashboard.");
    }
  }, [user, userLoading]);

  if (userLoading || loading) return <div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-estate-blue text-white py-8">
          <div className="page-container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 animate-fade-in">Welcome, {user?.firstName || user?.email || 'Guest'}</h1>
                <p className="text-blue-100 animate-fade-in" style={{ animationDelay: "0.1s" }}>Level {user?.level || 1} Agent • {teamMembersCount} Team Members</p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Button size="sm" variant="outline" className="text-white border-white/30 bg-white/10 hover:bg-white/20 hover:text-white">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Profile
                </Button>
                <Button size="sm" className="bg-estate-gold hover:bg-estate-gold/90 text-black">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="page-container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="animate-fade-in card-hover" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Home className="mr-2 h-5 w-5 text-estate-blue" />
                  Properties
                </CardTitle>
                <CardDescription>Your active listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{propertiesCount}</div>
                <div className="text-sm text-muted-foreground mt-1">{pendingPropertiesCount} pending approval</div>
                <Button variant="outline" className="w-full mt-4 text-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in card-hover" style={{ animationDelay: "0.3s" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-estate-blue" />
                  Team
                </CardTitle>
                <CardDescription>Your team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{teamMembersCount}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Across {teamMembersCount > 0 ? 3 : 0} levels
                </div>
                <Button variant="outline" className="w-full mt-4 text-sm">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Generate Invite
                </Button>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in card-hover" style={{ animationDelay: "0.4s" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-estate-blue" />
                  Commission
                </CardTitle>
                <CardDescription>Current earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalCommission}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  From {totalSales} sales
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-4">
                  <div 
                    className="bg-estate-blue h-2 rounded-full" 
                    style={{ width: `${((user?.level || 1) / 7) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Level {user?.level || 1}/7 • {7 - (user?.level || 1)} more levels to unlock
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <Tabs defaultValue="listings" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="listings" className="text-sm">
                  <ListFilter className="mr-2 h-4 w-4" />
                  Listings
                </TabsTrigger>
                <TabsTrigger value="team" className="text-sm">
                  <Users className="mr-2 h-4 w-4" />
                  Team
                </TabsTrigger>
                <TabsTrigger value="companies" className="text-sm">
                  <Building2 className="mr-2 h-4 w-4" />
                  Companies
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="listings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Property Listings</CardTitle>
                    <CardDescription>
                      Manage and track your property listings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground/60" />
                      <p className="mb-4">You haven't created any property listings yet</p>
                      <Button className="bg-estate-blue hover:bg-estate-blue/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Listing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="team" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Team Members</CardTitle>
                    <CardDescription>
                      Manage your team and track performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/60" />
                      <p className="mb-4">Start building your team to earn higher commissions</p>
                      <Button className="bg-estate-blue hover:bg-estate-blue/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Team
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="companies" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Associated Companies</CardTitle>
                    <CardDescription>
                      Companies you're working with
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/60" />
                      <p className="mb-4">You're not associated with any companies yet</p>
                      <Button className="bg-estate-blue hover:bg-estate-blue/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Join Company
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
