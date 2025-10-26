// AI Prompt Configuration for CRU GROUP Report Generation
// This prompt ensures exact formatting matching the official CRU GROUP Property Report Template

export const CRU_REPORT_PROMPT = `You are to generate a professional property inspection report using the exact structure, layout, and tone of the "CRU GROUP Property Report Template (Revised)".

Your output must replicate the original formatting — including section titles, indentation, spacing, and placeholders — exactly as in the official CRU Group format.

The report must include these main sections in this exact order:

1. **Today's Date** (at the top right)
2. **IAT Insurance Group address block** (left-aligned):
   IAT Insurance Group
   [Address Line 1]
   [Address Line 2]

3. **Attention and Claim Details Table**:
   Attn: [Client Adjuster's Name]
   Claim #: [Claim Number]
   Policy #: [Policy Number]
   Insured: [Insured Name]
   Loss Location: [Property Address]
   Date of Loss: [Loss Date]

4. **Introductory Paragraph**:
   "This will serve as our [Choose report type: First Report/Interim Report/Final Report] report on the above captioned property. We completed our inspection on [Inspection Date] and met with [Who was present]."

5. **ESTIMATED LOSS TABLE** with these exact 7 columns:
   | Description | Quantity | Unit Cost | Total | Depreciation | ACV | RCV |

6. **Property Description**:
   - Building type, construction, age, square footage
   - Number of bedrooms, bathrooms, stories
   - Roof type, foundation, exterior materials

7. **All Subsequent Sections in Exact Order**:

   **REMARKS**
   [Brief overview of the inspection and key findings]

   **RISK**
   [Property characteristics and risk factors]

   **ITV (Insurance to Value)**
   Estimated Replacement Cost: $[Amount]
   Policy Coverage: $[Amount]
   ITV Percentage: [Calculate percentage]

   **OCCURRENCE**
   Date of Loss: [Date]
   Cause of Loss: [Detailed description of what happened]
   Discovery: [How and when damage was discovered]

   **COVERAGE**
   Policy Type: [e.g., HO-3, HO-5]
   Dwelling Coverage: $[Amount]
   Other Structures: $[Amount]
   Contents: $[Amount]
   ALE/Loss of Use: $[Amount]
   Deductible: $[Amount]

   **DWELLING DAMAGE**
   [Detailed description of all structural damage to main dwelling]
   - Roof: [Specific damage]
   - Exterior: [Specific damage]
   - Interior: [Room-by-room damage]

   **OTHER STRUCTURES DAMAGE**
   [Damage to detached garage, shed, fence, etc.]

   **CONTENTS DAMAGE**
   [Damaged personal property and belongings]

   **ALE / FMV CLAIM**
   [Additional Living Expenses or Fair Market Value claim details]

   **SUBROGATION / SALVAGE**
   Subrogation Potential: [Yes/No and explanation]
   Salvage Value: $[Amount or None]

   **WORK TO BE COMPLETED / RECOMMENDATION**
   1. [Action item 1]
   2. [Action item 2]
   3. [Action item 3]
   [Continue as needed]

   **ASSIGNMENT**
   Inspector: [Inspector Name]
   Inspection Date: [Date]
   Report Date: [Date]
   File #: [Internal file number]

   **INSURED**
   Name: [Full name]
   Contact: [Phone and email]
   Occupancy: [Owner-occupied, Tenant, Vacant]

   **RISK** (Detailed)
   Property Type: [Single-family, Multi-family, etc.]
   Year Built: [Year]
   Square Footage: [SF]
   Construction Type: [Frame, Brick, etc.]
   Roof Type: [Composition shingle, Metal, etc.]
   Foundation: [Slab, Crawl space, Basement]

   **OWNERSHIP / INSURABLE INTEREST**
   [Confirm ownership and insurable interest]

   **LOSS AND ORIGIN**
   [Comprehensive description of the loss event and origin point]

   **DAMAGES** (Comprehensive Breakdown):

   **ROOF**
   - [Specific roof damages with measurements]

   **EXTERIOR**
   - Siding: [Condition and damage]
   - Windows: [Condition and damage]
   - Doors: [Condition and damage]
   - Foundation: [Condition and damage]

   **INTERIOR**
   - Living Room: [Damage description]
   - Kitchen: [Damage description]
   - Bedrooms: [Damage description]
   - Bathrooms: [Damage description]
   - Basement/Attic: [Damage description]

   **OTHER STRUCTURES**
   - Garage: [Damage description]
   - Shed: [Damage description]
   - Fence: [Damage description]

   **EXPERTS**
   Required Experts: [List any experts needed - engineer, electrician, plumber, etc.]

   **OFFICIAL REPORTS**
   Police Report: [Yes/No - Report #]
   Fire Report: [Yes/No - Report #]
   Other: [Any other official reports]

   **SUBROGATION** (Detailed)
   [Thorough analysis of subrogation potential]

   **SALVAGE** (Detailed)
   [Detailed salvage analysis and estimated values]

   **ACTION PLAN / PENDING ITEMS**
   1. [Pending item 1]
   2. [Pending item 2]
   3. [Pending item 3]

   **RECOMMENDATION**
   [Final recommendations for claim handling]

   **DIARY DATE**
   Follow-up Date: [Date]
   Reason: [Why follow-up is needed]

8. **Closing Statement and Signature Block**:
   "Should you have any questions or require additional information, please do not hesitate to contact our office.

   Respectfully submitted,

   [Inspector Name]
   CRU Group
   [Inspector Title]
   [Phone Number]
   [Email Address]"

9. **Attachments Section**:
   "ATTACHMENTS:
   - Estimate of Damages
   - Site Photographs
   - [Any other attachments]"

---

**Formatting Requirements:**

1. **Typography:**
   - Section titles: ALL UPPERCASE, Bold, 14pt
   - Subsection titles: Title Case, Bold, 12pt
   - Body text: 11pt, single spacing
   - Font: Calibri or Arial

2. **Spacing:**
   - Single space after periods
   - Double space between sections
   - 1.15 line spacing in paragraphs
   - 1-inch margins all around

3. **Tables:**
   - Bordered tables with header row shaded gray
   - Align currency values to the right
   - Align text to the left
   - Use consistent column widths

4. **Lists:**
   - Use numbered lists for sequential items
   - Use bullet points for non-sequential items
   - Indent sublists 0.5 inches

5. **Placeholders:**
   - Keep example placeholders like "[Inspector Name]", "[Choose an item]"
   - Use brackets [ ] for fillable fields
   - Use "Provide a brief overview..." as placeholder text for longer sections

6. **Headers/Footers:**
   - Header: "CRU GROUP | Property Inspection Report"
   - Footer: "Page [X] of [Y] | Claim #: [Claim Number] | Date: [Report Date]"

---

**Now generate the report using this exact format with the following data:**

Claim Number: {claimNumber}
Insured Name: {insuredName}
Loss Date: {lossDate}
Loss Type: {lossType}
Report Type: {reportType}
Property Address: {propertyAddress}
Property Details: {propertyDetails}
Loss Description: {lossDescription}
Damages Observed: {damages}
Recommendations: {recommendations}

**Output the final result in DOCX format preserving the CRU Group style exactly, with all tables, formatting, spacing, and structure matching the official template.**`;

export const getReportPrompt = (formData) => {
  return CRU_REPORT_PROMPT
    .replace('{claimNumber}', formData.claimNumber || '[Claim Number]')
    .replace('{insuredName}', formData.insuredName || '[Insured Name]')
    .replace('{lossDate}', formData.lossDate || '[Loss Date]')
    .replace('{lossType}', formData.lossType || '[Loss Type]')
    .replace('{reportType}', formData.reportType || '[Report Type]')
    .replace('{propertyAddress}', formData.propertyAddress || '[Property Address]')
    .replace('{propertyDetails}', formData.propertyDetails || '[Property Details]')
    .replace('{lossDescription}', formData.lossDescription || '[Loss Description]')
    .replace('{damages}', formData.damages || '[Damages Observed]')
    .replace('{recommendations}', formData.recommendations || '[Recommendations]');
};

export default {
  CRU_REPORT_PROMPT,
  getReportPrompt
};
