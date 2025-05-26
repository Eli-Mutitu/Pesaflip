#!/bin/bash

# Script to manually run the invoice reminder job
# Usage: ./scripts/send-invoice-reminders.sh

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_PATH="$(which node)"

echo "Starting invoice reminder job..."
cd "$PROJECT_DIR" && $NODE_PATH -r ts-node/register jobs/sendInvoiceReminders.ts

# Exit with the same code as the Node.js script
exit $? 