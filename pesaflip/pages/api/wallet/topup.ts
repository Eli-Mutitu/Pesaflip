import { NextApiRequest, NextApiResponse } from 'next';
import { withApiMiddleware, validateRequiredFields, combineValidators } from '@/middleware/apiMiddleware';
import { topUpWallet } from '@/services/walletService';
import { sendSuccess, ApiError, HttpStatus } from '@/lib/api-utils';

/**
 * Validator for the top-up request
 */
function validateTopUpRequest(req: NextApiRequest) {
  // First validate required fields
  validateRequiredFields(['amount', 'method'])(req);
  
  // Validate amount
  const { amount } = req.body;
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'Amount must be a positive number'
    );
  }
  
  // Validate method (must be one of allowed values)
  const { method } = req.body;
  const allowedMethods = ['mpesa', 'card', 'bank'];
  
  if (!allowedMethods.includes(method.toLowerCase())) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      `Payment method must be one of: ${allowedMethods.join(', ')}`
    );
  }
  
  // Conditionally validate mobile number or card number
  if (method.toLowerCase() === 'mpesa' && !req.body.mobileNumber) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'Mobile number is required for M-PESA payments'
    );
  }
  
  if (method.toLowerCase() === 'card' && !req.body.cardNumber) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'Card number is required for card payments'
    );
  }
}

/**
 * @route POST /api/wallet/topup
 * @desc Add funds to the authenticated user's wallet
 * @access Private
 */
async function topUpHandler(req: NextApiRequest, res: NextApiResponse) {
  // Get user from the request (set by the middleware)
  const { user } = req as any;
  
  // Get the data from request body
  const { amount, method, mobileNumber, cardNumber } = req.body;
  
  // Process the top-up
  const referenceInfo = method === 'mpesa' ? mobileNumber : (method === 'card' ? cardNumber : '');
  const result = await topUpWallet(user.userId, parseFloat(amount), method, referenceInfo);
  
  // Send success response with transaction data
  sendSuccess(
    res, 
    result,
    'Wallet top-up successful',
    HttpStatus.CREATED
  );
}

// Export the API route with middleware
export default withApiMiddleware(topUpHandler, {
  methods: ['POST'],
  requireAuth: true,
  validator: validateTopUpRequest
}); 