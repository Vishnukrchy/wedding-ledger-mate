import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Filter, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ExpenseForm from '@/components/ExpenseForm';

interface Expense {
  id: string;
  date: string;
  item_name: string;
  quantity: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  paid_status: 'paid' | 'half_paid' | 'unpaid';
  notes?: string;
  categories: { name: string };
  paid_by: { name: string };
  events: { name: string };
  payment_modes: { name: string };
}

interface ExpenseListProps {
  refreshTrigger: number;
}

const ExpenseList = ({ refreshTrigger }: ExpenseListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadExpenses();
      loadFilterOptions();
    }
  }, [user, refreshTrigger]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, categoryFilter, statusFilter, eventFilter]);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          categories(name),
          paid_by(name),
          events(name),
          payment_modes(name)
        `)
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [categoriesRes, eventsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('events').select('*').eq('user_id', user?.id).order('name'),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.categories.name === categoryFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(expense => expense.paid_status === statusFilter);
    }

    if (eventFilter && eventFilter !== 'all') {
      filtered = filtered.filter(expense => expense.events.name === eventFilter);
    }

    setFilteredExpenses(filtered);
  };

  // Utility for Indian Rupee formatting
  const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

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

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setEventFilter('');
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowEditDialog(true);
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingExpense) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', deletingExpense.id);

      if (error) throw error;

      toast({
        title: "Expense Deleted",
        description: `${deletingExpense.item_name} has been deleted successfully.`,
      });

      // Refresh the list
      loadExpenses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setDeletingExpense(null);
    }
  };

  const handleEditComplete = () => {
    setShowEditDialog(false);
    setEditingExpense(null);
    loadExpenses(); // Refresh the list
    toast({
      title: "Expense Updated",
      description: "The expense has been updated successfully.",
    });
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={`loading-${i}`} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Expense List
        </CardTitle>
        <CardDescription>
          View and filter your wedding expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="half_paid">Half Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Event</Label>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.name}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </p>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No expenses found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-muted/50">
                    <TableCell>
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">{expense.item_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.categories.name}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(expense.total_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(expense.paid_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(expense.balance)}
                    </TableCell>
                    <TableCell>{getStatusBadge(expense.paid_status)}</TableCell>
                    <TableCell>{expense.paid_by.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{expense.events.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleEdit(expense)}
                            className="cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(expense)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        {editingExpense && (
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
                <DialogDescription>
                  Update the details for "{editingExpense.item_name}"
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm 
                onExpenseAdded={handleEditComplete}
                editingExpense={{
                  id: editingExpense.id,
                  date: new Date(editingExpense.date),
                  item_name: editingExpense.item_name,
                  quantity: editingExpense.quantity,
                  total_amount: editingExpense.total_amount,
                  paid_amount: editingExpense.paid_amount,
                  paid_status: editingExpense.paid_status,
                  notes: editingExpense.notes || '',
                  category_id: editingExpense.categories?.name || '',
                  paid_by_id: editingExpense.paid_by?.name || '',
                  event_id: editingExpense.events?.name || '',
                  payment_mode_id: editingExpense.payment_modes?.name || ''
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingExpense?.item_name}"? 
                This action cannot be undone and will permanently remove this expense from your records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Expense
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default ExpenseList;