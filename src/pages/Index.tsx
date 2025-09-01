import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, LogOut, Plus, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Dashboard from '@/components/Dashboard';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import SetupWizard from '@/components/SetupWizard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Redirect to auth if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (user) {
      checkSetupStatus();
    }
  }, [user]);

  const checkSetupStatus = async () => {
    try {
      const [paidByRes, eventsRes] = await Promise.all([
        supabase.from('paid_by').select('id').eq('user_id', user?.id).limit(1),
        supabase.from('events').select('id').eq('user_id', user?.id).limit(1),
      ]);

      const hasData = (paidByRes.data && paidByRes.data.length > 0) ||
                     (eventsRes.data && eventsRes.data.length > 0);
      
      setNeedsSetup(!hasData);
    } catch (error) {
      console.error('Error checking setup status:', error);
      setNeedsSetup(true);
    }
  };

  const handleSetupComplete = () => {
    setNeedsSetup(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading || needsSetup === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-elegant">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (needsSetup) {
    return <SetupWizard onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Wedding Ledger</h1>
              <Sparkles className="h-5 w-5 text-primary-glow" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.user_metadata?.display_name || user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Dashboard */}
          <section>
            <Dashboard />
          </section>

          {/* Tabs for Expense Management */}
          <section>
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Expense List
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="add" className="mt-6">
                <ExpenseForm onExpenseAdded={handleExpenseAdded} />
              </TabsContent>
              
              <TabsContent value="list" className="mt-6">
                <ExpenseList refreshTrigger={refreshTrigger} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background/50 border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for your perfect wedding day
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
