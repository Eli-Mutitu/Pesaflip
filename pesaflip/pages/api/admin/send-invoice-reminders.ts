import { NextApiRequest, NextApiResponse } from 'next';
import { sendInvoiceReminders } from '@/jobs/sendInvoiceReminders';
import { authenticated } from '@/lib/auth';

/**
 * Admin API endpoint to manually trigger sending invoice reminders
 * This is protected by authentication and requires admin role
 * @param req API request
 * @param res API response
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow POST method
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: {
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED'
        }
      });
    }
    
    // Check if user is admin
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Admin access required',
          code: 'ADMIN_ACCESS_REQUIRED'
        }
      });
    }
    
    // Execute the invoice reminder job
    await sendInvoiceReminders();
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Invoice reminders sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending invoice reminders:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to send invoice reminders',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}

// Wrap the handler with authentication middleware
export default authenticated(handler); 