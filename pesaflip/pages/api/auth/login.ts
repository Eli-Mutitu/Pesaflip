import { NextApiRequest, NextApiResponse } from 'next';
import { 
  withApiMiddleware, 
  validateRequiredFields, 
  validatePhoneNumber, 
  combineValidators 
} from '@/middleware/apiMiddleware';
import { authenticateUser } from '@/services/userService';
import { generateToken } from '@/lib/auth';
import { sendSuccess } from '@/lib/api-utils';
import { initDb } from '@/lib/db';

// Initialize database on first API call
let dbInitialized = false;

// Handler for user login
async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure database is initialized
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
  
  // Extract login credentials from request body
  const { phone_number, password } = req.body;
  
  // Authenticate user
  const user = await authenticateUser({ phone_number, password });
  
  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    phoneNumber: user.phone_number,
  });
  
  // Send success response
  sendSuccess(
    res, 
    { 
      user, 
      token 
    }, 
    'Login successful'
  );
}

// Validation for login
const validateLogin = combineValidators([
  validateRequiredFields(['phone_number', 'password']),
  validatePhoneNumber(),
]);

// Export the API route with middleware
export default withApiMiddleware(loginHandler, {
  methods: ['POST'],
  validator: validateLogin,
}); 