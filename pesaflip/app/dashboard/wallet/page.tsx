"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Plus, CreditCard, Clock, Filter, Calendar, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/common/Table";
import { getWalletBalance, getWalletTransactions, topUpWallet, withdrawFromWallet, Transaction } from "@/services/api/walletApi";
import { useToast } from "@/components/ui/use-toast";

// Mock data for transactions
const transactions = [
  {
    id: "tx-001",
    date: new Date(2023, 10, 28),
    type: "topup",
    amount: 25000,
    status: "completed",
    reference: "MPE1234567",
    method: "M-PESA",
  },
  {
    id: "tx-002",
    date: new Date(2023, 10, 25),
    type: "withdraw",
    amount: 15000,
    status: "completed",
    reference: "WD9876543",
    method: "Bank Transfer",
  },
  {
    id: "tx-003",
    date: new Date(2023, 10, 22),
    type: "topup",
    amount: 50000,
    status: "completed",
    reference: "MPE7654321",
    method: "M-PESA",
  },
  {
    id: "tx-004",
    date: new Date(2023, 10, 20),
    type: "withdraw",
    amount: 30000,
    status: "failed",
    reference: "WD5432167",
    method: "Bank Transfer",
  },
  {
    id: "tx-005",
    date: new Date(2023, 10, 15),
    type: "topup",
    amount: 10000,
    status: "pending",
    reference: "MPE8765432",
    method: "M-PESA",
  },
];

// Wallet Page Component
export default function WalletPage() {
  const { toast } = useToast();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [withdrawMethod, setWithdrawMethod] = useState("mpesa");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0
  });
  
  // Form validation types
  type FormErrors = {
    amount?: string;
    mobileNumber?: string;
    cardNumber?: string;
    accountNumber?: string;
  }
  
  const [topUpErrors, setTopUpErrors] = useState<FormErrors>({});
  const [withdrawErrors, setWithdrawErrors] = useState<FormErrors>({});
  
  // Format currency in KES
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };
  
  // Fetch wallet balance and transactions
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setIsLoading(true);
        setIsLoadingTransactions(true);
        
        // Fetch balance
        const balance = await getWalletBalance();
        setWalletBalance(balance);
        
        // Fetch transactions
        const transactionData = await getWalletTransactions({
          limit: pagination.limit,
          offset: pagination.offset
        });
        
        setTransactions(transactionData.transactions);
        setPagination({
          ...pagination,
          total: transactionData.pagination.total
        });
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch wallet data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoadingTransactions(false);
      }
    };

    fetchWalletData();
  }, [pagination.limit, pagination.offset]);
  
  // Load more transactions
  const loadMoreTransactions = () => {
    setPagination({
      ...pagination,
      offset: pagination.offset + pagination.limit
    });
  };
  
  // Transaction table columns definition
  const transactionColumns = [
    {
      header: "Date",
      cell: (tx: Transaction) => {
        const date = new Date(tx.created_at);
        return formatDate(date);
      },
    },
    {
      header: "Type",
      cell: (tx: Transaction) => (
        <Badge 
          variant="outline" 
          className={`
            ${tx.type === "topup" ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}
            rounded-full px-2 py-0.5 text-xs font-medium
          `}
        >
          {tx.type === "topup" ? "Top Up" : "Withdraw"}
        </Badge>
      ),
    },
    {
      header: "Amount",
      cell: (tx: Transaction) => (
        <div className="font-medium">
          {tx.type === "topup" ? "+" : "-"}{formatCurrency(tx.amount)}
        </div>
      ),
    },
    {
      header: "Method",
      cell: (tx: Transaction) => tx.method,
    },
    {
      header: "Reference",
      cell: (tx: Transaction) => <span className="text-xs font-mono">{tx.reference}</span>,
    },
    {
      header: "Status",
      cell: (tx: Transaction) => {
        const statusStyles = {
          completed: "bg-green-50 text-green-700 border-green-200",
          pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
          failed: "bg-red-50 text-red-700 border-red-200",
        };
        
        return (
          <Badge 
            variant="outline" 
            className={`${statusStyles[tx.status as keyof typeof statusStyles]} rounded-full px-2 py-0.5 text-xs font-medium`}
          >
            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
          </Badge>
        );
      },
    },
  ];
  
  // Reset form states when dialogs close
  const handleTopUpClose = () => {
    setTopUpAmount("");
    setMobileNumber("");
    setCardNumber("");
    setPaymentMethod("mpesa");
    setTopUpErrors({});
    setIsTopUpOpen(false);
  };

  const handleWithdrawClose = () => {
    setWithdrawAmount("");
    setAccountNumber("");
    setWithdrawMethod("mpesa");
    setWithdrawErrors({});
    setIsWithdrawOpen(false);
  };

  // Validate Top Up form
  const validateTopUpForm = () => {
    const errors: FormErrors = {};
    
    if (!topUpAmount || parseInt(topUpAmount) < 100) {
      errors.amount = "Amount must be at least KES 100";
    }
    
    if (paymentMethod === "mpesa" && (!mobileNumber || !/^07\d{8}$|^01\d{8}$/.test(mobileNumber))) {
      errors.mobileNumber = "Please enter a valid mobile number (e.g., 0712345678)";
    }
    
    if (paymentMethod === "card" && (!cardNumber || cardNumber.length < 16)) {
      errors.cardNumber = "Please enter a valid card number";
    }
    
    setTopUpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate Withdraw form
  const validateWithdrawForm = () => {
    const errors: FormErrors = {};
    
    if (!withdrawAmount || isNaN(parseInt(withdrawAmount)) || parseInt(withdrawAmount) < 100) {
      errors.amount = "Amount must be at least KES 100";
    } else if (parseInt(withdrawAmount) > walletBalance) {
      errors.amount = "Amount exceeds your available balance";
    }
    
    if (withdrawMethod === "mpesa" && (!mobileNumber || !/^07\d{8}$|^01\d{8}$/.test(mobileNumber))) {
      errors.mobileNumber = "Please enter a valid mobile number (e.g., 0712345678)";
    }
    
    if (withdrawMethod === "bank" && (!accountNumber || accountNumber.length < 6)) {
      errors.accountNumber = "Please enter a valid account number";
    }
    
    setWithdrawErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Top Up submission
  const handleTopUpSubmit = async () => {
    if (validateTopUpForm()) {
      try {
        setIsProcessing(true);
        
        const topUpData = {
          amount: parseFloat(topUpAmount),
          method: paymentMethod as 'mpesa' | 'card' | 'bank',
          ...(paymentMethod === "mpesa" && { mobileNumber }),
          ...(paymentMethod === "card" && { cardNumber }),
        };
        
        const result = await topUpWallet(topUpData);
        
        // Update wallet balance
        setWalletBalance(result.newBalance);
        
        // Refresh transactions list
        const transactionData = await getWalletTransactions({
          limit: pagination.limit,
          offset: 0 // Reset to first page
        });
        
        setTransactions(transactionData.transactions);
        setPagination({
          ...pagination,
          offset: 0,
          total: transactionData.pagination.total
        });
        
        toast({
          title: "Success",
          description: `Your wallet has been topped up with ${formatCurrency(parseFloat(topUpAmount))}`,
          variant: "default",
        });
        
        handleTopUpClose();
      } catch (error: any) {
        console.error('Top up failed:', error);
        toast({
          title: "Top Up Failed",
          description: error?.message || "An error occurred while processing your top-up request.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handle Withdraw submission
  const handleWithdrawSubmit = async () => {
    if (validateWithdrawForm()) {
      try {
        setIsProcessing(true);
        
        const withdrawData = {
          amount: parseFloat(withdrawAmount),
          destination: withdrawMethod as 'mpesa' | 'bank',
          ...(withdrawMethod === "mpesa" && { mobileNumber }),
          ...(withdrawMethod === "bank" && { accountNumber }),
        };
        
        const result = await withdrawFromWallet(withdrawData);
        
        // Update wallet balance
        setWalletBalance(result.newBalance);
        
        // Refresh transactions list
        const transactionData = await getWalletTransactions({
          limit: pagination.limit,
          offset: 0 // Reset to first page
        });
        
        setTransactions(transactionData.transactions);
        setPagination({
          ...pagination,
          offset: 0,
          total: transactionData.pagination.total
        });
        
        toast({
          title: "Success",
          description: `${formatCurrency(parseFloat(withdrawAmount))} has been withdrawn from your wallet.`,
          variant: "default",
        });
        
        handleWithdrawClose();
      } catch (error: any) {
        console.error('Withdrawal failed:', error);
        toast({
          title: "Withdrawal Failed",
          description: error?.message || "An error occurred while processing your withdrawal request.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">Manage your wallet, funds, and transactions</p>
      </div>
      
      {/* Wallet Balance Card */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-3 overflow-hidden relative shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-0"></div>
          <CardHeader className="relative z-10">
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>Your current available balance</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <div className="h-16 flex items-center justify-start">
                <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading balance...</span>
              </div>
            ) : (
              <div className="text-4xl font-bold tracking-tight text-primary">
                {formatCurrency(walletBalance)}
              </div>
            )}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <ArrowDownLeft size={16} />
                    Top Up
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Top Up Wallet</DialogTitle>
                    <DialogDescription>
                      Add funds to your wallet using M-PESA or card payment.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount" className="flex items-center justify-between">
                        Amount
                        {topUpErrors.amount && (
                          <span className="text-xs text-red-500 font-normal">{topUpErrors.amount}</span>
                        )}
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        min="100"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className={topUpErrors.amount ? "border-red-300" : ""}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="method">Payment Method</Label>
                      <Select 
                        defaultValue="mpesa"
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        disabled={isProcessing}
                      >
                        <SelectTrigger id="method">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mpesa">M-PESA</SelectItem>
                          <SelectItem value="card">Card Payment</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentMethod === "mpesa" && (
                      <div className="grid gap-2">
                        <Label htmlFor="mobile-number" className="flex items-center justify-between">
                          Mobile Number
                          {topUpErrors.mobileNumber && (
                            <span className="text-xs text-red-500 font-normal">{topUpErrors.mobileNumber}</span>
                          )}
                        </Label>
                        <Input
                          id="mobile-number"
                          type="tel"
                          placeholder="e.g., 0712345678"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className={topUpErrors.mobileNumber ? "border-red-300" : ""}
                          disabled={isProcessing}
                        />
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="grid gap-2">
                        <Label htmlFor="card-number" className="flex items-center justify-between">
                          Card Number
                          {topUpErrors.cardNumber && (
                            <span className="text-xs text-red-500 font-normal">{topUpErrors.cardNumber}</span>
                          )}
                        </Label>
                        <Input
                          id="card-number"
                          type="text"
                          placeholder="Enter your card number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className={topUpErrors.cardNumber ? "border-red-300" : ""}
                          disabled={isProcessing}
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleTopUpClose}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={handleTopUpSubmit}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Proceed to Payment"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <ArrowUpRight size={16} />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Withdraw funds from your wallet to your bank account or mobile money.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="withdraw-amount" className="flex items-center justify-between">
                        Amount
                        {withdrawErrors.amount && (
                          <span className="text-xs text-red-500 font-normal">{withdrawErrors.amount}</span>
                        )}
                      </Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="Enter amount"
                        min="100"
                        max={walletBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className={withdrawErrors.amount ? "border-red-300" : ""}
                        disabled={isProcessing}
                      />
                      <p className="text-xs text-muted-foreground">
                        Available balance: {formatCurrency(walletBalance)}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="withdraw-method">Withdrawal Method</Label>
                      <Select 
                        defaultValue="mpesa"
                        value={withdrawMethod}
                        onValueChange={setWithdrawMethod}
                        disabled={isProcessing}
                      >
                        <SelectTrigger id="withdraw-method">
                          <SelectValue placeholder="Select withdrawal method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mpesa">M-PESA</SelectItem>
                          <SelectItem value="bank">Bank Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {withdrawMethod === "mpesa" && (
                      <div className="grid gap-2">
                        <Label htmlFor="withdraw-mobile" className="flex items-center justify-between">
                          Mobile Number
                          {withdrawErrors.mobileNumber && (
                            <span className="text-xs text-red-500 font-normal">{withdrawErrors.mobileNumber}</span>
                          )}
                        </Label>
                        <Input
                          id="withdraw-mobile"
                          type="tel"
                          placeholder="e.g., 0712345678"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className={withdrawErrors.mobileNumber ? "border-red-300" : ""}
                          disabled={isProcessing}
                        />
                      </div>
                    )}

                    {withdrawMethod === "bank" && (
                      <div className="grid gap-2">
                        <Label htmlFor="account-number" className="flex items-center justify-between">
                          Account Number
                          {withdrawErrors.accountNumber && (
                            <span className="text-xs text-red-500 font-normal">{withdrawErrors.accountNumber}</span>
                          )}
                        </Label>
                        <Input
                          id="account-number"
                          type="text"
                          placeholder="Enter your account number"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className={withdrawErrors.accountNumber ? "border-red-300" : ""}
                          disabled={isProcessing}
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleWithdrawClose}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={handleWithdrawSubmit}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Withdraw Funds"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground flex items-center gap-2 relative z-10">
            <Clock size={14} />
            Last updated: Today at {new Date().toLocaleTimeString()}
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Top Ups</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="text-xl font-bold">{formatCurrency(85000)}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="text-xl font-bold">{formatCurrency(45000)}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Active Transactions</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="text-xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="text-xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Transaction History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your wallet transactions</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="topup">Top Up</SelectItem>
                  <SelectItem value="withdraw">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Calendar size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions && transactions.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading transactions...</span>
            </div>
          ) : transactions.length > 0 ? (
            <>
              <Table 
                data={transactions} 
                columns={transactionColumns} 
                keyExtractor={(tx) => tx.id}
              />
              {pagination.total > transactions.length && (
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={loadMoreTransactions}
                    disabled={isLoadingTransactions}
                    className="text-sm"
                  >
                    {isLoadingTransactions ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-10 border rounded-md bg-background">
              <p className="text-muted-foreground">No transactions found.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Advanced Filters
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 