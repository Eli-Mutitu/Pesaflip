"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Trash2, FileDown, Eye, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
import AISuggestions from "@/components/invoice/AISuggestions";

// Define types for our form data
type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type InvoiceFormData = {
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  paymentTerms: string;
  items: LineItem[];
  notes: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
};

// Fallback UUID generator for browsers that don't support crypto.randomUUID()
function generateUUID() {
  // Use crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function CreateInvoicePage() {
  const router = useRouter();
  
  // Initialize form state with default values
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Default to 14 days from now
    paymentTerms: "14",
    items: [
      {
        id: generateUUID(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ],
    notes: "",
    subtotal: 0,
    taxRate: 16, // Default VAT rate in Kenya
    taxAmount: 0,
    total: 0,
  });

  // Handle form field changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  // Handle due date change based on payment terms selection
  const handlePaymentTermsChange = (value: string) => {
    const days = parseInt(value);
    const newDueDate = new Date(invoiceData.issueDate);
    newDueDate.setDate(newDueDate.getDate() + days);
    
    setInvoiceData({ 
      ...invoiceData, 
      paymentTerms: value,
      dueDate: newDueDate
    });
  };

  // Handle issue date change and update due date accordingly
  const handleIssueDateChange = (date: Date) => {
    const days = parseInt(invoiceData.paymentTerms);
    const newDueDate = new Date(date);
    newDueDate.setDate(newDueDate.getDate() + days);
    
    setInvoiceData({ 
      ...invoiceData, 
      issueDate: date,
      dueDate: newDueDate
    });
  };
  
  // Handle direct due date change
  const handleDueDateChange = (date: Date) => {
    setInvoiceData({ ...invoiceData, dueDate: date });
  };

  // Handle changes to line item fields
  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoiceData((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate amount if quantity or unitPrice changes
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
          }
          
          return updatedItem;
        }
        return item;
      });
      
      // Recalculate subtotal, tax, and total
      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * (prev.taxRate / 100);
      const total = subtotal + taxAmount;
      
      return { 
        ...prev, 
        items: updatedItems,
        subtotal,
        taxAmount,
        total
      };
    });
  };
  
  // Add a new line item
  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: generateUUID(),
          description: "",
          quantity: 1,
          unitPrice: 0,
          amount: 0,
        },
      ],
    }));
  };

  // Remove a line item
  const removeItem = (id: string) => {
    if (invoiceData.items.length === 1) {
      return; // Don't remove the last item
    }
    
    setInvoiceData((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== id);
      
      // Recalculate subtotal, tax, and total
      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * (prev.taxRate / 100);
      const total = subtotal + taxAmount;
      
      return { 
        ...prev, 
        items: updatedItems,
        subtotal,
        taxAmount,
        total
      };
    });
  };

  // Handle tax rate change
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const taxRate = parseFloat(e.target.value) || 0;
    const taxAmount = invoiceData.subtotal * (taxRate / 100);
    const total = invoiceData.subtotal + taxAmount;
    
    setInvoiceData({ 
      ...invoiceData, 
      taxRate,
      taxAmount,
      total
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Invoice Data:', invoiceData);
    // In a real app, you would send this data to your backend
    // and then generate a PDF or redirect to the preview page
    
    // For now, we'll just show an alert
    alert('Invoice created successfully! In a real app, this would be saved and the PDF would be generated.');
  };

  // Handle AI suggestions
  const handleTitleSuggestion = (title: string, description: string) => {
    setInvoiceData({ 
      ...invoiceData, 
      notes: description 
    });
  };

  const handleDueDateSuggestion = (dueDays: number) => {
    const newDueDate = new Date(invoiceData.issueDate);
    newDueDate.setDate(newDueDate.getDate() + dueDays);
    
    setInvoiceData({ 
      ...invoiceData, 
      paymentTerms: dueDays.toString(),
      dueDate: newDueDate
    });
  };

  const handleItemsSuggestion = (items: any[]) => {
    const newItems = items.map(item => ({
      id: generateUUID(),
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.amount / (item.quantity || 1),
      amount: item.amount
    }));
    
    // Calculate totals
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + taxAmount;
    
    setInvoiceData({
      ...invoiceData,
      items: newItems,
      subtotal,
      taxAmount,
      total
    });
  };

  const handlePaymentTermsSuggestion = (terms: string) => {
    // Try to extract days from terms if it follows patterns like "Net 30"
    const daysMatch = terms.match(/net\s+(\d+)/i);
    if (daysMatch && daysMatch[1]) {
      const days = parseInt(daysMatch[1]);
      const newDueDate = new Date(invoiceData.issueDate);
      newDueDate.setDate(newDueDate.getDate() + days);
      
      setInvoiceData({ 
        ...invoiceData, 
        paymentTerms: days.toString(),
        dueDate: newDueDate
      });
    }
    
    // Add the terms to notes
    setInvoiceData({
      ...invoiceData,
      notes: invoiceData.notes ? `${invoiceData.notes}\n\nPayment Terms: ${terms}` : `Payment Terms: ${terms}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for your client</p>
        </div>
        <Link href="/dashboard/invoices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  placeholder="Client or Company Name"
                  value={invoiceData.clientName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={invoiceData.clientEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Client Address</Label>
                <Input
                  id="clientAddress"
                  name="clientAddress"
                  placeholder="Street, City, Country"
                  value={invoiceData.clientAddress}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !invoiceData.issueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceData.issueDate ? (
                          format(invoiceData.issueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={invoiceData.issueDate}
                        onSelect={(date) => handleIssueDateChange(date as Date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select
                    value={invoiceData.paymentTerms}
                    onValueChange={handlePaymentTermsChange}
                  >
                    <SelectTrigger id="paymentTerms">
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Net 7 days</SelectItem>
                      <SelectItem value="14">Net 14 days</SelectItem>
                      <SelectItem value="30">Net 30 days</SelectItem>
                      <SelectItem value="60">Net 60 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !invoiceData.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoiceData.dueDate ? (
                        format(invoiceData.dueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={invoiceData.dueDate}
                      onSelect={(date) => handleDueDateChange(date as Date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b text-sm">
                    <th className="text-left pb-2 font-medium">Description</th>
                    <th className="text-center pb-2 font-medium w-28">Quantity</th>
                    <th className="text-center pb-2 font-medium w-36">Unit Price</th>
                    <th className="text-right pb-2 font-medium w-36">Amount</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                          className="border-none p-2 focus-visible:ring-0"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                          className="border-none text-center p-2 focus-visible:ring-0"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, "unitPrice", Number(e.target.value))}
                          className="border-none text-center p-2 focus-visible:ring-0"
                        />
                      </td>
                      <td className="py-2 text-right">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          disabled={invoiceData.items.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Notes */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Notes & Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional notes for the client..."
                  value={invoiceData.notes}
                  onChange={handleInputChange}
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoiceData.subtotal)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="taxRate" className="flex-shrink-0">Tax Rate (%):</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    value={invoiceData.taxRate}
                    onChange={handleTaxRateChange}
                    className="w-16 p-1 h-8"
                  />
                  <span className="flex-1 text-right font-medium">
                    {formatCurrency(invoiceData.taxAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Total:</span>
                  <span className="text-lg font-bold">{formatCurrency(invoiceData.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AISuggestions
              businessName="Your Business"
              clientName={invoiceData.clientName}
              onSuggestTitle={handleTitleSuggestion}
              onSuggestDueDate={handleDueDateSuggestion}
              onSuggestItems={handleItemsSuggestion}
              onSuggestPaymentTerms={handlePaymentTermsSuggestion}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" type="button">
            <FileDown className="mr-2 h-4 w-4" />
            Download as PDF
          </Button>
          <Button type="submit">
            Save Invoice
          </Button>
        </div>
      </form>
    </div>
  );
} 