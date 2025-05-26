'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface InvoiceItem {
  description: string;
  quantity: number;
  amount: number;
}

interface AIInvoiceSuggestionsProps {
  businessName: string;
  clientName: string;
  onSuggestTitle: (title: string, description: string) => void;
  onSuggestDueDate: (dueDays: number) => void;
  onSuggestItems: (items: InvoiceItem[]) => void;
  onSuggestPaymentTerms: (terms: string) => void;
  previousInvoices?: any[];
  previousItems?: InvoiceItem[];
  previousDueDates?: number[];
  previousTerms?: string[];
}

/**
 * AI Suggestions component for invoice creation
 */
export default function AISuggestions({
  businessName,
  clientName,
  onSuggestTitle,
  onSuggestDueDate,
  onSuggestItems,
  onSuggestPaymentTerms,
  previousInvoices = [],
  previousItems = [],
  previousDueDates = [],
  previousTerms = []
}: AIInvoiceSuggestionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<{
    title: boolean;
    dueDate: boolean;
    items: boolean;
    terms: boolean;
  }>({
    title: false,
    dueDate: false,
    items: false,
    terms: false
  });

  /**
   * Suggest invoice title and description
   */
  const handleSuggestTitle = async () => {
    setIsLoading(prev => ({ ...prev, title: true }));
    try {
      const response = await fetch('/api/invoice/ai/title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          clientName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const result = await response.json();
      if (result.success && result.data) {
        onSuggestTitle(result.data.title, result.data.description);
        toast({
          title: 'AI Suggestion Applied',
          description: 'Title and description added to invoice',
        });
      } else {
        throw new Error(result.error?.message || 'Failed to get AI suggestions');
      }
    } catch (error) {
      console.error('Error suggesting title:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, title: false }));
    }
  };

  /**
   * Suggest due date
   */
  const handleSuggestDueDate = async () => {
    setIsLoading(prev => ({ ...prev, dueDate: true }));
    try {
      const response = await fetch('/api/invoice/ai/due-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previousDueDates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const result = await response.json();
      if (result.success && result.data) {
        onSuggestDueDate(result.data.dueDays);
        toast({
          title: 'AI Suggestion Applied',
          description: `Due date set to ${result.data.dueDays} days`,
        });
      } else {
        throw new Error(result.error?.message || 'Failed to get AI suggestions');
      }
    } catch (error) {
      console.error('Error suggesting due date:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, dueDate: false }));
    }
  };

  /**
   * Suggest invoice items
   */
  const handleSuggestItems = async () => {
    setIsLoading(prev => ({ ...prev, items: true }));
    try {
      const response = await fetch('/api/invoice/ai/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previousItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const result = await response.json();
      if (result.success && result.data) {
        onSuggestItems(result.data.items);
        toast({
          title: 'AI Suggestion Applied',
          description: `${result.data.items.length} items added to invoice`,
        });
      } else {
        throw new Error(result.error?.message || 'Failed to get AI suggestions');
      }
    } catch (error) {
      console.error('Error suggesting items:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, items: false }));
    }
  };

  /**
   * Suggest payment terms
   */
  const handleSuggestPaymentTerms = async () => {
    setIsLoading(prev => ({ ...prev, terms: true }));
    try {
      const response = await fetch('/api/invoice/ai/payment-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previousTerms,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const result = await response.json();
      if (result.success && result.data) {
        onSuggestPaymentTerms(result.data.terms);
        toast({
          title: 'AI Suggestion Applied',
          description: 'Payment terms added to invoice',
        });
      } else {
        throw new Error(result.error?.message || 'Failed to get AI suggestions');
      }
    } catch (error) {
      console.error('Error suggesting payment terms:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, terms: false }));
    }
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg border mb-6">
      <div className="flex items-center mb-3">
        <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
        <h3 className="text-sm font-medium">AI Suggestions</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSuggestTitle}
          disabled={isLoading.title || !businessName || !clientName}
        >
          {isLoading.title ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Suggest Title & Description'
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSuggestDueDate}
          disabled={isLoading.dueDate}
        >
          {isLoading.dueDate ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Suggest Due Date'
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSuggestItems}
          disabled={isLoading.items}
        >
          {isLoading.items ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Suggest Invoice Items'
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSuggestPaymentTerms}
          disabled={isLoading.terms}
        >
          {isLoading.terms ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Suggest Payment Terms'
          )}
        </Button>
      </div>
    </div>
  );
} 