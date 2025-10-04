import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Building2, UserPlus, Mail, Phone, Lock, MapPin, Briefcase } from "lucide-react";
import { registerAgent, registerCompany } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  companyName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  licenseNumber?: string;
  referralCode?: string;
}

const Register = () => {
  const [registerType, setRegisterType] = useState<'company' | 'agent'>('agent');
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    licenseNumber: "",
    referralCode: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};
    
    // Required fields for all users
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Additional validation for company registration
    if (registerType === 'company') {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof RegistrationFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (registerType === 'agent') {
        await registerAgent({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          referralCode: formData.referralCode || undefined,
        });
      } else {
        await registerCompany({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          companyName: formData.companyName!,
          address: formData.address!,
          city: formData.city!,
          state: formData.state!,
          country: formData.country!,
          licenseNumber: formData.licenseNumber!,
          referralCode: formData.referralCode || undefined,
        });
      }

      toast({
        title: "Success",
        description: "Registration successful! Redirecting to login...",
        variant: "default",
      });
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      console.error("Registration failed:", err);
      
      // Check if it's a referral code error
      if (err.message?.includes('Referral code does not exist')) {
        toast({
          title: "Invalid Referral Code",
          description: "The referral code you entered does not exist. Please check and try again.",
          variant: "destructive",
        });
        // Clear the referral code field
        setFormData(prev => ({
          ...prev,
          referralCode: ""
        }));
      } else {
      toast({
        title: "Registration Failed",
          description: err.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 page-container py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-estate-green mb-2 animate-fade-in">
              Join Kamaaupoot
            </h1>
            <p className="text-muted-foreground text-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Register as a company or an agent to get started
            </p>
          </div>
          
          <Card className="animate-scale-in shadow-md border-muted" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <Tabs defaultValue="agent" onValueChange={(v) => setRegisterType(v as 'company' | 'agent')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="agent" className="flex items-center gap-2">
                    <UserPlus size={18} />
                    <span>Agent</span>
                  </TabsTrigger>
                  <TabsTrigger value="company" className="flex items-center gap-2">
                    <Building2 size={18} />
                    <span>Company</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="agent">
                  <CardTitle>Register as an Agent</CardTitle>
                  <CardDescription>Create your agent account to join teams and list properties</CardDescription>
                </TabsContent>
                
                <TabsContent value="company">
                  <CardTitle>Register as a Company</CardTitle>
                  <CardDescription>Create your company account to manage agents and track commissions</CardDescription>
                </TabsContent>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName"
                      required
                      placeholder="John" 
                      value={formData.firstName} 
                      onChange={handleInputChange}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName"
                      required
                      placeholder="Doe" 
                      value={formData.lastName} 
                      onChange={handleInputChange}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      required
                      placeholder="your@email.com" 
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      value={formData.email} 
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      name="phone"
                      required
                      type="tel" 
                      placeholder="(555) 123-4567" 
                      className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                      value={formData.phone} 
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      name="password"
                      type="password" 
                      required
                      placeholder="••••••••" 
                      className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                      value={formData.password} 
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="referralCode" 
                      name="referralCode"
                      required
                      placeholder="Enter referral code if you have one" 
                      className="pl-10"
                      value={formData.referralCode} 
                      onChange={handleInputChange}
                      
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    If you were referred by someone, enter their referral code here
                  </p>
                </div>
                
                {registerType === 'company' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="companyName" 
                          name="companyName"
                          
                          placeholder="Real Estate Inc." 
                          className={`pl-10 ${errors.companyName ? "border-red-500" : ""}`}
                          value={formData.companyName} 
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.companyName && (
                        <p className="text-sm text-red-500">{errors.companyName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="address" 
                          name="address"
                          placeholder="123 Main St, City, State" 
                          className={`pl-10 ${errors.address ? "border-red-500" : ""}`}
                          value={formData.address} 
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-sm text-red-500">{errors.address}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city"
                        required
                        placeholder="City" 
                        value={formData.city} 
                        onChange={handleInputChange}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500">{errors.city}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        name="state"
                        required
                        placeholder="State" 
                        value={formData.state} 
                        onChange={handleInputChange}
                        className={errors.state ? "border-red-500" : ""}
                      />
                      {errors.state && (
                        <p className="text-sm text-red-500">{errors.state}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        name="country"
                        required
                        placeholder="Country" 
                        value={formData.country} 
                        onChange={handleInputChange}
                        className={errors.country ? "border-red-500" : ""}
                      />
                      {errors.country && (
                        <p className="text-sm text-red-500">{errors.country}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="licenseNumber" 
                          name="licenseNumber"
                          placeholder="RE12345678" 
                          className={`pl-10 ${errors.licenseNumber ? "border-red-500" : ""}`}
                          value={formData.licenseNumber} 
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.licenseNumber && (
                        <p className="text-sm text-red-500">{errors.licenseNumber}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-estate-green hover:bg-estate-green/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{" "}
                  <a href="/login" className="text-primary hover:underline">
                    Sign in
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
