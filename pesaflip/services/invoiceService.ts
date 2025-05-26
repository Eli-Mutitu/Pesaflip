import { executeQuery } from '@/lib/db';
import { ApiError, HttpStatus } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';

// Define Invoice interface
export interface Invoice {
  id: string;
  user_id: string;
  client_id?: string;
  client_name: string;
  client_email: string;
  client_address?: string;
  invoice_number: string;
  title: string;
  description?: string;
  issue_date: Date | string;
  due_date: Date | string;
  payment_terms: string;
  tax_rate: number;
  tax_amount: number;
  subtotal: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

// Define InvoiceItem interface
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: Date | string;
}

/**
 * Initialize invoice tables in the database
 */
export async function initInvoiceTables() {
  try {
    // Create invoices table if not exists
    await executeQuery(`
      DECLARE
        table_exists NUMBER;
      BEGIN
        SELECT COUNT(*) INTO table_exists FROM user_tables WHERE table_name = 'INVOICES';
        IF table_exists = 0 THEN
          EXECUTE IMMEDIATE '
            CREATE TABLE invoices (
              id VARCHAR2(36) PRIMARY KEY,
              user_id VARCHAR2(36) NOT NULL,
              client_id VARCHAR2(36),
              client_name VARCHAR2(100) NOT NULL,
              client_email VARCHAR2(100) NOT NULL,
              client_address VARCHAR2(255),
              invoice_number VARCHAR2(50) NOT NULL,
              title VARCHAR2(200) NOT NULL,
              description VARCHAR2(1000),
              issue_date DATE NOT NULL,
              due_date DATE NOT NULL,
              payment_terms VARCHAR2(100) NOT NULL,
              tax_rate NUMBER(5,2) DEFAULT 0 NOT NULL,
              tax_amount NUMBER(20,2) DEFAULT 0 NOT NULL,
              subtotal NUMBER(20,2) DEFAULT 0 NOT NULL,
              total NUMBER(20,2) DEFAULT 0 NOT NULL,
              status VARCHAR2(20) DEFAULT ''draft'' NOT NULL,
              notes VARCHAR2(2000),
              created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
              updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
              CONSTRAINT fk_invoices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              CONSTRAINT chk_invoice_status CHECK (status IN (''draft'', ''sent'', ''paid'', ''overdue'', ''cancelled''))
            )
          ';
          
          EXECUTE IMMEDIATE 'CREATE INDEX idx_invoices_user_id ON invoices(user_id)';
          EXECUTE IMMEDIATE 'CREATE INDEX idx_invoices_client_id ON invoices(client_id)';
          EXECUTE IMMEDIATE 'CREATE INDEX idx_invoices_status ON invoices(status)';
          EXECUTE IMMEDIATE 'CREATE INDEX idx_invoices_due_date ON invoices(due_date)';
        END IF;
      END;
    `);

    // Create invoice_items table if not exists
    await executeQuery(`
      DECLARE
        table_exists NUMBER;
      BEGIN
        SELECT COUNT(*) INTO table_exists FROM user_tables WHERE table_name = 'INVOICE_ITEMS';
        IF table_exists = 0 THEN
          EXECUTE IMMEDIATE '
            CREATE TABLE invoice_items (
              id VARCHAR2(36) PRIMARY KEY,
              invoice_id VARCHAR2(36) NOT NULL,
              description VARCHAR2(500) NOT NULL,
              quantity NUMBER(10,2) DEFAULT 1 NOT NULL,
              unit_price NUMBER(20,2) DEFAULT 0 NOT NULL,
              amount NUMBER(20,2) DEFAULT 0 NOT NULL,
              created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
              CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
              CONSTRAINT chk_invoice_item_quantity CHECK (quantity > 0)
            )
          ';
          
          EXECUTE IMMEDIATE 'CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id)';
        END IF;
      END;
    `);

    console.log('Invoice tables initialized successfully');
  } catch (error) {
    console.error('Error initializing invoice tables:', error);
    throw error;
  }
}

/**
 * Create a new invoice
 * @param invoiceData The invoice data
 * @param items The invoice items
 * @returns The created invoice with items
 */
export async function createInvoice(
  invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>,
  items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]
): Promise<Invoice> {
  try {
    const invoiceId = uuidv4();
    
    // Insert the invoice
    await executeQuery(`
      INSERT INTO invoices (
        id, user_id, client_id, client_name, client_email, client_address,
        invoice_number, title, description, issue_date, due_date, payment_terms,
        tax_rate, tax_amount, subtotal, total, status, notes, created_at, updated_at
      )
      VALUES (
        :id, :user_id, :client_id, :client_name, :client_email, :client_address,
        :invoice_number, :title, :description, TO_DATE(:issue_date, 'YYYY-MM-DD'),
        TO_DATE(:due_date, 'YYYY-MM-DD'), :payment_terms, :tax_rate, :tax_amount,
        :subtotal, :total, :status, :notes, SYSTIMESTAMP, SYSTIMESTAMP
      )
    `, {
      id: invoiceId,
      ...invoiceData,
      issue_date: formatDateForSQL(invoiceData.issue_date),
      due_date: formatDateForSQL(invoiceData.due_date)
    });
    
    // Insert the invoice items
    for (const item of items) {
      await executeQuery(`
        INSERT INTO invoice_items (
          id, invoice_id, description, quantity, unit_price, amount, created_at
        )
        VALUES (
          :id, :invoice_id, :description, :quantity, :unit_price, :amount, SYSTIMESTAMP
        )
      `, {
        id: uuidv4(),
        invoice_id: invoiceId,
        ...item
      });
    }
    
    // Return the created invoice with items
    return getInvoiceById(invoiceId);
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to create invoice');
  }
}

/**
 * Get an invoice by ID
 * @param invoiceId The invoice ID
 * @returns The invoice with items
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice> {
  try {
    // Get the invoice
    const invoices = await executeQuery<any[]>(`
      SELECT
        id, user_id, client_id, client_name, client_email, client_address,
        invoice_number, title, description, issue_date, due_date, payment_terms,
        tax_rate, tax_amount, subtotal, total, status, notes, created_at, updated_at
      FROM invoices
      WHERE id = :invoiceId
    `, { invoiceId });
    
    if (!invoices || invoices.length === 0) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Invoice not found');
    }
    
    const invoice = mapInvoiceFromDB(invoices[0]);
    
    // Get the invoice items
    const items = await executeQuery<any[]>(`
      SELECT
        id, invoice_id, description, quantity, unit_price, amount, created_at
      FROM invoice_items
      WHERE invoice_id = :invoiceId
      ORDER BY created_at ASC
    `, { invoiceId });
    
    invoice.items = items.map(mapInvoiceItemFromDB);
    
    return invoice;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error getting invoice:', error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to get invoice');
  }
}

/**
 * Get upcoming due or overdue invoices for reminders
 * @param daysAhead Number of days ahead to include in "upcoming" (default: 3)
 * @returns List of invoices that are due soon or overdue
 */
export async function getInvoicesForReminders(daysAhead: number = 3): Promise<Invoice[]> {
  try {
    const today = new Date();
    const futureCutoff = new Date();
    futureCutoff.setDate(today.getDate() + daysAhead);
    
    // Format dates for SQL
    const todayStr = formatDateForSQL(today);
    const futureCutoffStr = formatDateForSQL(futureCutoff);
    
    // Get invoices that are:
    // 1. Due in the next X days OR
    // 2. Due today OR
    // 3. Overdue
    // 4. AND have status 'sent' (not paid, cancelled, or draft)
    const invoices = await executeQuery<any[]>(`
      SELECT
        i.id, i.user_id, i.client_id, i.client_name, i.client_email, i.client_address,
        i.invoice_number, i.title, i.description, i.issue_date, i.due_date, i.payment_terms,
        i.tax_rate, i.tax_amount, i.subtotal, i.total, i.status, i.notes, i.created_at, i.updated_at,
        u.email as user_email, u.name as user_name
      FROM invoices i
      JOIN users u ON i.user_id = u.id
      WHERE 
        i.status = 'sent' AND
        (
          (i.due_date BETWEEN TO_DATE(:todayStr, 'YYYY-MM-DD') AND TO_DATE(:futureCutoffStr, 'YYYY-MM-DD'))
          OR i.due_date < TO_DATE(:todayStr, 'YYYY-MM-DD')
        )
    `, { todayStr, futureCutoffStr });
    
    if (!invoices || invoices.length === 0) {
      return [];
    }
    
    // Map database results to Invoice objects
    const result = invoices.map(invoice => {
      const mapped = mapInvoiceFromDB(invoice);
      // Add extra fields for email sending
      mapped.user_email = invoice.USER_EMAIL;
      mapped.user_name = invoice.USER_NAME;
      return mapped;
    });
    
    return result;
  } catch (error) {
    console.error('Error getting invoices for reminders:', error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to get invoices for reminders');
  }
}

/**
 * Update invoice status
 * @param invoiceId The invoice ID
 * @param status The new status
 * @returns The updated invoice
 */
export async function updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<Invoice> {
  try {
    // Update the invoice status
    await executeQuery(`
      UPDATE invoices
      SET status = :status, updated_at = SYSTIMESTAMP
      WHERE id = :invoiceId
    `, { invoiceId, status });
    
    // Return the updated invoice
    return getInvoiceById(invoiceId);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update invoice status');
  }
}

/**
 * Helper function to map database invoice record to Invoice interface
 * @param dbInvoice Database invoice record
 * @returns Invoice object
 */
function mapInvoiceFromDB(dbInvoice: any): Invoice & { items?: InvoiceItem[], user_email?: string, user_name?: string } {
  return {
    id: dbInvoice.ID,
    user_id: dbInvoice.USER_ID,
    client_id: dbInvoice.CLIENT_ID,
    client_name: dbInvoice.CLIENT_NAME,
    client_email: dbInvoice.CLIENT_EMAIL,
    client_address: dbInvoice.CLIENT_ADDRESS,
    invoice_number: dbInvoice.INVOICE_NUMBER,
    title: dbInvoice.TITLE,
    description: dbInvoice.DESCRIPTION,
    issue_date: dbInvoice.ISSUE_DATE,
    due_date: dbInvoice.DUE_DATE,
    payment_terms: dbInvoice.PAYMENT_TERMS,
    tax_rate: dbInvoice.TAX_RATE,
    tax_amount: dbInvoice.TAX_AMOUNT,
    subtotal: dbInvoice.SUBTOTAL,
    total: dbInvoice.TOTAL,
    status: dbInvoice.STATUS,
    notes: dbInvoice.NOTES,
    created_at: dbInvoice.CREATED_AT,
    updated_at: dbInvoice.UPDATED_AT,
    items: [],
  };
}

/**
 * Helper function to map database invoice item record to InvoiceItem interface
 * @param dbItem Database invoice item record
 * @returns InvoiceItem object
 */
function mapInvoiceItemFromDB(dbItem: any): InvoiceItem {
  return {
    id: dbItem.ID,
    invoice_id: dbItem.INVOICE_ID,
    description: dbItem.DESCRIPTION,
    quantity: dbItem.QUANTITY,
    unit_price: dbItem.UNIT_PRICE,
    amount: dbItem.AMOUNT,
    created_at: dbItem.CREATED_AT,
  };
}

/**
 * Helper function to format a date for SQL
 * @param date Date to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
function formatDateForSQL(date: Date | string): string {
  if (typeof date === 'string') {
    // If it's already a string, ensure it's in YYYY-MM-DD format
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
  }
  
  return date.toISOString().split('T')[0];
}

// Initialize the invoice tables as soon as the module is imported
initInvoiceTables().catch(console.error); 