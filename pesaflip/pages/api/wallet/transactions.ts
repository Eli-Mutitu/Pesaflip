import { NextApiRequest, NextApiResponse } from 'next';
import { withApiMiddleware } from '@/middleware/apiMiddleware';
import { getWalletTransactions } from '@/services/walletService';
import { sendSuccess, ApiError, HttpStatus } from '@/lib/api-utils';

/**
 * @route GET /api/wallet/transactions
 * @desc Get the authenticated user's wallet transactions
 * @access Private
 */
async function transactionsHandler(req: NextApiRequest, res: NextApiResponse) {
  // Get user from the request (set by the middleware)
  const { user } = req as any;
  
  // Get query parameters for filtering and pagination
  const { 
    limit = '10', 
    offset = '0', 
    type, 
    status 
  } = req.query;
  
  // Parse pagination params
  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);
  
  // Apply pagination limits
  const safeLimit = Math.min(isNaN(limitNum) ? 10 : limitNum, 50); // Max 50 items per page
  const safeOffset = isNaN(offsetNum) ? 0 : offsetNum;
  
  // Get transactions
  const transactions = await getWalletTransactions(
    user.userId,
    safeLimit,
    safeOffset,
    type as string | undefined,
    status as string | undefined
  );
  
  // Get total count for pagination info
  // Note: In a real app, you might want to add a separate count query for efficiency
  const total = transactions.length;
  
  // Send success response with transactions data
  sendSuccess(
    res, 
    { 
      transactions,
      pagination: {
        limit: safeLimit,
        offset: safeOffset,
        total
      } 
    }, 
    'Wallet transactions retrieved successfully'
  );
}

// Export the API route with middleware
export default withApiMiddleware(transactionsHandler, {
  methods: ['GET'],
  requireAuth: true
}); 