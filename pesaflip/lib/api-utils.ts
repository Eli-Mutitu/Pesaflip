import { NextApiResponse } from 'next';

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Standard success response structure
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: HttpStatus;
    message: string;
    details?: any;
  };
}

/**
 * Send a success response
 * @param res Next.js API response object
 * @param data Response data
 * @param message Optional success message
 * @param statusCode HTTP status code
 */
export function sendSuccess<T>(
  res: NextApiResponse,
  data: T,
  message?: string,
  statusCode: HttpStatus = HttpStatus.OK
): void {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  
  res.status(statusCode).json(response);
}

/**
 * Send an error response
 * @param res Next.js API response object
 * @param statusCode HTTP status code
 * @param message Error message
 * @param details Additional error details
 */
export function sendError(
  res: NextApiResponse,
  statusCode: HttpStatus,
  message: string,
  details?: any
): void {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: statusCode,
      message,
      ...(details && { details }),
    },
  };
  
  res.status(statusCode).json(response);
}

/**
 * Handle API errors and send appropriate response
 * @param res Next.js API response object
 * @param error Error object
 */
export function handleApiError(res: NextApiResponse, error: any): void {
  console.error('API Error:', error);
  
  const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = error.message || 'An unexpected error occurred';
  
  sendError(res, statusCode, message, error.details);
}

/**
 * Error class for API errors
 */
export class ApiError extends Error {
  statusCode: HttpStatus;
  details?: any;
  
  constructor(statusCode: HttpStatus, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Create a custom API error
 * @param statusCode HTTP status code
 * @param message Error message
 * @param details Additional error details
 */
export function createApiError(
  statusCode: HttpStatus,
  message: string,
  details?: any
): ApiError {
  return new ApiError(statusCode, message, details);
} 