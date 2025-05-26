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
import { ArrowUpRight, ArrowDownLeft, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getWalletBalance, topUpWallet, withdrawFromWallet } from "@/services/api/walletApi";
import { useToast } from "@/components/ui/use-toast";

// Form validation types
type FormErrors = {
  amount?: string;
  mobileNumber?: string;
  cardNumber?: string;
  accountNumber?: string;
}

// Wallet Summary Component for Dashboard
export function WalletSummary() {
  const { toast } = useToast();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [withdrawMethod, setWithdrawMethod] = useState("mpesa");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [topUpErrors, setTopUpErrors] = useState<FormErrors>({});
  const [withdrawErrors, setWithdrawErrors] = useState<FormErrors>({});
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Format currency in KES
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        const balance = await getWalletBalance();
        setWalletBalance(balance);
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
        toast({
          title: "Error",
          description: "Failed to fetch wallet balance. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

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
    <Card className="shadow-sm overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-0"></div>
      <CardHeader className="relative z-10 pb-2">
        <CardTitle className="text-lg">Wallet Balance</CardTitle>
        <CardDescription>Your current available balance</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 pt-0">
        {isLoading ? (
          <div className="h-16 flex items-center justify-start">
            <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading balance...</span>
          </div>
        ) : (
          <div className="text-3xl font-bold tracking-tight text-primary">
            {formatCurrency(walletBalance)}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <ArrowDownLeft size={14} />
                Top Up
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] overflow-hidden">
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
                    className={cn(
                      "transition-all duration-200",
                      topUpErrors.amount ? "border-red-300 ring-red-100" : ""
                    )}
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

                <AnimatePresence mode="wait">
                  {paymentMethod === "mpesa" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid gap-2"
                    >
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
                        className={cn(
                          "transition-all duration-200",
                          topUpErrors.mobileNumber ? "border-red-300 ring-red-100" : ""
                        )}
                        disabled={isProcessing}
                      />
                    </motion.div>
                  )}

                  {paymentMethod === "card" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid gap-2"
                    >
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
                        className={cn(
                          "transition-all duration-200",
                          topUpErrors.cardNumber ? "border-red-300 ring-red-100" : ""
                        )}
                        disabled={isProcessing}
                      />
                    </motion.div>
                  )}

                  {paymentMethod === "bank" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Alert className="bg-blue-50 border-blue-100 text-blue-700">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You will receive bank details on the next screen after confirmation.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleTopUpClose} 
                  className="transition-all duration-200 hover:bg-red-50"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleTopUpSubmit}
                  className="transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
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
              <Button size="sm" variant="outline" className="gap-1">
                <ArrowUpRight size={14} />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] overflow-hidden">
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
                    className={cn(
                      "transition-all duration-200",
                      withdrawErrors.amount ? "border-red-300 ring-red-100" : ""
                    )}
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

                <AnimatePresence mode="wait">
                  {withdrawMethod === "mpesa" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid gap-2"
                    >
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
                        className={cn(
                          "transition-all duration-200",
                          withdrawErrors.mobileNumber ? "border-red-300 ring-red-100" : ""
                        )}
                        disabled={isProcessing}
                      />
                    </motion.div>
                  )}

                  {withdrawMethod === "bank" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid gap-2"
                    >
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
                        className={cn(
                          "transition-all duration-200",
                          withdrawErrors.accountNumber ? "border-red-300 ring-red-100" : ""
                        )}
                        disabled={isProcessing}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleWithdrawClose} 
                  className="transition-all duration-200 hover:bg-red-50"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleWithdrawSubmit}
                  className="transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
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
      <CardFooter className="border-t bg-white/50 flex justify-between items-center relative z-10 py-2">
        <Link href="/dashboard/wallet" className="text-sm text-primary hover:underline flex items-center gap-1">
          <span>View all transactions</span>
          <ExternalLink size={14} />
        </Link>
      </CardFooter>
    </Card>
  );
} 