// Document Generation Utility for FlacronAI - CRU Group Template Format
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');
const PDFDocument = require('pdfkit');

/**
 * Parse AI-generated content into structured sections
 */
function parseReportSections(aiContent) {
  const sections = {};
  const lines = aiContent.split('\n');
  let currentSection = 'header';
  let currentContent = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this is a section header (all caps or specific keywords)
    if (trimmed && (trimmed === trimmed.toUpperCase() ||
        ['REMARKS', 'RISK', 'ITV', 'OCCURRENCE', 'COVERAGE', 'ASSIGNMENT', 'INSURED', 'LOSS AND ORIGIN', 'DAMAGES', 'EXPERTS', 'OFFICIAL REPORTS', 'SUBROGATION', 'SALVAGE', 'ACTION PLAN', 'RECOMMENDATION', 'DIARY DATE'].some(keyword => trimmed.startsWith(keyword)))) {

      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n');
      }

      // Start new section
      currentSection = trimmed;
      currentContent = [];
    } else if (trimmed) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n');
  }

  return sections;
}

/**
 * Create formatted paragraphs from text content
 */
function createFormattedParagraphs(text) {
  const paragraphs = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      continue;
    }

    // Check if it's a bold header (ends with :)
    if (trimmed.endsWith(':') && trimmed.length < 50) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: trimmed, bold: true })],
        spacing: { before: 150, after: 100 }
      }));
    } else {
      paragraphs.push(new Paragraph({
        text: trimmed,
        spacing: { after: 100 }
      }));
    }
  }

  return paragraphs;
}

/**
 * Generate DOCX document from report content in CRU Group format
 */
async function generateDOCX(reportData, aiContent) {
  try {
    const currentDate = new Date().toLocaleDateString();

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 360,  // 0.25 inch - minimal margin
              right: 360,  // 0.25 inch
              bottom: 360,  // 0.25 inch
              left: 360  // 0.25 inch - no visible gap
            }
          }
        },
        children: [
          // Date at top
          new Paragraph({
            text: currentDate,
            spacing: { after: 200 }
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Company Header
          new Paragraph({
            text: "FlacronAI Insurance Services",
            bold: true,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Professional Property Inspection Reports",
            spacing: { after: 200 }
          }),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // Claim Information Section
          new Paragraph({
            children: [
              new TextRun({ text: "Client Claim #: ", bold: true }),
              new TextRun(reportData.claimNumber || 'N/A')
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Insured: ", bold: true }),
              new TextRun(reportData.insuredName || 'N/A')
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Loss Location: ", bold: true }),
              new TextRun(reportData.propertyAddress || 'N/A')
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Date of Loss: ", bold: true }),
              new TextRun(reportData.lossDate || 'N/A')
            ],
            spacing: { after: 200 }
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Paragraph({
            text: `This will serve as our ${reportData.reportType || 'inspection report'} on the above captioned assignment.`,
            spacing: { after: 400 }
          }),

          // ESTIMATED LOSS Table
          new Paragraph({
            children: [new TextRun({ text: "ESTIMATED LOSS:", bold: true })],
            spacing: { before: 200, after: 200 }
          }),

          new Paragraph({
            text: "The following reserves are suggested for damages observed to date:",
            spacing: { after: 200 }
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Coverage", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Limit", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Prior Reserve", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Change +/-", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Remaining Reserve", bold: true })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Dwelling")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Other Structures")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Personal Property")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] })
                ]
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { after: 400 } }),

          // AI Generated Content - Format with proper sections
          ...formatAIContent(aiContent),

          // Footer
          new Paragraph({ text: "", spacing: { before: 600 } }),

          new Paragraph({
            text: "Respectfully submitted,",
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Paragraph({
            text: "FlacronAI",
            bold: true,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "www.flacronai.com",
            spacing: { after: 200 }
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Paragraph({
            children: [new TextRun({ text: "Powered by IBM WatsonX AI & OpenAI", italics: true, size: 18 })],
            alignment: AlignmentType.CENTER
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    return {
      success: true,
      buffer: buffer,
      fileName: `${reportData.claimNumber}_${reportData.reportType}_${Date.now()}.docx`
    };
  } catch (error) {
    console.error('DOCX generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Clean markdown symbols from text - AGGRESSIVE CLEANING
 */
function cleanMarkdown(text) {
  if (!text) return '';

  return text
    // Remove ALL types of bold markers
    .replace(/\*\*(.+?)\*\*/g, '$1')  // **text**
    .replace(/__(.+?)__/g, '$1')       // __text__

    // Remove ALL types of italic markers
    .replace(/\*(.+?)\*/g, '$1')       // *text*
    .replace(/_(.+?)_/g, '$1')         // _text_

    // Remove bullet points with asterisks, dashes, or plus signs
    .replace(/^[\*\-\+]\s+/gm, '')

    // Remove markdown headers (keep the text only)
    .replace(/^#+\s+/gm, '')

    // Remove strikethrough
    .replace(/~~(.+?)~~/g, '$1')

    // Remove inline code markers
    .replace(/`(.+?)`/g, '$1')

    // Remove ALL remaining standalone asterisks
    .replace(/\*/g, '')

    // Remove ALL remaining underscores that are standalone
    .replace(/(?<!\w)_(?!\w)/g, '')

    // Clean up multiple spaces
    .replace(/\s+/g, ' ')

    .trim();
}

/**
 * Check if line starts with preamble text
 */
function isPreambleText(text) {
  const preamblePhrases = [
    'here is',
    'i have generated',
    'i\'ve generated',
    'below is',
    'following is',
    'i have created',
    'i\'ve created',
    'this is the',
    'as requested',
    'do not include',
    'stick to the facts',
    'avoid subjective',
    'focus on factual',
    'maintain objectivity',
    'be objective',
    'assume you have',
    'assume that you',
    'ensure the report',
    'ensure that the',
    'make sure the report',
    'make sure that',
    'remember to',
    'be sure to'
  ];
  const lower = text.toLowerCase();
  return preamblePhrases.some(phrase => lower.includes(phrase));
}

/**
 * Parse markdown text into TextRun objects with proper formatting
 */
function parseMarkdownToRuns(text) {
  const runs = [];
  let currentPos = 0;

  // Match bold text: **text** or __text__
  const boldRegex = /(\*\*|__)(.*?)\1/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > currentPos) {
      const plainText = text.substring(currentPos, match.index);
      if (plainText) runs.push(new TextRun({ text: plainText }));
    }

    // Add bold text
    runs.push(new TextRun({ text: match[2], bold: true }));
    currentPos = match.index + match[0].length;
  }

  // Add remaining text
  if (currentPos < text.length) {
    const remainingText = text.substring(currentPos);
    if (remainingText) runs.push(new TextRun({ text: remainingText }));
  }

  // If no markdown found, return plain text
  if (runs.length === 0) {
    runs.push(new TextRun({ text: text }));
  }

  return runs;
}

/**
 * Format AI content with proper section headers and styling for DOCX
 */
function formatAIContent(aiContent) {
  const paragraphs = [];
  const lines = aiContent.split('\n');

  const sectionHeaders = [
    'REMARKS', 'RISK', 'ITV', 'OCCURRENCE', 'COVERAGE', 'DWELLING DAMAGE',
    'OTHER STRUCTURES DAMAGE', 'CONTENTS DAMAGE', 'ALE', 'FMV', 'SUBROGATION',
    'SALVAGE', 'WORK TO BE COMPLETED', 'RECOMMENDATION', 'ASSIGNMENT',
    'INSURED', 'OWNERSHIP', 'LOSS AND ORIGIN', 'DAMAGES', 'DWELLING',
    'ROOF', 'EXTERIOR', 'INTERIOR', 'OTHER STRUCTURES', 'EXPERTS',
    'OFFICIAL REPORTS', 'ACTION PLAN', 'DIARY DATE', 'MORTGAGEE',
    'INSURABLE INTEREST', 'ALE / FMV CLAIM', 'SUBROGATION / SALVAGE',
    'WORK TO BE COMPLETED / RECOMMENDATION', 'OWNERSHIP / INSURABLE INTEREST'
  ];

  let skipPreamble = true; // Skip any preamble text at the start

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines - add a small spacing
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 80 } }));
      continue;
    }

    // Skip separator lines
    if (trimmed === '---' || trimmed === '___' || trimmed === '...') {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 150 } }));
      continue;
    }

    // Skip preamble text (first few lines that might be meta-commentary)
    if (skipPreamble && isPreambleText(trimmed)) {
      continue;
    }

    // Check if it's a bullet point (*, -, or + at start)
    const bulletMatch = trimmed.match(/^[\*\-\+]\s+(.+)$/);
    if (bulletMatch) {
      skipPreamble = false;
      const bulletText = bulletMatch[1];
      paragraphs.push(new Paragraph({
        children: parseMarkdownToRuns(bulletText),
        bullet: { level: 0 },
        spacing: { after: 80, line: 276 }
      }));
      continue;
    }

    // Check if it's a numbered list (1., 2., etc.)
    const numberMatch = trimmed.match(/^([0-9]+)\.\s+(.+)$/);
    if (numberMatch) {
      skipPreamble = false;
      const listText = numberMatch[2];
      paragraphs.push(new Paragraph({
        children: parseMarkdownToRuns(listText),
        numbering: { reference: "default-numbering", level: 0 },
        spacing: { after: 80, line: 276 }
      }));
      continue;
    }

    // Check if it's a major section header (without markdown)
    const cleanedForHeader = trimmed.replace(/\*\*/g, '');
    const isHeader = sectionHeaders.some(header =>
      cleanedForHeader.toUpperCase() === header ||
      cleanedForHeader.toUpperCase().startsWith(header + ':') ||
      cleanedForHeader.toUpperCase() === header + ':'
    );

    // Once we hit actual content, stop skipping
    if (isHeader || cleanedForHeader.match(/^[A-Z][A-Z\s]+:?$/)) {
      skipPreamble = false;
    }

    // Format major section headers
    if (isHeader) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({
          text: cleanedForHeader,
          bold: true,
          size: 22,  // 11pt
          allCaps: false
        })],
        spacing: { before: 240, after: 120 }
      }));
    }
    // Format subsections (ends with :)
    else if (trimmed.endsWith(':') && trimmed.length < 80 && !trimmed.includes('\n')) {
      const cleanedSubsection = trimmed.replace(/\*\*/g, '');
      paragraphs.push(new Paragraph({
        children: [new TextRun({
          text: cleanedSubsection,
          bold: true,
          size: 20  // 10pt
        })],
        spacing: { before: 120, after: 80 }
      }));
    }
    // Regular paragraph with markdown parsing
    else {
      paragraphs.push(new Paragraph({
        children: parseMarkdownToRuns(trimmed),
        spacing: {
          after: 80,
          line: 276  // 1.15 line spacing
        },
        alignment: AlignmentType.LEFT
      }));
    }
  }

  return paragraphs;
}

/**
 * Generate PDF document from report content with professional formatting
 */
function generatePDF(reportData, aiContent) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 0,  // Zero margin to maximize content space
        size: 'LETTER',
        bufferPages: true  // Enable page numbering
      });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          success: true,
          buffer: buffer,
          fileName: `${reportData.claimNumber}_${reportData.reportType}_${Date.now()}.pdf`
        });
      });

      // Professional Header - Centered with Claim Number
      doc.fontSize(28)
         .fillColor('#FF7C08')
         .font('Helvetica-Bold')
         .text('FLACRONAI', { align: 'center' });

      doc.moveDown(0.2);

      doc.fontSize(14)
         .fillColor('#333333')
         .font('Helvetica')
         .text('Insurance Inspection Report', { align: 'center' });

      doc.moveDown(0.3);

      // Claim Number prominently displayed in header
      doc.fontSize(11)
         .fillColor('#0d6efd')
         .font('Helvetica-Bold')
         .text(`Claim #: ${reportData.claimNumber || 'N/A'}`, { align: 'center' });

      doc.moveDown(1.5);

      // Report Information Section with Professional Layout
      const infoBoxY = doc.y;
      const pageWidth = doc.page.width;
      const boxWidth = pageWidth - (doc.page.margins.left + doc.page.margins.right);
      const contentPadding = 5;  // Minimal padding - no visible gap

      // Draw background box for info section
      doc.rect(doc.page.margins.left, infoBoxY, boxWidth, 150)
         .fillAndStroke('#f8f9fa', '#dee2e6');

      doc.fillColor('#000000');

      // Reset position for text with proper padding
      doc.y = infoBoxY + 15;

      doc.fontSize(12)
         .fillColor('#0d6efd')
         .font('Helvetica-Bold')
         .text('REPORT INFORMATION', doc.page.margins.left + contentPadding, doc.y);

      doc.moveDown(0.8);

      // Format info in two columns with proper spacing
      const leftCol = doc.page.margins.left + contentPadding;
      const rightCol = doc.page.margins.left + (boxWidth / 2) + contentPadding;
      const startY = doc.y;

      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica-Bold')
         .text('Claim Number:', leftCol, startY);
      doc.fontSize(9)
         .fillColor('#000000')
         .font('Helvetica')
         .text(reportData.claimNumber || 'N/A', leftCol + 85, startY);

      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica-Bold')
         .text('Loss Date:', rightCol, startY);
      doc.fontSize(9)
         .fillColor('#000000')
         .font('Helvetica')
         .text(reportData.lossDate || 'N/A', rightCol + 60, startY);

      doc.y = startY + 20;
      const row2Y = doc.y;

      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica-Bold')
         .text('Insured Name:', leftCol, row2Y);
      doc.fontSize(9)
         .fillColor('#000000')
         .font('Helvetica')
         .text(reportData.insuredName || 'N/A', leftCol + 85, row2Y);

      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica-Bold')
         .text('Loss Type:', rightCol, row2Y);
      doc.fontSize(9)
         .fillColor('#000000')
         .font('Helvetica')
         .text(reportData.lossType || 'N/A', rightCol + 60, row2Y);

      doc.y = row2Y + 20;
      const row3Y = doc.y;

      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica-Bold')
         .text('Property Address:', leftCol, row3Y);
      doc.fontSize(9)
         .fillColor('#000000')
         .font('Helvetica')
         .text(reportData.propertyAddress || 'N/A', leftCol + 100, row3Y, { width: boxWidth / 2 - 115 });

      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica-Bold')
         .text('Report Type:', rightCol, row3Y);
      doc.fontSize(9)
         .fillColor('#000000')
         .font('Helvetica')
         .text(reportData.reportType || 'N/A', rightCol + 65, row3Y);

      doc.y = row3Y + 35;
      const row4Y = doc.y;

      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica-Bold')
         .text('Report Date:', leftCol, row4Y);
      doc.fontSize(9)
         .fillColor('#000000')
         .font('Helvetica')
         .text(new Date().toLocaleDateString(), leftCol + 70, row4Y);

      // Move past the info box with proper spacing to prevent overlap
      doc.y = infoBoxY + 170;  // Increased from 160 to 170 to prevent text overlap
      doc.moveDown(0.5);  // Reduced from 1 to 0.5 for tighter spacing

      // Content Section Header
      doc.fontSize(12)
         .fillColor('#0d6efd')
         .font('Helvetica-Bold')
         .text('REPORT CONTENT');

      // Draw underline
      const lineY = doc.y + 5;
      doc.moveTo(doc.page.margins.left, lineY)
         .lineTo(doc.page.width - doc.page.margins.right, lineY)
         .strokeColor('#dee2e6')
         .lineWidth(1)
         .stroke();

      doc.moveDown(0.8);

      // Just render the content simply - no fancy boxes or tables
      formatPDFContent(doc, aiContent);

      // Add page numbers and headers to all pages
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        // No header on subsequent pages

        // Footer with page numbers on every page
        const footerY = doc.page.height - 50;

        doc.fontSize(8)
           .fillColor('#888888')
           .font('Helvetica')
           .text(`Page ${i + 1} of ${pageCount}`, doc.page.margins.left, footerY, {
             align: 'center',
             width: doc.page.width - (doc.page.margins.left + doc.page.margins.right)
           });

        doc.fontSize(7)
           .fillColor('#888888')
           .font('Helvetica-Oblique')
           .text('Generated with FlacronAI - https://flacronai.com', doc.page.margins.left, footerY + 12, {
             align: 'center',
             width: doc.page.width - (doc.page.margins.left + doc.page.margins.right)
           });
      }

      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      reject({
        success: false,
        error: error.message
      });
    }
  });
}

/**
 * Parse cost estimate data from AI content
 */
function parseCostEstimate(aiContent) {
  const costItems = [];
  const lines = aiContent.split('\n');
  let inCostSection = false;
  let totalCost = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect cost estimate section
    if (trimmed.match(/cost estimate|estimated cost|repair costs/i)) {
      inCostSection = true;
      continue;
    }

    // Exit cost section on next major heading
    if (inCostSection && trimmed.match(/^[A-Z][A-Z\s]+:?$/) && !trimmed.match(/cost/i)) {
      inCostSection = false;
    }

    // Parse cost items (e.g., "- Shingle replacement: $2,500" or "Roof repair - $1,200")
    if (inCostSection) {
      const costMatch = trimmed.match(/^[\-\*]?\s*(.+?)[\:\-]\s*\$?([\d,]+\.?\d*)/);
      if (costMatch) {
        const item = costMatch[1].trim();
        const cost = parseFloat(costMatch[2].replace(/,/g, ''));
        costItems.push({ item, cost });
        totalCost += cost;
      }
    }

    // Also look for total cost
    if (trimmed.match(/total.*cost.*\$?([\d,]+)/i)) {
      const totalMatch = trimmed.match(/\$?([\d,]+\.?\d*)/);
      if (totalMatch && totalCost === 0) {
        totalCost = parseFloat(totalMatch[1].replace(/,/g, ''));
      }
    }
  }

  return { costItems, totalCost };
}

/**
 * Draw cost estimate table in PDF
 */
function drawCostEstimateTable(doc, costItems, totalCost) {
  if (!costItems || costItems.length === 0) return;

  const tableTop = doc.y;
  const itemX = doc.page.margins.left;
  const costX = doc.page.width - doc.page.margins.right - 100;
  const rowHeight = 25;
  const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Table header
  doc.rect(itemX, tableTop, tableWidth, rowHeight)
     .fillAndStroke('#0d6efd', '#0d6efd');

  doc.fontSize(10)
     .fillColor('#ffffff')
     .font('Helvetica-Bold')
     .text('Item Description', itemX + 10, tableTop + 8, { width: tableWidth - 120 })
     .text('Cost', costX + 10, tableTop + 8, { width: 80, align: 'right' });

  doc.fillColor('#000000');

  // Table rows with alternating colors
  let currentY = tableTop + rowHeight;
  costItems.forEach((item, index) => {
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';

    doc.rect(itemX, currentY, tableWidth, rowHeight)
       .fillAndStroke(bgColor, '#dee2e6');

    doc.fontSize(9)
       .fillColor('#333333')
       .font('Helvetica')
       .text(item.item, itemX + 10, currentY + 8, { width: tableWidth - 120 })
       .text(`$${item.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
             costX + 10, currentY + 8, { width: 80, align: 'right' });

    currentY += rowHeight;
  });

  // Total row
  doc.rect(itemX, currentY, tableWidth, rowHeight)
     .fillAndStroke('#fff3cd', '#ffc107');

  doc.fontSize(10)
     .fillColor('#000000')
     .font('Helvetica-Bold')
     .text('Total Estimated Cost', itemX + 10, currentY + 8)
     .text(`$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
           costX + 10, currentY + 8, { width: 80, align: 'right' });

  doc.y = currentY + rowHeight + 8;  // Reduced from 15 to 8 for tighter spacing after table
}

/**
 * Draw Executive Summary call-out box
 */
function drawExecutiveSummary(doc, summaryText) {
  if (!summaryText) return;

  const boxY = doc.y;
  const boxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const contentPadding = 15;

  // Measure text height
  const textHeight = doc.heightOfString(summaryText, {
    width: boxWidth - (contentPadding * 2),
    align: 'left'
  });

  const boxHeight = textHeight + 50;

  // Draw call-out box with distinct styling
  doc.rect(doc.page.margins.left, boxY, boxWidth, boxHeight)
     .fillAndStroke('#e7f3ff', '#0d6efd');

  // Add "Executive Summary" label
  doc.fontSize(11)
     .fillColor('#0d6efd')
     .font('Helvetica-Bold')
     .text('EXECUTIVE SUMMARY', doc.page.margins.left + contentPadding, boxY + contentPadding);

  doc.moveDown(0.5);

  // Add summary content
  doc.fontSize(9)
     .fillColor('#000000')
     .font('Helvetica')
     .text(summaryText, doc.page.margins.left + contentPadding, doc.y, {
       width: boxWidth - (contentPadding * 2),
       align: 'left',
       lineGap: 3
     });

  doc.y = boxY + boxHeight + 8;  // Reduced from 15 to 8 for tighter spacing after summary box
}

/**
 * Extract Executive Summary from AI content
 */
function extractExecutiveSummary(aiContent) {
  const lines = aiContent.split('\n');
  let inSummary = false;
  let summaryLines = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.match(/executive summary|key findings|summary/i) && trimmed.match(/^[A-Z#]/)) {
      inSummary = true;
      continue;
    }

    if (inSummary && trimmed.match(/^[A-Z][A-Z\s]+:?$/) && !trimmed.match(/summary/i)) {
      break;
    }

    if (inSummary && trimmed && !trimmed.match(/^[\-\*#]/)) {
      summaryLines.push(trimmed);
    }
  }

  return summaryLines.join(' ').slice(0, 500);  // Limit to 500 chars for call-out
}

/**
 * Add status badge for recommendations
 */
function getRecommendationBadge(text) {
  const lower = text.toLowerCase();

  if (lower.match(/urgent|immediate|critical|emergency/)) {
    return { text: 'URGENT', color: '#dc3545', bgColor: '#f8d7da' };
  } else if (lower.match(/high priority|important|required/)) {
    return { text: 'HIGH PRIORITY', color: '#fd7e14', bgColor: '#fff3cd' };
  } else if (lower.match(/medium|moderate|recommend/)) {
    return { text: 'RECOMMENDED', color: '#0d6efd', bgColor: '#cfe2ff' };
  } else {
    return { text: 'STANDARD', color: '#6c757d', bgColor: '#e2e3e5' };
  }
}

/**
 * Render text with markdown bold formatting in PDF
 */
function renderMarkdownTextPDF(doc, text, options = {}) {
  const fontSize = options.fontSize || 10;
  const indent = options.indent || 0;
  const lineGap = options.lineGap || 2;

  doc.fontSize(fontSize).fillColor('#000000');

  // Split text by bold markers
  const parts = [];
  let currentPos = 0;
  const boldRegex = /(\*\*|__)(.*?)\1/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > currentPos) {
      parts.push({ text: text.substring(currentPos, match.index), bold: false });
    }
    // Add bold text
    parts.push({ text: match[2], bold: true });
    currentPos = match.index + match[0].length;
  }

  // Add remaining text
  if (currentPos < text.length) {
    parts.push({ text: text.substring(currentPos), bold: false });
  }

  // If no markdown found, render as plain text with proper wrapping
  if (parts.length === 0) {
    doc.font('Helvetica').text(text, {
      indent: indent,
      lineGap: lineGap,
      align: 'left',
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right - indent
    });
    return;
  }

  // Render parts with mixed formatting using continued option properly
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const font = part.bold ? 'Helvetica-Bold' : 'Helvetica';
    doc.font(font);

    // Render the text part with proper continuation
    doc.text(part.text, {
      continued: i < parts.length - 1,
      lineGap: lineGap,
      indent: i === 0 ? indent : 0,
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right - (i === 0 ? indent : 0)
    });
  }
}

/**
 * Strip sections that are already rendered elsewhere to prevent duplication
 */
function stripAlreadyRenderedSections(aiContent) {
  const forbiddenSections = [
    'EXECUTIVE SUMMARY',
    'COST ESTIMATE',
    'ESTIMATED COST',
    'CLAIM INFORMATION',
    'REPORT INFORMATION'
  ];

  const lines = aiContent.split('\n');
  let cleaned = [];
  let skip = false;

  for (const line of lines) {
    const upper = line.trim().toUpperCase();

    if (forbiddenSections.some(h => upper.startsWith(h))) {
      skip = true;
      continue;
    }

    if (skip && upper.match(/^[A-Z][A-Z\s]+:?$/)) {
      skip = false;
    }

    if (!skip) cleaned.push(line);
  }

  return cleaned.join('\n');
}

/**
 * Format PDF content with proper headings, bullets, and formatting
 */
function formatPDFContent(doc, aiContent) {
  // Strip already-rendered sections to prevent duplication
  const safeAIContent = stripAlreadyRenderedSections(aiContent);
  const lines = safeAIContent.split('\n');

  const sectionHeaders = [
    'REMARKS', 'RISK', 'ITV', 'OCCURRENCE', 'COVERAGE', 'DWELLING DAMAGE',
    'OTHER STRUCTURES DAMAGE', 'CONTENTS DAMAGE', 'ALE', 'FMV', 'SUBROGATION',
    'SALVAGE', 'WORK TO BE COMPLETED', 'RECOMMENDATION', 'ASSIGNMENT',
    'INSURED', 'OWNERSHIP', 'LOSS AND ORIGIN', 'DAMAGES', 'DWELLING',
    'ROOF', 'EXTERIOR', 'INTERIOR', 'OTHER STRUCTURES', 'EXPERTS',
    'OFFICIAL REPORTS', 'ACTION PLAN', 'DIARY DATE', 'MORTGAGEE',
    'INSURABLE INTEREST', 'ALE / FMV CLAIM', 'SUBROGATION / SALVAGE',
    'WORK TO BE COMPLETED / RECOMMENDATION', 'PROPERTY DETAILS', 'LOSS DESCRIPTION',
    'SCOPE OF DAMAGE', 'DAMAGE ASSESSMENT', 'RECOMMENDATIONS', 'CONCLUSION',
    'EXECUTIVE SUMMARY', 'CLAIM INFORMATION'
  ];

  let skipPreamble = true;
  const renderedSections = new Set();  // Track which sections we've already rendered to prevent duplicates

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line || line === '---' || line === '___') {
      doc.moveDown(0.15);  // Reduced from 0.3 to 0.15 for tighter spacing
      continue;
    }

    // Convert markdown headings to section headers (but skip generic ones like "# INSURANCE CLAIM REPORT")
    const markdownHeadingMatch = line.match(/^(#+)\s+(.+)$/);
    if (markdownHeadingMatch) {
      const headingText = markdownHeadingMatch[2].trim();
      const upperHeading = headingText.toUpperCase();

      // Skip generic report title headings
      if (upperHeading === 'INSURANCE CLAIM REPORT' || upperHeading === 'INSPECTION REPORT') {
        continue;
      }

      // Convert to section header
      const normalizedHeader = upperHeading;

      // Skip duplicate sections
      if (renderedSections.has(normalizedHeader)) {
        continue;
      }

      renderedSections.add(normalizedHeader);
      skipPreamble = false;

      doc.moveDown(0.4);
      doc.fontSize(12)
         .fillColor('#0d6efd')
         .font('Helvetica-Bold')
         .text(headingText);

      const headerLineY = doc.y + 3;
      doc.moveTo(doc.page.margins.left, headerLineY)
         .lineTo(doc.page.width - doc.page.margins.right, headerLineY)
         .strokeColor('#dee2e6')
         .lineWidth(0.5)
         .stroke();

      doc.moveDown(0.3);
      continue;
    }

    // Skip preamble text
    if (isPreambleText(line)) {
      continue;
    }

    // Check if it's a bullet point (*, -, or + at start)
    const bulletMatch = line.match(/^[\*\-\+]\s+(.+)$/);
    if (bulletMatch) {
      const bulletText = bulletMatch[1];

      // Skip if it's an AI instruction bullet
      if (isPreambleText(bulletText)) {
        continue;
      }

      skipPreamble = false;
      doc.fontSize(10).fillColor('#000000').font('Helvetica');
      doc.text('• ', { continued: true });
      renderMarkdownTextPDF(doc, bulletText, { indent: 0, lineGap: 1 });
      doc.moveDown(0.05);
      continue;
    }

    // Check if it's a numbered list (1., 2., etc.)
    const numberMatch = line.match(/^([0-9]+)\.\s+(.+)$/);
    if (numberMatch) {
      skipPreamble = false;
      const number = numberMatch[1];
      const listText = numberMatch[2];

      // Check if this is in a Recommendation section (look back further to catch all items)
      const isRecommendation = i > 0 && lines.slice(Math.max(0, i - 30), i).some(prevLine =>
        prevLine.trim().match(/RECOMMENDATION|ACTION PLAN|WORK TO BE COMPLETED/i)
      );

      if (isRecommendation) {
        // Add status badge for recommendations
        const badge = getRecommendationBadge(listText);
        const badgeY = doc.y;

        // Draw badge
        doc.roundedRect(doc.page.margins.left, badgeY, 85, 16, 3)
           .fillAndStroke(badge.bgColor, badge.color);

        doc.fontSize(7)
           .fillColor(badge.color)
           .font('Helvetica-Bold')
           .text(badge.text, doc.page.margins.left + 5, badgeY + 4, { width: 75, align: 'center' });

        doc.y = badgeY;
        doc.fontSize(10).fillColor('#000000')
           .font('Helvetica-Bold')
           .text(`${number}. `, doc.page.margins.left + 95, doc.y, { continued: true });

        doc.font('Helvetica');
        renderMarkdownTextPDF(doc, listText, { indent: 0, lineGap: 1 });
      } else {
        // Carrier-grade inline numbering
        doc.fontSize(10).fillColor('#000000')
           .font('Helvetica-Bold')
           .text(`${number}. `, { continued: true });

        doc.font('Helvetica');
        renderMarkdownTextPDF(doc, listText, { indent: 0, lineGap: 1 });
      }

      doc.moveDown(0.05);  // Reduced from 0.1 to 0.05 for tighter list spacing
      continue;
    }

    // Check if it's a major section header (without markdown)
    const cleanedForHeader = line.replace(/\*\*/g, '');

    // Only match if line starts with ## (markdown h2) or is ALL CAPS section header
    const isMarkdownHeader = line.startsWith('##');
    const isAllCapsHeader = cleanedForHeader === cleanedForHeader.toUpperCase() &&
                           cleanedForHeader.length > 3 &&
                           !cleanedForHeader.includes(':') &&
                           sectionHeaders.some(header => cleanedForHeader === header);

    const isHeader = isMarkdownHeader || isAllCapsHeader;

    // Once we hit actual content, stop skipping
    if (isHeader || cleanedForHeader.match(/^[A-Z][A-Z\s]+:?$/)) {
      skipPreamble = false;
    }

    if (isHeader) {
      // Remove ## markdown symbols if present
      const headerText = cleanedForHeader.replace(/^##\s*/, '');
      const normalizedHeader = headerText.toUpperCase().trim();

      // Skip duplicate sections (like duplicate "Executive Summary" or "Claim Information")
      if (renderedSections.has(normalizedHeader)) {
        // Skip until we find the next section header
        let skipUntilNextSection = true;
        while (i < lines.length - 1 && skipUntilNextSection) {
          i++;
          const nextLine = lines[i].trim();
          const nextCleaned = nextLine.replace(/\*\*/g, '');
          const nextIsHeader = nextLine.startsWith('##') ||
                              (nextCleaned === nextCleaned.toUpperCase() &&
                               nextCleaned.length > 3 &&
                               sectionHeaders.some(h => nextCleaned === h));
          if (nextIsHeader) {
            i--; // Go back one so the next iteration processes this header
            skipUntilNextSection = false;
          }
        }
        continue;
      }

      // Mark this section as rendered
      renderedSections.add(normalizedHeader);

      doc.moveDown(0.4);  // Reduced from 0.7 to 0.4 for tighter spacing before section headers
      doc.fontSize(12)
         .fillColor('#0d6efd')
         .font('Helvetica-Bold')
         .text(headerText);

      // Draw underline for major sections
      const headerLineY = doc.y + 3;
      doc.moveTo(doc.page.margins.left, headerLineY)
         .lineTo(doc.page.width - doc.page.margins.right, headerLineY)
         .strokeColor('#dee2e6')
         .lineWidth(0.5)
         .stroke();

      doc.moveDown(0.3);  // Reduced from 0.5 to 0.3 for tighter spacing after section headers
    }
    // Check if it's a subsection (ends with :)
    else if (line.endsWith(':') && line.length < 80) {
      const cleanedSubsection = line.replace(/\*\*/g, '');
      doc.moveDown(0.25);  // Reduced from 0.4 to 0.25 for tighter spacing before subsections
      doc.fontSize(10)
         .fillColor('#333333')
         .font('Helvetica-Bold')
         .text(cleanedSubsection);
      doc.moveDown(0.15);  // Reduced from 0.2 to 0.15 for tighter spacing after subsections
    }
    // Regular paragraph with markdown parsing
    else {
      renderMarkdownTextPDF(doc, line, { lineGap: 1 });  // Reduced from 2 to 1 for tighter line spacing
    }
  }
}

/**
 * Generate HTML version of report
 */
function generateHTML(reportData, aiContent) {
  // Clean markdown from AI content
  const cleanedContent = cleanMarkdown(aiContent);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insurance Report - ${reportData.claimNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #FF7C08;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #FF7C08;
            font-size: 32px;
            margin-bottom: 10px;
        }
        .header h2 {
            color: #0d6efd;
            font-size: 24px;
        }
        .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-left: 4px solid #0d6efd;
            margin-bottom: 30px;
        }
        .info-section h3 {
            color: #0d6efd;
            margin-bottom: 15px;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            min-width: 150px;
            color: #555;
        }
        .info-value {
            color: #333;
        }
        .content-section {
            margin-top: 30px;
        }
        .content-section h3 {
            color: #0d6efd;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .content-text {
            text-align: justify;
            white-space: pre-line;
            line-height: 1.8;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
            font-style: italic;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FLACRONAI</h1>
            <h2>Insurance Inspection Report</h2>
        </div>

        <div class="info-section">
            <h3>Report Information</h3>
            <div class="info-row">
                <div class="info-label">Claim Number:</div>
                <div class="info-value">${reportData.claimNumber || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Insured Name:</div>
                <div class="info-value">${reportData.insuredName || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Property Address:</div>
                <div class="info-value">${reportData.propertyAddress || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Loss Date:</div>
                <div class="info-value">${reportData.lossDate || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Loss Type:</div>
                <div class="info-value">${reportData.lossType || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Report Type:</div>
                <div class="info-value">${reportData.reportType || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Report Date:</div>
                <div class="info-value">${new Date().toLocaleDateString()}</div>
            </div>
        </div>

        <div class="content-section">
            <h3>Report Content</h3>
            <div class="content-text">${cleanedContent}</div>
        </div>

        <div class="footer">
            <p>Generated with FlacronAI - <a href="https://flacronai.com">https://flacronai.com</a></p>
            <p>Powered by IBM WatsonX AI & OpenAI</p>
        </div>
    </div>
</body>
</html>
  `;

  return {
    success: true,
    html: htmlContent,
    fileName: `${reportData.claimNumber}_${reportData.reportType}_${Date.now()}.html`
  };
}

module.exports = {
  generateDOCX,
  generatePDF,
  generateHTML
};
