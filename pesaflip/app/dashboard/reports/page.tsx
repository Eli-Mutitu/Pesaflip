"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Wallet,
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table } from "@/components/common/Table";
import { Column } from "@/components/common/Table";

// Define data types
type MonthlyData = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
};

type ExpenseCategory = {
  category: string;
  amount: number;
  percentage: number;
};

type BalanceSheetItem = {
  item: string;
  amount: number;
};

// Sample data for charts and tables
const monthlyData: MonthlyData[] = [
  { month: "Jan", revenue: 48500, expenses: 31200, profit: 17300 },
  { month: "Feb", revenue: 52300, expenses: 33400, profit: 18900 },
  { month: "Mar", revenue: 57800, expenses: 35600, profit: 22200 },
  { month: "Apr", revenue: 53200, expenses: 34900, profit: 18300 },
  { month: "May", revenue: 59700, expenses: 36800, profit: 22900 },
  { month: "Jun", revenue: 63500, expenses: 38200, profit: 25300 },
  { month: "Jul", revenue: 68900, expenses: 40100, profit: 28800 },
  { month: "Aug", revenue: 72300, expenses: 41700, profit: 30600 },
  { month: "Sep", revenue: 75800, expenses: 42900, profit: 32900 },
  { month: "Oct", revenue: 83400, expenses: 45600, profit: 37800 },
  { month: "Nov", revenue: 89700, expenses: 47800, profit: 41900 },
  { month: "Dec", revenue: 102500, expenses: 52300, profit: 50200 },
];

const expenseCategories: ExpenseCategory[] = [
  { category: "Rent", amount: 15000, percentage: 22 },
  { category: "Salaries", amount: 25000, percentage: 37 },
  { category: "Utilities", amount: 5200, percentage: 8 },
  { category: "Marketing", amount: 8200, percentage: 12 },
  { category: "Office Supplies", amount: 3800, percentage: 6 },
  { category: "Software", amount: 5900, percentage: 9 },
  { category: "Other", amount: 4200, percentage: 6 },
];

const balanceSheetData = {
  assets: [
    { item: "Cash", amount: 125000 },
    { item: "Accounts Receivable", amount: 85000 },
    { item: "Inventory", amount: 45000 },
    { item: "Equipment", amount: 120000 },
    { item: "Vehicles", amount: 80000 },
  ] as BalanceSheetItem[],
  liabilities: [
    { item: "Accounts Payable", amount: 35000 },
    { item: "Loans", amount: 150000 },
    { item: "Tax Payable", amount: 22000 },
  ] as BalanceSheetItem[],
  equity: [
    { item: "Owner's Capital", amount: 180000 },
    { item: "Retained Earnings", amount: 68000 },
  ] as BalanceSheetItem[]
};

export default function ReportsPage() {
  const [timePeriod, setTimePeriod] = useState("year");
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals for balance sheet
  const totalAssets = balanceSheetData.assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = balanceSheetData.liabilities.reduce((sum, item) => sum + item.amount, 0);
  const totalEquity = balanceSheetData.equity.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate annual totals
  const annualRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
  const annualExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const annualProfit = monthlyData.reduce((sum, month) => sum + month.profit, 0);
  
  // Define income statement columns for reusable table
  const incomeColumns: Column<MonthlyData>[] = [
    {
      header: "Month",
      accessorKey: "month",
    },
    {
      header: "Revenue",
      cell: (data: MonthlyData) => formatCurrency(data.revenue),
      className: "text-right",
    },
    {
      header: "Expenses",
      cell: (data: MonthlyData) => formatCurrency(data.expenses),
      className: "text-right",
    },
    {
      header: "Profit",
      cell: (data: MonthlyData) => formatCurrency(data.profit),
      className: "text-right",
    },
    {
      header: "Margin",
      cell: (data: MonthlyData) => `${Math.round((data.profit / data.revenue) * 100)}%`,
      className: "text-right",
    },
  ];

  // Define expense categories columns
  const expenseColumns: Column<ExpenseCategory>[] = [
    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Amount",
      cell: (data: ExpenseCategory) => formatCurrency(data.amount),
      className: "text-right",
    },
    {
      header: "% of Total",
      cell: (data: ExpenseCategory) => `${data.percentage}%`,
      className: "text-right",
    },
    {
      header: "Distribution",
      cell: (data: ExpenseCategory) => (
        <div className="w-full h-2 rounded-full bg-muted">
          <div 
            className="h-2 rounded-full bg-blue-500" 
            style={{ width: `${data.percentage}%` }}
          />
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">Analyze your business performance with detailed financial reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export Report
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="profit-loss" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="expense-summary">Expense Summary</TabsTrigger>
        </TabsList>
        
        {/* Profit & Loss Tab */}
        <TabsContent value="profit-loss" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(annualRevenue)}</div>
                <div className="flex items-center mt-1">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    14.5%
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                </div>
                <div className="h-[150px] mt-4 rounded-md overflow-hidden">
                  {/* In a real implementation, you would use a chart library like Recharts or Chart.js */}
                  <div className="flex h-full items-end gap-2 pb-4">
                    {monthlyData.map((month, i) => (
                      <div key={i} className="relative flex-1 overflow-hidden rounded-t-md bg-blue-600" style={{ height: `${(month.revenue / 120000) * 100}%` }}>
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-blue-100">
                          {month.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(annualExpenses)}</div>
                <div className="flex items-center mt-1">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    9.2%
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                </div>
                <div className="h-[150px] mt-4 rounded-md overflow-hidden">
                  <div className="flex h-full items-end gap-2 pb-4">
                    {monthlyData.map((month, i) => (
                      <div key={i} className="relative flex-1 overflow-hidden rounded-t-md bg-red-500" style={{ height: `${(month.expenses / 60000) * 100}%` }}>
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-red-100">
                          {month.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(annualProfit)}</div>
                <div className="flex items-center mt-1">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    22.3%
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                </div>
                <div className="h-[150px] mt-4 rounded-md overflow-hidden">
                  <div className="flex h-full items-end gap-2 pb-4">
                    {monthlyData.map((month, i) => (
                      <div key={i} className="relative flex-1 overflow-hidden rounded-t-md bg-green-500" style={{ height: `${(month.profit / 60000) * 100}%` }}>
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-green-100">
                          {month.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Income Statement */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Income Statement</CardTitle>
                  <CardDescription>Year to date profit and loss summary</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <Table 
                data={monthlyData}
                columns={incomeColumns}
                keyExtractor={(item) => item.month}
              />
              <div className="mt-4 p-3 bg-muted/50 rounded-md flex justify-between items-center font-medium">
                <span>Total</span>
                <div className="grid grid-cols-3 gap-8 text-right">
                  <span>{formatCurrency(annualRevenue)}</span>
                  <span>{formatCurrency(annualExpenses)}</span>
                  <span>{formatCurrency(annualProfit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Revenue vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>Monthly comparison for the year</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {/* In a real implementation, you would use a chart library */}
              <div className="h-full w-full rounded-md overflow-hidden">
                <div className="flex h-full items-end gap-6 px-6 pb-6">
                  {monthlyData.map((month, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex-1 flex flex-col justify-end gap-1">
                        <div 
                          className="w-full rounded-t bg-green-500" 
                          style={{ height: `${(month.profit / 60000) * 100}%` }}
                        />
                        <div 
                          className="w-full bg-red-500" 
                          style={{ height: `${(month.expenses / 60000) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs font-medium">{month.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-sm bg-red-500"></div>
                  <span>Expenses</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                  <span>Profit</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Balance Sheet Tab */}
        <TabsContent value="balance-sheet" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
                <div className="mt-1 flex items-center text-sm">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">12.5%</span>
                  <span className="text-xs text-muted-foreground ml-1">from last year</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</div>
                <div className="mt-1 flex items-center text-sm">
                  <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">3.2%</span>
                  <span className="text-xs text-muted-foreground ml-1">from last year</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Worth (Equity)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalEquity)}</div>
                <div className="mt-1 flex items-center text-sm">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">18.7%</span>
                  <span className="text-xs text-muted-foreground ml-1">from last year</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Balance Sheet Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet Overview</CardTitle>
              <CardDescription>Assets, Liabilities, and Equity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center md:items-stretch h-[300px] gap-6">
                <div className="flex-1 flex flex-col w-full">
                  <div className="text-center text-sm font-medium mb-2">Assets</div>
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="bg-blue-500 rounded-t-md w-full" style={{ height: `${(totalAssets / Math.max(totalAssets, totalLiabilities + totalEquity)) * 100}%` }}>
                      <div className="text-center text-white py-2 font-bold">
                        {formatCurrency(totalAssets)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col w-full">
                  <div className="text-center text-sm font-medium mb-2">Liabilities & Equity</div>
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="bg-green-500 rounded-t-md w-full" style={{ height: `${(totalEquity / Math.max(totalAssets, totalLiabilities + totalEquity)) * 100}%` }}>
                      <div className="text-center text-white py-2 font-bold">
                        {formatCurrency(totalEquity)}
                      </div>
                    </div>
                    <div className="bg-red-500 w-full" style={{ height: `${(totalLiabilities / Math.max(totalAssets, totalLiabilities + totalEquity)) * 100}%` }}>
                      <div className="text-center text-white py-2 font-bold">
                        {formatCurrency(totalLiabilities)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-3">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-sm bg-blue-500"></div>
                  <span>Assets</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-sm bg-red-500"></div>
                  <span>Liabilities</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                  <span>Equity</span>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Balance Sheet Detailed */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <tbody className="divide-y">
                    {balanceSheetData.assets.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2">{item.item}</td>
                        <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td className="pt-4">Total Assets</td>
                      <td className="pt-4 text-right">{formatCurrency(totalAssets)}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Liabilities & Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Liabilities</h4>
                    <table className="w-full">
                      <tbody className="divide-y">
                        {balanceSheetData.liabilities.map((item, index) => (
                          <tr key={index}>
                            <td className="py-2">{item.item}</td>
                            <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-medium">
                          <td className="pt-2">Total Liabilities</td>
                          <td className="pt-2 text-right">{formatCurrency(totalLiabilities)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Equity</h4>
                    <table className="w-full">
                      <tbody className="divide-y">
                        {balanceSheetData.equity.map((item, index) => (
                          <tr key={index}>
                            <td className="py-2">{item.item}</td>
                            <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-medium">
                          <td className="pt-2">Total Equity</td>
                          <td className="pt-2 text-right">{formatCurrency(totalEquity)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <table className="w-full">
                      <tbody>
                        <tr className="font-bold">
                          <td>Total Liabilities & Equity</td>
                          <td className="text-right">{formatCurrency(totalLiabilities + totalEquity)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Expense Summary Tab */}
        <TabsContent value="expense-summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
                <CardDescription>Breakdown of expenses by category</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col lg:flex-row items-center">
                <div className="w-full lg:w-[250px] h-[250px] relative flex-shrink-0 mb-4 lg:mb-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {expenseCategories.reduce((acc, category, i) => {
                      const prevOffset = acc.offset;
                      const offset = prevOffset + category.percentage;
                      
                      // Calculate SVG pie slice properties
                      const startAngle = (prevOffset / 100) * 2 * Math.PI;
                      const endAngle = (offset / 100) * 2 * Math.PI;
                      
                      const x1 = 50 + 40 * Math.cos(startAngle);
                      const y1 = 50 + 40 * Math.sin(startAngle);
                      const x2 = 50 + 40 * Math.cos(endAngle);
                      const y2 = 50 + 40 * Math.sin(endAngle);
                      
                      const largeArc = category.percentage > 50 ? 1 : 0;
                      
                      // Assign a color based on index
                      const colors = [
                        "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
                        "#8b5cf6", "#ec4899", "#6366f1", "#64748b"
                      ];
                      
                      acc.elements.push(
                        <path
                          key={i}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={colors[i % colors.length]}
                        />
                      );
                      
                      acc.offset = offset;
                      return acc;
                    }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{formatCurrency(annualExpenses)}</div>
                      <div className="text-sm text-muted-foreground">Total Expenses</div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex-1 w-full space-y-3">
                  {expenseCategories.map((category, i) => {
                    const colors = [
                      "bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500", 
                      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-slate-500"
                    ];
                    
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`${colors[i % colors.length]} h-3 w-3 rounded-sm mr-2`}></div>
                          <span>{category.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{formatCurrency(category.amount)}</span>
                          <span className="text-muted-foreground text-sm">{category.percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Expenses</CardTitle>
                <CardDescription>Highest expenses this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseCategories
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 3)
                    .map((category, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.category}</span>
                          <span>{formatCurrency(category.amount)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div 
                            className="h-2 rounded-full bg-blue-500" 
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{category.percentage}% of total</span>
                          <span>Year to date</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Expenses Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trend</CardTitle>
              <CardDescription>Expense changes throughout the year</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full w-full rounded-md">
                <div className="relative h-full w-full">
                  {/* Y-axis grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-10">
                    {[0, 1, 2, 3, 4].map((_, i) => (
                      <div key={i} className="border-b border-dashed border-gray-200 w-full"></div>
                    ))}
                  </div>
                  
                  {/* Line chart */}
                  <svg className="absolute inset-0 h-full w-full overflow-visible p-10">
                    <path
                      d={monthlyData.reduce((path, data, i, arr) => {
                        const x = (i / (arr.length - 1)) * 100;
                        const y = 100 - (data.expenses / 60000) * 100;
                        return path + `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }, '')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                    
                    {/* Data points */}
                    {monthlyData.map((data, i, arr) => {
                      const x = (i / (arr.length - 1)) * 100;
                      const y = 100 - (data.expenses / 60000) * 100;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="3"
                          fill="white"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 w-full flex justify-between px-10 text-xs text-muted-foreground">
                    {monthlyData.filter((_, i) => i % 2 === 0).map((data, i) => (
                      <div key={i}>{data.month}</div>
                    ))}
                  </div>
                  
                  {/* Y-axis labels */}
                  <div className="absolute left-0 h-full flex flex-col justify-between py-10 text-xs text-muted-foreground">
                    {[0, 15000, 30000, 45000, 60000].reverse().map((value, i) => (
                      <div key={i}>{formatCurrency(value)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Expense Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Detailed breakdown of all expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table 
                data={expenseCategories}
                columns={expenseColumns}
                keyExtractor={(item) => item.category}
              />
              <div className="mt-4 p-3 bg-muted/50 rounded-md flex justify-between items-center font-medium">
                <span>Total</span>
                <div className="text-right">
                  <span>{formatCurrency(annualExpenses)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 