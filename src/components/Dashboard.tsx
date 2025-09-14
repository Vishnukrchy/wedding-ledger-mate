import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Calendar,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalExpenses: number;
  totalPaid: number;
  totalBalance: number;
  expenseCount: number;
  upcomingPayments: number;
  completedPayments: number;
  categoryBreakdown: { [key: string]: number };
  recentActivity: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalPaid: 0,
    totalBalance: 0,
    expenseCount: 0,
    upcomingPayments: 0,
    completedPayments: 0,
    categoryBreakdown: {},
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [weddingDate, setWeddingDate] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load expenses with related data
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          categories(name),
          paid_by(name),
          events(name),
          payment_modes(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      // Load user profile for wedding date
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (expenses) {
        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.total_amount), 0);
        const totalPaid = expenses.reduce((sum, exp) => sum + Number(exp.paid_amount), 0);
        const totalBalance = expenses.reduce((sum, exp) => sum + Number(exp.balance), 0);
        
        const upcomingPayments = expenses.filter(exp => exp.paid_status === 'unpaid').length;
        const completedPayments = expenses.filter(exp => exp.paid_status === 'paid').length;

        // Category breakdown
        const categoryBreakdown = expenses.reduce((acc, exp) => {
          const categoryName = exp.categories?.name || 'Other';
          acc[categoryName] = (acc[categoryName] || 0) + Number(exp.total_amount);
          return acc;
        }, {} as { [key: string]: number });

        // Recent activity (last 5 expenses)
        const recentActivity = expenses.slice(0, 5);

        setStats({
          totalExpenses,
          totalPaid,
          totalBalance,
          expenseCount: expenses.length,
          upcomingPayments,
          completedPayments,
          categoryBreakdown,
          recentActivity,
        });
      }

      if (profile?.wedding_date) {
        setWeddingDate(profile.wedding_date);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Utility for Indian Rupee formatting
  const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const getPercentagePaid = () => {
    if (stats.totalExpenses === 0) return 0;
    return Math.round((stats.totalPaid / stats.totalExpenses) * 100);
  };

  const getDaysUntilWedding = () => {
    if (!weddingDate) return null;
    const today = new Date();
    const wedding = new Date(weddingDate);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'half_paid': return 'text-orange-600';
      case 'unpaid': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      half_paid: 'bg-orange-100 text-orange-800 border-orange-200',
      unpaid: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
      paid: 'Paid',
      half_paid: 'Half Paid',
      unpaid: 'Unpaid',
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={`loading-${i}`} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const daysUntilWedding = getDaysUntilWedding();

  return (
    <div className="space-y-6">
      {/* Wedding Countdown */}
      {daysUntilWedding !== null && (
        <Card className="bg-gradient-rose text-white shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Wedding Countdown</h3>
                <p className="text-white/90">
                  {daysUntilWedding > 0 
                    ? `${daysUntilWedding} days until your special day!`
                    : daysUntilWedding === 0 
                    ? "Today is your wedding day! 🎉"
                    : "Congratulations on your wedding! 💍"
                  }
                </p>
              </div>
              <Calendar className="h-12 w-12 text-white/80" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatINR(stats.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.expenseCount} expense{stats.expenseCount !== 1 ? 's' : ''} tracked
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatINR(stats.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getPercentagePaid()}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatINR(stats.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {100 - getPercentagePaid()}% remaining to pay
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Progress</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {getPercentagePaid()}%
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-rose h-2 rounded-full transition-all duration-500" 
                style={{ width: `${getPercentagePaid()}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedPayments}</div>
            <p className="text-xs text-muted-foreground">Fully paid expenses</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.upcomingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPercentagePaid() > 80 ? 'text-red-600' : getPercentagePaid() > 60 ? 'text-orange-600' : 'text-green-600'}`}>
              {getPercentagePaid() > 80 ? 'High' : getPercentagePaid() > 60 ? 'Medium' : 'Good'}
            </div>
            <p className="text-xs text-muted-foreground">Budget utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.categoryBreakdown).length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Expense Categories
            </CardTitle>
            <CardDescription>
              Breakdown of expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.categoryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([category, amount]) => {
                  const percentage = (amount / stats.totalExpenses) * 100;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {formatINR(amount)}
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest expense entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{expense.item_name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{expense.categories?.name}</span>
                      <span>•</span>
                      <span>{expense.events?.name}</span>
                      <span>•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium text-foreground">{formatINR(expense.total_amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        Paid: {formatINR(expense.paid_amount)}
                      </div>
                    </div>
                    {getStatusBadge(expense.paid_status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Message for New Users */}
      {stats.expenseCount === 0 && (
        <Card className="shadow-elegant border-primary/20 bg-gradient-to-br from-primary/5 to-primary-glow/5 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Welcome to Your Wedding Dashboard! 💍
            </CardTitle>
            <CardDescription>
              Start planning your perfect wedding with our comprehensive management tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Wedding Management Services:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Complete wedding packages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Destination wedding planning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Budget tracking & analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Vendor coordination</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Get Started:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-semibold">1</span>
                    <span>Browse wedding packages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-semibold">2</span>
                    <span>Book with advance payment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-semibold">3</span>
                    <span>Track expenses & payments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-semibold">4</span>
                    <span>Enjoy your perfect day</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Ready to start planning your dream wedding? Explore our packages or track your expenses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="wedding" size="sm" className="hover-scale">
                  <Heart className="h-4 w-4 mr-2" />
                  Browse Wedding Packages
                </Button>
                <Button variant="outline" size="sm" className="hover-scale">
                  Add First Expense
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Alert */}
      {getPercentagePaid() > 80 && stats.totalBalance > 0 && (
        <Card className="shadow-card border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-800">Budget Alert</h4>
                <p className="text-sm text-orange-700">
                  You've used {getPercentagePaid()}% of your budget. Consider reviewing upcoming expenses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;