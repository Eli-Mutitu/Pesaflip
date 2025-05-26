'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText, FileDown, FileClock } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and track payments</p>
        </div>
        <Link href="/dashboard/invoices/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>
      
      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paid Invoices</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <FileDown className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Invoices</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <FileClock className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
      </div>
      
      {/* Empty state */}
      <Card>
        <CardContent className="p-10 text-center">
          <FileText className="h-12 w-12 mx-auto mb-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No invoices yet</h2>
          <p className="text-muted-foreground mb-6">Start by creating your first invoice to track payments from clients.</p>
          <Link href="/dashboard/invoices/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Invoice
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
} 