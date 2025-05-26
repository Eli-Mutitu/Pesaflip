import { NextApiRequest, NextApiResponse } from 'next';
import { withApiMiddleware } from '@/middleware/apiMiddleware';
import { getUserById } from '@/services/userService';
import { sendSuccess, ApiError, HttpStatus } from '@/lib/api-utils';

// Handler for getting the current user profile
async function meHandler(req: NextApiRequest, res: NextApiResponse) {
  // Get user from the request (set by the middleware)
  const { user } = req as any;
  
  // Get the user from the database by ID
  const userData = await getUserById(user.userId);
  
  if (!userData) {
    throw new ApiError(
      HttpStatus.NOT_FOUND,
      'User profile not found'
    );
  }
  
  // Send success response with user data
  sendSuccess(
    res, 
    { user: userData }, 
    'User profile retrieved successfully'
  );
}

// Export the API route with middleware
export default withApiMiddleware(meHandler, {
  methods: ['GET'],
  requireAuth: true, // This makes it a protected endpoint
}); 