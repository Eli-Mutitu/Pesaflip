import { NextApiRequest, NextApiResponse } from 'next';
import { suggestInvoiceTitle } from '@/lib/invoiceAI';

/**
 * API endpoint to get AI suggested invoice title and description
 * @param req API request
 * @param res API response
 */
export default async function aiTitleHandler(req: NextApiRequest, res: NextApiResponse) {
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
    const { businessName, clientName, previousTitles } = req.body;

    // Validate required fields
    if (!businessName || !clientName) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Business name and client name are required',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
    }

    // Call OpenAI to get suggestions
    const suggestions = await suggestInvoiceTitle(
      businessName,
      clientName,
      previousTitles || []
    );

    // Return suggestions
    return res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error: any) {
    console.error('Error generating AI title suggestions:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate AI suggestions',
        code: error.code || 'INTERNAL_SERVER_ERROR'
      }
    });
  }
} 