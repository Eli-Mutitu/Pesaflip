import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, HttpStatus, handleApiError } from '@/lib/api-utils';
import { authenticateRequest } from '@/lib/auth';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface MiddlewareOptions {
  methods: HttpMethod[];
  requireAuth?: boolean;
  validator?: (req: NextApiRequest) => Promise<void> | void;
}

/**
 * Middleware for handling API requests
 * @param handler API request handler
 * @param options Middleware options
 * @returns Handler with middleware applied
 */
export function withApiMiddleware(
  handler: ApiHandler,
  options: MiddlewareOptions
): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Check HTTP method
      if (!options.methods.includes(req.method as HttpMethod)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          `Method ${req.method} not supported`
        );
      }
      
      // Check authentication if required
      if (options.requireAuth) {
        const user = authenticateRequest(req);
        if (!user) {
          throw new ApiError(
            HttpStatus.UNAUTHORIZED,
            'Authentication required'
          );
        }
        
        // Add user to request for later use
        (req as any).user = user;
      }
      
      // Validate request if validator provided
      if (options.validator) {
        await Promise.resolve(options.validator(req));
      }
      
      // Call the handler
      await handler(req, res);
    } catch (error) {
      handleApiError(res, error);
    }
  };
}

/**
 * Validate required fields in request body
 * @param fields Array of required field names
 * @returns Validator function
 */
export function validateRequiredFields(fields: string[]) {
  return (req: NextApiRequest) => {
    const missingFields = fields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missingFields.length > 0) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Missing required fields',
        { missingFields }
      );
    }
  };
}

/**
 * Validate phone number format in request body
 * @param fieldName Name of the field containing the phone number
 * @returns Validator function
 */
export function validatePhoneNumber(fieldName: string = 'phone_number') {
  return (req: NextApiRequest) => {
    const phoneNumber = req.body[fieldName];
    
    if (!phoneNumber) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        `Phone number is required`
      );
    }
    
    // Basic phone number validation (can be improved)
    if (!/^\+?[0-9]{10,15}$/.test(phoneNumber)) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Invalid phone number format'
      );
    }
  };
}

/**
 * Validate email format in request body (if present)
 * @param fieldName Name of the field containing the email
 * @returns Validator function
 */
export function validateEmail(fieldName: string = 'email') {
  return (req: NextApiRequest) => {
    const email = req.body[fieldName];
    
    // Skip validation if email not provided
    if (!email) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Invalid email format'
      );
    }
  };
}

/**
 * Combine multiple validators
 * @param validators Array of validator functions
 * @returns Combined validator function
 */
export function combineValidators(validators: ((req: NextApiRequest) => void)[]) {
  return (req: NextApiRequest) => {
    for (const validator of validators) {
      validator(req);
    }
  };
} 