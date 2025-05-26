import { executeQuery } from '@/lib/db';
import { ApiError, HttpStatus } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';

// Initialize wallet tables
export async function initWalletTables() {
  try {
    // Create wallets table if not exists
    await executeQuery(`
      DECLARE
        table_exists NUMBER;
      BEGIN
        SELECT COUNT(*) INTO table_exists FROM user_tables WHERE table_name = 'WALLETS';
        IF table_exists = 0 THEN
          EXECUTE IMMEDIATE '
            CREATE TABLE wallets (
              id VARCHAR2(36) PRIMARY KEY,
              user_id VARCHAR2(36) NOT NULL,
              balance NUMBER(20,2) DEFAULT 0 NOT NULL,
              created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
              CONSTRAINT chk_wallet_balance CHECK (balance >= 0)
            )
          ';
          
          EXECUTE IMMEDIATE 'CREATE INDEX idx_wallets_user_id ON wallets(user_id)';
        END IF;
      END;
    `);

    // Create wallet_transactions table if not exists
    await executeQuery(`
      DECLARE
        table_exists NUMBER;
      BEGIN
        SELECT COUNT(*) INTO table_exists FROM user_tables WHERE table_name = 'WALLET_TRANSACTIONS';
        IF table_exists = 0 THEN
          EXECUTE IMMEDIATE '
            CREATE TABLE wallet_transactions (
              id VARCHAR2(36) PRIMARY KEY,
              wallet_id VARCHAR2(36) NOT NULL,
              type VARCHAR2(20) NOT NULL,
              amount NUMBER(20,2) NOT NULL,
              status VARCHAR2(20) DEFAULT ''pending'' NOT NULL,
              method VARCHAR2(50) NOT NULL,
              reference VARCHAR2(100),
              recipient_info VARCHAR2(255),
              created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
              CONSTRAINT fk_wallet_transactions_wallet
                FOREIGN KEY (wallet_id)
                REFERENCES wallets(id)
                ON DELETE CASCADE,
              CONSTRAINT chk_transaction_type CHECK (type IN (''topup'', ''withdraw'')),
              CONSTRAINT chk_transaction_status CHECK (status IN (''pending'', ''completed'', ''failed'')),
              CONSTRAINT chk_transaction_amount CHECK (amount > 0)
            )
          ';
          
          EXECUTE IMMEDIATE 'CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id)';
          EXECUTE IMMEDIATE 'CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type)';
          EXECUTE IMMEDIATE 'CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status)';
          EXECUTE IMMEDIATE 'CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at)';
          EXECUTE IMMEDIATE 'CREATE INDEX idx_wallet_txn_wallet_type_status ON wallet_transactions(wallet_id, type, status)';
        END IF;
      END;
    `);

    console.log('Wallet tables initialized successfully');
  } catch (error) {
    console.error('Error initializing wallet tables:', error);
    throw error;
  }
}

// Define Wallet interface
interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: Date | string;
}

// Define Transaction interface
interface Transaction {
  id: string;
  user_id: string;
  type: 'topup' | 'withdraw';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  reference: string;
  recipient_info?: string | null;
  created_at: Date | string;
}

/**
 * Get or create a wallet for a user
 * @param userId The user ID
 * @returns The wallet object
 */
export async function getOrCreateWallet(userId: string): Promise<Wallet> {
  try {
    // Try to get existing wallet
    const wallets = await executeQuery<Wallet[]>(`
      SELECT id, user_id, balance, created_at
      FROM wallets
      WHERE user_id = :userId
    `, { userId });
    
    // Return existing wallet if found
    if (wallets && wallets.length > 0) {
      return wallets[0];
    }
    
    // Create a new wallet if none exists
    const walletId = uuidv4();
    const newWallet: Wallet = {
      id: walletId,
      user_id: userId,
      balance: 0,
      created_at: new Date()
    };
    
    await executeQuery(`
      INSERT INTO wallets (id, user_id, balance, created_at)
      VALUES (:id, :user_id, :balance, SYSTIMESTAMP)
    `, newWallet);
    
    return newWallet;
  } catch (error) {
    console.error('Error getting or creating wallet:', error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to process wallet information');
  }
}

/**
 * Get the wallet balance for a user
 * @param userId The user ID
 * @returns The wallet balance
 */
export async function getWalletBalance(userId: string): Promise<number> {
  try {
    // Get or create wallet
    const wallet = await getOrCreateWallet(userId);
    return wallet.balance;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to get wallet balance');
  }
}

/**
 * Top up a user's wallet
 * @param userId The user ID
 * @param amount The amount to top up
 * @param method The payment method used
 * @param reference The payment reference or ID
 * @returns The updated wallet balance and transaction details
 */
export async function topUpWallet(
  userId: string,
  amount: number,
  method: string,
  reference?: string
): Promise<{newBalance: number, transactionId: string}> {
  // Input validation
  if (!userId) throw new ApiError(HttpStatus.BAD_REQUEST, 'User ID is required');
  if (!amount || amount <= 0) throw new ApiError(HttpStatus.BAD_REQUEST, 'Amount must be greater than zero');
  if (!method) throw new ApiError(HttpStatus.BAD_REQUEST, 'Payment method is required');
  
  // Generate a reference if not provided
  if (!reference) {
    reference = `TOP${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10000)}`;
  }
  
  try {
    // Use a transaction to ensure data consistency
    const result = await executeQuery<any>(`
      DECLARE
        v_wallet_id VARCHAR2(36);
        v_balance NUMBER(20,2);
        v_transaction_id VARCHAR2(36) := :transactionId;
      BEGIN
        -- Get or create wallet
        BEGIN
          SELECT id, balance INTO v_wallet_id, v_balance 
          FROM wallets 
          WHERE user_id = :userId;
        EXCEPTION
          WHEN NO_DATA_FOUND THEN
            v_wallet_id := :newWalletId;
            v_balance := 0;
            
            INSERT INTO wallets (id, user_id, balance, created_at)
            VALUES (v_wallet_id, :userId, 0, SYSTIMESTAMP);
        END;
        
        -- Update wallet balance
        UPDATE wallets 
        SET balance = balance + :amount 
        WHERE id = v_wallet_id
        RETURNING balance INTO v_balance;
        
        -- Create transaction record
        INSERT INTO wallet_transactions (
          id, wallet_id, type, amount, status, method, reference, created_at
        ) VALUES (
          v_transaction_id, v_wallet_id, 'topup', :amount, 'completed', :method, :reference, SYSTIMESTAMP
        );
        
        -- Return updated balance and transaction details
        :result := '{"newBalance":' || v_balance || ',"transactionId":"' || v_transaction_id || '"}';
      END;
    `, {
      userId,
      amount,
      method,
      reference,
      transactionId: uuidv4(),
      newWalletId: uuidv4(),
      result: { dir: 2, type: 2001, maxSize: 32767 } // OUT param for Oracle
    });
    
    // Parse the result JSON string into an object
    return JSON.parse(result);
  } catch (error) {
    console.error('Error topping up wallet:', error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to process top-up transaction');
  }
}

/**
 * Withdraw from a user's wallet
 * @param userId The user ID
 * @param amount The amount to withdraw
 * @param destination The withdrawal destination (e.g., 'mpesa', 'bank')
 * @param reference Optional reference number
 * @returns The updated wallet balance and transaction details
 */
export async function withdrawFromWallet(
  userId: string,
  amount: number,
  destination: string,
  recipientInfo?: string,
  reference?: string
): Promise<{newBalance: number, transactionId: string}> {
  // Input validation
  if (!userId) throw new ApiError(HttpStatus.BAD_REQUEST, 'User ID is required');
  if (!amount || amount <= 0) throw new ApiError(HttpStatus.BAD_REQUEST, 'Amount must be greater than zero');
  if (!destination) throw new ApiError(HttpStatus.BAD_REQUEST, 'Withdrawal destination is required');
  
  // Generate a reference if not provided
  if (!reference) {
    reference = `WD${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10000)}`;
  }
  
  try {
    // Get the wallet
    const wallet = await getOrCreateWallet(userId);
    
    // Check if wallet has sufficient balance
    if (wallet.balance < amount) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Insufficient funds');
    }
    
    // Use a transaction to ensure data consistency
    const result = await executeQuery<any>(`
      DECLARE
        v_new_balance NUMBER(20,2);
        v_transaction_id VARCHAR2(36) := :transactionId;
      BEGIN
        -- Update wallet balance
        UPDATE wallets 
        SET balance = balance - :amount 
        WHERE id = :walletId
        RETURNING balance INTO v_new_balance;
        
        -- Create transaction record
        INSERT INTO wallet_transactions (
          id, wallet_id, type, amount, status, method, reference, recipient_info, created_at
        ) VALUES (
          v_transaction_id, :walletId, 'withdraw', :amount, 'completed', :destination, 
          :reference, :recipientInfo, SYSTIMESTAMP
        );
        
        -- Return updated balance and transaction details
        :result := '{"newBalance":' || v_new_balance || ',"transactionId":"' || v_transaction_id || '"}';
      END;
    `, {
      walletId: wallet.id,
      amount,
      destination,
      reference,
      recipientInfo: recipientInfo || null,
      transactionId: uuidv4(),
      result: { dir: 2, type: 2001, maxSize: 32767 } // OUT param for Oracle
    });
    
    // Parse the result JSON string into an object
    return JSON.parse(result);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error withdrawing from wallet:', error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to process withdrawal transaction');
  }
}

/**
 * Get transaction history for a user
 * @param userId The user ID
 * @param limit Maximum number of transactions to return
 * @param offset Offset for pagination
 * @param type Filter by transaction type
 * @param status Filter by transaction status
 * @returns The list of transactions and pagination details
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 10,
  offset: number = 0,
  type?: 'topup' | 'withdraw',
  status?: 'pending' | 'completed' | 'failed'
): Promise<{
  transactions: Transaction[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}> {
  try {
    // Get the wallet
    const wallet = await getOrCreateWallet(userId);
    
    // Build the query dynamically based on filters
    let query = `
      SELECT t.id, t.type, t.amount, t.status, t.method, t.reference, 
             t.recipient_info, t.created_at, w.user_id
      FROM wallet_transactions t
      JOIN wallets w ON t.wallet_id = w.id
      WHERE w.id = :walletId
    `;
    
    const params: any = { walletId: wallet.id };
    
    if (type) {
      query += ` AND t.type = :type`;
      params.type = type;
    }
    
    if (status) {
      query += ` AND t.status = :status`;
      params.status = status;
    }
    
    // Add count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM wallet_transactions t
      WHERE t.wallet_id = :walletId
      ${type ? 'AND t.type = :type' : ''}
      ${status ? 'AND t.status = :status' : ''}
    `;
    
    // Get total count first
    const countResult = await executeQuery<{TOTAL: number}[]>(countQuery, params);
    const total = countResult[0].TOTAL;
    
    // Add order and pagination to the main query
    query += `
      ORDER BY t.created_at DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;
    
    params.offset = offset;
    params.limit = limit;
    
    // Execute the query
    const transactions = await executeQuery<any[]>(query, params);
    
    return {
      transactions: transactions.map((tx: any) => ({
        id: tx.ID,
        user_id: tx.USER_ID,
        type: tx.TYPE as 'topup' | 'withdraw',
        amount: tx.AMOUNT,
        status: tx.STATUS as 'pending' | 'completed' | 'failed',
        method: tx.METHOD,
        reference: tx.REFERENCE,
        recipient_info: tx.RECIPIENT_INFO,
        created_at: tx.CREATED_AT
      })),
      pagination: {
        limit,
        offset,
        total
      }
    };
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to get transaction history');
  }
}

// Initialize the wallet tables as soon as the module is imported
initWalletTables().catch(console.error); 