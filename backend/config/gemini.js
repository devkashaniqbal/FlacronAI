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

    // Use Gemini 2.5 Flash for report generation
    model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
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
    model: 'gemini-2.5-flash',
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
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      stack: error.stack
    });

    // Provide more specific error messages
    if (error.message && error.message.includes('fetch failed')) {
      throw new Error('Network error: Unable to connect to Google AI. Please check your internet connection and firewall settings.');
    } else if (error.message && (error.message.includes('API key') || error.message.includes('API_KEY_INVALID'))) {
      throw new Error('Invalid API key. Please check your GEMINI_API_KEY environment variable.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 400) {
      throw new Error('Invalid request to Gemini API. The model may not support the requested parameters.');
    } else if (error.message && error.message.includes('models/')) {
      throw new Error(`Invalid model name. Error: ${error.message}`);
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

  const prompt = `You are a professional insurance claims adjuster writing a property inspection report for CRU GROUP.

CRITICAL INSTRUCTIONS:
1. Use ONLY these exact section headers with "## " prefix (## REMARKS, ## RISK, etc.)
2. Each section header must be on its own line
3. Write in plain text - NO asterisks, NO underscores, NO markdown formatting
4. The example content below shows the style and format to follow
5. Adapt the example content to match the specific claim data provided
6. Keep the same professional tone and detail level as the examples
7. Do NOT copy the examples exactly - customize them for THIS specific claim

CLAIM DATA TO USE:
Claim Number: ${reportData.claimNumber}
Insured Name: ${reportData.insuredName}
Property Address: ${reportData.propertyAddress}
Date of Loss: ${reportData.lossDate}
Loss Type: ${reportData.lossType}
Inspection Date: ${currentDate}
${reportData.propertyDetails ? `Property Details: ${reportData.propertyDetails}` : ''}
${reportData.damages ? `Damages Reported: ${reportData.damages}` : ''}

GENERATE THE REPORT IN THIS EXACT SECTION ORDER (adapt example content for this claim):

## REMARKS

Thank you for the assignment. An inspection was conducted on ${currentDate}. This report details our findings regarding the ${reportData.lossType} loss at the insured property.

## RISK

The risk is a single-family residential dwelling located at ${reportData.propertyAddress}.

CONSTRUCTION: The structure is wood-frame construction with asphalt shingle roofing, approximately 15-20 years old based on construction style typical of the ${reportData.propertyAddress.split(',').slice(-2).join(',').trim()} region. The exterior is vinyl siding in good condition. The foundation is slab construction. The dwelling is approximately 1,800-2,200 square feet of finished living space with main level and upper level layout.

REGIONAL CHARACTERISTICS: Based on the property location in ${reportData.propertyAddress.split(',').slice(-2).join(',').trim()}, the construction reflects typical regional characteristics common to this area.

The occupancy is consistent with the policy declarations as a primary residence. Overall property condition is good prior to this loss.

## ITV (Insurance to Value)

Based on the property size, construction quality, and current market conditions in ${reportData.propertyAddress.split(',').slice(-2).join(',').trim()}, the limit of insurance appears adequate for this risk.

## OCCURRENCE

On ${reportData.lossDate}, a ${reportData.lossType} loss occurred at the insured location resulting in property damage. The loss was discovered by the insured and reported immediately. The damage resulted in visible impacts to the interior and exterior of the dwelling. Emergency mitigation services were contacted and responded to the scene. The property remains occupied with ongoing mitigation efforts in progress. The cause of loss is confirmed as ${reportData.lossType} per field inspection and documentation.

## COVERAGE

The risk is insured with the above stated limits, policy forms, and deductible. All aspects pertaining to coverage are submitted for the carrier's review and final disposition. No pertinent exclusions or limitations were observed during our inspection.

## DWELLING DAMAGE

EXTERIOR: The roof is asphalt shingle construction in fair condition with ${reportData.lossType} related damage observed. All four elevations show vinyl siding in good condition with minimal damage at this time. Windows and doors appear functional with no significant damage. Foundation is stable with no visible cracks or settlement issues related to this loss.

INTERIOR ASSESSMENT BY LEVEL:

MAIN LEVEL - Kitchen: Hardwood flooring shows water damage across approximately 120 square feet. Lower cabinets along the east wall (8 linear feet) require replacement. Drywall requires 2-foot flood cut along affected walls. Dishwasher appears damaged and requires replacement.

MAIN LEVEL - Living Room: Carpet flooring damaged across 200 square feet requiring replacement. Baseboards along south wall (12 linear feet) damaged. No ceiling damage observed.

MAIN LEVEL - Powder Room: Vinyl flooring intact. Minor wall damage to drywall behind toilet. Fixtures operational.

UPPER LEVEL - Master Bedroom: No visible damage observed during inspection.

UPPER LEVEL - Master Bathroom: No visible damage observed during inspection.

UPPER LEVEL - Bedroom 2: No visible damage observed during inspection.

UPPER LEVEL - Bedroom 3: No visible damage observed during inspection.

Emergency mitigation services have been deployed and dehumidification equipment is currently operating on site.

## OTHER STRUCTURES DAMAGE

No damage to other structures was observed during our inspection. The detached garage, fencing, and other outbuildings remain in pre-loss condition.

## CONTENTS DAMAGE

The insured sustained minor damage to contents and personal property in the affected areas. Items include furniture, area rugs, and stored items in the kitchen area. A detailed contents inventory is being prepared by the insured.

## ALE / FMV CLAIM

The risk did not become uninhabitable as a result of this loss. The property remains safe for occupancy during repairs. Additional Living Expenses (ALE) claims are not anticipated at this time.

## SUBROGATION / SALVAGE

Our investigation did not reveal any third-party liability; therefore, subrogation potential is not present at this time. This appears to be a standard ${reportData.lossType} loss without negligence from external parties.

## WORK TO BE COMPLETED / RECOMMENDATION

ESTIMATED REPAIR COSTS:

Emergency Mitigation: Water extraction services 850.00, Dehumidification equipment 3 days 675.00, Air movers and fans 425.00, Antimicrobial treatment 350.00 - Subtotal Mitigation 2,300.00

Demolition and Removal: Remove wet drywall 80 SF at 1.50/SF 120.00, Remove wet flooring 320 SF at 2.25/SF 720.00, Remove baseboards 20 LF 60.00, Remove cabinets 8 LF 240.00, Debris removal 450.00 - Subtotal Demo 1,590.00

Reconstruction: Replace drywall 80 SF at 3.50/SF 280.00, Texture and paint 80 SF 240.00, Replace hardwood flooring 120 SF at 8.50/SF 1,020.00, Replace carpet 200 SF at 4.50/SF 900.00, Replace baseboards 20 LF at 4.00/LF 80.00, Replace lower cabinets 8 LF at 175/LF 1,400.00, Dishwasher replacement 650.00, Plumbing repairs 425.00 - Subtotal Reconstruction 4,995.00

TOTAL ESTIMATED REPAIR COST: 8,885.00

SCOPE OF WORK: Continue dehumidification until moisture readings reach acceptable levels. Remove all wet materials including drywall, flooring, and damaged cabinets. Apply antimicrobial treatment to affected framing and subfloors. Document moisture readings before reconstruction. Replace all removed materials with like kind and quality. Test all plumbing repairs and verify proper drainage upon completion.

PAYMENT RECOMMENDATION: Based on our inspection and the factors outlined in this report, we recommend payment of claim on an ACV basis totaling approximately 8,885.00 for dwelling repairs, subject to policy terms and deductible.

Thank you for the opportunity to be of service to you and your policyholders.


## ASSIGNMENT

Assignment was received on ${currentDate} to inspect the insured property damages resulting from ${reportData.lossType}. Contact was established with the insured on ${currentDate} and inspection of the risk was completed on ${currentDate}. The insured and our inspector were present during the inspection. A full inspection was conducted for the ${reportData.lossType} damages at the risk location. Our findings are outlined in this report for your review and consideration.

## INSURED

Named insured is confirmed to be ${reportData.insuredName} which matches the provided policy information. Contact information is on file with the carrier.

## OWNERSHIP / INSURABLE INTEREST

Property ownership confirmed with insured. Mortgagee information to be confirmed with carrier records.

## LOSS AND ORIGIN

CONFIRMED DATE OF LOSS: ${reportData.lossDate}
CONFIRMED CAUSE OF LOSS: ${reportData.lossType}

DETAILED LOSS DESCRIPTION: The loss was discovered by the insured on ${reportData.lossDate} when water was observed in the main level kitchen and living room areas. The insured immediately contacted a water mitigation company who responded within two hours. Investigation revealed the ${reportData.lossType} loss originated from a failed supply line connection under the kitchen sink. The water flowed for approximately 3-4 hours before discovery, affecting the main level flooring and lower cabinets. The property remains occupied with mitigation equipment currently in operation. Weather conditions were not a contributing factor. The age and condition of the plumbing connections appear to be contributing factors in this loss.


## DAMAGES

ROOF: The roof is 3-tab asphalt shingle construction, gray in color, approximately 15 years old, in fair condition. Single layer installation. Medium slope pitch approximately 6/12. Drip edge present on eaves and gables. Ridge vent ventilation appears adequate. Flashing at chimney and penetrations shows normal wear. Aluminum gutters in good condition. No related ${reportData.lossType} damage observed to roof system.

EXTERIOR ELEVATIONS:

Front Elevation: Vinyl siding beige color in good condition. Three double-hung vinyl windows operational. Entry door fiberglass construction good condition. Foundation visible slab construction no cracks observed. No landscaping impact. No visible damages observed to front elevation related to this loss.

Right Elevation: Vinyl siding good condition. Two windows operational. No visible damages observed.

Left Elevation: Vinyl siding good condition. Kitchen window above sink location. No visible damages observed to siding.

Rear Elevation: Vinyl siding good condition. Sliding glass door to patio operational. Small concrete patio in good condition. No visible damages observed.

INTERIOR: Kitchen shows water damage to hardwood flooring approximately 120 square feet and lower cabinets 8 linear feet along east wall. Living room carpet damaged approximately 200 square feet. Drywall in kitchen requires 2-foot flood cut along affected walls. All upper level rooms show no visible damage.

## EXPERTS

No experts were retained or recommended for this loss.

## OFFICIAL REPORTS

No official reports were provided or pending with this assignment.

## SUBROGATION

Subrogation Potential: No

Our investigation did not reveal any third-party liability or product defects; therefore, subrogation potential is not present at this time.

## SALVAGE

An inspection of the damaged property determined that there are no viable salvage opportunities associated with this claim.

## ACTION PLAN/PENDING ITEMS

At this time, no further items are pending. Should any additional activity be required to conclude this claim, please contact us.

## RECOMMENDATION

Based on our inspection and the factors outlined in this report, we recommend claim payment for the damages sustained. The scope of damage is consistent with the reported ${reportData.lossType} loss and repairs can proceed once authorization is received.

## DIARY DATE

No diary date required at this time.

Thank you for allowing FlacronAI to be of service to you on this loss.`;

  const rawContent = await generateContent(prompt);

  // DO NOT strip markdown - preserve formatting for document generators
  // const cleanedContent = stripMarkdownFormatting(rawContent);

  return rawContent;
}

module.exports = {
  initializeGemini,
  getGeminiModel,
  getGeminiVisionModel,
  generateContent,
  analyzeImage,
  generateReport
};
