import { NextApiRequest, NextApiResponse } from 'next';
import { 
  withApiMiddleware, 
  validateRequiredFields, 
  validatePhoneNumber, 
  validateEmail, 
  combineValidators 
} from '@/middleware/apiMiddleware';
import { createUser } from '@/services/userService';
import { generateToken } from '@/lib/auth';
import { sendSuccess, HttpStatus } from '@/lib/api-utils';
import { initDb } from '@/lib/db';

// Initialize database on first API call
let dbInitialized = false;

// Handler for user registration
async function registerHandler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure database is initialized
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
  
  // Extract user data from request body
  const { 
    phone_number, 
    name, 
    email, 
    password, 
    business_name, 
    business_type 
  } = req.body;
  
  // Create user
  const user = await createUser({ 
    phone_number, 
    name, 
    email, 
    password, 
    business_name, 
    business_type 
  });
  
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
    'User registered successfully', 
    HttpStatus.CREATED
  );
}

// Validation for registration
const validateRegistration = combineValidators([
  validateRequiredFields(['phone_number', 'name', 'password']),
  validatePhoneNumber(),
  validateEmail(),
]);

// Export the API route with middleware
export default withApiMiddleware(registerHandler, {
  methods: ['POST'],
  validator: validateRegistration,
}); 