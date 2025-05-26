import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// JWT Secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface UserData {
  id: string;
  name: string;
  email?: string;
  phone_number: string;
  business_name?: string;
  business_type?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  phoneNumber?: string;
}

// User type definition - must match JwtPayload
export interface User {
  userId: string;
  email: string;
  role: string;
  phoneNumber?: string;
}

/**
 * Generate a JWT token for a user
 * @param user User data to include in the token
 * @returns JWT token
 */
export function generateToken(user: Partial<User>): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify a JWT token
 * @param token JWT token to verify
 * @returns Decoded user data
 */
export function verifyToken(token: string): User {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Extract JWT token from request headers or cookies
 * @param req Next.js API request
 * @returns JWT token or null if not found
 */
export function extractTokenFromRequest(req: NextApiRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try to get token from cookies
  const { token } = req.cookies;
  if (token) {
    return token;
  }
  
  return null;
}

/**
 * Authenticate a request using JWT token
 * @param req Next.js API request
 * @returns User payload from token or null if unauthorized
 */
export function authenticateRequest(req: NextApiRequest): User | null {
  const token = extractTokenFromRequest(req);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

/**
 * Hash a password
 * @param password Password to hash
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Compare a password with a hash
 * @param password Password to compare
 * @param hash Hash to compare with
 * @returns True if the password matches the hash
 */
export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Generate a unique ID
 * @returns Unique ID
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Validate phone number format (basic validation)
 * @param phoneNumber Phone number to validate
 * @returns Boolean indicating if phone number is valid
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation - should be expanded based on requirements
  return /^\+?[0-9]{10,15}$/.test(phoneNumber);
}

/**
 * Validate email format
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Authentication middleware for Next.js API routes
 * @param handler API route handler
 * @returns Wrapped handler with authentication
 */
export function authenticated(handler: any) {
  return async (req: any, res: any) => {
    try {
      // Get the authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTHENTICATION_REQUIRED'
          }
        });
      }
      
      // Get the token
      const token = authHeader.split(' ')[1];
      
      // Verify the token
      const user = verifyToken(token);
      
      // Attach the user to the request
      req.user = user;
      
      // Call the handler
      return handler(req, res);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        }
      });
    }
  };
}

/**
 * For development purposes only - creates a mock user token
 * @returns Mock user token
 */
export function createMockUserToken(): string {
  const mockUser: User = {
    userId: 'mock-user-123',
    email: 'test@example.com',
    role: 'user',
    phoneNumber: '+1234567890'
  };
  
  return generateToken(mockUser);
} 