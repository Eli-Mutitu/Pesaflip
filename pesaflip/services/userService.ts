import { executeQuery } from '@/lib/db';
import { hashPassword, comparePasswords, generateUserId } from '@/lib/auth';
import { ApiError, HttpStatus } from '@/lib/api-utils';
import { UserData } from '@/lib/auth';

interface CreateUserParams {
  phone_number: string;
  name: string;
  email?: string;
  password: string;
  business_name?: string;
  business_type?: string;
}

interface LoginParams {
  phone_number: string;
  password: string;
}

/**
 * Create a new user account
 * @param userData User data for registration
 * @returns Created user data
 */
export async function createUser(userData: CreateUserParams): Promise<UserData> {
  try {
    // Check if user with this phone number already exists
    const checkUser = await getUserByPhoneNumber(userData.phone_number);
    
    if (checkUser) {
      throw new ApiError(
        HttpStatus.CONFLICT,
        'A user with this phone number already exists'
      );
    }
    
    // Check if user with this email already exists (if email provided)
    if (userData.email) {
      const checkEmail = await getUserByEmail(userData.email);
      
      if (checkEmail) {
        throw new ApiError(
          HttpStatus.CONFLICT,
          'A user with this email already exists'
        );
      }
    }
    
    // Generate a unique ID for the user
    const userId = generateUserId();
    
    // Hash the password
    const hashedPassword = await hashPassword(userData.password);
    
    // Prepare SQL statement
    const sql = `
      INSERT INTO users (
        id, 
        phone_number, 
        name, 
        email, 
        password, 
        business_name, 
        business_type,
        created_at,
        updated_at
      ) VALUES (
        :id, 
        :phone_number, 
        :name, 
        :email, 
        :password, 
        :business_name, 
        :business_type,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING id, phone_number, name, email, business_name, business_type
    `;
    
    // Bind parameters
    const params = {
      id: userId,
      phone_number: userData.phone_number,
      name: userData.name,
      email: userData.email || null,
      password: hashedPassword,
      business_name: userData.business_name || null,
      business_type: userData.business_type || null,
    };
    
    // Execute the query
    const result = await executeQuery<any>(sql, params);
    
    if (!result.rows || result.rows.length === 0) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR, 
        'Failed to create user'
      );
    }
    
    // Return the created user data
    return result.rows[0] as UserData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('Error creating user:', error);
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'An error occurred while creating the user',
      { originalError: error }
    );
  }
}

/**
 * Authenticate a user based on phone number and password
 * @param loginData Login credentials
 * @returns User data if authentication successful
 */
export async function authenticateUser(loginData: LoginParams): Promise<UserData> {
  try {
    const { phone_number, password } = loginData;
    
    // Get user by phone number
    const sql = `
      SELECT id, phone_number, name, email, password, business_name, business_type
      FROM users
      WHERE phone_number = :phone_number
    `;
    
    const result = await executeQuery<any>(sql, { phone_number });
    
    // Check if user exists
    if (!result.rows || result.rows.length === 0) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Invalid phone number or password'
      );
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isPasswordValid = await comparePasswords(password, user.PASSWORD);
    
    if (!isPasswordValid) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Invalid phone number or password'
      );
    }
    
    // Return user data (excluding password)
    const { PASSWORD, ...userData } = user;
    
    // Convert Oracle's uppercase column names to lowercase
    return {
      id: userData.ID,
      phone_number: userData.PHONE_NUMBER,
      name: userData.NAME,
      email: userData.EMAIL,
      business_name: userData.BUSINESS_NAME,
      business_type: userData.BUSINESS_TYPE,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('Error authenticating user:', error);
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'An error occurred during authentication',
      { originalError: error }
    );
  }
}

/**
 * Get a user by ID
 * @param id User ID
 * @returns User data if found
 */
export async function getUserById(id: string): Promise<UserData | null> {
  try {
    const sql = `
      SELECT id, phone_number, name, email, business_name, business_type
      FROM users
      WHERE id = :id
    `;
    
    const result = await executeQuery<any>(sql, { id });
    
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    
    // Convert Oracle's uppercase column names to lowercase
    return {
      id: user.ID,
      phone_number: user.PHONE_NUMBER,
      name: user.NAME,
      email: user.EMAIL,
      business_name: user.BUSINESS_NAME,
      business_type: user.BUSINESS_TYPE,
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

/**
 * Get a user by phone number
 * @param phoneNumber User phone number
 * @returns User data if found
 */
export async function getUserByPhoneNumber(phoneNumber: string): Promise<UserData | null> {
  try {
    const sql = `
      SELECT id, phone_number, name, email, business_name, business_type
      FROM users
      WHERE phone_number = :phone_number
    `;
    
    const result = await executeQuery<any>(sql, { phone_number: phoneNumber });
    
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    
    // Convert Oracle's uppercase column names to lowercase
    return {
      id: user.ID,
      phone_number: user.PHONE_NUMBER,
      name: user.NAME,
      email: user.EMAIL,
      business_name: user.BUSINESS_NAME,
      business_type: user.BUSINESS_TYPE,
    };
  } catch (error) {
    console.error('Error fetching user by phone number:', error);
    return null;
  }
}

/**
 * Get a user by email
 * @param email User email
 * @returns User data if found
 */
export async function getUserByEmail(email: string): Promise<UserData | null> {
  try {
    const sql = `
      SELECT id, phone_number, name, email, business_name, business_type
      FROM users
      WHERE email = :email
    `;
    
    const result = await executeQuery<any>(sql, { email });
    
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    
    // Convert Oracle's uppercase column names to lowercase
    return {
      id: user.ID,
      phone_number: user.PHONE_NUMBER,
      name: user.NAME,
      email: user.EMAIL,
      business_name: user.BUSINESS_NAME,
      business_type: user.BUSINESS_TYPE,
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
} 