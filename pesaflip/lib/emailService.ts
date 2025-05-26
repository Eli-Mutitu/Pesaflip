import emailjs from '@emailjs/nodejs';

// Initialize EmailJS
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

/**
 * Options for sending an email
 */
interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  message: string;
  templateParams?: Record<string, any>;
}

/**
 * Send an email using EmailJS
 * @param options Options for sending the email
 * @returns Promise resolving to the EmailJS response
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    const templateParams = {
      to_email: options.to,
      to_name: options.toName || options.to,
      subject: options.subject,
      message: options.message,
      ...options.templateParams,
    };
    
    // Send email using EmailJS
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID as string,
      process.env.EMAILJS_TEMPLATE_ID as string,
      templateParams
    );
    
    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send an invoice due reminder
 * @param invoice Invoice data
 * @param recipientEmail Recipient email
 * @param recipientName Recipient name
 * @returns Promise resolving to the EmailJS response
 */
export async function sendInvoiceDueReminder(
  invoice: {
    invoice_number: string;
    client_name: string;
    due_date: Date | string;
    total: number;
    status: string;
  },
  recipientEmail: string,
  recipientName: string
) {
  // Format due date
  const dueDate = typeof invoice.due_date === 'string' 
    ? new Date(invoice.due_date) 
    : invoice.due_date;
  
  const formattedDueDate = dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Check if the invoice is overdue
  const today = new Date();
  const isOverdue = dueDate < today;
  
  // Format amount
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
  }).format(invoice.total);
  
  // Create subject based on whether the invoice is overdue or not
  const subject = isOverdue
    ? `OVERDUE: Invoice ${invoice.invoice_number} Payment Required`
    : `Reminder: Invoice ${invoice.invoice_number} Due on ${formattedDueDate}`;
  
  // Create message based on whether the invoice is overdue or not
  let message = '';
  if (isOverdue) {
    message = `
      Your invoice ${invoice.invoice_number} for ${formattedAmount} to ${invoice.client_name} was due on ${formattedDueDate} and is now overdue.
      
      Please make payment at your earliest convenience to avoid late fees.
      
      You can view and pay the invoice by logging into your Pesaflip account.
    `;
  } else {
    message = `
      This is a reminder that your invoice ${invoice.invoice_number} for ${formattedAmount} to ${invoice.client_name} is due on ${formattedDueDate}.
      
      Please ensure payment is made by the due date.
      
      You can view and pay the invoice by logging into your Pesaflip account.
    `;
  }
  
  // Send the reminder email
  return sendEmail({
    to: recipientEmail,
    toName: recipientName,
    subject,
    message,
    templateParams: {
      invoice_number: invoice.invoice_number,
      invoice_amount: formattedAmount,
      client_name: invoice.client_name,
      due_date: formattedDueDate,
      is_overdue: isOverdue,
    },
  });
}

/**
 * Send invoice reminders for a batch of invoices
 * @param invoices List of invoices to send reminders for
 * @returns Promise resolving to a list of results
 */
export async function sendBatchInvoiceReminders(
  invoices: Array<{
    invoice_number: string;
    client_name: string;
    due_date: Date | string;
    total: number;
    status: string;
    user_email: string;
    user_name: string;
  }>
) {
  const results = [];
  
  for (const invoice of invoices) {
    try {
      const result = await sendInvoiceDueReminder(
        invoice,
        invoice.user_email,
        invoice.user_name
      );
      
      results.push({
        invoice_number: invoice.invoice_number,
        success: true,
        result,
      });
    } catch (error) {
      console.error(`Error sending reminder for invoice ${invoice.invoice_number}:`, error);
      
      results.push({
        invoice_number: invoice.invoice_number,
        success: false,
        error,
      });
    }
  }
  
  return results;
} 