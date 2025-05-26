# Invoice Reminder System

The Pesaflip invoice reminder system automatically sends email notifications for unpaid invoices at key intervals relative to their due dates. This helps improve payment collection rates and ensures clients are reminded about their upcoming or overdue payments.

## How It Works

The system runs as a daily scheduled job and checks for invoices that meet specific criteria:

1. **Early Reminders (3 days before due date)**
   - Notifies clients that an invoice will be due soon
   - Provides sufficient time for payment processing

2. **Due Date Reminders (on the due date)**
   - Alerts clients that payment is due today
   - Creates urgency for same-day payment

3. **Late Reminders (3 days after due date)**
   - Notifies clients that payment is overdue
   - Updates invoice status to "overdue"
   - Helps recover delayed payments

## Technical Implementation

The reminder system consists of several components:

- **Invoice Reminder Job** (`/jobs/sendInvoiceReminders.ts`)
  - Core logic for identifying invoices needing reminders
  - Determines reminder type based on due date
  - Updates invoice status as needed

- **Cron Job Setup** (`/scripts/setup-invoice-reminders-cron.sh`)
  - Shell script to set up the daily scheduled task
  - Runs the reminder job daily at 7:00 AM
  - Creates logs directory and sets up logging

- **Email Service** (`/lib/emailService.ts`)
  - Handles email composition and delivery using EmailJS
  - Customizes messages based on reminder type
  - Includes invoice details and payment instructions

- **Admin API** (`/pages/api/admin/send-invoice-reminders.ts`)
  - Allows administrators to manually trigger reminders
  - Protected by authentication and admin role check
  - Useful for testing or one-off reminder campaigns

## Setup Instructions

### 1. Set Up Environment Variables

Ensure these variables are set in your `.env.local` file:

```
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
```

### 2. Install the Cron Job

Run the setup script to install the daily cron job:

```bash
chmod +x scripts/setup-invoice-reminders-cron.sh
./scripts/setup-invoice-reminders-cron.sh
```

This will:
- Create the logs directory
- Install ts-node globally if needed
- Set up a cron job to run daily at 7:00 AM
- Create a manual trigger script for testing

### 3. Manual Testing

You can manually trigger the reminder system in two ways:

**Using the trigger script:**
```bash
./scripts/trigger-invoice-reminders.sh
```

**Using the API endpoint:**
```bash
curl -X POST http://localhost:3000/api/admin/send-invoice-reminders \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## Email Templates

The system uses EmailJS templates for sending emails. The template should include placeholders for:

- `{{to_email}}`: Recipient email address
- `{{to_name}}`: Recipient name
- `{{subject}}`: Email subject line
- `{{message}}`: Email content
- `{{invoice_number}}`: Invoice reference number
- `{{invoice_amount}}`: Formatted invoice amount
- `{{client_name}}`: Client name
- `{{due_date}}`: Formatted due date
- `{{is_overdue}}`: Boolean flag indicating if invoice is overdue

## Monitoring

Logs from the reminder system are written to `/logs/invoice-reminders.log`. Monitor this file for any errors or issues with the reminder system.

## Customization

To customize reminder intervals, edit the `getReminderType` function in `/jobs/sendInvoiceReminders.ts` and adjust the day calculations as needed. 