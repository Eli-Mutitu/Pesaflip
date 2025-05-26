import { NextApiRequest, NextApiResponse } from 'next';
import { suggestPaymentTerms } from '@/lib/invoiceAI';

/**
 * API endpoint to get AI suggested payment terms
 * @param req API request
 * @param res API response
 */
export default async function aiPaymentTermsHandler(req: NextApiRequest, res: NextApiResponse) {
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
    const { previousTerms } = req.body;

    // Call OpenAI to get suggestions
    const terms = await suggestPaymentTerms(previousTerms || []);

    // Return suggestions
    return res.status(200).json({
      success: true,
      data: { terms }
    });
  } catch (error: any) {
    console.error('Error generating AI payment terms suggestions:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate AI suggestions',
        code: error.code || 'INTERNAL_SERVER_ERROR'
      }
    });
  }
} 