import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define types for invoice data
interface InvoiceItem {
  description: string;
  quantity: number;
  amount: number;
  unitPrice?: number;
}

interface PreviousInvoice {
  title: string;
  description?: string;
  dueDate: string;
  items: InvoiceItem[];
  paymentTerms?: string;
  clientId?: string;
}

interface AIInvoiceSuggestions {
  title: string;
  description: string;
  suggestedDueDate: string;
  suggestedItems: InvoiceItem[];
  suggestedPaymentTerms: string;
}

/**
 * Generate AI suggestions for invoice details based on previous invoices
 * @param previousInvoices Array of user's previous invoices
 * @param clientId Optional client ID to filter suggestions for specific client
 * @returns Object containing AI-suggested invoice details
 */
export async function generateInvoiceSuggestions(
  previousInvoices: PreviousInvoice[],
  clientId?: string
): Promise<AIInvoiceSuggestions> {
  try {
    // Filter previous invoices by client if clientId is provided
    const relevantInvoices = clientId
      ? previousInvoices.filter(invoice => invoice.clientId === clientId)
      : previousInvoices;

    // Prepare context for the OpenAI request
    const invoiceContext = JSON.stringify(
      relevantInvoices.slice(-5) // Use last 5 invoices for context
    );

    // Make request to OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that helps generate invoice suggestions based on previous invoice data."
        },
        {
          role: "user",
          content: `Based on these previous invoices: ${invoiceContext}, suggest a title, description, due date (14 days from today), 
          invoice items, and payment terms for a new invoice. Format your response as JSON with fields: title, description, 
          suggestedDueDate, suggestedItems (array with description, quantity, amount), and suggestedPaymentTerms.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Parse the response
    const content = response.choices[0]?.message?.content || '{}';
    const suggestion = JSON.parse(content.trim());
    
    // Return formatted suggestions
    return {
      title: suggestion.title || 'Invoice',
      description: suggestion.description || 'Services provided',
      suggestedDueDate: suggestion.suggestedDueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      suggestedItems: suggestion.suggestedItems || [],
      suggestedPaymentTerms: suggestion.suggestedPaymentTerms || 'Net 14',
    };
  } catch (error) {
    console.error('Error generating invoice suggestions:', error);
    throw new Error('Failed to generate AI suggestions for invoice');
  }
}

/**
 * Suggest invoice title and description
 * @param businessName User's business name
 * @param clientName Client's name
 * @param previousTitles Array of previous invoice titles
 * @returns Object containing suggested title and description
 */
export async function suggestInvoiceTitle(
  businessName: string,
  clientName: string,
  previousTitles: string[] = []
): Promise<{ title: string; description: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that helps generate professional invoice titles and descriptions."
        },
        {
          role: "user",
          content: `Generate a professional invoice title and description for ${businessName} billing ${clientName}. 
          Previous titles include: ${previousTitles.join(', ')}. 
          Response format: JSON with title and description fields.`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const suggestion = JSON.parse(content.trim());
    return {
      title: suggestion.title || `Invoice for ${clientName}`,
      description: suggestion.description || `Services provided by ${businessName}`,
    };
  } catch (error) {
    console.error('Error suggesting invoice title:', error);
    return {
      title: `Invoice for ${clientName}`,
      description: `Services provided by ${businessName}`
    };
  }
}

/**
 * Predict due date based on business patterns and industry standards
 * @param previousDueDates Array of previous due dates (in days from invoice date)
 * @returns Suggested due date in days from invoice date
 */
export async function predictDueDate(previousDueDates: number[] = []): Promise<number> {
  try {
    // Default options for due dates (in days)
    const commonDueDates = [7, 14, 30, 45, 60];
    
    // If there are previous due dates, use them for context
    if (previousDueDates.length > 0) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that predicts appropriate invoice due dates."
          },
          {
            role: "user",
            content: `Based on these previous invoice due dates (in days): ${previousDueDates.join(', ')}, 
            suggest a reasonable due date in days for a new invoice. Return only a number.`
          }
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const content = response.choices[0]?.message?.content || '14';
      const suggestion = parseInt(content.trim());
      return isNaN(suggestion) ? 14 : suggestion; // Default to 14 days if parsing fails
    }
    
    // Default to 14 days if no previous data
    return 14;
  } catch (error) {
    console.error('Error predicting due date:', error);
    return 14; // Default to 14 days if API call fails
  }
}

/**
 * Suggest invoice items based on previous invoices
 * @param previousItems Array of items from previous invoices
 * @param partialDescription Optional partial description to autocomplete
 * @returns Array of suggested invoice items
 */
export async function suggestInvoiceItems(
  previousItems: InvoiceItem[],
  partialDescription?: string
): Promise<InvoiceItem[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that helps suggest invoice items based on previous patterns."
        },
        {
          role: "user",
          content: `Based on these previous invoice items: ${JSON.stringify(previousItems)}, 
          ${partialDescription ? `and this partial description: "${partialDescription}", ` : ''}
          suggest 3-5 relevant invoice items. Format as JSON array with objects containing description, quantity, and amount fields.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '[]';
    return JSON.parse(content.trim());
  } catch (error) {
    console.error('Error suggesting invoice items:', error);
    return [];
  }
}

/**
 * Suggest payment terms based on previous invoices and industry standards
 * @param previousTerms Array of previous payment terms
 * @returns Suggested payment terms
 */
export async function suggestPaymentTerms(previousTerms: string[] = []): Promise<string> {
  try {
    // Default options for payment terms
    const commonTerms = [
      "Due on receipt",
      "Net 14",
      "Net 30",
      "50% upfront, 50% on completion",
      "Payment due within 14 days"
    ];
    
    // If there are previous terms, use them for context
    if (previousTerms.length > 0) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that suggests appropriate invoice payment terms."
          },
          {
            role: "user",
            content: `Based on these previous payment terms: ${previousTerms.join('; ')}, 
            suggest appropriate payment terms for a new invoice. Provide only the payment terms text.`
          }
        ],
        temperature: 0.5,
        max_tokens: 50,
      });

      return response.choices[0]?.message?.content?.trim() || "Net 14";
    }
    
    // Return a common term if no previous data
    return commonTerms[1]; // Default to "Net 14"
  } catch (error) {
    console.error('Error suggesting payment terms:', error);
    return "Net 14"; // Default if API call fails
  }
} 