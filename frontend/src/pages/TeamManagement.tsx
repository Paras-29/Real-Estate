import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronRight, 
  Copy, 
  Link2, 
  Mail, 
  Plus, 
  Search, 
  Share2, 
  Star, 
  User, 
  UserPlus, 
  Users
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const TeamManagement = () => {
  const { toast } = useToast();

  // Mock team data
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      level: 2,
      joinDate: "Feb 2025",
      properties: 8,
      teamSize: 3,
      performance: "high",
    },
    {
      id: 2,
      name: "Michael Chen",
      level: 1,
      joinDate: "Mar 2025",
      properties: 5,
      teamSize: 0,
      performance: "medium",
    },
    {
      id: 3,
      name: "Emily Williams",
      level: 1,
      joinDate: "Apr 2025",
      properties: 3,
      teamSize: 0,
      performance: "medium",
    },
  ];

  const referralLink = "https://kaamupoot.com/join?ref=agent123";

  const handleCopyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Success",
        description: "Referral link copied to clipboard!",
      });
    } catch (err) {
      console.error("Failed to copy referral link:", err);
      toast({
        title: "Error",
        description: "Failed to copy referral link.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-estate-blue text-white py-8">
          <div className="page-container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 animate-fade-in">Team Management</h1>
                <p className="text-blue-100 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  Build your network and increase your commission opportunities
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Button className="bg-estate-gold hover:bg-estate-gold/90 text-black">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Agent
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="page-container py-8">
          <Tabs defaultValue="hierarchy" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="hierarchy">
                <Users className="mr-2 h-4 w-4" />
                Hierarchy
              </TabsTrigger>
              <TabsTrigger value="invite">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite
              </TabsTrigger>
              <TabsTrigger value="stats">
                <Star className="mr-2 h-4 w-4" />
                Performance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hierarchy" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Hierarchy</CardTitle>
                  <CardDescription>
                    View your team structure and member details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-8 mt-4">
                    <div className="flex flex-col items-center p-4 border rounded-md border-estate-blue bg-estate-blue/5">
                      <div className="w-16 h-16 rounded-full bg-estate-blue flex items-center justify-center text-white mb-2">
                        <User className="h-8 w-8" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium">You</h3>
                        <p className="text-sm text-muted-foreground">Level 3</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full h-8 border-l-2 border-dashed border-estate-blue/50 ml-[50%]"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="border rounded-md p-4 card-hover">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 rounded-full bg-estate-blue/20 flex items-center justify-center text-estate-blue mr-3">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{member.name}</h3>
                            <p className="text-xs text-muted-foreground">Level {member.level} • {member.joinDate}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center p-2 bg-muted rounded-md">
                            <p className="text-xs text-muted-foreground">Properties</p>
                            <p className="font-medium">{member.properties}</p>
                          </div>
                          <div className="text-center p-2 bg-muted rounded-md">
                            <p className="text-xs text-muted-foreground">Team</p>
                            <p className="font-medium">{member.teamSize}</p>
                          </div>
                          <div className="text-center p-2 bg-muted rounded-md">
                            <p className="text-xs text-muted-foreground">Performance</p>
                            <div className={`h-2 mt-1 rounded-full ${
                              member.performance === 'high' 
                                ? 'bg-green-500' 
                                : member.performance === 'medium' 
                                ? 'bg-amber-500' 
                                : 'bg-red-500'
                            }`}></div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                          View Details
                          <ChevronRight className="ml-auto h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <Button variant="outline" className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Invite More Agents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="invite" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invite Team Members</CardTitle>
                  <CardDescription>
                    Grow your team by inviting other agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Your Referral Link</h3>
                    <div className="flex">
                      <div className="flex-1 bg-muted p-3 rounded-l-md text-sm truncate">
                        {referralLink}
                      </div>
                      <Button variant="secondary" className="rounded-l-none" onClick={handleCopyReferralLink}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this link with other agents. You'll earn commission from their sales.
                    </p>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <h3 className="text-sm font-medium mb-4">Send Direct Invitation</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="inviteEmail" type="email" placeholder="agent@example.com" className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="inviteMessage">Personal Message (Optional)</Label>
                      <textarea 
                        id="inviteMessage" 
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                        placeholder="Join my team on Kaamupoot to boost your real estate business and earn more commissions!"
                      ></textarea>
                    </div>
                    
                    <Button className="bg-estate-blue hover:bg-estate-blue/90 w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invitation
                    </Button>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Link2 className="mr-2 h-4 w-4" />
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>
                    Track your team's sales and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Team Overview</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                          This Month
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          <Search className="h-3 w-3 mr-1" />
                          Filter
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-xs text-muted-foreground">Total Members</p>
                        <p className="text-2xl font-bold">{teamMembers.length}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-xs text-muted-foreground">Total Properties</p>
                        <p className="text-2xl font-bold">16</p>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-xs text-muted-foreground">Commission Generated</p>
                        <p className="text-2xl font-bold">$12,450</p>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-xs text-muted-foreground">Average Performance</p>
                        <div className="flex items-center mt-2">
                          <div className="w-full bg-estate-blue/20 rounded-full h-2.5">
                            <div className="bg-estate-blue h-2.5 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <span className="text-xs font-medium ml-2">65%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium mt-8 mb-4">Member Performance</h3>
                  
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center p-3 border rounded-md">
                        <div className="w-10 h-10 rounded-full bg-estate-blue/20 flex items-center justify-center text-estate-blue mr-3">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{member.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                              Level {member.level}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <div className="w-full bg-estate-blue/20 rounded-full h-1.5 mr-2">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  member.performance === 'high' 
                                    ? 'bg-green-500' 
                                    : member.performance === 'medium' 
                                    ? 'bg-amber-500' 
                                    : 'bg-red-500'
                                }`} 
                                style={{ 
                                  width: member.performance === 'high' 
                                    ? '85%' 
                                    : member.performance === 'medium' 
                                    ? '60%' 
                                    : '30%' 
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {member.properties} properties
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TeamManagement;
