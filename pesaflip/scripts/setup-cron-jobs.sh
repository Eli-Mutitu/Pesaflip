#!/bin/bash

# Setup cron jobs for Pesaflip

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_PATH="$(which node)"

# Create temporary crontab file
TEMP_CRONTAB=$(mktemp)

# Export current crontab
crontab -l > "$TEMP_CRONTAB" 2>/dev/null || true

# Check if the invoice reminder job already exists
if ! grep -q "sendInvoiceReminders.ts" "$TEMP_CRONTAB"; then
    # Add invoice reminders job to run daily at 8:00 AM
    echo "# Pesaflip - Send Invoice Reminders (daily at 8:00 AM)" >> "$TEMP_CRONTAB"
    echo "0 8 * * * cd $PROJECT_DIR && $NODE_PATH -r ts-node/register jobs/sendInvoiceReminders.ts >> $PROJECT_DIR/logs/invoice-reminders.log 2>&1" >> "$TEMP_CRONTAB"
    echo "" >> "$TEMP_CRONTAB"
    
    echo "Added invoice reminders job to crontab"
else
    echo "Invoice reminders job already exists in crontab"
fi

# Install new crontab
crontab "$TEMP_CRONTAB"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Clean up
rm "$TEMP_CRONTAB"

echo "Cron jobs setup complete!"
echo "To view cron jobs: crontab -l"
echo "Logs will be written to: $PROJECT_DIR/logs/" 