// OpenAI Configuration for FlacronAI
// Used for general AI features, content generation, and user-facing interactions
const OpenAI = require('openai');
require('dotenv').config();

let openaiClient;

/**
 * Initialize OpenAI client
 * Uses API key only - simple and straightforward
 */
function initializeOpenAI() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('✅ OpenAI initialized successfully');
    return openaiClient;
  } catch (error) {
    console.error('❌ OpenAI initialization error:', error.message);
    throw error;
  }
}

/**
 * Get OpenAI client instance
 */
function getOpenAIClient() {
  if (!openaiClient) {
    return initializeOpenAI();
  }
  return openaiClient;
}

/**
 * Generate content using OpenAI
 * Used for conversational AI, summaries, and user-facing features
 */
async function generateContent(prompt, options = {}) {
  try {
    const client = getOpenAIClient();

    const completion = await client.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: options.systemPrompt || 'You are a helpful AI assistant for insurance professionals.' },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
      top_p: options.topP || 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI content generation error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });

    // Provide specific error messages
    if (error.code === 'invalid_api_key' || error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
    } else if (error.code === 'rate_limit_exceeded' || error.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    } else if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI quota exceeded. Please check your billing settings.');
    } else if (error.status === 400) {
      throw new Error('Invalid request to OpenAI API. Please check the parameters.');
    }

    throw new Error(`Failed to generate content with OpenAI: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Analyze image with OpenAI Vision
 * Used for property damage assessment
 */
async function analyzeImage(imageData, prompt) {
  try {
    const client = getOpenAIClient();

    // Convert base64 image data to proper format
    const imageUrl = `data:image/jpeg;base64,${imageData}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.4,
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No response from OpenAI Vision');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI image analysis error:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

/**
 * Generate executive summary
 * Used for creating concise overviews
 */
async function generateExecutiveSummary(fullReport) {
  const prompt = `Based on the following insurance inspection report, create a concise executive summary (2-3 paragraphs)
that highlights the key findings, damage assessment, and primary recommendations:

${fullReport}

The summary should be suitable for insurance adjusters and executives who need a quick overview.`;

  return await generateContent(prompt, {
    systemPrompt: 'You are an expert insurance adjuster creating executive summaries from detailed reports.',
    temperature: 0.5,
    maxTokens: 1024
  });
}

/**
 * Enhance user input with AI suggestions
 * Used for improving and professionalizing user notes
 */
async function enhanceReportInput(userInput) {
  const prompt = `Based on these brief notes, expand and professionalize the following description while maintaining accuracy:

${userInput}

Provide a more detailed, professional version suitable for an official insurance report.
Keep the same facts but improve clarity and professional language.`;

  return await generateContent(prompt, {
    systemPrompt: 'You are assisting an insurance adjuster. Improve their notes while maintaining factual accuracy.',
    temperature: 0.6,
    maxTokens: 2048
  });
}

/**
 * Generate scope of work
 * Used for creating repair/restoration plans
 */
async function generateScopeOfWork(damages, lossType) {
  const prompt = `As a construction and restoration expert, create a detailed scope of work for the following damages:

Loss Type: ${lossType}
Damages: ${damages}

Provide:
1. Step-by-step repair procedures
2. Materials needed
3. Estimated timeframe
4. Special considerations
5. Required trades/contractors

Be specific and follow industry standards for ${lossType} restoration.`;

  return await generateContent(prompt, {
    systemPrompt: 'You are a construction and restoration expert creating detailed scopes of work.',
    temperature: 0.7,
    maxTokens: 3072
  });
}

/**
 * Quality check generated report
 * Used for reviewing and improving report quality
 */
async function qualityCheckReport(reportContent) {
  const prompt = `Review the following insurance report and identify:
1. Missing critical information
2. Inconsistencies
3. Areas that need more detail
4. Professional language issues

Report:
${reportContent}

Provide a brief quality assessment and list of improvements needed.`;

  return await generateContent(prompt, {
    systemPrompt: 'You are a quality assurance expert reviewing insurance reports.',
    temperature: 0.4,
    maxTokens: 2048
  });
}

/**
 * Generate full insurance report using OpenAI (fallback for WatsonX)
 */
async function generateReportWithOpenAI(reportData) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const prompt = `You are a professional insurance claims adjuster writing a property inspection report for CRU GROUP.

CRITICAL INSTRUCTIONS:
1. Use ONLY these exact section headers with "## " prefix
2. Each section header must be on its own line
3. Write in plain text - NO asterisks, NO underscores, NO markdown formatting in content
4. Adapt the example content to match the specific claim data provided
5. Keep the same professional tone and detail level

CLAIM DATA:
Claim Number: ${reportData.claimNumber}
Insured Name: ${reportData.insuredName}
Property Address: ${reportData.propertyAddress || 'Not provided'}
Date of Loss: ${reportData.lossDate || 'Not provided'}
Loss Type: ${reportData.lossType}
Inspection Date: ${currentDate}
Property Details: ${reportData.propertyDetails || 'Not provided'}
Damages: ${reportData.damages || 'Not provided'}

GENERATE THE REPORT USING THESE EXACT SECTION HEADERS IN ORDER:

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

For each section, provide detailed, realistic content based on the claim data. Write in plain text without markdown formatting. Be specific and professional.`;

  console.log('🔄 Generating report with OpenAI as fallback...');

  const content = await generateContent(prompt, {
    systemPrompt: 'You are an expert insurance adjuster generating CRU GROUP format reports. Use ## for section headers ONLY. Write content in plain text without asterisks, underscores, or other markdown formatting. Be detailed, specific, and professional.',
    temperature: 0.5,
    maxTokens: 4096
  });

  console.log('✅ OpenAI fallback report generated successfully');
  console.log('   Content length:', content.length, 'characters');
  console.log('   Word count:', content.split(/\s+/).length, 'words');

  return content;
}

module.exports = {
  initializeOpenAI,
  getOpenAIClient,
  generateContent,
  analyzeImage,
  generateExecutiveSummary,
  enhanceReportInput,
  generateScopeOfWork,
  qualityCheckReport,
  generateReportWithOpenAI
};
