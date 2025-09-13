import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Heart, Users, MapPin, Phone, Mail, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Utility for Indian Rupee formatting
const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

interface BookingFormData {
  // Personal Information
  bride_name: string;
  groom_name: string;
  contact_phone: string;
  contact_email: string;
  
  // Wedding Details
  wedding_date: Date;
  estimated_guests: number;
  venue_preference: string;
  budget_range: string;
  
  // Event Preferences
  selected_events: string[];
  special_requirements: string;
  dietary_restrictions: string;
  
  // Additional Information
  how_did_you_hear: string;
  additional_notes: string;
}

interface BookingFormProps {
  package: {
    id: string;
    name: string;
    price: string;
    guests: string;
    description: string;
    features: string[];
  };
  onBookingComplete: () => void;
}

const BookingForm = ({ package: selectedPackage, onBookingComplete }: BookingFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [weddingDate, setWeddingDate] = useState<Date>();
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>();

  const eventOptions = [
    'Engagement Ceremony',
    'Haldi Ceremony',
    'Mehendi Ceremony',
    'Sangeet Night',
    'Bachelor/Bachelorette Party',
    'Wedding Ceremony',
    'Reception Party',
    'Ring Ceremony',
    'Cocktail Party',
    'Welcome Dinner'
  ];

  const budgetRanges = [
    'Under $20,000',
    '$20,000 - $40,000',
    '$40,000 - $60,000',
    '$60,000 - $80,000',
    '$80,000 - $100,000',
    'Above $100,000'
  ];

  const venuePreferences = [
    'Banquet Hall',
    'Hotel',
    'Resort',
    'Beach',
    'Garden/Outdoor',
    'Palace/Heritage',
    'Farmhouse',
    'Destination (International)',
    'Destination (Domestic)',
    'Religious Place'
  ];

  const handleEventToggle = (event: string) => {
    const updatedEvents = selectedEvents.includes(event)
      ? selectedEvents.filter(e => e !== event)
      : [...selectedEvents, event];
    
    setSelectedEvents(updatedEvents);
    setValue('selected_events', updatedEvents);
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!weddingDate) {
      toast({
        title: "Error",
        description: "Please select your wedding date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Save booking information
      const bookingData = {
        user_id: user?.id,
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        bride_name: data.bride_name,
        groom_name: data.groom_name,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        wedding_date: format(weddingDate, 'yyyy-MM-dd'),
        estimated_guests: data.estimated_guests,
        venue_preference: data.venue_preference,
        budget_range: data.budget_range,
        selected_events: selectedEvents,
        special_requirements: data.special_requirements,
        dietary_restrictions: data.dietary_restrictions,
        how_did_you_hear: data.how_did_you_hear,
        additional_notes: data.additional_notes,
        booking_status: 'pending',
        created_at: new Date().toISOString()
      };

      // For now, we'll store this in the profiles table as additional data
      // In a real application, you'd have a separate bookings table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          display_name: `${data.bride_name} & ${data.groom_name}`,
          wedding_date: format(weddingDate, 'yyyy-MM-dd'),
          contact_phone: data.contact_phone,
          estimated_guests: data.estimated_guests,
          venue_preference: data.venue_preference,
          budget_range: data.budget_range,
          package_preference: selectedPackage.name,
          booking_data: bookingData
        });

      if (profileError) throw profileError;

      onBookingComplete();
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to submit booking request",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Package Summary */}
      <div className="p-4 bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-lg border border-primary/20">
        <h3 className="font-semibold text-foreground mb-2">Selected Package: {selectedPackage.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{selectedPackage.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{formatINR(Number(selectedPackage.price.replace(/[^0-9.-]+/g, "")))}</span>
          <span className="text-sm text-muted-foreground">{selectedPackage.guests}</span>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Couple Information
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bride_name">Bride's Name *</Label>
            <Input
              id="bride_name"
              {...register('bride_name', { required: 'Bride name is required' })}
              placeholder="Enter bride's full name"
            />
            {errors.bride_name && (
              <p className="text-sm text-red-500">{errors.bride_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="groom_name">Groom's Name *</Label>
            <Input
              id="groom_name"
              {...register('groom_name', { required: 'Groom name is required' })}
              placeholder="Enter groom's full name"
            />
            {errors.groom_name && (
              <p className="text-sm text-red-500">{errors.groom_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone *</Label>
            <Input
              id="contact_phone"
              type="tel"
              {...register('contact_phone', { required: 'Phone number is required' })}
              placeholder="+1 (555) 123-4567"
            />
            {errors.contact_phone && (
              <p className="text-sm text-red-500">{errors.contact_phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email *</Label>
            <Input
              id="contact_email"
              type="email"
              {...register('contact_email', { required: 'Email is required' })}
              placeholder="your.email@example.com"
              defaultValue={user?.email}
            />
            {errors.contact_email && (
              <p className="text-sm text-red-500">{errors.contact_email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Wedding Details */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Wedding Details
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Wedding Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !weddingDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {weddingDate ? format(weddingDate, "PPP") : <span>Select wedding date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={weddingDate}
                  onSelect={setWeddingDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_guests">Estimated Guests *</Label>
            <Input
              id="estimated_guests"
              type="number"
              min="1"
              {...register('estimated_guests', { required: 'Guest count is required', min: 1 })}
              placeholder="150"
            />
            {errors.estimated_guests && (
              <p className="text-sm text-red-500">{errors.estimated_guests.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Venue Preference</Label>
            <Select onValueChange={(value) => setValue('venue_preference', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select venue type" />
              </SelectTrigger>
              <SelectContent>
                {venuePreferences.map((venue) => (
                  <SelectItem key={venue} value={venue}>
                    {venue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Budget Range</Label>
            <Select onValueChange={(value) => setValue('budget_range', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Event Selection */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Events & Ceremonies
        </h4>
        <p className="text-sm text-muted-foreground">Select all events you want to include in your wedding package</p>
        
        <div className="grid md:grid-cols-2 gap-3">
          {eventOptions.map((event) => (
            <div key={event} className="flex items-center space-x-2">
              <Checkbox
                id={event}
                checked={selectedEvents.includes(event)}
                onCheckedChange={() => handleEventToggle(event)}
              />
              <Label htmlFor={event} className="text-sm font-medium cursor-pointer">
                {event}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Special Requirements */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Special Requirements</h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              id="special_requirements"
              {...register('special_requirements')}
              placeholder="Any special decorations, themes, or arrangements..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
            <Textarea
              id="dietary_restrictions"
              {...register('dietary_restrictions')}
              placeholder="Vegetarian, vegan, allergies, etc..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Additional Information</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>How did you hear about us?</Label>
            <Select onValueChange={(value) => setValue('how_did_you_hear', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Search</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="friend_referral">Friend Referral</SelectItem>
                <SelectItem value="wedding_website">Wedding Website</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_notes">Additional Notes</Label>
            <Textarea
              id="additional_notes"
              {...register('additional_notes')}
              placeholder="Any other information you'd like to share..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Checkbox id="terms" required />
          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            I agree to the terms and conditions and understand that this is a booking request. 
            Final pricing and arrangements will be confirmed during consultation with our wedding team.
          </Label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button 
          type="submit" 
          variant="wedding" 
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? "Submitting Request..." : "Submit Booking Request"}
        </Button>
      </div>

      {/* Contact Information */}
      <div className="p-4 bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-lg border border-primary/20">
        <h5 className="font-medium text-foreground mb-3">Need Help?</h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Call us: +1 (555) 123-WEDDING</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Email: hello@weddingledger.com</span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;