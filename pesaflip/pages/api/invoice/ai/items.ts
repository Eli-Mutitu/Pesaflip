import { NextApiRequest, NextApiResponse } from 'next';
import { suggestInvoiceItems } from '@/lib/invoiceAI';

/**
 * API endpoint to get AI suggested invoice items
 * @param req API request
 * @param res API response
 */
export default async function aiItemsHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: {
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED'
        }
      });
    }

    // Get request body
    const { previousItems, partialDescription } = req.body;

    // Call OpenAI to get suggestions
    const items = await suggestInvoiceItems(
      previousItems || [],
      partialDescription
    );

    // Return suggestions
    return res.status(200).json({
      success: true,
      data: { items }
    });
  } catch (error: any) {
    console.error('Error generating AI invoice item suggestions:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate AI suggestions',
        code: error.code || 'INTERNAL_SERVER_ERROR'
      }
    });
  }
} 