/**
 * Wallet API service functions for connecting to the backend
 */

// Interface for Top Up request
export interface TopUpRequest {
  amount: number;
  method: 'mpesa' | 'card' | 'bank';
  mobileNumber?: string;
  cardNumber?: string;
}

// Interface for Withdrawal request
export interface WithdrawRequest {
  amount: number;
  destination: 'mpesa' | 'bank';
  mobileNumber?: string;
  accountNumber?: string;
}

// Interface for Transaction filter parameters
export interface TransactionParams {
  limit?: number;
  offset?: number;
  type?: 'topup' | 'withdraw';
  status?: 'pending' | 'completed' | 'failed';
}

// Transaction interface
export interface Transaction {
  id: string;
  user_id: string;
  type: 'topup' | 'withdraw';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  method: string;
  recipient_info?: string;
  created_at: string;
}

/**
 * Fetch the wallet balance
 * @returns Wallet balance
 */
export async function getWalletBalance(): Promise<number> {
  try {
    const response = await fetch('/api/wallet/balance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to fetch wallet balance');
    }
    
    return data.data.balance;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw error;
  }
}

/**
 * Top up the wallet
 * @param topUpData Data for topping up the wallet
 * @returns Transaction data and new balance
 */
export async function topUpWallet(topUpData: TopUpRequest): Promise<any> {
  try {
    const response = await fetch('/api/wallet/topup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(topUpData),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to top up wallet');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error topping up wallet:', error);
    throw error;
  }
}

/**
 * Withdraw from the wallet
 * @param withdrawData Data for withdrawing from the wallet
 * @returns Transaction data and new balance
 */
export async function withdrawFromWallet(withdrawData: WithdrawRequest): Promise<any> {
  try {
    const response = await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(withdrawData),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to withdraw from wallet');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error withdrawing from wallet:', error);
    throw error;
  }
}

/**
 * Get wallet transactions
 * @param params Parameters for filtering and pagination
 * @returns Transactions and pagination data
 */
export async function getWalletTransactions(params: TransactionParams = {}): Promise<{
  transactions: Transaction[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}> {
  try {
    // Construct query string
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const url = `/api/wallet/transactions${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to get wallet transactions');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    throw error;
  }
} 