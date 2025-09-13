import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SetupWizardProps {
  onSetupComplete: () => void;
}

const SetupWizard = ({ onSetupComplete }: SetupWizardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Default data
  const defaultPaidBy = ['Krishan', 'Vishnu', 'Vijendra', 'Dad', 'Mom', 'Uncle', 'Aunty', 'Other'];
  const defaultEvents = ['Engagement', 'Haldi', 'Mehendi', 'Sangeet', 'Wedding', 'Reception', 'Other'];

  const [paidByList, setPaidByList] = useState<string[]>(defaultPaidBy);
  const [eventsList, setEventsList] = useState<string[]>(defaultEvents);
  const [newPaidBy, setNewPaidBy] = useState('');
  const [newEvent, setNewEvent] = useState('');

  const addPaidBy = () => {
    if (newPaidBy.trim() && !paidByList.includes(newPaidBy.trim())) {
      setPaidByList([...paidByList, newPaidBy.trim()]);
      setNewPaidBy('');
    }
  };

  const removePaidBy = (item: string) => {
    setPaidByList(paidByList.filter(p => p !== item));
  };

  const addEvent = () => {
    if (newEvent.trim() && !eventsList.includes(newEvent.trim())) {
      setEventsList([...eventsList, newEvent.trim()]);
      setNewEvent('');
    }
  };

  const removeEvent = (item: string) => {
    setEventsList(eventsList.filter(e => e !== item));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Insert paid_by options
      const paidByData = paidByList.map(name => ({
        name,
        user_id: user.id,
      }));

      const { error: paidByError } = await supabase
        .from('paid_by')
        .insert(paidByData);

      if (paidByError) throw paidByError;

      // Insert events
      const eventsData = eventsList.map(name => ({
        name,
        user_id: user.id,
      }));

      const { error: eventsError } = await supabase
        .from('events')
        .insert(eventsData);

      if (eventsError) throw eventsError;

      toast({
        title: "Setup Complete!",
        description: "Your wedding expense tracker is ready to use.",
      });

      onSetupComplete();
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to complete setup",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  // Utility for Indian Rupee formatting
  const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-elegant p-4">
      <Card className="w-full max-w-2xl shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Wedding Ledger! 💍</CardTitle>
          <CardDescription>
            Let's set up your expense tracker with some initial data
          </CardDescription>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Who will be paying for expenses?</h3>
                <p className="text-muted-foreground">Add the people who will be paying for wedding expenses</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add person name..."
                    value={newPaidBy}
                    onChange={(e) => setNewPaidBy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPaidBy()}
                  />
                  <Button onClick={addPaidBy} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {paidByList.map((person) => (
                    <Badge key={person} variant="secondary" className="text-sm">
                      {person}
                      <button
                        onClick={() => removePaidBy(person)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold">What events are you planning?</h3>
                <p className="text-muted-foreground">Add all the wedding events you're organizing</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add event name..."
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                  />
                  <Button onClick={addEvent} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {eventsList.map((event) => (
                    <Badge key={event} variant="secondary" className="text-sm">
                      {event}
                      <button
                        onClick={() => removeEvent(event)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              disabled={step === 1}
            >
              Previous
            </Button>
            <Button
              variant="wedding"
              onClick={handleNext}
              disabled={isLoading}
            >
              {step === 1 ? 'Next' : isLoading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupWizard;