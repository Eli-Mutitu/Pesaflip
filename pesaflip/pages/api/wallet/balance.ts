import { NextApiRequest, NextApiResponse } from 'next';
import { getWalletBalance } from '@/services/walletService';
import { authenticated } from '@/lib/auth';

/**
 * API endpoint to get the wallet balance
 * @param req API request
 * @param res API response
 */
export default authenticated(async function balance(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: {
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED'
        }
      });
    }

    // Get the wallet balance
    const { userId } = req.user;
    const balance = await getWalletBalance(userId);

    // Return the balance
    return res.status(200).json({
      success: true,
      data: { balance }
    });
  } catch (error: any) {
    console.error('Error fetching wallet balance:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch wallet balance',
        code: error.code || 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}); 