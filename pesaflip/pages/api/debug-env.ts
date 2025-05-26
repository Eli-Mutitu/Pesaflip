import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if OpenAI API key is set
  const apiKeyExists = !!process.env.OPENAI_API_KEY;
  
  // Get the masked API key (for security, only show first 4 and last 4 characters)
  let maskedKey = null;
  if (apiKeyExists && process.env.OPENAI_API_KEY) {
    const key = process.env.OPENAI_API_KEY;
    if (key.length > 8) {
      maskedKey = `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    } else {
      maskedKey = "***masked***";
    }
  }
  
  // Return environment info
  res.status(200).json({
    apiKeyExists,
    maskedKey,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
} 