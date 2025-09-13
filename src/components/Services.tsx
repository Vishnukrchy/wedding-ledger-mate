import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Sparkles, CheckCircle, MapPin, Camera, Utensils, Music, Flower, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BookingForm from '@/components/BookingForm';

// Utility for Indian Rupee formatting
const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const Services = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { toast } = useToast();

  const packages = [
    {
      id: 'intimate',
      name: 'Intimate Wedding',
      price: 1500000,
      guests: 'Up to 50 guests',
      icon: Heart,
      popular: false,
      features: [
        'Venue coordination',
        'Basic decoration',
        'Photography (4 hours)',
        'Catering for 50',
        'Wedding coordinator',
        'Bridal bouquet',
        'Basic sound system'
      ],
      description: 'Perfect for small, intimate ceremonies with close family and friends.',
      includes: {
        venue: true,
        catering: true,
        photography: '4 hours',
        decoration: 'Basic',
        coordinator: true,
        music: 'Basic sound system',
        flowers: 'Bridal bouquet only'
      }
    },
    {
      id: 'premium',
      name: 'Premium Wedding',
      price: 3500000,
      guests: 'Up to 150 guests',
      icon: Sparkles,
      popular: true,
      features: [
        'Premium venue coordination',
        'Full decoration & floral design',
        'Photography & videography (8 hours)',
        'Gourmet catering for 150',
        'Professional wedding coordinator',
        'Bridal & bridesmaids bouquets',
        'DJ & sound system',
        'Wedding cake',
        'Transportation coordination'
      ],
      description: 'Comprehensive wedding package with premium services and elegant styling.',
      includes: {
        venue: true,
        catering: true,
        photography: '8 hours + videography',
        decoration: 'Premium floral design',
        coordinator: true,
        music: 'Professional DJ',
        flowers: 'Full floral package',
        extras: ['Wedding cake', 'Transportation']
      }
    },
    {
      id: 'destination',
      name: 'Destination Wedding',
      price: 5000000,
      guests: 'Up to 100 guests',
      icon: MapPin,
      popular: false,
      features: [
        'Destination venue coordination',
        'Travel & accommodation planning',
        'Legal documentation assistance',
        'Full-service photography & videography',
        'Welcome party & rehearsal dinner',
        'Guest coordination services',
        'Cultural ceremony integration',
        'Multi-day event planning',
        '24/7 on-site coordination'
      ],
      description: 'Complete destination wedding experience with travel coordination and local expertise.',
      includes: {
        venue: true,
        catering: true,
        photography: 'Full coverage + videography',
        decoration: 'Destination-themed',
        coordinator: '24/7 on-site',
        music: 'Professional setup',
        flowers: 'Local & imported',
        extras: ['Travel planning', 'Legal assistance', 'Multi-day events']
      }
    }
  ];

  const additionalServices = [
    { name: 'Photography Extension', price: 500, icon: Camera },
    { name: 'Catering Upgrade', price: 25, icon: Utensils },
    { name: 'Live Band', price: 2500, icon: Music },
    { name: 'Floral Enhancement', price: 1000, icon: Flower },
  ];

  const handleBookPackage = (packageId: string) => {
    const selectedPkg = packages.find(p => p.id === packageId);
    if (selectedPkg) {
      setSelectedPackage(packageId);
      setShowBookingForm(true);
    }
  };

  const handleBookingComplete = () => {
    setShowBookingForm(false);
    setSelectedPackage(null);
    toast({
      title: "Booking Request Submitted!",
      description: "Our wedding consultants will contact you within 24 hours to discuss your requirements.",
    });
  };

  const selectedPkg = packages.find(p => p.id === selectedPackage);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Wedding Management Packages</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from our carefully curated wedding packages designed to make your special day perfect. 
          Our expert team handles every detail so you can focus on celebrating.
        </p>
      </div>

      {/* Main Packages */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const IconComponent = pkg.icon;
          return (
            <Card 
              key={pkg.id} 
              className={`relative transition-all duration-300 hover:shadow-elegant ${
                pkg.popular ? 'border-primary shadow-card' : 'border-border'
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-primary text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 rounded-full bg-gradient-primary w-fit mb-4">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription className="text-sm">{pkg.description}</CardDescription>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{formatINR(pkg.price)}</div>
                  <div className="text-sm text-muted-foreground">{pkg.guests}</div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Dialog open={showBookingForm && selectedPackage === pkg.id} onOpenChange={setShowBookingForm}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      variant={pkg.popular ? "default" : "outline"}
                      onClick={() => handleBookPackage(pkg.id)}
                    >
                      Book This Package
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        Book {selectedPkg?.name}
                      </DialogTitle>
                      <DialogDescription>
                        Fill in your details to book the {selectedPkg?.name} package. Our team will contact you to finalize the arrangements.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedPkg && (
                      <BookingForm 
                        package={selectedPkg} 
                        onBookingComplete={handleBookingComplete}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Services */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-2">Additional Services</h3>
          <p className="text-muted-foreground">Enhance your wedding package with these premium add-ons</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="text-center p-4 hover:shadow-card transition-all duration-300 cursor-pointer hover:border-primary/30">
                <div className="mx-auto p-2 rounded-full bg-gradient-subtle w-fit mb-3">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium text-foreground mb-1">{service.name}</h4>
                <p className="text-sm text-primary font-semibold mb-2">{formatINR(service.price)}</p>
                <Button size="sm" variant="outline" className="w-full">
                  Add to Package
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Contact Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
        <CardContent className="text-center p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start Planning?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our dedicated wedding consultants are here to help you create the perfect celebration. 
            Book a free consultation to discuss your vision and get a personalized quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              Schedule Free Consultation
            </Button>
            <Button size="lg" variant="outline">
              Download Brochure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Services;