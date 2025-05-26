"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Search, 
  MoreHorizontal,
  Download,
  Eye,
  RefreshCcw,
  XCircle,
  CheckCircle,
  Clock,
  Phone
} from "lucide-react";
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

// Define payment status types and styling
const paymentStatuses = {
  successful: {
    label: "Successful",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800",
    icon: XCircle
  }
};

// Define payment methods
const paymentMethods = [
  { id: "mpesa", name: "M-PESA", icon: "mpesa" },
  { id: "card", name: "Credit/Debit Card", icon: "card" }
];

// Define payment type
type Payment = {
  id: string;
  date: Date;
  amount: number;
  status: "successful" | "pending" | "failed";
  reference: string;
  payerName: string;
  payerPhone: string;
  paymentMethod: "mpesa" | "card";
  transactionId?: string;
};

export default function PaymentsPage() {
  // Sample payment data (would come from API in real app)
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "pmt-001",
      date: new Date(2023, 10, 30),
      amount: 12500,
      status: "successful",
      reference: "INV-2023-1095",
      payerName: "John Kimani",
      payerPhone: "254712345678",
      paymentMethod: "mpesa",
      transactionId: "QKL0PX1M2N"
    },
    {
      id: "pmt-002",
      date: new Date(2023, 11, 2),
      amount: 5000,
      status: "successful",
      reference: "INV-2023-1098",
      payerName: "Sarah Wanjiku",
      payerPhone: "254723456789",
      paymentMethod: "mpesa",
      transactionId: "QKL1PX3M4N"
    },
    {
      id: "pmt-003",
      date: new Date(2023, 11, 3),
      amount: 18000,
      status: "pending",
      reference: "INV-2023-1100",
      payerName: "Alex Maina",
      payerPhone: "254734567890",
      paymentMethod: "mpesa"
    },
    {
      id: "pmt-004",
      date: new Date(2023, 11, 5),
      amount: 7500,
      status: "failed",
      reference: "INV-2023-1105",
      payerName: "Faith Njeri",
      payerPhone: "254745678901",
      paymentMethod: "card"
    },
    {
      id: "pmt-005",
      date: new Date(2023, 11, 7),
      amount: 15000,
      status: "successful",
      reference: "INV-2023-1110",
      payerName: "David Ochieng",
      payerPhone: "254756789012",
      paymentMethod: "card",
      transactionId: "CRD98765432"
    },
  ]);

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    status: "",
    paymentMethod: "",
    minAmount: "",
    maxAmount: "",
    search: "",
    showFilters: false,
  });

  // Request payment form state
  const [requestPayment, setRequestPayment] = useState({
    payerPhone: "",
    amount: 0,
    reference: "",
    paymentMethod: "mpesa" as "mpesa" | "card",
  });

  const [isRequestPaymentOpen, setIsRequestPaymentOpen] = useState(false);

  // Handle filter changes
  const handleFilterChange = (field: string, value: any) => {
    setFilters({ ...filters, [field]: value });
  };

  // Handle request payment form changes
  const handleRequestPaymentChange = (field: string, value: any) => {
    setRequestPayment({ ...requestPayment, [field]: value });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateFrom: undefined,
      dateTo: undefined,
      status: "",
      paymentMethod: "",
      minAmount: "",
      maxAmount: "",
      search: "",
      showFilters: filters.showFilters,
    });
  };

  // Submit payment request
  const submitPaymentRequest = () => {
    // In a real app, this would send the request to your backend
    // and potentially trigger an SMS or push notification to the payer
    
    // For demo, we'll add this as a pending payment
    const newPayment: Payment = {
      id: `pmt-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date(),
      amount: requestPayment.amount,
      status: "pending",
      reference: requestPayment.reference || `REQ-${new Date().getTime().toString().slice(-8)}`,
      payerName: "New Customer", // Would be filled later or from contacts
      payerPhone: requestPayment.payerPhone,
      paymentMethod: requestPayment.paymentMethod,
    };
    
    setPayments([newPayment, ...payments]);
    
    // Reset form
    setRequestPayment({
      payerPhone: "",
      amount: 0,
      reference: "",
      paymentMethod: "mpesa",
    });
    
    setIsRequestPaymentOpen(false);
    
    // In real app, show a success message with next steps
    alert("Payment request sent successfully. The payer will receive a notification to complete the payment.");
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    // Date filter
    if (filters.dateFrom && payment.date < filters.dateFrom) return false;
    if (filters.dateTo && payment.date > filters.dateTo) return false;
    
    // Status filter
    if (filters.status && payment.status !== filters.status) return false;
    
    // Payment method filter
    if (filters.paymentMethod && payment.paymentMethod !== filters.paymentMethod) return false;
    
    // Amount filter
    if (filters.minAmount && payment.amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && payment.amount > parseFloat(filters.maxAmount)) return false;
    
    // Search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        payment.reference.toLowerCase().includes(searchTerm) ||
        payment.payerName.toLowerCase().includes(searchTerm) ||
        payment.payerPhone.includes(searchTerm) ||
        (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm))
      );
    }
    
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

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("254")) {
      return `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track and manage your payment transactions</p>
        </div>
        <Dialog open={isRequestPaymentOpen} onOpenChange={setIsRequestPaymentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Payment</DialogTitle>
              <DialogDescription>
                Send a payment request to your customer's phone number.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="payer-phone">Customer Phone Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    +254
                  </span>
                  <Input
                    id="payer-phone"
                    type="tel"
                    placeholder="712345678"
                    className="rounded-l-none"
                    value={requestPayment.payerPhone.startsWith("254") ? requestPayment.payerPhone.slice(3) : requestPayment.payerPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      handleRequestPaymentChange("payerPhone", value.startsWith("254") ? value : `254${value}`);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount (KES)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  min="1"
                  placeholder="0.00"
                  value={requestPayment.amount || ""}
                  onChange={(e) => handleRequestPaymentChange("amount", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-reference">Reference (Optional)</Label>
                <Input
                  id="payment-reference"
                  placeholder="e.g., Invoice number"
                  value={requestPayment.reference}
                  onChange={(e) => handleRequestPaymentChange("reference", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select
                  value={requestPayment.paymentMethod}
                  onValueChange={(value: "mpesa" | "card") => handleRequestPaymentChange("paymentMethod", value)}
                >
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsRequestPaymentOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={submitPaymentRequest}
                disabled={!requestPayment.payerPhone || requestPayment.amount <= 0}
              >
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payments List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Received Payments</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search payments..."
                  className="pl-8 w-64"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="show-filters" className="text-sm">Filters</Label>
                <Switch
                  id="show-filters"
                  checked={filters.showFilters}
                  onCheckedChange={(checked) => handleFilterChange("showFilters", checked)}
                />
              </div>
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
                    <SelectItem value="successful">Successful</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select 
                  value={filters.paymentMethod} 
                  onValueChange={(value) => handleFilterChange("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All methods</SelectItem>
                    <SelectItem value="mpesa">M-PESA</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
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

          {/* Payments Table */}
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Reference</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Method</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Amount</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => {
                    const StatusIcon = paymentStatuses[payment.status].icon;
                    
                    return (
                      <tr key={payment.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          {format(payment.date, "dd MMM yyyy")}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {payment.reference}
                        </td>
                        <td className="py-3 px-4">
                          <div>{payment.payerName}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" /> 
                            {formatPhoneNumber(payment.payerPhone)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {payment.paymentMethod === "mpesa" ? "M-PESA" : "Card"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={paymentStatuses[payment.status].color}>
                            <StatusIcon className="h-3.5 w-3.5 mr-1" />
                            {paymentStatuses[payment.status].label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download Receipt
                              </DropdownMenuItem>
                              {payment.status === "pending" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Resend Request
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No payments found. Adjust your filters or request a new payment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
          <div className="text-sm">
            Total: <span className="font-semibold">{formatCurrency(filteredPayments.reduce((sum, payment) => payment.status === "successful" ? sum + payment.amount : sum, 0))}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 