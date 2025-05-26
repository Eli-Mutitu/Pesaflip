import { NextApiRequest, NextApiResponse } from 'next';
import { withApiMiddleware, validateRequiredFields } from '@/middleware/apiMiddleware';
import { withdrawFromWallet, getWalletBalance } from '@/services/walletService';
import { sendSuccess, ApiError, HttpStatus } from '@/lib/api-utils';

/**
 * Validator for the withdrawal request
 */
async function validateWithdrawRequest(req: NextApiRequest) {
  // First validate required fields
  validateRequiredFields(['amount', 'destination'])(req);
  
  // Get user from the request (set by the middleware)
  const { user } = req as any;
  
  // Validate amount
  const { amount } = req.body;
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'Amount must be a positive number'
    );
  }
  
  // Check if amount exceeds available balance
  const balance = await getWalletBalance(user.userId);
  if (numAmount > balance) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'Withdrawal amount exceeds available balance',
      { requestedAmount: numAmount, availableBalance: balance }
    );
  }
  
  // Validate destination (must be one of allowed values)
  const { destination } = req.body;
  const allowedDestinations = ['mpesa', 'bank'];
  
  if (!allowedDestinations.includes(destination.toLowerCase())) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      `Destination must be one of: ${allowedDestinations.join(', ')}`
    );
  }
  
  // Conditionally validate account information
  if (destination.toLowerCase() === 'mpesa' && !req.body.mobileNumber) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'Mobile number is required for M-PESA withdrawals'
    );
  }
  
  if (destination.toLowerCase() === 'bank' && !req.body.accountNumber) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'Account number is required for bank withdrawals'
    );
  }
}

/**
 * @route POST /api/wallet/withdraw
 * @desc Withdraw funds from the authenticated user's wallet
 * @access Private
 */
async function withdrawHandler(req: NextApiRequest, res: NextApiResponse) {
  // Get user from the request (set by the middleware)
  const { user } = req as any;
  
  // Get the data from request body
  const { amount, destination, mobileNumber, accountNumber } = req.body;
  
  // Process the withdrawal
  const accountInfo = destination === 'mpesa' ? mobileNumber : accountNumber;
  const result = await withdrawFromWallet(
    user.userId, 
    parseFloat(amount), 
    destination,
    accountInfo
  );
  
  // Send success response with transaction data
  sendSuccess(
    res, 
    result,
    'Wallet withdrawal successful',
    HttpStatus.OK
  );
}

// Export the API route with middleware
export default withApiMiddleware(withdrawHandler, {
  methods: ['POST'],
  requireAuth: true,
  validator: validateWithdrawRequest
}); 