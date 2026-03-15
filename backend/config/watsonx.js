const axios = require('axios');
require('dotenv').config();

let iamToken = null;
let iamTokenExpiry = null;

const getIAMToken = async () => {
  if (iamToken && iamTokenExpiry && Date.now() < iamTokenExpiry) {
    return iamToken;
  }

  if (!process.env.WATSONX_API_KEY) {
    throw new Error('WATSONX_API_KEY not configured');
  }

  try {
    const response = await axios.post(
      'https://iam.cloud.ibm.com/identity/token',
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: process.env.WATSONX_API_KEY,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      }
    );

    iamToken = response.data.access_token;
    // Expire 5 minutes before actual expiry
    iamTokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
    console.log('✅ WatsonX IAM token refreshed');
    return iamToken;
  } catch (err) {
    throw new Error(`Failed to get WatsonX IAM token: ${err.message}`);
  }
};

const generateText = async (prompt, params = {}) => {
  const token = await getIAMToken();
  const url = `${process.env.WATSONX_URL}/ml/v1/text/generation?version=2024-05-01`;

  const body = {
    model_id: process.env.WATSONX_MODEL || 'ibm/granite-3-8b-instruct',
    project_id: process.env.WATSONX_PROJECT_ID,
    input: prompt,
    parameters: {
      max_new_tokens: params.max_new_tokens || 4096,
      temperature: params.temperature || 0.5,
      repetition_penalty: params.repetition_penalty || 1.1,
      stop_sequences: params.stop_sequences || [],
    },
  };

  const response = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 120000,
  });

  const result = response.data?.results?.[0]?.generated_text;
  if (!result) throw new Error('WatsonX returned no generated text');
  return result;
};

const checkHealth = async () => {
  try {
    await getIAMToken();
    return true;
  } catch {
    return false;
  }
};

module.exports = { generateText, checkHealth, getIAMToken };
