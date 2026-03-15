const OpenAI = require('openai');
require('dotenv').config();

let openaiClient;

const getOpenAI = () => {
  if (openaiClient) return openaiClient;

  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set — OpenAI fallback unavailable');
    return null;
  }

  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log('✅ OpenAI client initialized');
  return openaiClient;
};

module.exports = { getOpenAI };
