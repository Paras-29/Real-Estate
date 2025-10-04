import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProperties } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Share2,
  MapPin,
  Home,
  TrendingUp,
  Maximize,
} from "lucide-react";

// Updated Property interface
interface Property {
  id: number;
  title: string;
  price: number;
  area: string;
  location: string;
  featured_img: string;
  overview: string;
  why_invest: string;
  location_highlight: string;
  property_type: string;
  passation_status: string;
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getProperties();
        const foundProperty = data.properties.find(
          (p: Property) => p.id === parseInt(id, 10)
        );
        if (foundProperty) {
          setProperty(foundProperty);
        } else {
          setError("Property not found.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Check out this property: ${property?.title}`,
          url: window.location.href,
        });
        toast({ title: "Shared successfully!" });
      } catch (error) {
        toast({ title: "Error sharing", variant: "destructive" });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen">
        Property not found.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="overflow-hidden mb-6">
                <div className="relative">
                  <img
                    src={`https://kamaaupoot.com/${property.featured_img}`}
                    alt={property.title}
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Button size="icon" variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm" onClick={handleShare}>
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-6">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <Home className="h-8 w-8 mx-auto text-estate-green mb-2" />
                    <span className="font-semibold">{property.property_type}</span>
                    <p className="text-sm text-muted-foreground">Type</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto text-estate-green mb-2" />
                    <span className="font-semibold">{property.passation_status}</span>
                    <p className="text-sm text-muted-foreground">Status</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <Maximize className="h-8 w-8 mx-auto text-estate-green mb-2" />
                    <span className="font-semibold">{property.area}</span>
                    <p className="text-sm text-muted-foreground">Area</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Overview</h3>
                  <div dangerouslySetInnerHTML={{ __html: property.overview }} className="prose max-w-none text-muted-foreground" />
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-xl font-semibold mb-3">Why Invest?</h3>
                  <div dangerouslySetInnerHTML={{ __html: property.why_invest }} className="prose max-w-none text-muted-foreground" />
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-xl font-semibold mb-3">Location Highlights</h3>
                  <div dangerouslySetInnerHTML={{ __html: property.location_highlight }} className="prose max-w-none text-muted-foreground" />
                </div>
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card className="sticky top-24 p-6">
                <h3 className="text-xl font-bold mb-1">{property.title}</h3>
                <p className="text-lg text-estate-blue font-semibold mb-4">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(property.price)}
                </p>
                
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  {property.location}
                </div>

                <Separator className="my-4" />
                
                <h4 className="font-semibold mb-4">Interested in this property?</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  Contact us to get more information or to schedule a viewing. Our team is ready to help you.
                </p>
                <Button className="w-full bg-estate-blue hover:bg-estate-blue/90">
                  Contact Us
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetails;
