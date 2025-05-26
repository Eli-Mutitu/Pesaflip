import oracledb from 'oracledb';

// Set Oracle client path from environment variable
if (process.env.ORACLE_CLIENT_PATH) {
  try {
    oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });
    console.log('Oracle client initialized successfully');
  } catch (err) {
    console.error('Oracle client initialization error:', err);
  }
}

// Configuration for Oracle connection
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`,
};

// Connection pool initialization
let pool: oracledb.Pool | null = null;

/**
 * Initialize the Oracle connection pool
 */
export async function initPool() {
  if (pool) return pool;

  try {
    // Set pool attributes
    pool = await oracledb.createPool({
      ...dbConfig,
      poolIncrement: 1,
      poolMax: 10,
      poolMin: 2,
      poolTimeout: 60
    });
    
    console.log('Oracle DB connection pool created successfully');
    return pool;
  } catch (err) {
    console.error('Oracle DB connection pool creation error:', err);
    throw err;
  }
}

/**
 * Execute a SQL query
 * @param sql SQL query to execute
 * @param bindParams Parameters to bind to the query
 * @param options Query options
 * @returns Query result
 */
export async function executeQuery<T>(
  sql: string,
  bindParams: any = {},
  options: oracledb.ExecuteOptions = {}
): Promise<T> {
  let connection: oracledb.Connection | null = null;
  
  try {
    // Ensure pool is initialized
    if (!pool) {
      await initPool();
    }
    
    // Get connection from pool
    connection = await pool!.getConnection();
    
    // Set default options for better handling of query results
    const defaultOptions: oracledb.ExecuteOptions = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options
    };
    
    // Execute the query
    const result = await connection.execute(sql, bindParams, defaultOptions);
    
    return result as unknown as T;
  } catch (err) {
    console.error('Oracle DB query execution error:', err);
    throw err;
  } finally {
    // Release the connection back to the pool
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing Oracle connection:', err);
      }
    }
  }
}

/**
 * Create a table in the database if it doesn't exist
 * @param tableName Name of the table to create
 * @param schema SQL schema definition for the table
 */
export async function createTableIfNotExists(tableName: string, schema: string): Promise<void> {
  try {
    // Check if table exists
    const tableCheckQuery = `
      SELECT COUNT(*) AS count
      FROM user_tables
      WHERE table_name = :tableName
    `;
    
    const result = await executeQuery<oracledb.Result<{ COUNT: number }>>(
      tableCheckQuery,
      { tableName: tableName.toUpperCase() }
    );
    
    // If table doesn't exist, create it
    const count = result.rows?.[0]?.COUNT || 0;
    if (count === 0) {
      const createTableQuery = `CREATE TABLE ${tableName} (${schema})`;
      await executeQuery(createTableQuery);
      console.log(`Table ${tableName} created successfully`);
    } else {
      console.log(`Table ${tableName} already exists`);
    }
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
    throw error;
  }
}

// Initialize the users table if it doesn't exist
export async function initUsersTable() {
  const schema = `
    id VARCHAR2(36) PRIMARY KEY,
    phone_number VARCHAR2(20) UNIQUE NOT NULL,
    email VARCHAR2(100) UNIQUE,
    name VARCHAR2(100) NOT NULL,
    password VARCHAR2(100) NOT NULL,
    business_name VARCHAR2(100),
    business_type VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `;
  
  await createTableIfNotExists('users', schema);
}

// Initialize database and tables
export async function initDb() {
  try {
    await initPool();
    await initUsersTable();
    
    // Initialize wallet tables (imported dynamically to avoid circular dependencies)
    const { initWalletTables } = await import('@/services/walletService');
    await initWalletTables();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Close the connection pool
export async function closePool() {
  if (pool) {
    try {
      await pool.close(0);
      pool = null;
      console.log('Oracle DB connection pool closed');
    } catch (err) {
      console.error('Error closing Oracle DB connection pool:', err);
      throw err;
    }
  }
} 