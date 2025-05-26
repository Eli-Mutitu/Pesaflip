"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Info, 
  AlertCircle, 
  Download, 
  Banknote, 
  Clock, 
  Briefcase
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Define loan period options
const loanPeriods = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "12 months" }
];

// Define business purpose options
const businessPurposes = [
  { value: "inventory", label: "Inventory Purchase" },
  { value: "equipment", label: "Equipment Purchase" },
  { value: "expansion", label: "Business Expansion" },
  { value: "operations", label: "Working Capital/Operations" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "other", label: "Other" }
];

// Define loan type
type Loan = {
  id: string;
  amount: number;
  interestRate: number;
  period: number; // days
  startDate: Date;
  dueDate: Date;
  status: "active" | "paid" | "overdue";
  purpose: string;
  remainingAmount?: number;
};

// Define payment type
type Payment = {
  id: string;
  date: Date;
  amount: number;
  loanId: string;
};

export default function CreditPage() {
  // User credit profile (would come from API in real app)
  const [creditProfile, setCreditProfile] = useState({
    creditScore: 720,
    maxCreditLimit: 500000,
    availableCredit: 350000,
    totalOutstanding: 150000,
    interestRate: 13.5, // percentage
    nextPaymentDue: new Date(2023, 11, 15),
    nextPaymentAmount: 52500,
    paymentHistory: {
      onTime: 12,
      late: 1,
      missed: 0
    }
  });

  // Sample loan history
  const [loans, setLoans] = useState<Loan[]>([
    {
      id: "loan-001",
      amount: 200000,
      interestRate: 13.5,
      period: 90,
      startDate: new Date(2023, 8, 15),
      dueDate: new Date(2023, 11, 15),
      status: "active",
      purpose: "inventory",
      remainingAmount: 150000
    },
    {
      id: "loan-002",
      amount: 100000,
      interestRate: 14.0,
      period: 60,
      startDate: new Date(2023, 5, 10),
      dueDate: new Date(2023, 7, 10),
      status: "paid",
      purpose: "marketing"
    },
    {
      id: "loan-003",
      amount: 75000,
      interestRate: 14.5,
      period: 30,
      startDate: new Date(2023, 3, 5),
      dueDate: new Date(2023, 4, 5),
      status: "paid",
      purpose: "operations"
    }
  ]);

  // Sample payment history
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "pmt-001",
      date: new Date(2023, 10, 15),
      amount: 50000,
      loanId: "loan-001"
    },
    {
      id: "pmt-002",
      date: new Date(2023, 9, 15),
      amount: 50000,
      loanId: "loan-001"
    },
    {
      id: "pmt-003",
      date: new Date(2023, 7, 10),
      amount: 107000, // with interest
      loanId: "loan-002"
    },
    {
      id: "pmt-004",
      date: new Date(2023, 4, 5),
      amount: 79000, // with interest
      loanId: "loan-003"
    }
  ]);

  // Loan application form state
  const [loanApplication, setLoanApplication] = useState({
    amount: 0,
    period: "30",
    purpose: "",
    purposeOther: "",
    expectedRepaymentSource: "",
    isDialogOpen: false
  });

  // Handle loan application form changes
  const handleLoanApplicationChange = (field: string, value: any) => {
    setLoanApplication({ ...loanApplication, [field]: value });
  };

  // Calculate expected interest and total repayment for loan application preview
  const calculateLoanPreview = () => {
    const amount = loanApplication.amount;
    const periodInDays = parseInt(loanApplication.period);
    const interestRateAdjusted = creditProfile.interestRate / 100;
    
    // Calculate interest (simple interest for this example)
    const interestAmount = amount * interestRateAdjusted * (periodInDays / 365);
    
    // Calculate total repayment
    const totalRepayment = amount + interestAmount;
    
    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + periodInDays);
    
    return {
      principal: amount,
      interestAmount,
      totalRepayment,
      interestRate: creditProfile.interestRate,
      dueDate
    };
  };

  // Submit loan application
  const submitLoanApplication = () => {
    // In a real app, this would send the application to your backend for processing
    alert("Loan application submitted successfully! It will be reviewed by our team.");
    setLoanApplication({
      amount: 0,
      period: "30",
      purpose: "",
      purposeOther: "",
      expectedRepaymentSource: "",
      isDialogOpen: false
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get credit score rating text and color
  const getCreditScoreRating = (score: number) => {
    if (score >= 750) return { text: "Excellent", color: "text-green-600" };
    if (score >= 700) return { text: "Good", color: "text-green-500" };
    if (score >= 650) return { text: "Fair", color: "text-yellow-500" };
    if (score >= 600) return { text: "Poor", color: "text-orange-500" };
    return { text: "Bad", color: "text-red-500" };
  };

  // Get loan status badge styling
  const getLoanStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Calculate loan progress (percentage paid)
  const calculateLoanProgress = (loan: Loan) => {
    if (loan.status === "paid") return 100;
    if (!loan.remainingAmount) return 0;
    
    const paid = loan.amount - loan.remainingAmount;
    return Math.round((paid / loan.amount) * 100);
  };

  // Application preview
  const loanPreview = calculateLoanPreview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Credit</h1>
        <p className="text-muted-foreground">Access and manage business financing</p>
      </div>

      {/* Credit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Credit Score */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Credit Score</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="w-80 p-4">
                    <p className="font-medium mb-2">About Your Credit Score</p>
                    <p className="text-sm mb-2">Your credit score is calculated based on:</p>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      <li>Payment history (35%)</li>
                      <li>Credit utilization (30%)</li>
                      <li>Length of credit history (15%)</li>
                      <li>Business cash flow (20%)</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="text-center py-4">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  fill="none" 
                  stroke="#e5e7eb" 
                  strokeWidth="12" 
                />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  fill="none" 
                  stroke={creditProfile.creditScore >= 700 ? "#10b981" : creditProfile.creditScore >= 600 ? "#f59e0b" : "#ef4444"} 
                  strokeWidth="12"
                  strokeDasharray={352}
                  strokeDashoffset={352 - (352 * (creditProfile.creditScore / 850))}
                  transform="rotate(-90, 64, 64)"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{creditProfile.creditScore}</span>
                <span className={`text-sm font-medium ${getCreditScoreRating(creditProfile.creditScore).color}`}>
                  {getCreditScoreRating(creditProfile.creditScore).text}
                </span>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Poor (300)</span>
                <span>(850) Excellent</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-1.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" 
                  style={{ width: "100%" }}
                />
                <div 
                  className="h-3 w-3 rounded-full bg-black -mt-2.25"
                  style={{ marginLeft: `calc(${(creditProfile.creditScore / 850) * 100}% - 0.375rem)` }}
                />
              </div>
            </div>
            <div className="mt-4 text-sm">
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100">
                Last updated: {format(new Date(), "dd MMM yyyy")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Credit */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available Credit</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex flex-col space-y-3">
              <div>
                <span className="text-3xl font-bold">{formatCurrency(creditProfile.availableCredit)}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground ml-1 inline-block" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Maximum amount available for borrowing</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="h-2.5 w-full bg-gray-200 rounded-full">
                <div 
                  className="h-2.5 rounded-full bg-blue-600" 
                  style={{ width: `${(creditProfile.availableCredit / creditProfile.maxCreditLimit) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Credit Limit:</span>
                  <span className="font-medium ml-1">{formatCurrency(creditProfile.maxCreditLimit)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Outstanding:</span>
                  <span className="font-medium ml-1">{formatCurrency(creditProfile.totalOutstanding)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{creditProfile.paymentHistory.onTime}</div>
                <div className="text-sm text-muted-foreground">On Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">{creditProfile.paymentHistory.late}</div>
                <div className="text-sm text-muted-foreground">Late</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{creditProfile.paymentHistory.missed}</div>
                <div className="text-sm text-muted-foreground">Missed</div>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Next Payment:</span>
                <span className="font-medium ml-1">{formatCurrency(creditProfile.nextPaymentAmount)}</span>
              </div>
              <div className="text-sm mt-1">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium ml-1">{format(creditProfile.nextPaymentDue, "dd MMM yyyy")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apply for Loan */}
        <Card className="md:col-span-1 shadow-sm bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Apply for Loan</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Get quick access to business financing to fuel your growth.</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                  Competitive interest rates
                </li>
                <li className="flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                  Quick application process
                </li>
                <li className="flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                  Flexible repayment terms
                </li>
              </ul>
              <Dialog 
                open={loanApplication.isDialogOpen} 
                onOpenChange={(open) => handleLoanApplicationChange("isDialogOpen", open)}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">
                    Apply Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Loan Application</DialogTitle>
                    <DialogDescription>
                      Fill out the form to apply for business financing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="loan-amount">
                        Loan Amount (KES)
                        <span className="text-xs text-muted-foreground ml-2">
                          Max: {formatCurrency(creditProfile.availableCredit)}
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="loan-amount"
                          type="number"
                          placeholder="Enter amount"
                          min={5000}
                          max={creditProfile.availableCredit}
                          value={loanApplication.amount || ""}
                          onChange={(e) => handleLoanApplicationChange("amount", parseFloat(e.target.value) || 0)}
                          className={loanApplication.amount > creditProfile.availableCredit ? "border-red-500 pr-10" : ""}
                        />
                        {loanApplication.amount > creditProfile.availableCredit && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {loanApplication.amount > creditProfile.availableCredit && (
                        <p className="text-sm text-red-500 mt-1">Amount exceeds your available credit</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          onClick={() => handleLoanApplicationChange("amount", 10000)}
                        >
                          10,000
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          onClick={() => handleLoanApplicationChange("amount", 50000)}
                        >
                          50,000
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          onClick={() => handleLoanApplicationChange("amount", 100000)}
                        >
                          100,000
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          onClick={() => handleLoanApplicationChange("amount", Math.min(200000, creditProfile.availableCredit))}
                        >
                          200,000
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loan-period">Repayment Period</Label>
                      <Select
                        value={loanApplication.period}
                        onValueChange={(value) => handleLoanApplicationChange("period", value)}
                      >
                        <SelectTrigger id="loan-period">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {loanPeriods.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loan-purpose">Business Purpose</Label>
                      <Select
                        value={loanApplication.purpose}
                        onValueChange={(value) => handleLoanApplicationChange("purpose", value)}
                      >
                        <SelectTrigger id="loan-purpose">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessPurposes.map((purpose) => (
                            <SelectItem key={purpose.value} value={purpose.value}>
                              {purpose.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Select how you plan to use the funds</p>
                    </div>
                    {loanApplication.purpose === "other" && (
                      <div className="space-y-2">
                        <Label htmlFor="purpose-other">Specify Other Purpose</Label>
                        <Input
                          id="purpose-other"
                          placeholder="Enter purpose"
                          value={loanApplication.purposeOther}
                          onChange={(e) => handleLoanApplicationChange("purposeOther", e.target.value)}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="repayment-source">Expected Repayment Source</Label>
                      <Input
                        id="repayment-source"
                        placeholder="e.g., Business revenue, contract payment"
                        value={loanApplication.expectedRepaymentSource}
                        onChange={(e) => handleLoanApplicationChange("expectedRepaymentSource", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">How do you plan to repay this loan?</p>
                    </div>
                    
                    {loanApplication.amount > 0 && (
                      <div className="bg-muted p-4 rounded-md space-y-3 mt-2">
                        <div className="font-medium flex justify-between items-center">
                          <span>Loan Preview</span>
                          <Badge variant="outline" className="font-normal">
                            {creditProfile.interestRate}% APR
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Principal:</span>
                            <span>{formatCurrency(loanPreview.principal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Interest Amount:</span>
                            <span>{formatCurrency(loanPreview.interestAmount)}</span>
                          </div>
                          <div className="h-px w-full bg-border my-1"></div>
                          <div className="flex justify-between font-medium">
                            <span>Total Repayment:</span>
                            <span>{formatCurrency(loanPreview.totalRepayment)}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Due Date:</span>
                            <span>{format(loanPreview.dueDate, "dd MMM yyyy")}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleLoanApplicationChange("isDialogOpen", false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={submitLoanApplication}
                      disabled={
                        !loanApplication.amount || 
                        loanApplication.amount > creditProfile.availableCredit ||
                        loanApplication.amount < 5000 ||
                        !loanApplication.period ||
                        !loanApplication.purpose ||
                        (loanApplication.purpose === "other" && !loanApplication.purposeOther) ||
                        !loanApplication.expectedRepaymentSource
                      }
                    >
                      Submit Application
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Loans */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Active & Past Loans</CardTitle>
          <CardDescription>
            View your current and previous loan history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Loan ID</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Purpose</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Start Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Due Date</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Amount</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Interest Rate</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Progress</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => {
                  const progress = calculateLoanProgress(loan);
                  const businessPurpose = businessPurposes.find(p => p.value === loan.purpose)?.label || loan.purpose;
                  
                  return (
                    <tr key={loan.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{loan.id}</td>
                      <td className="py-3 px-4">{businessPurpose}</td>
                      <td className="py-3 px-4">{format(loan.startDate, "dd MMM yyyy")}</td>
                      <td className="py-3 px-4">{format(loan.dueDate, "dd MMM yyyy")}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(loan.amount)}</td>
                      <td className="py-3 px-4 text-right">{loan.interestRate}%</td>
                      <td className="py-3 px-4 text-center">{getLoanStatusBadge(loan.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{progress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Record of your loan repayments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Payment ID</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Loan ID</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Amount</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{payment.id}</td>
                    <td className="py-3 px-4">{format(payment.date, "dd MMM yyyy")}</td>
                    <td className="py-3 px-4">{payment.loanId}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Credit Terms & Info */}
      <Card className="shadow-sm bg-muted/50">
        <CardHeader>
          <CardTitle>Credit Terms & Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <Banknote className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <h4 className="font-medium">Loan Amounts</h4>
                  <p className="text-sm text-muted-foreground">
                    Loans are available from KES 5,000 up to your approved credit limit.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <h4 className="font-medium">Repayment Terms</h4>
                  <p className="text-sm text-muted-foreground">
                    Flexible repayment periods ranging from 30 days to 12 months based on loan amount.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Briefcase className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <h4 className="font-medium">Business Use Only</h4>
                  <p className="text-sm text-muted-foreground">
                    Loans are provided for business purposes only, not for personal use.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-start bg-muted p-4 rounded-md">
            <AlertCircle className="h-5 w-5 mr-2 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium">Important Note:</span> Your credit score and available credit limit are calculated based on your business performance, payment history, and financial records. Maintaining on-time payments will improve your credit score and may increase your credit limit over time.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 