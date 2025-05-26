import { NextApiRequest, NextApiResponse } from 'next';
import { authenticated } from '@/lib/auth';
import { sendInvoiceReminders } from '@/jobs/sendInvoiceReminders';
import { User } from '@/lib/auth';

// Extend NextApiRequest to include user
interface AuthenticatedRequest extends NextApiRequest {
  user: User;
}

// Store the last run information
const jobStatus = {
  lastRun: null as Date | null,
  lastResult: null as any,
  isRunning: false,
};

/**
 * API handler for invoice reminder job
 * - GET: Get the status of the job
 * - POST: Trigger the job manually
 */
export default authenticated(async function invoiceReminderJobHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    // Check if the user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to access this resource',
          code: 'PERMISSION_DENIED',
        },
      });
    }

    // Handle GET request - return job status
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: {
          lastRun: jobStatus.lastRun ? jobStatus.lastRun.toISOString() : null,
          lastResult: jobStatus.lastResult,
          isRunning: jobStatus.isRunning,
        },
      });
    }

    // Handle POST request - trigger job manually
    if (req.method === 'POST') {
      // Check if the job is already running
      if (jobStatus.isRunning) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Job is already running',
            code: 'JOB_ALREADY_RUNNING',
          },
        });
      }

      // Set job as running
      jobStatus.isRunning = true;

      try {
        // Run the job
        const result = await sendInvoiceReminders();

        // Update job status
        jobStatus.lastRun = new Date();
        jobStatus.lastResult = result;

        return res.status(200).json({
          success: true,
          data: {
            jobResult: result,
            lastRun: jobStatus.lastRun.toISOString(),
          },
        });
      } finally {
        // Set job as not running regardless of success or failure
        jobStatus.isRunning = false;
      }
    }

    // Handle unsupported methods
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error handling invoice reminder job request:', error);

    return res.status(500).json({
      success: false,
      error: {
        message: errorMessage || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}); 