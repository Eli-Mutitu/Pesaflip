"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Define expense categories
const expenseCategories = [
  { id: "office-supplies", name: "Office Supplies", color: "bg-blue-100 text-blue-800" },
  { id: "rent", name: "Rent", color: "bg-purple-100 text-purple-800" },
  { id: "utilities", name: "Utilities", color: "bg-yellow-100 text-yellow-800" },
  { id: "salaries", name: "Salaries", color: "bg-green-100 text-green-800" },
  { id: "marketing", name: "Marketing", color: "bg-pink-100 text-pink-800" },
  { id: "travel", name: "Travel", color: "bg-orange-100 text-orange-800" },
  { id: "software", name: "Software", color: "bg-indigo-100 text-indigo-800" },
  { id: "other", name: "Other", color: "bg-gray-100 text-gray-800" },
];

// Define expense type
type Expense = {
  id: string;
  date: Date;
  category: string;
  amount: number;
  description: string;
  receipt?: string;
  status: "pending" | "approved" | "rejected";
};

export default function ExpensesPage() {
  // Sample expense data (would come from API in real app)
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "exp-001",
      date: new Date(2023, 10, 15),
      category: "office-supplies",
      amount: 5000,
      description: "Office stationery and supplies",
      status: "approved",
    },
    {
      id: "exp-002",
      date: new Date(2023, 10, 18),
      category: "utilities",
      amount: 3500,
      description: "Electricity bill for October",
      status: "approved",
    },
    {
      id: "exp-003",
      date: new Date(2023, 10, 20),
      category: "marketing",
      amount: 15000,
      description: "Social media advertising",
      status: "pending",
    },
    {
      id: "exp-004",
      date: new Date(2023, 10, 25),
      category: "travel",
      amount: 8500,
      description: "Client meeting transport",
      status: "approved",
    },
    {
      id: "exp-005",
      date: new Date(2023, 11, 1),
      category: "software",
      amount: 12000,
      description: "Annual subscription for accounting software",
      status: "pending",
    },
  ]);

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    category: "",
    minAmount: "",
    maxAmount: "",
    status: "",
    showFilters: false,
  });

  // Create expense form state
  const [newExpense, setNewExpense] = useState<Omit<Expense, "id" | "status">>({
    date: new Date(),
    category: "",
    amount: 0,
    description: "",
  });

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Handle filter changes
  const handleFilterChange = (field: string, value: any) => {
    setFilters({ ...filters, [field]: value });
  };

  // Handle new expense form changes
  const handleExpenseChange = (field: string, value: any) => {
    setNewExpense({ ...newExpense, [field]: value });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateFrom: undefined,
      dateTo: undefined,
      category: "",
      minAmount: "",
      maxAmount: "",
      status: "",
      showFilters: filters.showFilters,
    });
  };

  // Add new expense
  const addExpense = () => {
    const expense: Expense = {
      id: `exp-${Math.floor(100 + Math.random() * 900)}`,
      ...newExpense,
      status: "pending",
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({
      date: new Date(),
      category: "",
      amount: 0,
      description: "",
    });
    setIsAddExpenseOpen(false);
  };

  // Delete expense
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    // Date filter
    if (filters.dateFrom && expense.date < filters.dateFrom) return false;
    if (filters.dateTo && expense.date > filters.dateTo) return false;
    
    // Category filter
    if (filters.category && expense.category !== filters.category) return false;
    
    // Amount filter
    if (filters.minAmount && expense.amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && expense.amount > parseFloat(filters.maxAmount)) return false;
    
    // Status filter
    if (filters.status && expense.status !== filters.status) return false;
    
    return true;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your business expenses</p>
        </div>
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Enter the details of your business expense.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newExpense.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newExpense.date ? (
                        format(newExpense.date, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newExpense.date}
                      onSelect={(date: Date | undefined) => handleExpenseChange("date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category</Label>
                <Select 
                  value={newExpense.category} 
                  onValueChange={(value) => handleExpenseChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount (KES)</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  value={newExpense.amount || ""}
                  onChange={(e) => handleExpenseChange("amount", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-description">Description</Label>
                <Input
                  id="expense-description"
                  value={newExpense.description}
                  onChange={(e) => handleExpenseChange("description", e.target.value)}
                  placeholder="Brief description of expense"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddExpenseOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={addExpense}
                disabled={!newExpense.category || newExpense.amount <= 0 || !newExpense.description}
              >
                Save Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Expenses List</CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="show-filters" className="text-sm">Filters</Label>
              <Switch
                id="show-filters"
                checked={filters.showFilters}
                onCheckedChange={(checked) => handleFilterChange("showFilters", checked)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filters.showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-md">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-sm",
                          !filters.dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? (
                          format(filters.dateFrom, "PP")
                        ) : (
                          <span>From</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date: Date | undefined) => handleFilterChange("dateFrom", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-sm",
                          !filters.dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? (
                          format(filters.dateTo, "PP")
                        ) : (
                          <span>To</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date: Date | undefined) => handleFilterChange("dateTo", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => handleFilterChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex items-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetFilters}
                  className="mr-2"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
          
          {/* Expenses Table */}
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Amount</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => {
                    const category = expenseCategories.find(cat => cat.id === expense.category);
                    return (
                      <tr key={expense.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          {format(expense.date, "dd MMM yyyy")}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={category?.color}>
                            {category?.name || expense.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{expense.description}</td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge 
                            className={
                              expense.status === "approved" 
                                ? "bg-green-100 text-green-800" 
                                : expense.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-more-horizontal"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteExpense(expense.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No expenses found. Adjust your filters or add a new expense.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 