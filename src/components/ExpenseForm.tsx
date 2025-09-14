import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExpenseFormData {
  date: Date;
  item_name: string;
  category_id: string;
  quantity: number;
  unit_price: number;
  paid_amount: number;
  paid_by_id: string;
  event_id: string;
  payment_mode_id: string;
  notes: string;
}

interface EditingExpense {
  id: string;
  date: Date;
  item_name: string;
  quantity: number;
  total_amount: number;
  paid_amount: number;
  paid_status: 'paid' | 'half_paid' | 'unpaid';
  notes: string;
  category_id: string;
  paid_by_id: string;
  event_id: string;
  payment_mode_id: string;
}

interface ExpenseFormProps {
  onExpenseAdded: () => void;
  editingExpense?: EditingExpense;
}

const ExpenseForm = ({ onExpenseAdded, editingExpense }: ExpenseFormProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(editingExpense?.date);
  const [categories, setCategories] = useState<any[]>([]);
  const [paidByOptions, setPaidByOptions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!editingExpense;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    defaultValues: editingExpense ? {
      item_name: editingExpense.item_name,
      quantity: editingExpense.quantity,
      unit_price: editingExpense.total_amount / editingExpense.quantity,
      paid_amount: editingExpense.paid_amount,
      notes: editingExpense.notes || '',
    } : {}
  });

  const quantity = watch('quantity') || 1;
  const unitPrice = watch('unit_price') || 0;
  const paidAmount = watch('paid_amount') || 0;
  const totalAmount = quantity * unitPrice;
  const balance = totalAmount - paidAmount;

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [categoriesRes, paymentModesRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('payment_modes').select('*').order('name'),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (paymentModesRes.data) setPaymentModes(paymentModesRes.data);

      // Load user-specific data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [paidByRes, eventsRes] = await Promise.all([
          supabase.from('paid_by').select('*').eq('user_id', user.id).order('name'),
          supabase.from('events').select('*').eq('user_id', user.id).order('name'),
        ]);

        if (paidByRes.data) setPaidByOptions(paidByRes.data);
        if (eventsRes.data) setEvents(eventsRes.data);

        // Set default values for editing
        if (editingExpense) {
          // Find and set the correct IDs for selects
          const category = categoriesRes.data?.find(c => c.name === editingExpense.category_id);
          const paidBy = paidByRes.data?.find(p => p.name === editingExpense.paid_by_id);
          const event = eventsRes.data?.find(e => e.name === editingExpense.event_id);
          const paymentMode = paymentModesRes.data?.find(pm => pm.name === editingExpense.payment_mode_id);

          if (category) setValue('category_id', category.id);
          if (paidBy) setValue('paid_by_id', paidBy.id);
          if (event) setValue('event_id', event.id);
          if (paymentMode) setValue('payment_mode_id', paymentMode.id);
        }
      }
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!data.category_id) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!data.paid_by_id) {
      toast({
        title: "Error",
        description: "Please select who paid for this expense",
        variant: "destructive",
      });
      return;
    }

    if (!data.event_id) {
      toast({
        title: "Error",
        description: "Please select an event",
        variant: "destructive",
      });
      return;
    }

    if (!data.payment_mode_id) {
      toast({
        title: "Error",
        description: "Please select a payment mode",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const totalAmount = data.quantity * data.unit_price;
      const balance = totalAmount - data.paid_amount;
      
      let paidStatus: 'paid' | 'half_paid' | 'unpaid' = 'unpaid';
      if (data.paid_amount >= totalAmount) {
        paidStatus = 'paid';
      } else if (data.paid_amount > 0) {
        paidStatus = 'half_paid';
      }

      if (isEditing && editingExpense) {
        // Update existing expense
        const { error } = await supabase
          .from('expenses')
          .update({
            date: format(date, 'yyyy-MM-dd'),
            item_name: data.item_name,
            category_id: data.category_id,
            quantity: data.quantity,
            unit_price: data.unit_price,
            total_amount: totalAmount,
            paid_amount: data.paid_amount,
            balance: balance,
            paid_status: paidStatus,
            paid_by_id: data.paid_by_id,
            event_id: data.event_id,
            payment_mode_id: data.payment_mode_id,
            notes: data.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingExpense.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expense updated successfully!",
        });
      } else {
        // Create new expense
        const { error } = await supabase.from('expenses').insert({
          user_id: user.id,
          date: format(date, 'yyyy-MM-dd'),
          item_name: data.item_name,
          category_id: data.category_id,
          quantity: data.quantity,
          unit_price: data.unit_price,
          total_amount: totalAmount,
          paid_amount: data.paid_amount,
          balance: balance,
          paid_status: paidStatus,
          paid_by_id: data.paid_by_id,
          event_id: data.event_id,
          payment_mode_id: data.payment_mode_id,
          notes: data.notes || null,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expense added successfully!",
        });

        reset();
        setDate(undefined);
      }

      onExpenseAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  // Utility for Indian Rupee formatting
  const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const getPaidStatus = () => {
    if (paidAmount >= totalAmount && totalAmount > 0) return 'Paid';
    if (paidAmount > 0) return 'Half Paid';
    return 'Unpaid';
  };

  const getStatusColor = () => {
    const status = getPaidStatus();
    if (status === 'Paid') return 'text-green-600';
    if (status === 'Half Paid') return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {isEditing ? 'Edit Expense' : 'Add New Expense'}
          Add New Expense
        </CardTitle>
        <CardDescription>
          Enter the details for your wedding expense
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_name">Item / Expense Title</Label>
              <Input
                id="item_name"
                {...register('item_name', { required: 'Item name is required' })}
                placeholder="Enter item name"
              />
              {errors.item_name && (
                <p className="text-sm text-red-500">{errors.item_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(value) => setValue('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(category => category.id && category.id.toString().trim() !== '').map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">* Required</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register('quantity', { required: true, min: 1 })}
                placeholder="1"
                defaultValue="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price (₹)</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                {...register('unit_price', { required: true, min: 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="p-2 bg-muted rounded-md">
                {formatINR(totalAmount)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_amount">Paid Amount (₹)</Label>
              <Input
                id="paid_amount"
                type="number"
                step="0.01"
                min="0"
                {...register('paid_amount', { min: 0 })}
                placeholder="0.00"
                defaultValue="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Balance</Label>
              <div className="p-2 bg-muted rounded-md">
                {formatINR(balance)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className={cn("p-2 bg-muted rounded-md font-medium", getStatusColor())}>
                {getPaidStatus()}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Paid By</Label>
              <Select onValueChange={(value) => setValue('paid_by_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {paidByOptions.filter(option => option.id && option.id.toString().trim() !== '').map((option) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">* Required</p>
            </div>

            <div className="space-y-2">
              <Label>Event</Label>
              <Select onValueChange={(value) => setValue('event_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {events.filter(event => event.id && event.id.toString().trim() !== '').map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">* Required</p>
            </div>

            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select onValueChange={(value) => setValue('payment_mode_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.filter(mode => mode.id && mode.id.toString().trim() !== '').map((mode) => (
                    <SelectItem key={mode.id} value={mode.id.toString()}>
                      {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">* Required</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            variant="wedding" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;