#!/bin/bash

# Script to set up a cron job for sending invoice reminders

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up cron job for invoice reminders...${NC}"

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
JOB_SCRIPT="$PROJECT_DIR/jobs/sendInvoiceReminders.ts"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/invoice-reminders.log"

# Create logs directory if it doesn't exist
if [ ! -d "$LOG_DIR" ]; then
  echo -e "${YELLOW}Creating logs directory...${NC}"
  mkdir -p "$LOG_DIR"
fi

# Check if ts-node is installed globally, install if not
if ! command -v ts-node &> /dev/null; then
  echo -e "${YELLOW}ts-node is not installed globally. Installing...${NC}"
  npm install -g ts-node typescript
fi

# Create the cron command
# Runs daily at 7:00 AM
CRON_CMD="0 7 * * * cd $PROJECT_DIR && /usr/bin/env ts-node $JOB_SCRIPT >> $LOG_FILE 2>&1"

# Check if the cron job already exists
EXISTING_CRON=$(crontab -l 2>/dev/null | grep -F "$JOB_SCRIPT")

if [ -n "$EXISTING_CRON" ]; then
  echo -e "${YELLOW}Cron job already exists. Updating...${NC}"
  # Remove existing cron job
  (crontab -l 2>/dev/null | grep -v "$JOB_SCRIPT") | crontab -
else
  echo -e "${YELLOW}Adding new cron job...${NC}"
fi

# Add the new cron job
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

# Verify the cron job was added
if crontab -l | grep -q "$JOB_SCRIPT"; then
  echo -e "${GREEN}Cron job successfully set up!${NC}"
  echo -e "${GREEN}Invoice reminders will run daily at 7:00 AM${NC}"
  echo -e "${YELLOW}Logs will be written to: ${LOG_FILE}${NC}"
else
  echo -e "${RED}Failed to set up cron job${NC}"
  exit 1
fi

# Create a manual trigger script for testing
TRIGGER_SCRIPT="$PROJECT_DIR/scripts/trigger-invoice-reminders.sh"

echo -e "${YELLOW}Creating manual trigger script...${NC}"

cat > "$TRIGGER_SCRIPT" << EOF
#!/bin/bash
cd $PROJECT_DIR && /usr/bin/env ts-node $JOB_SCRIPT
EOF

chmod +x "$TRIGGER_SCRIPT"

echo -e "${GREEN}Created manual trigger script: ${TRIGGER_SCRIPT}${NC}"
echo -e "${YELLOW}You can run it anytime to manually trigger invoice reminders${NC}"

# Make this script executable
chmod +x "$0"

echo -e "${GREEN}Setup complete!${NC}" 