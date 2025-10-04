import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Bed,
  Building2, 
  ChevronRight, 
  DollarSign, 
  Home, 
  Maximize,
  Share2, 
  Star, 
  Trophy, 
  Users,
  Search,
  MapPin,
  Mail,
  MessageCircle
} from "lucide-react";
import { getProperties } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define Property interface to match backend data
interface Property {
  id: number;
  title: string;
  price: number;
  area: string;
  location: string;
  featured_img: string;
}

const PropertyCard = ({
  property,
  user,
}: {
  property: Property;
  user: { name: string; email: string; phone?: string } | null;
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const propertyUrl = `${window.location.origin}/properties/${property.id}`;

  const contactInfoForDialog = user
    ? `\n\nFor more details, contact ${user.name} at:\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}`
    : "";
  
  const directShareText = `Check out this property, ${property.title}: ${propertyUrl}`;

  // Direct share for the top button
  const handleDirectShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: directShareText,
        });
        toast({ title: "Shared successfully!" });
      } catch (error) {
        toast({ title: "Error sharing", variant: "destructive" });
      }
    } else {
      navigator.clipboard.writeText(directShareText);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const mailToLink = `mailto:?subject=${encodeURIComponent(
    `Check out this property: ${property.title}`
  )}&body=${encodeURIComponent(
    `I found this property and thought you might be interested:\n\n${propertyUrl}${contactInfoForDialog}`
  )}`;

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
    `Check out this property, ${property.title}: ${propertyUrl}${contactInfoForDialog}`
  )}`;

  return (
    <Card
      onClick={() => navigate(`/properties/${property.id}`)}
      className="overflow-hidden cursor-pointer group"
    >
      <CardHeader className="p-0 relative">
        <img
          src={`https://kamaaupoot.com/${property.featured_img}`}
          alt={property.title}
          className="w-full h-56 object-cover"
        />
        <Badge className="absolute top-4 left-4 bg-estate-blue text-white">
          {property.location}
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full h-8 w-8"
          onClick={handleDirectShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold truncate group-hover:text-estate-blue">
          {property.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {property.location}
        </p>
        <p className="text-xl font-bold text-estate-blue mt-2">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(property.price)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center text-sm text-muted-foreground">
          <Maximize className="h-4 w-4 mr-1" />
          <span>{property.area}</span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-8 w-8"
              onClick={handleShareClick}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" onClick={handleShareClick}>
            <DialogHeader>
              <DialogTitle>Share Property</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button asChild variant="outline">
                <a href={mailToLink} target="_blank" rel="noopener noreferrer">
                  <Mail className="mr-2 h-4 w-4" /> Share via Email
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> Share via WhatsApp
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

const Index = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        // Take only the first few properties to feature
        setProperties(data.properties.slice(0, 3)); 
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-estate-green text-white py-16 md:py-24">
          <div className="page-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                  Build Your Real Estate Empire
                </h1>
                <p className="text-xl text-blue-100 mb-8">
                Kamaaupoot helps real estate agents and companies build teams, 
                  manage listings, and maximize commissions with our innovative platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {user ? (
                    <Link to="/properties">
                      <Button size="lg" className="bg-estate-gold hover:bg-estate-gold/90 text-black">
                        View Properties
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/register">
                      <Button size="lg" className="bg-estate-gold hover:bg-estate-gold/90 text-black">
                        Register Now
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}

                  
                  <Link to="/commissions">
                    <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/10 hover:bg-white/20 hover:text-white">
                      View Commission Structure
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:flex justify-center hidden">
                <div className="relative w-full max-w-md animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <div className="absolute -top-6 -left-6 w-full h-full bg-estate-gold/20 rounded-xl"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                    alt="Real Estate Team" 
                    className="w-full h-full object-cover rounded-xl relative z-10 shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted">
          <div className="page-container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">
                How Kamaaupoot Works
              </h2>
              <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Our platform provides the tools and structure for real estate professionals 
                to grow their business and increase their earnings
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white border-0 shadow-md animate-fade-in card-hover" style={{ animationDelay: "0.2s" }}>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-estate-green/10 flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-estate-green" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Company & Agent Registration</h3>
                  <p className="text-muted-foreground mb-4">
                    Register as a company to manage your agents or as an individual agent to join teams and list properties.
                  </p>
                  {user ? (
                    <Link to="/properties" className="text-estate-green font-medium inline-flex items-center hover:underline">
                      View Properties
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  ) : (
                    <Link to="/register" className="text-estate-green font-medium inline-flex items-center hover:underline">
                      Get Started
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-md animate-fade-in card-hover" style={{ animationDelay: "0.3s" }}>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-estate-green/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-estate-green" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Team Building & Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Create and grow your own team of agents, track performance, and generate referral links.
                  </p>
                  <Link to="/team" className="text-estate-green font-medium inline-flex items-center hover:underline">
                    Explore Team Features
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-md animate-fade-in card-hover" style={{ animationDelay: "0.4s" }}>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-estate-green/10 flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-estate-green" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Multi-Level Commissions</h3>
                  <p className="text-muted-foreground mb-4">
                    Earn commissions from your own sales and from the sales of agents in your team.
                  </p>
                  <Link to="/commissions" className="text-estate-green font-medium inline-flex items-center hover:underline">
                    View Commission Structure
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Commission Visualization */}
        <section className="py-16 md:py-24">
          <div className="page-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative max-w-md mx-auto">
                  <div className="bg-estate-blue/5 border border-estate-blue/20 rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-estate-gold" />
                      7-Level Commission Structure
                    </h3>
                    
                    <div className="space-y-4">
                      {[7, 6, 5, 4, 3, 2, 1].map((level) => (
                        <div key={level} className="flex items-center">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              level === 7 
                                ? 'bg-estate-gold text-black' 
                                : level >= 5 
                                ? 'bg-estate-green text-white' 
                                : 'bg-estate-green/20 text-estate-green'
                            }`}
                          >
                            {level}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Level {level}</span>
                              <span className="text-sm font-semibold">
                                {level === 7 ? '7%' : 
                                 level === 6 ? '6.75%' : 
                                 level === 5 ? '6.50%' : 
                                 level === 4 ? '6%' : 
                                 level === 3 ? '5%' : 
                                 level === 2 ? '4%' : '3%'}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  level === 7 ? 'bg-estate-gold' : 'bg-estate-green'
                                }`} 
                                style={{ width: `${(level / 7) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="text-center">
                      <Link to="/commissions">
                        <Button className="bg-estate-green hover:bg-estate-green/90">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Full Commission Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Unlock Higher Earnings With Each Level
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Our unique 7-level commission structure rewards both personal sales 
                  and team building. As you progress through the levels, you'll unlock 
                  higher commission rates and additional benefits.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-estate-green text-white flex items-center justify-center mr-3 shrink-0">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Direct Sale Commission Up to 7%</h3>
                      <p className="text-muted-foreground">
                        Earn higher rates on your personal sales as you move up the levels
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-estate-green text-white flex items-center justify-center mr-3 shrink-0">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Team Commission Up to 4%</h3>
                      <p className="text-muted-foreground">
                        Earn a percentage of your team members' sales volume
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-estate-green text-white flex items-center justify-center mr-3 shrink-0">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Exclusive Benefits by Level</h3>
                      <p className="text-muted-foreground">
                        Access premium tools, support, and opportunities as you level up
                      </p>
                    </div>
                  </div>
                </div>

                {user ? (
                     <Link to="/level-up-guide">
                     <Button size="lg" className="bg-estate-green hover:bg-estate-green/90">
                       Level-Up-Guide
                       <ChevronRight className="ml-2 h-5 w-5" />
                     </Button>
                   </Link>
                  ) : (
                  <Link to="/register">
                  <Button size="lg" className="bg-estate-green hover:bg-estate-green/90">
                    Start Your Journey Today
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                  )}
                
              </div>
            </div>
          </div>
        </section>
        
        {/* Property Listings Section */}
        <section className="py-16 md:py-24 bg-muted">
          <div className="page-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">
                Featured Properties
              </h2>
              <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Browse our latest listings from prime locations
              </p>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                {loading ? (
                  <div className="text-center py-12">
                    <p>Loading featured properties...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} user={user} />
                    ))}
                  </div>
                )}
            </div>
                
            <div className="text-center mt-12">
                  <Link to="/properties">
                <Button size="lg" className="bg-estate-blue hover:bg-estate-blue/90">
                      View All Properties
                  <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 md:py-24">
          <div className="page-container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">
                Success Stories
              </h2>
              <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Hear from real estate professionals who've grown their business with Kaamupoot
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Jennifer Martinez",
                  role: "Senior Agent, Level 5",
                  image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
                  quote: "Since joining Kaamupoot, I've built a team of 15 agents and increased my annual income by over 300%. The commission structure is a game-changer!",
                  teamSize: 15,
                  salesVolume: "$12M"
                },
                {
                  name: "David Wilson",
                  role: "Team Leader, Level 6",
                  image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
                  quote: "The team management tools are incredible. I can track performance, distribute leads, and grow my business all in one platform. My team has never been more productive.",
                  teamSize: 28,
                  salesVolume: "$24M"
                },
                {
                  name: "Sophia Chen",
                  role: "Broker & Company Owner",
                  image: "https://images.unsplash.com/photo-1611432579699-484f7990b127?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
                  quote: "As a company owner, Kaamupoot gives me powerful tools to manage my agents, track performance, and grow my business. We've doubled in size since joining.",
                  teamSize: 42,
                  salesVolume: "$38M"
                }
              ].map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-md animate-fade-in" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.quote}"
                    </p>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Team Size</p>
                        <p className="font-semibold">{testimonial.teamSize} agents</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Annual Volume</p>
                        <p className="font-semibold">{testimonial.salesVolume}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-estate-green text-white">
          <div className="page-container">
            <div className="text-center max-w-3xl mx-auto animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Grow Your Real Estate Business?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of successful agents and companies on Kamaaupoot
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/leads">
                      <Button size="lg" className="bg-estate-gold hover:bg-estate-gold/90 text-black">
                        View All Leads
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>

                     <Link to="/commissions">
                     <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/10 hover:bg-white/20 hover:text-white">
                     View Commission Structur
                     </Button>
                   </Link>
                </div>
                  
                  ) : (
                    <Link to="/register">
                    <Button size="lg" className="bg-estate-gold hover:bg-estate-gold/90 text-black">
                      Register Now
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  )}
              
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
