import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { BarChart3, ChevronRight, DollarSign, HelpCircle, Star, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link, useNavigate } from "react-router-dom";
import { createScrollAreaScope } from "@radix-ui/react-scroll-area";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyDownline, getMySales, getMyCommissions, getCompanySales } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Commission level data
const commissionLevels = [
  {
    level: 1,
    personalCommission: "3%",
    teamCommission: "0%",
    achievementCriteria: "Join Kaamupoot",
    maxEarning: "$300000/mo",
    benefits: ["Basic listing tools", "Client management"]
  },
  {
    level: 2,
    personalCommission: "4%",
    teamCommission: "1%",
    achievementCriteria: "3+ sales AND 5+ team members",
    maxEarning: "$1200000/mo",
    benefits: ["Team building tools", "Enhanced visibility"]
  },
  {
    level: 3,
    personalCommission: "5%",
    teamCommission: "2%",
    achievementCriteria: "7+ sales AND 15+ team members",
    maxEarning: "$2500000/mo",
    benefits: ["Marketing automation", "Priority support"]
  },
  {
    level: 4,
    personalCommission: "6%",
    teamCommission: "3%",
    achievementCriteria: "10+ sales AND 30+ team members",
    maxEarning: "$20000000/mo",
    benefits: ["Premium analytics", "Coaching sessions"]
  },
  {
    level: 5,
    personalCommission: "6.50%",
    teamCommission: "3.50%",
    achievementCriteria: "30+ sales AND 100+ team members",
    maxEarning: "$50000000/mo",
    benefits: ["VIP client tools", "Regional exclusivity"]
  },
  {
    level: 6,
    personalCommission: "6.75%",
    teamCommission: "3.75%",
    achievementCriteria: "50+ sales AND 200+ team members",
    maxEarning: "$1000,00000/mo",
    benefits: ["Executive retreat", "Leadership program"]
  },
  {
    level: 7,
    personalCommission: "7%",
    teamCommission: "4%",
    achievementCriteria: "100+ sales AND 350+ team members",
    maxEarning: "$250000000/mo",
    benefits: ["Global network access", "Equity opportunities"]
  }
];

const faqs = [
  {
    question: "How are commissions calculated?",
    answer: "Commissions are calculated based on a 7% total commission pool. Your personal commission varies by level (3% to 7%), and the remaining amount is distributed to your upline team members according to their levels."
  },
  {
    question: "What are the requirements for leveling up?",
    answer: "Requirements for leveling up include achieving specific numbers of sales or total sales volume, as well as building and maintaining a certain team size."
  },
  {
    question: "How often are commissions paid out?",
    answer: "Commissions are typically paid out on a monthly basis, directly deposited into your linked bank account. Detailed statements are available in your dashboard."
  },
  {
    question: "How does team commission distribution work?",
    answer: "When you make a sale, your personal commission is deducted from the 7% total pool. The remaining amount is distributed to your upline agents: Level 1 (0%), Level 2-4 (1% each), Level 5 (0.5%), Level 6-7 (0.25% each)."
  },
];

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'agent' | 'company' | 'admin';
  level: number;
  personalSalesVolume: number;
  teamSalesVolume: number;
  personalSalesCount: number;
  teamSalesCount: number;
  companyName?: string;
}

interface Property {
  _id: string;
  title: string;
  price: number;
  soldDate: string;
  soldBy: string;
}

interface CommissionRecord {
  _id: string;
  agent: string;
  property: string;
  amount: number;
  type: string;
  date: string;
  company?: string;
}

const CommissionStructure = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentLevel, setCurrentLevel] = useState<number>(user?.level || 1);
  const [personalSalesVolume, setPersonalSalesVolume] = useState<number>(user?.personalSalesVolume || 0);
  const [teamSalesVolume, setTeamSalesVolume] = useState<number>(user?.teamSalesVolume || 0);
  const [personalSalesCount, setPersonalSalesCount] = useState<number>(user?.personalSalesCount || 0);
  const [teamSalesCount, setTeamSalesCount] = useState<number>(user?.teamSalesCount || 0);
  const [downlineAgents, setDownlineAgents] = useState<UserData[]>([]);
  const [mySales, setMySales] = useState<Property[]>([]);
  const [myCommissions, setMyCommissions] = useState<CommissionRecord[]>([]);
  const [companySales, setCompanySales] = useState<Property[]>([]);
  const [companyCommissions, setCompanyCommissions] = useState<CommissionRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Add calculator state
  const [calculatorInputs, setCalculatorInputs] = useState({
    salesVolume: 1000000,
    teamSize: 5,
    teamMemberSales: 500000,
    useCustomSalesVolume: false,
    useCustomTeamSize: false,
    useCustomTeamSales: false
  });

  useEffect(() => {
    if (!authLoading && user) {
      setCurrentLevel(user.level || 1);
      setPersonalSalesVolume(user.personalSalesVolume || 0);
      setTeamSalesVolume(user.teamSalesVolume || 0);
      setPersonalSalesCount(user.personalSalesCount || 0);
      setTeamSalesCount(user.teamSalesCount || 0);

      const fetchCommissionData = async () => {
        setDataLoading(true);
        try {
          if (user.userType === 'agent') {
            // Get downline agents
            const downlineRes = await getMyDownline();
            setDownlineAgents(downlineRes.data?.downline || []);
            
            // Get sales data
            const salesRes = await getMySales();
            setMySales(salesRes.data?.personalSales || []);
            
            // Get commission data
            const commissionsRes = await getMyCommissions();
            setMyCommissions(commissionsRes.data?.commissions || []);
          } else if (user.userType === 'company') {
            // Get downline agents
            const downlineRes = await getMyDownline();
            setDownlineAgents(downlineRes.data?.downline || []);

            // Get company sales and commissions
            const companySalesRes = await getCompanySales();
            const allCompanyCommissions = companySalesRes.data?.commissions || [];
            const companyPersonalSales = allCompanyCommissions
              .filter((commission: CommissionRecord) => commission.type === 'personal' && commission.company === user?.companyName)
              .map((commission: CommissionRecord) => commission.property); // Assuming commission.property is the full Property object from populate
            
            setCompanySales(companyPersonalSales);
            setCompanyCommissions(allCompanyCommissions);
          }
        } catch (err) {
          console.error("Error fetching commission data:", err);
          toast({
            title: "Error",
            description: "Failed to load commission details. Please ensure you are logged in and authorized.",
            variant: "destructive",
          });
        } finally {
          setDataLoading(false);
        }
      };

      fetchCommissionData();
    }
  }, [user, authLoading]);

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate earnings based on inputs
  const calculateEarnings = () => {
    const { salesVolume, teamSize, teamMemberSales } = calculatorInputs;
    const totalCommissionRate = 0.07; // 7% total
    
    // Personal commission (your own sales)
    const personalCommissionRate = commissionLevels[currentLevel - 1].personalCommission;
    const personalCommissionPercentage = parseFloat(personalCommissionRate) / 100;
    const personalCommission = salesVolume * personalCommissionPercentage;

    // Upline commission (what you would earn as an upline from your downline's sales)
    // Distribution as per FAQ:
    // Level 2-4: 1% each, Level 5: 0.5%, Level 6-7: 0.25% each
    let uplineCommissionPercentage = 0;
    if (currentLevel >= 2 && currentLevel <= 4) {
      uplineCommissionPercentage = 0.01;
    } else if (currentLevel === 5) {
      uplineCommissionPercentage = 0.005;
    } else if (currentLevel === 6 || currentLevel === 7) {
      uplineCommissionPercentage = 0.0025;
    }
    // Upline commission is based on your team's sales (teamSize * teamMemberSales)
    const teamTotalSales = teamSize * teamMemberSales;
    const uplineCommission = teamTotalSales * uplineCommissionPercentage;

    // Total commission distributed (personal + upline)
    const totalAnnualEarning = personalCommission + uplineCommission;
    const monthlyAverage = totalAnnualEarning / 12;

    // For reference, also show the full 7% pool for your own sales
    const totalCommissionPool = salesVolume * totalCommissionRate;
    const remainingCommissionAmount = totalCommissionPool - personalCommission;

    return {
      personalCommission,
      uplineCommission,
      totalAnnualEarning,
      monthlyAverage,
      totalCommissionPool,
      remainingCommissionAmount
    };
  };

  // Handle calculator input changes
  const handleCalculatorChange = (field: string, value: string) => {
    const numValue = parseInt(value);
    const isCustomInput = 
      (field === 'salesVolume' && calculatorInputs.useCustomSalesVolume) ||
      (field === 'teamSize' && calculatorInputs.useCustomTeamSize) ||
      (field === 'teamMemberSales' && calculatorInputs.useCustomTeamSales);

    if (isCustomInput) {
      // Ensure the value is a valid number and not negative
      if (!isNaN(numValue) && numValue >= 0) {
        setCalculatorInputs(prev => ({
          ...prev,
          [field]: numValue
        }));
      }
    } else {
      setCalculatorInputs(prev => ({
        ...prev,
        [field]: parseInt(value)
      }));
    }
  };

  // Get calculated earnings
  const earnings = calculateEarnings();

  if (authLoading || dataLoading) return (
    <div className="flex items-center justify-center min-h-screen">Loading commission data...</div>
  );
  if (dataError) return (
    <div className="flex items-center justify-center min-h-screen text-red-500">Error: {dataError}</div>
  );
  if (!user) return (
    <div className="flex items-center justify-center min-h-screen text-red-500">
      Please log in to view this page.
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-estate-green text-white py-8">
          <div className="page-container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 animate-fade-in">Commission Structure</h1>
                <p className="text-blue-100 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  Understand how to maximize your earnings with Kaamupoot
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Button variant="outline" className="text-white border-white/30 bg-white/10 hover:bg-white/20 hover:text-white">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Commission Calculator
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="page-container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="animate-fade-in card-hover col-span-2" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Star className="mr-2 h-5 w-5 text-estate-gold" />
                  Multi-Level Commission Structure
                </CardTitle>
                <CardDescription>
                  Earn more as you grow your sales and team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">Level</TableHead>
                        <TableHead>Direct Sale Commission</TableHead>
                        <TableHead>Team Sale Commission</TableHead>
                        <TableHead className="hidden sm:table-cell">Achievement Criteria</TableHead>
                        <TableHead className="text-right">Max Earning</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionLevels.map((level) => (
                        <TableRow key={level.level} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <span className="bg-estate-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                                {level.level}
                              </span>
                              {level.level === 7 && (
                                <span className="text-xs bg-estate-gold text-black px-1.5 py-0.5 rounded ml-1">
                                  Elite
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{level.personalCommission}</TableCell>
                          <TableCell>{level.teamCommission}</TableCell>
                          <TableCell className="hidden sm:table-cell">{level.achievementCriteria}</TableCell>
                          <TableCell className="text-right font-medium">
                            {level.maxEarning}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>* Commission rates are based on qualifying transaction volume and team performance</p>
                  <p>* Team commissions apply to all agents in your direct downline</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in card-hover" style={{ animationDelay: "0.3s" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-estate-blue" />
                  Your Current Status
                </CardTitle>
                <CardDescription>
                  Agent level and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center pt-4 pb-6">
                  <div className="relative flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full border-8 border-estate-green flex items-center justify-center text-4xl font-bold">
                      {currentLevel}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-estate-gold text-black text-xs px-2 py-1 rounded-full">
                      Level {currentLevel}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current Level</span>
                      <span className="font-medium">Level {currentLevel}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-estate-green h-2 rounded-full" style={{ width: `${(currentLevel / 7) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Level {currentLevel}</span>
                      <span>Level {Math.min(currentLevel + 1, 7)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between mb-2">
                      <span>Personal Sales Volume</span>
                      <span>{formatCurrency(personalSalesVolume)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-estate-gold h-2 rounded-full" style={{ width: `${(personalSalesVolume / 1000000) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between mb-2">
                      <span>Team Sales Volume</span>
                      <span>{formatCurrency(teamSalesVolume)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-estate-gold h-2 rounded-full" style={{ width: `${(teamSalesVolume / 2000000) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between mb-2">
                      <span>Personal Sales Count</span>
                      <span>{personalSalesCount} sales</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between mb-2">
                      <span>Team Size</span>
                      <span>{downlineAgents.length} agents</span>
                    </div>
                  </div>
                </div>
                
                <Link to="/level-up-guide">
                  <Button 
                    className="w-full mt-6 bg-estate-green hover:bg-estate-green/90"
                  >
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Level Up Guide
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="animate-fade-in card-hover" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-estate-green" />
                  Benefits By Level
                </CardTitle>
                <CardDescription>
                  Special features and benefits by level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissionLevels.map((level) => (
                    <div key={level.level} className="group">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 group-hover:bg-estate-green group-hover:text-white transition-colors">
                          {level.level}
                        </div>
                        <div>
                          <h4 className="font-medium">Level {level.level}</h4>
                          <p className="text-xs text-muted-foreground">{level.achievementCriteria}</p>
                        </div>
                      </div>
                      <div className="ml-11 mt-2 space-y-1">
                        {level.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-estate-green mt-1.5 mr-2"></div>
                            <p className="text-sm">{benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in card-hover" style={{ animationDelay: "0.4s" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-estate-green" />
                  Earning Calculator
                </CardTitle>
                <CardDescription>
                  Estimate your annual and monthly earnings based on your level and team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use our calculator to estimate your earnings potential based on your sales volume, 
                    team size, and commission level.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Your Sales Volume (Annual)</label>
                      <div className="flex gap-2 mt-1">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          {calculatorInputs.useCustomSalesVolume ? (
                            <input
                              type="number"
                              value={calculatorInputs.salesVolume}
                              onChange={(e) => handleCalculatorChange('salesVolume', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                              placeholder="Enter amount"
                              min="0"
                              step="1000"
                            />
                          ) : (
                            <select 
                              value={calculatorInputs.salesVolume}
                              onChange={(e) => handleCalculatorChange('salesVolume', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                            >
                              <option value="500000">$500,000</option>
                              <option value="1000000">$1,000,000</option>
                              <option value="2000000">$2,000,000</option>
                              <option value="5000000">$5,000,000</option>
                              <option value="10000000">$10,000,000+</option>
                            </select>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 px-3"
                          onClick={() => setCalculatorInputs(prev => ({
                            ...prev,
                            useCustomSalesVolume: !prev.useCustomSalesVolume
                          }))}
                        >
                          {calculatorInputs.useCustomSalesVolume ? "Use Presets" : "Custom Amount"}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Number of Team Members</label>
                      <div className="flex gap-2 mt-1">
                        <div className="relative flex-1">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          {calculatorInputs.useCustomTeamSize ? (
                            <input
                              type="number"
                              value={calculatorInputs.teamSize}
                              onChange={(e) => handleCalculatorChange('teamSize', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                              placeholder="Enter number of agents"
                              min="0"
                              step="1"
                            />
                          ) : (
                            <select 
                              value={calculatorInputs.teamSize}
                              onChange={(e) => handleCalculatorChange('teamSize', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                            >
                              <option value="0">0 agents</option>
                              <option value="5">5-10 agents</option>
                              <option value="15">11-20 agents</option>
                              <option value="30">21-50 agents</option>
                              <option value="50">50+ agents</option>
                            </select>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 px-3"
                          onClick={() => setCalculatorInputs(prev => ({
                            ...prev,
                            useCustomTeamSize: !prev.useCustomTeamSize
                          }))}
                        >
                          {calculatorInputs.useCustomTeamSize ? "Use Presets" : "Custom Size"}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Average Team Member Sales</label>
                      <div className="flex gap-2 mt-1">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          {calculatorInputs.useCustomTeamSales ? (
                            <input
                              type="number"
                              value={calculatorInputs.teamMemberSales}
                              onChange={(e) => handleCalculatorChange('teamMemberSales', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                              placeholder="Enter amount"
                              min="0"
                              step="1000"
                            />
                          ) : (
                            <select 
                              value={calculatorInputs.teamMemberSales}
                              onChange={(e) => handleCalculatorChange('teamMemberSales', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                            >
                              <option value="250000">$250,000</option>
                              <option value="500000">$500,000</option>
                              <option value="1000000">$1,000,000</option>
                              <option value="2000000">$2,000,000+</option>
                            </select>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 px-3"
                          onClick={() => setCalculatorInputs(prev => ({
                            ...prev,
                            useCustomTeamSales: !prev.useCustomTeamSales
                          }))}
                        >
                          {calculatorInputs.useCustomTeamSales ? "Use Presets" : "Custom Amount"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Personal Commission</span>
                      <span className="font-medium">{formatCurrency(earnings.personalCommission)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Your Upline Commission (from team sales)</span>
                      <span className="font-medium">{formatCurrency(earnings.uplineCommission)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Commission Distributed (Annual)</span>
                      <span className="font-medium">{formatCurrency(earnings.totalAnnualEarning)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Average</span>
                      <span className="font-medium">{formatCurrency(earnings.monthlyAverage)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Total 7% Commission Pool (your sales)</span>
                      <span>{formatCurrency(earnings.totalCommissionPool)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Commission left for your upline</span>
                      <span>{formatCurrency(earnings.remainingCommissionAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> Calculations are based on your current commission level ({currentLevel}) with 
                      {commissionLevels[currentLevel - 1].personalCommission} personal commission and 
                      {commissionLevels[currentLevel - 1].teamCommission} team commission rates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {(user?.userType === 'agent' || user?.userType === 'company') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="animate-fade-in card-hover col-span-2" style={{ animationDelay: "0.7s" }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="mr-2 h-5 w-5 text-estate-blue" />
                    {user?.userType === 'agent' ? 'My Team & Sales' : 'Company Team & Sales'}
                  </CardTitle>
                  <CardDescription>
                    {user?.userType === 'agent' ? 'View your direct downline and personal sales history.' : "Overview of your company's agents and sales performance."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="team" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
                      <TabsTrigger value="team">Team Members</TabsTrigger>
                      <TabsTrigger value="sales">Sales Records</TabsTrigger>
                      {user?.userType === 'company' && <TabsTrigger value="commissions">Commissions</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="team" className="mt-4">
                      {downlineAgents.length === 0 ? (
                        <p className="text-muted-foreground">No team members to display.</p>
                      ) : (
                        <div className="w-full overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Sales Volume</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {downlineAgents.map((agent) => (
                                <TableRow key={agent._id}>
                                  <TableCell>{agent.firstName} {agent.lastName}</TableCell>
                                  <TableCell>{agent.email}</TableCell>
                                  <TableCell>Level {agent.level}</TableCell>
                                  <TableCell>{formatCurrency(agent.personalSalesVolume)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="sales" className="mt-4">
                      {user?.userType === 'agent' ? (
                        mySales.length === 0 ? (
                          <p className="text-muted-foreground">No personal sales records to display.</p>
                        ) : (
                          <div className="w-full overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Property</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Sold Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {mySales.map((sale) => (
                                  <TableRow key={sale._id}>
                                    <TableCell>{sale.title}</TableCell>
                                    <TableCell>{formatCurrency(sale.price)}</TableCell>
                                    <TableCell>{new Date(sale.soldDate).toLocaleDateString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )
                      ) : ( // Company sales
                        companySales.length === 0 ? (
                          <p className="text-muted-foreground">No company sales records to display.</p>
                        ) : (
                          <div className="w-full overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Property</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Sold By</TableHead>
                                  <TableHead>Sold Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {companySales.map((sale) => (
                                  <TableRow key={sale._id}>
                                    <TableCell>{sale.title}</TableCell>
                                    <TableCell>{formatCurrency(sale.price)}</TableCell>
                                    <TableCell>{sale.soldBy}</TableCell>
                                    <TableCell>{new Date(sale.soldDate).toLocaleDateString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )
                      )}
                    </TabsContent>
                    {user?.userType === 'company' && (
                      <TabsContent value="commissions" className="mt-4">
                        {companyCommissions.length === 0 ? (
                          <p className="text-muted-foreground">No company commission records to display.</p>
                        ) : (
                          <div className="w-full overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Agent</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {companyCommissions.map((commission) => (
                                  <TableRow key={commission._id}>
                                    <TableCell>{commission.agent}</TableCell>
                                    <TableCell>{formatCurrency(commission.amount)}</TableCell>
                                    <TableCell>{commission.type}</TableCell>
                                    <TableCell>{new Date(commission.date).toLocaleDateString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card className="animate-fade-in mb-8" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle>
                <HelpCircle className="mr-2 h-5 w-5 text-estate-blue" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find answers to common questions about commissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-base font-medium text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CommissionStructure;
