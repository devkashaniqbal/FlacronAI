// Gemini AI Service for FlacronAI
const { generateContent, analyzeImage, generateReport } = require('../config/gemini');

/**
 * Generate insurance report using Gemini AI
 */
async function generateInsuranceReport(reportData) {
  try {
    console.log('Generating report with Gemini AI...');
    const reportText = await generateReport(reportData);
    return {
      success: true,
      content: reportText,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'gemini-1.5-pro',
        reportType: reportData.reportType,
        claimNumber: reportData.claimNumber
      }
    };
  } catch (error) {
    console.error('Report generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyze property damage images
 */
async function analyzeDamageImages(images) {
  try {
    const analyses = [];

    for (const image of images) {
      const prompt = `
        You are an expert property damage assessor. Analyze this image of property damage and provide:
        1. Type of damage visible
        2. Severity assessment (minor, moderate, severe, catastrophic)
        3. Affected areas/materials
        4. Potential causes
        5. Recommended actions

        Be specific and professional in your assessment.
      `;

      const analysis = await analyzeImage(image.data, prompt);
      analyses.push({
        imageId: image.id,
        imageName: image.name,
        analysis: analysis
      });
    }

    return {
      success: true,
      analyses: analyses
    };
  } catch (error) {
    console.error('Image analysis failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate executive summary from detailed report
 */
async function generateExecutiveSummary(fullReport) {
  try {
    const prompt = `
      Based on the following insurance inspection report, create a concise executive summary (2-3 paragraphs)
      that highlights the key findings, damage assessment, and primary recommendations:

      ${fullReport}

      The summary should be suitable for insurance adjusters and executives who need a quick overview.
    `;

    const summary = await generateContent(prompt);
    return {
      success: true,
      summary: summary
    };
  } catch (error) {
    console.error('Summary generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Enhance user input with AI suggestions
 */
async function enhanceReportInput(userInput) {
  try {
    const prompt = `
      You are assisting an insurance adjuster. Based on their brief notes, expand and professionalize
      the following description while maintaining accuracy:

      ${userInput}

      Provide a more detailed, professional version suitable for an official insurance report.
      Keep the same facts but improve clarity and professional language.
    `;

    const enhanced = await generateContent(prompt);
    return {
      success: true,
      enhanced: enhanced
    };
  } catch (error) {
    console.error('Input enhancement failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate scope of work based on damages
 */
async function generateScopeOfWork(damages, lossType) {
  try {
    const prompt = `
      As a construction and restoration expert, create a detailed scope of work for the following damages:

      Loss Type: ${lossType}
      Damages: ${damages}

      Provide:
      1. Step-by-step repair procedures
      2. Materials needed
      3. Estimated timeframe
      4. Special considerations
      5. Required trades/contractors

      Be specific and follow industry standards for ${lossType} restoration.
    `;

    const scope = await generateContent(prompt);
    return {
      success: true,
      scope: scope
    };
  } catch (error) {
    console.error('Scope generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Quality check generated report
 */
async function qualityCheckReport(reportContent) {
  try {
    const prompt = `
      Review the following insurance report and identify:
      1. Missing critical information
      2. Inconsistencies
      3. Areas that need more detail
      4. Professional language issues

      Report:
      ${reportContent}

      Provide a brief quality assessment and list of improvements needed.
    `;

    const review = await generateContent(prompt);
    return {
      success: true,
      review: review
    };
  } catch (error) {
    console.error('Quality check failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateInsuranceReport,
  analyzeDamageImages,
  generateExecutiveSummary,
  enhanceReportInput,
  generateScopeOfWork,
  qualityCheckReport
};
