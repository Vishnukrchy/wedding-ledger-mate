import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  PieChart, 
  BarChart3,
  FileText,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ExpenseData {
  id: string;
  item_name: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  date: string;
  paid_status: 'paid' | 'half_paid' | 'unpaid';
  category_id: string;
  event_id: string;
}

interface AnalyticsData {
  totalBudget: number;
  totalSpent: number;
  totalBalance: number;
  expensesByCategory: { [key: string]: number };
  expensesByEvent: { [key: string]: number };
  expensesByStatus: { [key: string]: number };
  recentExpenses: ExpenseData[];
  monthlyTrend: { month: string; amount: number }[];
}

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select(`
          *,
          categories(name),
          events(name)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      if (expenses) {
        const analyticsData = processExpenseData(expenses);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processExpenseData = (expenses: any[]): AnalyticsData => {
    const totalBudget = expenses.reduce((sum, exp) => sum + Number(exp.total_amount), 0);
    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.paid_amount), 0);
    const totalBalance = expenses.reduce((sum, exp) => sum + Number(exp.balance), 0);

    const expensesByCategory = expenses.reduce((acc, exp) => {
      const categoryName = exp.categories?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + Number(exp.total_amount);
      return acc;
    }, {});

    const expensesByEvent = expenses.reduce((acc, exp) => {
      const eventName = exp.events?.name || 'No Event';
      acc[eventName] = (acc[eventName] || 0) + Number(exp.total_amount);
      return acc;
    }, {});

    const expensesByStatus = expenses.reduce((acc, exp) => {
      acc[exp.paid_status] = (acc[exp.paid_status] || 0) + Number(exp.total_amount);
      return acc;
    }, {});

    // Get recent expenses (last 5)
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Monthly trend (simplified - last 6 months)
    const monthlyTrend = generateMonthlyTrend(expenses);

    return {
      totalBudget,
      totalSpent,
      totalBalance,
      expensesByCategory,
      expensesByEvent,
      expensesByStatus,
      recentExpenses,
      monthlyTrend
    };
  };

  const generateMonthlyTrend = (expenses: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
      });
      
      const monthAmount = monthExpenses.reduce((sum, exp) => sum + Number(exp.paid_amount), 0);
      months.push({ month: monthName, amount: monthAmount });
    }
    
    return months;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'half_paid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unpaid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Add some expenses to see analytics and insights.</p>
        </CardContent>
      </Card>
    );
  }

  const budgetUtilization = (analytics.totalSpent / analytics.totalBudget) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Wedding Budget Analytics</h2>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(analytics.totalBudget)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(analytics.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {budgetUtilization.toFixed(1)}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(analytics.totalBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.recentExpenses.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(amount / analytics.totalBudget) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{formatCurrency(amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.monthlyTrend.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full" 
                        style={{ 
                          width: `${analytics.monthlyTrend.length > 0 ? 
                            (month.amount / Math.max(...analytics.monthlyTrend.map(m => m.amount))) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{formatCurrency(month.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{expense.item_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium text-foreground">{formatCurrency(expense.total_amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      Paid: {formatCurrency(expense.paid_amount)}
                    </div>
                  </div>
                  <Badge className={getStatusColor(expense.paid_status)}>
                    {expense.paid_status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;