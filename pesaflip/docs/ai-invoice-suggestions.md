# AI Invoice Suggestions

Pesaflip includes an AI-powered system for suggesting invoice content using OpenAI's GPT-3.5 model. This feature helps users create invoices faster by providing intelligent suggestions for titles, descriptions, due dates, and more.

## Features

The AI Invoice Suggestions system can:

1. **Generate invoice titles and descriptions** based on business and client information
2. **Predict appropriate due dates** based on previous payment patterns
3. **Suggest invoice items** based on previous invoices
4. **Recommend payment terms** tailored to business patterns

## Setup

The AI suggestions feature uses OpenAI's API, which requires an API key.

1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to your `.env.local` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Using AI Suggestions in the Invoice Form

When creating a new invoice, you'll find the AI Suggestions panel at the top of the form. The panel includes buttons for different suggestion types.

### Suggesting Title & Description

1. Fill in the business name and client name fields
2. Click "Suggest Title & Description"
3. The AI will generate a professional title and description
4. The suggestion will automatically fill the form fields

### Suggesting Due Date

1. Click "Suggest Due Date"
2. The AI will recommend a due date based on:
   - Previous due dates used by your business
   - Industry standards
   - Client payment history (if available)
3. The suggestion will automatically update the due date field

### Suggesting Invoice Items

1. Click "Suggest Invoice Items"
2. The AI will generate common invoice items based on:
   - Your previous invoices
   - Business category
   - Client history
3. You can then select which items to add to your invoice

### Suggesting Payment Terms

1. Click "Suggest Payment Terms"
2. The AI will recommend appropriate payment terms
3. The suggestion will populate the payment terms field

## API Endpoints

The AI suggestions feature is powered by these API endpoints:

- `POST /api/invoice/ai/title`: Generate invoice title and description
- `POST /api/invoice/ai/due-date`: Predict appropriate due date
- `POST /api/invoice/ai/items`: Suggest invoice items
- `POST /api/invoice/ai/payment-terms`: Recommend payment terms

## Data Privacy

- The AI suggestions feature uses your previous invoice data to make recommendations
- Data is sent to OpenAI's API in a secure, anonymized format
- No personal client information is stored by OpenAI
- All API requests are made server-side to protect your API key

## Limitations

- The quality of suggestions improves with more historical invoice data
- For new users with limited history, suggestions will be based on industry standards
- The AI model may occasionally generate irrelevant suggestions
- The feature requires an internet connection to access OpenAI's API 