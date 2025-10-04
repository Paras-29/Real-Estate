import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<'agent' | 'company'>('agent');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("DEBUG: handleSubmit triggered");
    e.preventDefault();
    console.log("DEBUG: preventDefault called.");

    if (!validateForm()) {
      console.log("DEBUG: Form validation failed. Returning.");
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("DEBUG: Calling login function with email:", email);
      await login(email, password);
      console.log("DEBUG: Login function completed successfully");
    } catch (err: any) {
      console.error("DEBUG: Login error caught in handleSubmit:", err);
      // Error handling is already done in AuthContext with toast
    } finally {
      setIsLoading(false);
      console.log("DEBUG: Login loading state set to false");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 page-container py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-estate-green mb-2 animate-fade-in">
              Welcome Back to Kamaaupoot
            </h1>
            <p className="text-muted-foreground text-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Sign in to your account to continue
            </p>
          </div>
          <Card className="w-full max-w-md mx-auto animate-scale-in shadow-md border-muted" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Login
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Choose your login type and enter your credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs 
                defaultValue="agent" 
                onValueChange={(value) => setLoginType(value as 'agent' | 'company')} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="agent" className="flex items-center gap-2">
                    <User size={16} />
                    <span className="text-sm">Agent</span>
                  </TabsTrigger>
                  <TabsTrigger value="company" className="flex items-center gap-2">
                    <Building2 size={16} />
                    <span className="text-sm">Company</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: undefined }));
                        }
                      }}
                      disabled={isLoading}
                      className={`pl-10 ${errors.email ? "border-red-500 focus:border-red-500" : ""} transition-colors`}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span>
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors(prev => ({ ...prev, password: undefined }));
                        }
                      }}
                      disabled={isLoading}
                      className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus:border-red-500" : ""} transition-colors`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span>
                      {errors.password}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-estate-green hover:bg-estate-green/90 focus:ring-4 focus:ring-estate-green/30 transition-all duration-200 font-medium py-2.5" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    `Sign in as ${loginType === 'agent' ? 'Agent' : 'Company'}`
                  )}
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                    Or
                  </span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="font-medium text-estate-green hover:text-estate-green/80 transition-colors"
                  >
                    Create account
                  </Link>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <Link 
                    to="/forgot-password" 
                    className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;