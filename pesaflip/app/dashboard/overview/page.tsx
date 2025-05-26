import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Wallet, 
  FileText, 
  Receipt, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Download,
  Eye,
  Check,
  Clock,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletSummary } from "@/components/dashboard/WalletSummary";

export default function OverviewPage() {
  // Sample data
  const stats = [
    {
      title: "Total Revenue",
      value: "KES 152,500",
      change: "+12.5%",
      trend: "up",
      icon: <Wallet className="h-5 w-5 text-primary" />,
      bgColor: "bg-primary/10",
      description: "Monthly revenue from all sources"
    },
    {
      title: "Pending Invoices",
      value: "KES 45,200",
      change: "+2.3%",
      trend: "up",
      icon: <FileText className="h-5 w-5 text-amber-500" />,
      bgColor: "bg-amber-100",
      description: "Invoices awaiting payment"
    },
    {
      title: "Expenses This Month",
      value: "KES 67,890",
      change: "-3.1%",
      trend: "down",
      icon: <Receipt className="h-5 w-5 text-red-500" />,
      bgColor: "bg-red-100",
      description: "Total expenses for current month"
    },
    {
      title: "Available Credit",
      value: "KES 200,000",
      change: "Limit: KES 500,000",
      trend: "neutral",
      icon: <CreditCard className="h-5 w-5 text-emerald-500" />,
      bgColor: "bg-emerald-100",
      description: "Current available credit line"
    },
  ];

  const recentTransactions = [
    { 
      id: "TR-001", 
      date: "2023-06-15", 
      description: "Invoice #INV-001 payment from Acme Co", 
      amount: "KES 12,500", 
      type: "income",
      status: "completed",
    },
    { 
      id: "TR-002", 
      date: "2023-06-14", 
      description: "Office rent payment", 
      amount: "KES 35,000", 
      type: "expense",
      status: "completed",
    },
    { 
      id: "TR-003", 
      date: "2023-06-13", 
      description: "Invoice #INV-002 payment from Widget Ltd", 
      amount: "KES 8,750", 
      type: "income",
      status: "processing",
    },
    { 
      id: "TR-004", 
      date: "2023-06-12", 
      description: "Utility bills payment", 
      amount: "KES 4,200", 
      type: "expense",
      status: "completed",
    },
    { 
      id: "TR-005", 
      date: "2023-06-10", 
      description: "Invoice #INV-003 payment from Dev Solutions", 
      amount: "KES 15,000", 
      type: "income",
      status: "failed",
    },
  ];
  
  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1">
            <Check className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Processing
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your business dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="h-9">
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center pt-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                ) : stat.trend === "down" ? (
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                ) : null}
                <span
                  className={`text-xs ${
                    stat.trend === "up" 
                      ? "text-emerald-500" 
                      : stat.trend === "down"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wallet Summary Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <WalletSummary />
        
        {/* Additional cards can be added here in the future */}
        <Card className="md:col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" className="h-10">Create Invoice</Button>
            <Button variant="outline" className="h-10">Add Expense</Button>
            <Button variant="outline" className="h-10">Schedule Payment</Button>
            <Button variant="outline" className="h-10">Generate Report</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left font-medium px-4 py-3">Transaction ID</th>
                  <th className="text-left font-medium px-4 py-3">Date</th>
                  <th className="text-left font-medium px-4 py-3">Description</th>
                  <th className="text-left font-medium px-4 py-3">Amount</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{transaction.id}</td>
                    <td className="px-4 py-3">{transaction.date}</td>
                    <td className="px-4 py-3">{transaction.description}</td>
                    <td className={`px-4 py-3 font-medium ${
                      transaction.type === "income" ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}{transaction.amount}
                    </td>
                    <td className="px-4 py-3">
                      {renderStatusBadge(transaction.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-neutral-50 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Showing 5 of 24 transactions</p>
          <Button variant="outline" size="sm" className="h-8">
            View All Transactions
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 