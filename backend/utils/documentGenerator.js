const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

// Generate DOCX from report data
const generateDOCX = async (report, options = {}) => {
  const { outputPath, companyName = 'FlacronAI', hideFlacronBranding = false } = options;

  // Build a DOCX from scratch using XML template
  const brandName = hideFlacronBranding ? companyName : 'FlacronAI';
  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sections = parseReportSections(report.content || '');

  // Build XML content for each section — with real table support
  const sectionXml = sections.map(sec => {
    const lines = sec.content.split('\n');
    const xmlParts = [];
    let tableRows = [];

    const flushDocxTable = () => {
      if (tableRows.length === 0) return;
      const cols = tableRows[0].length;
      const colWidthDxa = Math.floor(8640 / Math.max(cols, 1));
      let tblXml = `<w:tbl>
        <w:tblPr>
          <w:tblW w:w="8640" w:type="dxa"/>
          <w:tblBorders>
            <w:top w:val="single" w:sz="4" w:color="E2E8F0"/>
            <w:left w:val="single" w:sz="4" w:color="E2E8F0"/>
            <w:bottom w:val="single" w:sz="4" w:color="E2E8F0"/>
            <w:right w:val="single" w:sz="4" w:color="E2E8F0"/>
            <w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/>
            <w:insideV w:val="single" w:sz="4" w:color="E2E8F0"/>
          </w:tblBorders>
        </w:tblPr>`;
      tableRows.forEach((row, ri) => {
        const isHeader = ri === 0;
        const isTotal = row[0] && row[0].replace(/\*/g, '').trim().toUpperCase().startsWith('TOTAL');
        const fillColor = isHeader ? 'F97316' : isTotal ? 'FFF7ED' : (ri % 2 === 0 ? 'F8FAFC' : 'FFFFFF');
        tblXml += `<w:tr>`;
        row.forEach(cell => {
          const cellText = cell.trim().replace(/\*\*(.*?)\*\*/g, '$1');
          tblXml += `<w:tc>
            <w:tcPr>
              <w:tcW w:w="${colWidthDxa}" w:type="dxa"/>
              <w:shd w:val="clear" w:color="auto" w:fill="${fillColor}"/>
            </w:tcPr>
            <w:p><w:r><w:rPr>${isHeader || isTotal ? '<w:b/>' : ''}<w:color w:val="${isHeader ? 'FFFFFF' : '1E293B'}"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">${escapeXml(cellText)}</w:t></w:r></w:p>
          </w:tc>`;
        });
        tblXml += `</w:tr>`;
      });
      tblXml += `</w:tbl><w:p><w:r><w:t></w:t></w:r></w:p>`;
      xmlParts.push(tblXml);
      tableRows = [];
    };

    for (const line of lines) {
      if (line.startsWith('### ')) {
        flushDocxTable();
        xmlParts.push(`<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>${escapeXml(line.replace('### ', ''))}</w:t></w:r></w:p>`);
      } else if (line.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim() && !c.trim().match(/^[-:]+$/));
        if (cells.length > 0) tableRows.push(cells);
      } else if (line.trim() === '---') {
        flushDocxTable();
        xmlParts.push('<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="E2E8F0"/></w:pBdr></w:pPr></w:p>');
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        flushDocxTable();
        const text = line.trim().slice(2).replace(/\*\*(.*?)\*\*/g, '$1');
        xmlParts.push(`<w:p><w:pPr><w:ind w:left="360"/></w:pPr><w:r><w:t xml:space="preserve">• ${escapeXml(text)}</w:t></w:r></w:p>`);
      } else if (line.trim() === '') {
        flushDocxTable();
        xmlParts.push('<w:p><w:r><w:t></w:t></w:r></w:p>');
      } else {
        if (tableRows.length) flushDocxTable();
        const clean = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`(.*?)`/g, '$1');
        if (clean.trim()) {
          xmlParts.push(`<w:p><w:r><w:rPr><w:sz w:val="20"/><w:color w:val="374151"/></w:rPr><w:t xml:space="preserve">${escapeXml(clean)}</w:t></w:r></w:p>`);
        }
      }
    }
    flushDocxTable();

    return `
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:t>${escapeXml(sec.title)}</w:t></w:r>
    </w:p>
    ${xmlParts.join('\n')}`;
  }).join('\n');

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    <!-- Cover Header -->
    <w:p>
      <w:pPr><w:pStyle w:val="Title"/><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>INSURANCE INSPECTION REPORT</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:color w:val="F97316"/></w:rPr><w:t>Prepared by ${escapeXml(brandName)}</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <!-- Report Details Table -->
    <w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
        <w:tblW w:w="9000" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:color="E2E8F0"/>
          <w:left w:val="single" w:sz="4" w:color="E2E8F0"/>
          <w:bottom w:val="single" w:sz="4" w:color="E2E8F0"/>
          <w:right w:val="single" w:sz="4" w:color="E2E8F0"/>
          <w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/>
          <w:insideV w:val="single" w:sz="4" w:color="E2E8F0"/>
        </w:tblBorders>
      </w:tblPr>
      ${[
        ['Report Type', report.reportType || 'Initial'],
        ['Claim Number', report.claimNumber || ''],
        ['Insured Name', report.insuredName || ''],
        ['Property Address', report.propertyAddress || ''],
        ['Date of Loss', report.lossDate || ''],
        ['Loss Type', report.lossType || ''],
        ['Report Date', reportDate],
      ].map(([k, v]) => `
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(k)}</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:t>${escapeXml(v)}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>`).join('')}
    </w:tbl>

    <w:p><w:pPr><w:pageBreakBefore/></w:pPr><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

    <!-- Report Content -->
    ${sectionXml}

    <!-- Signature Block -->
    <w:p><w:pPr><w:pageBreakBefore/></w:pPr><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:t>Adjuster Certification</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t>I certify that the information contained in this report is accurate and complete to the best of my knowledge.</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">                                                    </w:t></w:r><w:r><w:t xml:space="preserve">  Signature</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">                                                    </w:t></w:r><w:r><w:t xml:space="preserve">  Date</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">                                                    </w:t></w:r><w:r><w:t xml:space="preserve">  Adjuster Name (Print)</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">                                                    </w:t></w:r><w:r><w:t xml:space="preserve">  License Number</w:t></w:r></w:p>

    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const zip = new PizZip();

  // Minimal DOCX structure
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

  zip.file('word/document.xml', docXml);
  zip.file('word/styles.xml', getDefaultStyles());

  const buf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(outputPath, buf);
  return outputPath;
};

const parseReportSections = (content) => {
  const sections = [];
  const lines = content.split('\n');
  let current = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { title: line.replace('## ', ''), content: '' };
    } else if (current) {
      current.content += line + '\n';
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : [{ title: 'Report Content', content }];
};

const escapeXml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const getDefaultStyles = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="22"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="52"/>
      <w:color w:val="0A0A0F"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
      <w:color w:val="F97316"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr><w:spacing w:before="200" w:after="80"/></w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="26"/>
      <w:color w:val="1E293B"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr>
      <w:sz w:val="22"/>
      <w:color w:val="374151"/>
    </w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
  </w:style>
</w:styles>`;

module.exports = { generateDOCX };
