# Invoice Reminder System

The Pesaflip platform includes an automated invoice reminder system that helps users improve their cash flow by sending timely email reminders for upcoming and overdue invoices.

## Features

- **Automated Daily Reminders**: Sends emails for invoices due in 3 days, today, or already overdue
- **Email Customization**: Different email templates for upcoming and overdue invoices
- **Admin Controls**: API endpoints for manually triggering and monitoring reminder jobs
- **Logging**: Detailed logs for troubleshooting and auditing

## Technical Architecture

The invoice reminder system consists of several components:

1. **Database Layer**
   - Uses Oracle19c to store invoice data
   - Optimized queries to efficiently retrieve invoices needing reminders

2. **Email Service**
   - EmailJS integration for sending transactional emails
   - Customizable templates
   - Batch processing to handle multiple reminders efficiently

3. **Background Job**
   - Daily execution via cron job
   - Stateless design for reliability
   - Error handling and reporting

4. **Admin API**
   - Endpoints for monitoring job status
   - Manual triggering capability for admins

## Configuration

The invoice reminder system requires the following environment variables:

```
# EmailJS Configuration
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
```

## Email Templates

The system uses the following email templates:

1. **Upcoming Invoice Reminder**
   - Subject: "Reminder: Invoice {invoice_number} Due on {due_date}"
   - Sent 3 days before due date

2. **Due Today Reminder**
   - Subject: "Reminder: Invoice {invoice_number} Due Today"
   - Sent on the due date

3. **Overdue Invoice Reminder**
   - Subject: "OVERDUE: Invoice {invoice_number} Payment Required"
   - Sent for any invoice past its due date

## Setting Up the Cron Job

To enable automatic daily reminders, run the setup script:

```bash
chmod +x scripts/setup-cron-jobs.sh
./scripts/setup-cron-jobs.sh
```

This will set up a cron job to run daily at 8:00 AM.

## Manual Trigger

Admins can manually trigger the reminder job via the API:

```
POST /api/admin/jobs/invoice-reminders
```

Response:
```json
{
  "success": true,
  "data": {
    "jobResult": {
      "success": true,
      "sent": 5,
      "failed": 0,
      "total": 5,
      "message": "Successfully sent 5 reminders"
    },
    "lastRun": "2023-10-25T12:34:56.789Z"
  }
}
```

## Checking Job Status

Admins can check the status of the last job run:

```
GET /api/admin/jobs/invoice-reminders
```

Response:
```json
{
  "success": true,
  "data": {
    "lastRun": "2023-10-25T12:34:56.789Z",
    "lastResult": {
      "success": true,
      "sent": 5,
      "failed": 0,
      "total": 5,
      "message": "Successfully sent 5 reminders"
    },
    "isRunning": false
  }
}
```

## Logging

The reminder job logs are stored in the `logs/invoice-reminders.log` file. This file includes information about job execution, reminders sent, and any errors encountered.

## Troubleshooting

If reminders are not being sent:

1. Check that the EmailJS credentials are correct
2. Verify that the cron job is active (`crontab -l`)
3. Check the log file for errors
4. Ensure there are invoices in the system with the 'sent' status that are due soon or overdue 