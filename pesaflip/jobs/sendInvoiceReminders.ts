import { getInvoicesForReminders, updateInvoiceStatus } from '@/services/invoiceService';
import { sendBatchInvoiceReminders } from '@/lib/emailService';

/**
 * Calculate reminder type based on due date
 * @param dueDate The invoice due date
 * @returns The reminder type
 */
function getReminderType(dueDate: Date): 'before' | 'due' | 'overdue' | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to beginning of day for comparison
  
  const dueDateObj = new Date(dueDate);
  dueDateObj.setHours(0, 0, 0, 0);
  
  // Calculate days difference
  const diffTime = dueDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 3) {
    return 'before'; // 3 days before due date
  } else if (diffDays === 0) {
    return 'due'; // On due date
  } else if (diffDays === -3) {
    return 'overdue'; // 3 days after due date
  }
  
  return null; // No reminder needed
}

/**
 * Send invoice reminders
 * This job checks for invoices that are:
 * - 3 days before due date (early reminder)
 * - Due today (due date reminder)
 * - 3 days overdue (late reminder)
 */
export async function sendInvoiceReminders() {
  try {
    console.log('Starting invoice reminder job...');
    
    // Get all unpaid invoices that are due soon or overdue
    const invoices = await getInvoicesForReminders(3);
    console.log(`Found ${invoices.length} unpaid invoices to check for reminders`);
    
    if (invoices.length === 0) {
      console.log('No invoices to send reminders for');
      return;
    }
    
    // Filter invoices by reminder type
    const remindersToSend = invoices.filter(invoice => {
      const dueDate = new Date(invoice.due_date);
      const reminderType = getReminderType(dueDate);
      
      // Attach reminder type to the invoice for reference
      if (reminderType) {
        (invoice as any).reminderType = reminderType;
        return true;
      }
      
      return false;
    });
    
    console.log(`Sending reminders for ${remindersToSend.length} invoices`);
    
    // Send reminders for filtered invoices
    if (remindersToSend.length > 0) {
      const results = await sendBatchInvoiceReminders(remindersToSend as any);
      
      // Log results
      const successCount = results.filter(r => r.success).length;
      console.log(`Successfully sent ${successCount} of ${results.length} reminders`);
      
      // Update status for overdue invoices
      for (const invoice of remindersToSend) {
        if ((invoice as any).reminderType === 'overdue') {
          await updateInvoiceStatus(invoice.id, 'overdue');
          console.log(`Updated invoice ${invoice.invoice_number} status to overdue`);
        }
      }
    }
    
    console.log('Invoice reminder job completed');
  } catch (error) {
    console.error('Error in invoice reminder job:', error);
    throw error;
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  sendInvoiceReminders()
    .then(() => {
      console.log('Invoice reminder job executed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Invoice reminder job failed:', error);
      process.exit(1);
    });
} 