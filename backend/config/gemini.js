// Google Gemini AI Configuration for FlacronAI
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

let genAI;
let model;

/**
 * Initialize Gemini AI
 */
function initializeGemini() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use Gemini 2.5 Pro for report generation
    model = genAI.getGenerativeModel({
      model: 'models/gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    console.log('✅ Gemini AI initialized successfully');
    return model;
  } catch (error) {
    console.error('❌ Gemini initialization error:', error.message);
    throw error;
  }
}

/**
 * Get Gemini model instance
 */
function getGeminiModel() {
  if (!model) {
    return initializeGemini();
  }
  return model;
}

/**
 * Initialize Gemini Vision model for image analysis
 */
function getGeminiVisionModel() {
  if (!genAI) {
    initializeGemini();
  }

  return genAI.getGenerativeModel({
    model: 'models/gemini-2.5-flash',
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 0.9,
      maxOutputTokens: 4096,
    }
  });
}

/**
 * Generate content using Gemini
 */
async function generateContent(prompt) {
  try {
    const geminiModel = getGeminiModel();
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini content generation error:', error);

    // Provide more specific error messages
    if (error.message && error.message.includes('fetch failed')) {
      throw new Error('Network error: Unable to connect to Google AI. Please check your internet connection and firewall settings.');
    } else if (error.message && error.message.includes('API key')) {
      throw new Error('Invalid API key. Please check your GEMINI_API_KEY environment variable.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 400) {
      throw new Error('Invalid request to Gemini API. The model may not support the requested parameters.');
    }

    throw new Error(`Failed to generate AI content: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Analyze image with Gemini Vision
 */
async function analyzeImage(imageData, prompt) {
  try {
    const visionModel = getGeminiVisionModel();

    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg'
      }
    };

    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini image analysis error:', error);
    throw new Error('Failed to analyze image');
  }
}

/**
 * Strip markdown formatting from AI-generated text
 */
function stripMarkdownFormatting(text) {
  if (!text) return text;

  // Remove bold formatting (**text** or __text__)
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/__(.+?)__/g, '$1');

  // Remove italic formatting (*text* or _text_)
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');

  // Remove any remaining stray asterisks or underscores used for emphasis
  text = text.replace(/\*\*/g, '');
  text = text.replace(/\*/g, '');

  // Remove markdown headers (# ## ###, etc.) - keep just the text
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');

  // Remove markdown bullet points (- or * at start of line) - keep just the text
  text = text.replace(/^[\*\-]\s+/gm, '');

  // Clean up any extra blank lines (more than 2 consecutive)
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Generate report using structured data following CRU Group template format
 */
async function generateReport(reportData) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const prompt = `You are a professional insurance claims adjuster writing a property inspection report. Generate a comprehensive report following the CRU GROUP template format.

CRITICAL OUTPUT REQUIREMENTS:
- Output PLAIN TEXT ONLY with NO formatting symbols
- NO asterisks, NO underscores, NO hashtags, NO markdown
- Start IMMEDIATELY with the first section - NO introduction or preamble
- Use ALL CAPS for main section headers
- Use Title Case with colon for subsections (Example: "Front Elevation:")
- Write as if typing in plain Notepad - zero formatting

CLAIM DATA:
Claim Number: ${reportData.claimNumber}
Insured Name: ${reportData.insuredName}
Property Address: ${reportData.propertyAddress}
Date of Loss: ${reportData.lossDate}
Loss Type: ${reportData.lossType}
Inspection Date: ${currentDate}
${reportData.propertyDetails ? `\nProperty Details: ${reportData.propertyDetails}` : ''}
${reportData.lossDescription ? `\nLoss Description: ${reportData.lossDescription}` : ''}
${reportData.damages ? `\nDamages: ${reportData.damages}` : ''}

Generate the following report sections. Write naturally and professionally. Fill each section with realistic, detailed content based on the claim data above.

Start your response with this EXACT structure:

REMARKS

Thank you for the assignment. An inspection was conducted on ${currentDate}. This report details our findings regarding the ${reportData.lossType} loss at the insured property.

RISK

The risk is a [describe: one-story/two-story] [construction type: wood-framed, brick, etc.] residential dwelling with [roof type] roof and [siding type] siding in [good/fair/poor] condition. The property consists of approximately [square footage] square feet of living space. The occupancy is consistent with the policy declarations as a primary residence.

ITV (Insurance to Value)

Based on the property size, construction quality, and current market conditions, the limit of insurance appears [adequate/low/high] for this risk.

OCCURRENCE

On ${reportData.lossDate}, a ${reportData.lossType} occurred at the insured location resulting in property damage. [Provide 2-3 sentences describing the incident, how it happened, and immediate impacts]. The cause of loss is confirmed as ${reportData.lossType} per field inspection.

COVERAGE

The risk is insured with the above stated limits, policy forms, and deductible. All aspects pertaining to coverage are submitted for the carrier's review and final disposition. No pertinent exclusions or limitations were observed during our inspection.

DWELLING DAMAGE

Exterior: [Describe condition of roof, all four elevations, siding, windows, doors, foundation, and any damage observed. Be specific about materials and damage extent.]

Interior: [Describe affected rooms with specific damage details. Include flooring, walls, ceilings, fixtures. Mention smoke/water damage, odor, or structural impacts room by room.]

Emergency services: Emergency mitigation services are [expected/not expected] for this loss.

OTHER STRUCTURES DAMAGE

The insured [did/did not] sustain damage to other structures. [If yes, describe fences, sheds, detached garages, etc. If no, state: "No damage to other structures was observed during our inspection."]

CONTENTS DAMAGE

The insured [did/did not] sustain damage to contents or personal property. [If yes, describe affected items and categories. If no, state: "No contents damage was reported or observed."]

ALE / FMV CLAIM

The risk [did/did not] become uninhabitable as a result of this loss. Additional Living Expenses (ALE) and Fair Market Value (FMV) claims are [anticipated/not anticipated] at this time.

SUBROGATION / SALVAGE

[State either: "Subrogation potential exists against [party name]" OR "Our investigation did not reveal any third-party liability; therefore, subrogation potential is not present at this time."]

WORK TO BE COMPLETED / RECOMMENDATION

We recommend [payment of claim on ACV/RCTV basis / further inspection / closing without payment]. [Add any specific next steps.] Thank you for the opportunity to be of service to you and your policyholders.


ASSIGNMENT

Assignment was received on ${currentDate} to inspect the insured's property damages resulting from ${reportData.lossType}.

Contact was established with the insured on ${currentDate} and inspection of the risk was completed on ${currentDate}.

The following parties were present during our inspection: [List insured, PA, contractor, etc. with contact information if applicable].

A full inspection was conducted for the ${reportData.lossType} damages at the risk location, and we have outlined our findings in this report for your review and consideration.


INSURED

Named insured is confirmed to be ${reportData.insuredName} which matches the provided policy information.

The best contact number for the insured is [provide phone] and email is [provide email if available].


RISK

The loss notice and policy information confirm the risk is located at ${reportData.propertyAddress}.


OWNERSHIP / INSURABLE INTEREST (Mortgagee)

Please confirm ownership and if there are any mortgagees on the risk location. [Add mortgagee information if known.]


LOSS AND ORIGIN

Confirmed Date of Loss: ${reportData.lossDate}
Confirmed Cause of Loss: ${reportData.lossType}

[Provide 3-5 sentences describing: the date and time of loss, how it was discovered, by whom, under what circumstances, and detailed description of the actual or suspected cause. Be specific and thorough.]


DAMAGES

DWELLING:

ROOF:
Type: [Specify: Asphalt shingle, Metal, Tile, etc.]
Age: [Specify age in years or state "Unknown"]
Condition: [Good, Fair, Poor]
Layers: [Single layer, Multiple layers]
Pitch: [Low slope, Medium slope, Steep slope]
Drip Edge: [Present, Not present]

Damages: [Provide detailed paragraph describing roof damages observed, affected areas, extent of damage, and repair recommendations. If no roof damage: "No visible or related roof damages were observed during our inspection."]

EXTERIOR:

Front Elevation: [Provide detailed description of siding condition, window condition, door condition, and any damages. If none: "No visible or related damages were observed to the Front Elevation during our inspection."]

Right Elevation: [Same format as above]

Left Elevation: [Same format as above]

Rear Elevation: [Same format as above]

INTERIOR:

[Provide room-by-room assessment. For each affected room, describe:
- Room name (Kitchen, Master Bedroom, etc.)
- Flooring damage (type, extent, square footage)
- Wall damage (drywall, paint, wallpaper)
- Ceiling damage
- Fixtures/built-ins affected
- Recommended repairs

Example format:
Kitchen: Water damage observed to hardwood flooring (approximately 150 square feet), lower cabinets (12 linear feet), and drywall (2-foot flood cut required along south wall).

Master Bedroom: Smoke damage to ceiling and upper walls. Odor present. Recommend cleaning and repainting.]

OTHER STRUCTURES:

[Describe any damage to detached garage, shed, fence, etc. If none: "No damage to other structures was observed during our inspection."]


EXPERTS

[Either list experts retained: "We retained [Name], [Type of Expert] at [Phone/Email] to evaluate [specific issue]."
OR state: "No experts were retained or recommended for this loss."]


OFFICIAL REPORTS

[Either describe reports: "We received a report from [Expert Name] dated [Date] indicating [brief summary of findings]."
OR state: "No official reports were provided or pending with this assignment."]


SUBROGATION

Subrogation Potential: [Yes or No]
Remarks: [If Yes, explain: "Third-party liability exists against [party name] due to [reason]. We recommend pursuing subrogation."
If No: "Our investigation did not reveal any third-party liability or product defects; therefore, subrogation potential is not present at this time."]


SALVAGE

[Either: "Salvage value exists on [describe items] with estimated value of [amount]."
OR: "An inspection of the damaged property determined that there is no viable salvage opportunities associated with this claim."]


ACTION PLAN/PENDING ITEMS

[Either list numbered items:
1. Awaiting [document/approval/inspection]
2. [Next action item]
3. [Next action item]

OR state: "At this time, no further items are pending. Should any additional activity be required to conclude this claim, please contact us."]


RECOMMENDATION

Based on our inspection and the factors outlined in this report, we recommend [specific recommendation: claim payment, further investigation, denial, etc.]. [Add 1-2 sentences justifying the recommendation.]


DIARY DATE

[Either: "Next report expected on or before [Date] pending [reason]."
OR: "No diary date required at this time."]


Thank you for allowing FlacronAI to be of service to you on this loss.

---

FORMATTING RULES - FOLLOW STRICTLY:
1. NO asterisks anywhere
2. NO underscores for emphasis
3. NO markdown or special characters
4. Write plain text as if in Notepad
5. Section headers in ALL CAPS
6. Subsection headers in Title Case with colon
7. Professional insurance industry language
8. Be thorough and specific
9. NO preamble - start with "REMARKS"
10. End with "Thank you for allowing FlacronAI..."`;

  const rawContent = await generateContent(prompt);

  // Apply post-processing to strip any markdown that slipped through
  const cleanedContent = stripMarkdownFormatting(rawContent);

  return cleanedContent;
}

module.exports = {
  initializeGemini,
  getGeminiModel,
  getGeminiVisionModel,
  generateContent,
  analyzeImage,
  generateReport
};
