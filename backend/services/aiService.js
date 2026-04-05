const { generateText, checkHealth: checkWatsonx } = require('../config/watsonx');
const { getOpenAI } = require('../config/openai');
const fs = require('fs');
const path = require('path');

const buildReportPrompt = (reportData, imageAnalysis) => {
  const {
    claimNumber, insuredName, propertyAddress, lossDate, lossType, reportType, additionalNotes,
    propertyDetails, lossDescription, damagesObserved, recommendations,
  } = reportData;
  const imageSection = imageAnalysis
    ? `\n\nIMAGE ANALYSIS RESULTS:\n${JSON.stringify(imageAnalysis, null, 2)}`
    : '';

  return `You are a professional insurance adjuster with 20+ years of experience. Generate a complete, professional CRU GROUP standard insurance inspection report in markdown format.

CLAIM DETAILS:
- Claim Number: ${claimNumber}
- Insured Name: ${insuredName}
- Property Address: ${propertyAddress}
- Date of Loss: ${lossDate}
- Loss Type: ${lossType}
- Report Type: ${reportType}
- Additional Notes: ${additionalNotes || 'None provided'}
${propertyDetails ? `- Property Details: ${propertyDetails}` : ''}
${lossDescription ? `- Loss Description (provided by adjuster): ${lossDescription}` : ''}
${damagesObserved ? `- Damages Observed (provided by adjuster): ${damagesObserved}` : ''}
${recommendations ? `- Adjuster Recommendations: ${recommendations}` : ''}${imageSection}

Generate a thorough, professional report following this EXACT structure with all sections fully populated:

# INSURANCE INSPECTION REPORT

## SECTION 1: REPORT HEADER
- Report Type: ${reportType} Inspection Report
- Claim Number: ${claimNumber}
- Date of Inspection: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
- Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
- Prepared By: FlacronAI Automated Report System

## SECTION 2: INSURED INFORMATION
- Insured Name: ${insuredName}
- Property Address: ${propertyAddress}
- Date of Loss: ${lossDate}
- Loss Type: ${lossType}
- Policy Information: [To be completed by adjuster]

## SECTION 3: PROPERTY DESCRIPTION
${propertyDetails
    ? `Based on the following property details provided by the adjuster, expand into a professional property description:\n${propertyDetails}`
    : `Write a professional property description for the ${lossType} loss site at ${propertyAddress}. Include: the type of structure (residential/commercial), likely construction type and materials, estimated age and condition, general layout, and any physical characteristics relevant to a ${lossType} loss assessment.`}

## SECTION 4: SCOPE OF LOSS / CAUSE OF LOSS
${lossDescription
    ? `Based on the following loss description provided by the adjuster, expand into a professional analysis:\n${lossDescription}\n\nAlso include analysis of coverage implications and contributing factors.`
    : `Write a detailed professional analysis of this ${lossType} loss at ${propertyAddress} on ${lossDate}. Cover all of the following in full sentences and paragraphs:
- The most probable cause of this ${lossType} loss and how it typically occurs
- How the damage developed, spread, and progressed at this property
- The likely sequence of events from the initial incident through discovery
- Coverage analysis: whether this ${lossType} loss is covered under standard insurance policy terms and any relevant exclusions to consider
- Contributing factors, pre-existing conditions, or aggravating circumstances relevant to this loss${additionalNotes ? `\n- Additional context from adjuster notes: ${additionalNotes}` : ''}`}

## SECTION 5: DAMAGE ASSESSMENT
${damagesObserved
    ? `Based on the following damages observed by the adjuster, expand into a professional room-by-room damage assessment:\n${damagesObserved}\n\nFor each area include severity (Minor/Moderate/Severe), affected materials, and estimated square footage.`
    : `Provide a detailed room-by-room / area-by-area damage assessment. For each area, list:
- Location/Room Name
- Type of damage observed
- Severity (Minor/Moderate/Severe)
- Affected materials (e.g., drywall, flooring, cabinetry)
- Square footage affected (estimated)

Include at minimum 5-7 damage areas relevant to the loss type: ${lossType}`}

## SECTION 6: SCOPE OF WORK (RECOMMENDED REPAIRS)
Provide itemized repair recommendations:
- Immediate emergency mitigation steps
- Temporary repairs needed
- Permanent repair scope by trade (demo, framing, drywall, flooring, painting, mechanical, etc.)
- Material specifications where applicable
- Labor descriptions

## SECTION 7: ESTIMATED LOSS SUMMARY
Provide a structured cost estimate table with REAL calculated dollar amounts based on industry-standard restoration rates for a ${lossType} loss. Do NOT use placeholder values like $XXX.XX — use realistic specific numbers (e.g., $1,850.00, $3,200.00). Calculate each line item individually and sum them for the TOTAL.

| Category | Description | Estimated Cost |
|----------|-------------|----------------|
[Include 8-12 line items with REAL dollar amounts based on scope of damage, e.g. $1,250.00]
| **TOTAL ESTIMATED LOSS** | | [sum of all line items above, e.g. $14,750.00] |

IMPORTANT: Every dollar amount must be a specific calculated number. No placeholders. The TOTAL must equal the sum of all line items above it.

## SECTION 8: SUPPORTING DOCUMENTATION
List all documentation reviewed and recommended:
- Photos taken (reference image analysis if available)
- Documents reviewed
- Additional documentation recommended
- Third-party reports needed (if any)

## SECTION 9: CONCLUSION / ADJUSTER NOTES
${recommendations
    ? `Include the following adjuster recommendations and expand professionally:\n${recommendations}\n\nAlso include:`
    : ''}
- Summary of findings
- Coverage determination notes
- Recommended next steps
- Special considerations
- Adjuster certification statement

---
*Report generated by FlacronAI AI System | ${new Date().toISOString()}*

Write the complete report now with all sections fully populated with professional, realistic content appropriate for a ${lossType} loss at a residential/commercial property. Be specific, detailed, and professional.`;
};

// Checks if the generated content has a complete Section 7 cost table.
// If missing or truncated, makes a focused AI call to generate just the table.
const ensureLossSummary = async (reportData, content) => {
  const section7Re = /##\s*SECTION\s*7[^\n]*\n([\s\S]*?)(?=##\s*SECTION\s*8|$)/i;
  const match = content.match(section7Re);
  const tableRows = ((match ? match[1] : '') .match(/^\|.+\|/gm) || [])
    .filter(r => !r.match(/^\|\s*[-:]+\s*\|/)); // strip separator rows

  // Need header + at least 3 data/total rows
  if (tableRows.length >= 4) return content;

  console.log('⚠️  Section 7 incomplete — generating cost summary separately...');

  const summaryPrompt = `You are a professional insurance adjuster. Generate ONLY the estimated cost table for a ${reportData.lossType} insurance loss claim.

Property: ${reportData.propertyAddress}
Damages: ${reportData.damagesObserved || 'Typical ' + reportData.lossType + ' damage to a residential property'}
Loss Description: ${reportData.lossDescription || ''}

Output ONLY this markdown section (no preamble, no other text):

## SECTION 7: ESTIMATED LOSS SUMMARY

| Category | Description | Estimated Cost |
|----------|-------------|----------------|
[8-10 rows with REAL specific dollar amounts, e.g. $1,850.00. No placeholders.]
| **TOTAL ESTIMATED LOSS** | | [exact sum of all rows above] |`;

  let summaryText;
  try {
    summaryText = await generateText(summaryPrompt, { max_new_tokens: 700, temperature: 0.3 });
  } catch {
    try {
      const openai = getOpenAI();
      if (!openai) return content;
      const res = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: summaryPrompt }],
        max_tokens: 700,
        temperature: 0.3,
      });
      summaryText = res.choices[0].message.content;
    } catch (err) {
      console.warn('Loss summary fallback also failed:', err.message);
      return content;
    }
  }

  if (match) {
    return content.replace(section7Re, summaryText.trim() + '\n\n');
  }
  // Content was truncated before reaching section 7 — append it
  return content.trimEnd() + '\n\n' + summaryText.trim();
};

const generateReport = async (reportData, imageAnalysis) => {
  const prompt = buildReportPrompt(reportData, imageAnalysis);

  let content;
  let modelUsed;

  // Try WatsonX first
  try {
    console.log('🤖 Attempting WatsonX report generation...');
    content = await generateText(prompt, { max_new_tokens: 4096, temperature: 0.5 });
    modelUsed = 'watsonx/ibm/granite-3-8b-instruct';
    console.log('✅ Report generated via WatsonX');
  } catch (watsonxErr) {
    console.warn('⚠️  WatsonX failed, falling back to OpenAI:', watsonxErr.message);

    // Fallback to OpenAI
    const openai = getOpenAI();
    if (!openai) throw new Error('No AI provider available. Please configure WATSONX_API_KEY or OPENAI_API_KEY.');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a professional insurance adjuster. Generate detailed, accurate insurance inspection reports.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.5,
    });

    content = completion.choices[0].message.content;
    modelUsed = 'openai/gpt-4-turbo-preview';
    console.log('✅ Report generated via OpenAI');
  }

  // Ensure Section 7 cost table is complete — patch it if truncated
  content = await ensureLossSummary(reportData, content);

  return { content, modelUsed };
};

const analyzeImages = async (imagePaths) => {
  const openai = getOpenAI();
  if (!openai) {
    return {
      summary: 'Image analysis unavailable — OpenAI not configured',
      damages: [],
      severity: 'Unknown',
    };
  }

  // Limit to 10 images for analysis
  const pathsToAnalyze = imagePaths.slice(0, 10);
  const imageContents = [];

  for (const imgPath of pathsToAnalyze) {
    try {
      if (!fs.existsSync(imgPath)) continue;
      const imageData = fs.readFileSync(imgPath);
      const base64 = imageData.toString('base64');
      const ext = path.extname(imgPath).toLowerCase().replace('.', '');
      const mimeType = ext === 'jpg' ? 'jpeg' : ext;
      imageContents.push({
        type: 'image_url',
        image_url: { url: `data:image/${mimeType};base64,${base64}`, detail: 'high' },
      });
    } catch (err) {
      console.warn(`Could not read image ${imgPath}:`, err.message);
    }
  }

  if (imageContents.length === 0) {
    return { summary: 'No valid images provided for analysis', damages: [], severity: 'Unknown' };
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are an expert insurance damage assessor. Analyze these ${imageContents.length} damage photos and provide:
1. A detailed damage assessment for each visible area
2. Overall severity (Minor/Moderate/Severe/Total Loss)
3. Estimated affected areas (rooms, surfaces)
4. Materials damaged (drywall, flooring, roofing, etc.)
5. Immediate concerns (structural, safety, mold risk)
6. Documentation quality assessment

Return as JSON with this structure:
{
  "summary": "Overall assessment summary",
  "severity": "Moderate",
  "totalImagesAnalyzed": ${imageContents.length},
  "damages": [
    {
      "area": "Living Room",
      "type": "Water damage",
      "severity": "Severe",
      "materials": ["drywall", "flooring"],
      "description": "Detailed description"
    }
  ],
  "immediateConcerns": ["List of urgent concerns"],
  "estimatedAffectedSqFt": 450,
  "documentationNotes": "Photo quality assessment"
}`,
          },
          ...imageContents,
        ],
      },
    ],
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content, damages: [], severity: 'Unknown' };
  } catch {
    return { summary: content, damages: [], severity: 'Unknown' };
  }
};

const generateSummary = async (reportContent) => {
  try {
    const prompt = `Summarize this insurance inspection report in 3-4 sentences highlighting the key findings, damage assessment, and recommended actions:\n\n${reportContent.substring(0, 3000)}`;
    const result = await generateText(prompt, { max_new_tokens: 500, temperature: 0.3 });
    return result;
  } catch {
    const openai = getOpenAI();
    if (!openai) return 'Summary unavailable';
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: `Summarize this insurance report in 3-4 sentences:\n\n${reportContent.substring(0, 3000)}` }],
      max_tokens: 500,
    });
    return completion.choices[0].message.content;
  }
};

const generateScopeOfWork = async (reportContent, damageAssessment) => {
  const prompt = `Based on this insurance report and damage assessment, generate a detailed scope of work with itemized repair tasks, materials needed, and labor descriptions:\n\nReport:\n${reportContent.substring(0, 2000)}\n\nDamage Assessment:\n${JSON.stringify(damageAssessment, null, 2).substring(0, 1000)}`;
  try {
    return await generateText(prompt, { max_new_tokens: 2000, temperature: 0.4 });
  } catch {
    const openai = getOpenAI();
    if (!openai) return 'Scope of work generation unavailable';
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
    });
    return completion.choices[0].message.content;
  }
};

const checkQuality = async (reportContent) => {
  const wordCount = reportContent.split(/\s+/).length;
  const sections = (reportContent.match(/^##\s/gm) || []).length;

  const checks = {
    hasClaimNumber: /claim\s*(number|#)/i.test(reportContent),
    hasDamageAssessment: /damage\s*assessment|section\s*5/i.test(reportContent),
    hasScopeOfWork: /scope\s*of\s*(work|loss)|section\s*(4|6)/i.test(reportContent),
    hasCostEstimate: /estimated|cost|total|estimate/i.test(reportContent),
    hasConclusion: /conclusion|adjuster|certification|notes|section\s*(8|9)/i.test(reportContent),
    isLongEnough: wordCount >= 300,
    hasSections: sections >= 4,
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const qualityScore = Math.round((passed / Object.keys(checks).length) * 100);

  const suggestions = [];
  if (!checks.hasClaimNumber) suggestions.push('Add claim number to report header');
  if (!checks.hasDamageAssessment) suggestions.push('Include detailed damage assessment section');
  if (!checks.hasScopeOfWork) suggestions.push('Add scope of work/recommended repairs');
  if (!checks.hasCostEstimate) suggestions.push('Include cost estimate table');
  if (!checks.hasConclusion) suggestions.push('Add conclusion/adjuster notes section');
  if (!checks.isLongEnough) suggestions.push('Report appears too brief — add more detail');
  if (!checks.hasSections) suggestions.push('Report should have at least 4 structured sections');

  return { score: qualityScore, suggestions, wordCount, sections };
};

const enhanceContent = async (rawContent) => {
  const prompt = `Improve the professional quality of this insurance inspection report section. Make it more detailed, precise, and industry-standard. Return only the improved text:\n\n${rawContent}`;
  try {
    return await generateText(prompt, { max_new_tokens: 1500, temperature: 0.4 });
  } catch {
    const openai = getOpenAI();
    if (!openai) return rawContent;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
    });
    return completion.choices[0].message.content;
  }
};

const checkAIHealth = async () => {
  const watsonxOk = await checkWatsonx();
  let openaiOk = false;
  try {
    const openai = getOpenAI();
    if (openai) {
      await openai.models.list();
      openaiOk = true;
    }
  } catch {}
  return {
    watsonx: watsonxOk ? 'online' : 'offline',
    openai: openaiOk ? 'online' : 'offline',
    primary: watsonxOk ? 'watsonx' : openaiOk ? 'openai' : 'none',
  };
};

module.exports = { generateReport, analyzeImages, generateSummary, generateScopeOfWork, checkQuality, enhanceContent, checkAIHealth };
