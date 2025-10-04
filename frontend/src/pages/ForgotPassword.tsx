import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/api/users/forgot-password`, { email });
      setSuccess("If an account with that email exists, a reset link has been sent.");
      toast({ title: "Reset Link Sent", description: res.data.message, variant: "blue" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      toast({ title: "Error", description: err.response?.data?.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 transition-colors"
                    autoComplete="email"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-estate-green hover:bg-estate-green/90" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
            {success && <p className="text-green-600 text-center text-sm">{success}</p>}
            {error && <p className="text-red-600 text-center text-sm">{error}</p>}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword; 