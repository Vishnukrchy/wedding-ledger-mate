import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, DollarSign, CreditCard, Calendar, Target, AlertTriangle, CheckCircle, Clock, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

// Utility for Indian Rupee formatting
const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const Analytics = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          categories(name),
          paid_by(name),
          events(name),
          payment_modes(name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.total_amount, 0);
  const totalPaid = expenses.reduce((sum, expense) => sum + expense.paid_amount, 0);
  const totalBalance = expenses.reduce((sum, expense) => sum + expense.balance, 0);
  const paymentPercent = totalSpent > 0 ? (totalPaid / totalSpent) * 100 : 0;

  // Budget analysis (assuming a target budget)
  const estimatedBudget = 500000; // ₹5 lakh default wedding budget
  const budgetUsed = (totalSpent / estimatedBudget) * 100;

  // Category-wise spending with detailed analysis
  const categoryData = expenses.reduce((acc, expense) => {
    const category = expense.categories?.name || 'Unknown';
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        paid: 0,
        balance: 0,
        count: 0,
        items: []
      };
    }
    acc[category].total += expense.total_amount;
    acc[category].paid += expense.paid_amount;
    acc[category].balance += expense.balance;
    acc[category].count += 1;
    acc[category].items.push(expense);
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, data]: [string, any]) => ({
    name,
    total: data.total,
    paid: data.paid,
    balance: data.balance,
    count: data.count,
    percent: totalSpent > 0 ? ((data.total / totalSpent) * 100).toFixed(1) : 0
  }));

  // Monthly spending trend with cumulative analysis
  const monthlyData = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { total: 0, paid: 0, balance: 0, count: 0 };
    }
    acc[month].total += expense.total_amount;
    acc[month].paid += expense.paid_amount;
    acc[month].balance += expense.balance;
    acc[month].count += 1;
    return acc;
  }, {});

  const monthlyChartData = Object.entries(monthlyData)
    .map(([month, data]: [string, any]) => ({
      month,
      total: data.total,
      paid: data.paid,
      balance: data.balance,
      count: data.count
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Payment status distribution with detailed breakdown
  const statusData = expenses.reduce((acc, expense) => {
    if (!acc[expense.paid_status]) {
      acc[expense.paid_status] = { count: 0, amount: 0 };
    }
    acc[expense.paid_status].count += 1;
    acc[expense.paid_status].amount += expense.total_amount;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([status, data]: [string, any]) => ({
    status: status.replace('_', ' ').toUpperCase(),
    count: data.count,
    amount: data.amount,
    color: status === 'paid' ? '#22c55e' : status === 'half_paid' ? '#f59e0b' : '#ef4444'
  }));

  // Event-wise spending analysis
  const eventData = expenses.reduce((acc, expense) => {
    const event = expense.events?.name || 'General';
    if (!acc[event]) {
      acc[event] = { total: 0, paid: 0, balance: 0, count: 0 };
    }
    acc[event].total += expense.total_amount;
    acc[event].paid += expense.paid_amount;
    acc[event].balance += expense.balance;
    acc[event].count += 1;
    return acc;
  }, {});

  const eventChartData = Object.entries(eventData).map(([name, data]: [string, any]) => ({
    name,
    total: data.total,
    paid: data.paid,
    balance: data.balance,
    count: data.count
  }));

  // Payment method analysis
  const paymentMethodData = expenses.reduce((acc, expense) => {
    const method = expense.payment_modes?.name || 'Unknown';
    if (!acc[method]) {
      acc[method] = { total: 0, count: 0 };
    }
    acc[method].total += expense.paid_amount;
    acc[method].count += 1;
    return acc;
  }, {});

  const paymentMethodChartData = Object.entries(paymentMethodData).map(([name, data]: [string, any]) => ({
    name,
    total: data.total,
    count: data.count
  }));

  // Recent expenses and upcoming payments
  const recentExpenses = expenses.slice(0, 10);
  const upcomingPayments = expenses.filter(e => e.balance > 0).slice(0, 5);

  const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#8b5a3c'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center p-8">
        <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Expenses Yet</h3>
        <p className="text-muted-foreground">Add some expenses to see detailed analytics and insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {budgetUsed.toFixed(1)}% of estimated budget ({formatINR(estimatedBudget)})
            </p>
            <Progress value={budgetUsed} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatINR(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {paymentPercent.toFixed(1)}% of total expenses
            </p>
            <Progress value={paymentPercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatINR(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Across {upcomingPayments.length} pending items
            </p>
            {totalBalance > 0 && (
              <Badge variant="outline" className="mt-2 text-orange-600 border-orange-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Attention Required
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {Object.keys(categoryData).length} categories
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Avg: {formatINR(totalSpent / expenses.length)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Distribution by Category</CardTitle>
                <CardDescription>Visual breakdown of expenses across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status Overview</CardTitle>
                <CardDescription>Current payment status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'count' ? value : `₹${Number(value).toLocaleString()}`,
                        name === 'count' ? 'Items' : 'Amount'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="#8884d8" name="Amount" />
                    <Bar dataKey="count" fill="#82ca9d" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Category-wise Detailed Analysis</CardTitle>
                <CardDescription>Comprehensive breakdown by expense categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryChartData.map((category, index) => (
                    <div key={category.name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {category.name}
                        </h4>
                        <Badge variant="secondary">{category.count} items</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-medium">{formatINR(category.total)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Paid Amount</p>
                          <p className="font-medium text-green-600">{formatINR(category.paid)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Balance</p>
                          <p className="font-medium text-orange-600">{formatINR(category.balance)}</p>
                        </div>
                      </div>
                      <Progress 
                        value={category.total > 0 ? (category.paid / category.total) * 100 : 0} 
                        className="mt-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Timeline</CardTitle>
              <CardDescription>Track your spending patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="paid" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Used</CardTitle>
                <CardDescription>Analysis of payment preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₹${Number(value).toLocaleString()}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {paymentMethodChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingPayments.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{expense.item_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.categories?.name} • Due: {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">{formatINR(expense.balance)}</p>
                        <Badge variant="outline" className="text-xs">
                          {expense.paid_status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {upcomingPayments.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">All payments up to date! 🎉</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Highest Expenses</CardTitle>
                <CardDescription>Your biggest wedding investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses
                    .sort((a, b) => b.total_amount - a.total_amount)
                    .slice(0, 5)
                    .map((expense, index) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{expense.item_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {expense.categories?.name} • {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatINR(expense.total_amount)}</p>
                          <Badge variant={
                            expense.paid_status === 'paid' ? 'default' :
                            expense.paid_status === 'half_paid' ? 'secondary' : 'destructive'
                          }>
                            {expense.paid_status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Insights</CardTitle>
                <CardDescription>Smart recommendations for your wedding budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Budget Efficiency</h4>
                    <p className="text-sm text-blue-700">
                      You've spent {budgetUsed.toFixed(1)}% of your estimated budget. 
                      {budgetUsed > 80 ? " Consider reviewing remaining expenses carefully." : 
                       budgetUsed < 50 ? " You're well within budget with room for extras." :
                       " You're on track with your spending."}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">✅ Payment Progress</h4>
                    <p className="text-sm text-green-700">
                      {paymentPercent.toFixed(1)}% of expenses are paid. 
                      {paymentPercent > 80 ? " Excellent payment discipline!" :
                       paymentPercent > 50 ? " Good progress on payments." :
                       " Consider catching up on pending payments."}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2">📊 Category Analysis</h4>
                    <p className="text-sm text-purple-700">
                      Your top spending category is {categoryChartData[0]?.name} at ₹{categoryChartData[0]?.total.toLocaleString()}.
                      This represents {categoryChartData[0]?.percent}% of your total budget.
                    </p>
                  </div>

                  {totalBalance > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-900 mb-2">⚠️ Pending Attention</h4>
                      <p className="text-sm text-orange-700">
                        You have ₹{totalBalance.toLocaleString()} in pending payments across {upcomingPayments.length} items. 
                        Consider prioritizing these to stay on track.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;