// IBM WatsonX AI Configuration for FlacronAI
// Used for enterprise-grade report generation
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');
require('dotenv').config();

let watsonxClient;

/**
 * Initialize WatsonX AI client
 * Uses API key only - no org/project ID required
 */
function initializeWatsonX() {
  try {
    if (!process.env.WATSONX_API_KEY) {
      throw new Error('WATSONX_API_KEY is not set in environment variables');
    }

    // Initialize WatsonX AI client with API key authentication
    watsonxClient = WatsonXAI.newInstance({
      version: '2024-05-31',
      serviceUrl: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSONX_API_KEY,
      }),
    });

    console.log('✅ WatsonX AI initialized successfully');
    return watsonxClient;
  } catch (error) {
    console.error('❌ WatsonX initialization error:', error.message);
    throw error;
  }
}

/**
 * Get WatsonX client instance
 */
function getWatsonXClient() {
  if (!watsonxClient) {
    return initializeWatsonX();
  }
  return watsonxClient;
}

/**
 * Strip markdown formatting from text
 */
function stripMarkdown(text) {
  if (!text) return '';

  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`{1,3}(.+?)`{1,3}/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate insurance report using WatsonX AI
 * Enterprise-grade structured report generation
 */
async function generateReport(reportData) {
  try {
    const client = getWatsonXClient();

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Construct CRU GROUP template-compatible prompt - CONCISE VERSION
    const prompt = `Write an insurance inspection report for CRU GROUP format.

CLAIM DATA:
Claim: ${reportData.claimNumber}
Insured: ${reportData.insuredName}
Address: ${reportData.propertyAddress || 'Not provided'}
Loss Date: ${reportData.lossDate || 'Not provided'}
Loss Type: ${reportData.lossType}
Details: ${reportData.propertyDetails || 'Not provided'}
Damages: ${reportData.damages || 'Not provided'}

Write 2-3 detailed sentences for EACH section. Use ## for headers. No markdown in content.

## REMARKS
## RISK
## ITV (Insurance to Value)
## OCCURRENCE
## COVERAGE
## DWELLING DAMAGE
## OTHER STRUCTURES DAMAGE
## CONTENTS DAMAGE
## ALE / FMV CLAIM
## SUBROGATION / SALVAGE
## WORK TO BE COMPLETED / RECOMMENDATION
## ASSIGNMENT
## INSURED
## OWNERSHIP / INSURABLE INTEREST
## LOSS AND ORIGIN
## DAMAGES
## EXPERTS
## OFFICIAL REPORTS
## SUBROGATION
## SALVAGE
## ACTION PLAN/PENDING ITEMS
## RECOMMENDATION
## DIARY DATE

Generate full report now:`;

    // Generate text using WatsonX AI
    const textGenParams = {
      input: prompt,
      modelId: process.env.WATSONX_MODEL || 'ibm/granite-13b-chat-v2',
      parameters: {
        max_new_tokens: 4096,  // Increased from 2048 to allow longer reports
        temperature: 0.5,       // Increased slightly for more varied output
        top_p: 0.95,
        top_k: 50,
        repetition_penalty: 1.15,
      },
    };

    // Add projectId or spaceId if available (optional)
    if (process.env.WATSONX_PROJECT_ID) {
      textGenParams.projectId = process.env.WATSONX_PROJECT_ID;
    }
    if (process.env.WATSONX_SPACE_ID) {
      textGenParams.spaceId = process.env.WATSONX_SPACE_ID;
    }

    console.log('🔵 Calling WatsonX AI for report generation...');
    console.log('   Model:', textGenParams.modelId);
    console.log('   Project ID:', textGenParams.projectId || 'Not set');
    console.log('   Space ID:', textGenParams.spaceId || 'Not set');

    const response = await client.generateText(textGenParams);

    if (!response || !response.result || !response.result.results || response.result.results.length === 0) {
      throw new Error('No response from WatsonX AI');
    }

    const generatedText = response.result.results[0].generated_text;

    // Validate that we have meaningful content
    if (!generatedText || generatedText.trim().length < 100) {
      throw new Error('WatsonX returned insufficient content (less than 100 characters)');
    }

    // DO NOT strip markdown - preserve formatting for document generators
    // const cleanedText = stripMarkdown(generatedText);

    console.log('✅ WatsonX report generated successfully');
    console.log('   Content length:', generatedText.length, 'characters');
    console.log('   Word count:', generatedText.split(/\s+/).length, 'words');

    return generatedText;
  } catch (error) {
    console.error('❌ WatsonX report generation error:', error);
    throw new Error(`Failed to generate report with WatsonX: ${error.message}`);
  }
}

module.exports = {
  initializeWatsonX,
  getWatsonXClient,
  generateReport
};
