import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Bed,
  Building,
  Calendar,
  ChevronDown,
  Compass,
  DollarSign,
  Filter,
  Home,
  Image as ImageIcon,
  Info,
  MapPin,
  Maximize,
  Plus,
  Search,
  Share2,
  User,
  Trash2,
  MoreVertical,
  List,
  LayoutGrid,
  Mail,
  MessageCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProperties } from "@/lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Property {
  id: number;
  title: string;
  price: number;
  area: string;
  location: string;
  featured_img: string;
  passation_status: string;
  // Add any other fields you need from the new API
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

const PropertyListing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  console.log("DEBUG - Full user object:", user);
  console.log("DEBUG - User role:", user?.userType);
  console.log("DEBUG - Is company user:", user?.userType === 'company');
  
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const data = await getProperties();
        setProperties(data.properties); // Access the properties array
        setFilteredProperties(data.properties);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading properties...</div>;
  if (!Array.isArray(properties)) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: Invalid data format received</div>;

  const renderGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} user={user} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="bg-estate-green text-white py-8">
          <div className="page-container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 animate-fade-in">Property Listings</h1>
                <p className="text-blue-100 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  Browse or add properties to the marketplace
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="page-container py-8">
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className={`grid w-full ${user?.userType === 'company' ? 'max-w-md grid-cols-2' : 'max-w-xs grid-cols-1'}`}>
              <TabsTrigger value="browse">
                <Search className="mr-2 h-4 w-4" />
                Browse Properties
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                      <CardTitle>Available Properties</CardTitle>
                      <CardDescription>
                        Browse and filter available properties
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <div className="relative w-full md:w-[240px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search properties..." className="pl-10" />
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filters</span>
                      </Button>
                      <div className="flex border rounded-md">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`px-2 rounded-r-none ${view === 'grid' ? 'bg-muted' : ''}`}
                          onClick={() => setView('grid')}
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`px-2 rounded-l-none ${view === 'list' ? 'bg-muted' : ''}`}
                          onClick={() => setView('list')}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {properties.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground/60" />
                      <p className="mb-4">No properties found. Try adjusting your filters or add a new property.</p>
                    </div>
                  ) : view === 'grid' ? (
                    renderGrid()
                  ) : (
                    <div className="space-y-6">
                      {properties.map((property) => (
                        <Card key={property.id} className="flex flex-col md:flex-row overflow-hidden card-hover"> 
                          <div className="md:w-1/3 h-48 md:h-auto relative bg-muted flex-shrink-0">
                            <img
                              src={`https://kamaaupoot.com/${property.featured_img}`}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 bg-estate-blue text-white text-xs px-2 py-1 rounded-md">
                              {property.location}
                            </div>
                            <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-white bg-black/30 hover:bg-black/50">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardContent className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-xl mb-1 line-clamp-1">{property.title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                <span className="truncate">{property.location}</span>
                              </div>
                              <p className="text-2xl font-bold text-estate-blue mb-3">{property.price}</p>
                              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                <div className="flex items-center">
                                  <Maximize className="h-4 w-4 mr-1" />
                                  <span>{property.area}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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

export default PropertyListing;
