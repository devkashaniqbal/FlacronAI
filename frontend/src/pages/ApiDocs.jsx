import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/api-docs.css';

const ApiDocs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'rate-limits', label: 'Rate Limits' },
    { id: 'endpoints', label: 'Endpoints' },
    { id: 'reports', label: 'Reports API' },
    { id: 'errors', label: 'Error Handling' },
    { id: 'examples', label: 'Code Examples' },
  ];

  const codeExamples = {
    curlGenerate: `curl -X POST https://api.flacronai.com/api/reports/generate \\
  -H "X-API-Key: flac_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "claimNumber": "CLM-2024-001234",
    "insuredName": "John Smith",
    "propertyAddress": "123 Main Street, Austin, TX 78701",
    "lossDate": "2024-01-15",
    "lossType": "Water Damage",
    "reportType": "Field Inspection"
  }'`,

    nodeExample: `const axios = require('axios');

const API_KEY = 'flac_live_your_api_key_here';
const BASE_URL = 'https://api.flacronai.com/api';

async function generateReport(reportData) {
  try {
    const response = await axios.post(\`\${BASE_URL}/reports/generate\`, reportData, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('Report generated:', response.data.reportId);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
generateReport({
  claimNumber: 'CLM-2024-001234',
  insuredName: 'John Smith',
  propertyAddress: '123 Main Street, Austin, TX 78701',
  lossDate: '2024-01-15',
  lossType: 'Water Damage',
  reportType: 'Field Inspection'
});`,

    pythonExample: `import requests

API_KEY = 'flac_live_your_api_key_here'
BASE_URL = 'https://api.flacronai.com/api'

def generate_report(report_data):
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }

    response = requests.post(
        f'{BASE_URL}/reports/generate',
        json=report_data,
        headers=headers
    )

    if response.status_code == 200:
        data = response.json()
        print(f"Report generated: {data['reportId']}")
        return data
    else:
        print(f"Error: {response.json()}")
        raise Exception(response.json().get('error'))

# Usage
report_data = {
    'claimNumber': 'CLM-2024-001234',
    'insuredName': 'John Smith',
    'propertyAddress': '123 Main Street, Austin, TX 78701',
    'lossDate': '2024-01-15',
    'lossType': 'Water Damage',
    'reportType': 'Field Inspection'
}

generate_report(report_data)`,

    exportExample: `// Export report to PDF
const exportReport = async (reportId, format = 'pdf') => {
  const response = await fetch(\`\${BASE_URL}/reports/\${reportId}/export\`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ format })
  });

  const data = await response.json();
  console.log('Download URL:', data.downloadUrl);
  return data;
};`
  };

  return (
    <div className="api-docs-page">
      <Navbar />

      <div className="api-docs-container">
        {/* Sidebar Navigation */}
        <aside className="api-docs-sidebar">
          <div className="sidebar-header">
            <h3>API Documentation</h3>
            <span className="api-version">v1.0</span>
          </div>
          <nav className="sidebar-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
          {user ? (
            <button className="get-api-key-btn" onClick={() => navigate('/settings')}>
              Manage API Keys
            </button>
          ) : (
            <button className="get-api-key-btn" onClick={() => navigate('/auth')}>
              Get API Key
            </button>
          )}
        </aside>

        {/* Main Content */}
        <main className="api-docs-content">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <section className="doc-section">
              <h1>FlacronAI API Overview</h1>
              <p className="intro-text">
                The FlacronAI API allows you to programmatically generate AI-powered insurance
                inspection reports. Integrate our technology directly into your workflow, CRM,
                or custom applications.
              </p>

              <div className="info-cards">
                <div className="info-card">
                  <h3>Base URL</h3>
                  <code>https://api.flacronai.com/api</code>
                </div>
                <div className="info-card">
                  <h3>Format</h3>
                  <p>All requests and responses are in JSON format</p>
                </div>
                <div className="info-card">
                  <h3>HTTPS Only</h3>
                  <p>All API requests must be made over HTTPS</p>
                </div>
              </div>

              <h2>Quick Start</h2>
              <ol className="quick-start-steps">
                <li>
                  <strong>Get your API key</strong> - Generate an API key from your
                  <a href="/settings"> Settings page</a> (Professional tier or higher required)
                </li>
                <li>
                  <strong>Make your first request</strong> - Use your API key in the X-API-Key header
                </li>
                <li>
                  <strong>Generate reports</strong> - Start creating AI-powered inspection reports
                </li>
              </ol>
            </section>
          )}

          {/* Authentication Section */}
          {activeSection === 'authentication' && (
            <section className="doc-section">
              <h1>Authentication</h1>
              <p>
                The FlacronAI API uses API keys for authentication. Include your API key in
                the <code>X-API-Key</code> header with every request.
              </p>

              <h2>API Key Format</h2>
              <p>API keys follow this format: <code>flac_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code></p>

              <div className="warning-box">
                <strong>Keep your API keys secure!</strong>
                <p>Never share your API keys in public repositories, client-side code, or insecure locations.</p>
              </div>

              <h2>Example Request</h2>
              <div className="code-block">
                <div className="code-header">
                  <span>HTTP Header</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard('X-API-Key: flac_live_your_api_key_here', 'header')}
                  >
                    {copiedCode === 'header' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre><code>X-API-Key: flac_live_your_api_key_here</code></pre>
              </div>

              <h2>Alternative: Bearer Token</h2>
              <p>
                For web applications, you can also authenticate using Firebase Bearer tokens:
              </p>
              <div className="code-block">
                <div className="code-header">
                  <span>Bearer Token</span>
                </div>
                <pre><code>Authorization: Bearer &lt;firebase_id_token&gt;</code></pre>
              </div>
            </section>
          )}

          {/* Rate Limits Section */}
          {activeSection === 'rate-limits' && (
            <section className="doc-section">
              <h1>Rate Limits</h1>
              <p>
                API rate limits are based on your subscription tier. Exceeding these limits
                will result in a <code>429 Too Many Requests</code> response.
              </p>

              <table className="rate-limits-table">
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Requests/Hour</th>
                    <th>Requests/Month</th>
                    <th>Max API Keys</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="tier-starter">
                    <td>Starter (Free)</td>
                    <td>No API access</td>
                    <td>No API access</td>
                    <td>0</td>
                  </tr>
                  <tr className="tier-professional">
                    <td>Professional</td>
                    <td>100</td>
                    <td>1,000</td>
                    <td>2</td>
                  </tr>
                  <tr className="tier-agency">
                    <td>Agency</td>
                    <td>500</td>
                    <td>5,000</td>
                    <td>5</td>
                  </tr>
                  <tr className="tier-enterprise">
                    <td>Enterprise</td>
                    <td>10,000</td>
                    <td>Unlimited</td>
                    <td>Unlimited</td>
                  </tr>
                </tbody>
              </table>

              <h2>Rate Limit Headers</h2>
              <p>Each API response includes headers to help you track your usage:</p>
              <div className="code-block">
                <pre><code>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000`}</code></pre>
              </div>
            </section>
          )}

          {/* Endpoints Section */}
          {activeSection === 'endpoints' && (
            <section className="doc-section">
              <h1>API Endpoints</h1>

              <div className="endpoints-list">
                <div className="endpoint-group">
                  <h2>Reports</h2>
                  <div className="endpoint">
                    <span className="method post">POST</span>
                    <code>/reports/generate</code>
                    <span className="desc">Generate a new AI-powered report</span>
                  </div>
                  <div className="endpoint">
                    <span className="method get">GET</span>
                    <code>/reports</code>
                    <span className="desc">List all your reports</span>
                  </div>
                  <div className="endpoint">
                    <span className="method get">GET</span>
                    <code>/reports/:id</code>
                    <span className="desc">Get a specific report</span>
                  </div>
                  <div className="endpoint">
                    <span className="method put">PUT</span>
                    <code>/reports/:id</code>
                    <span className="desc">Update a report</span>
                  </div>
                  <div className="endpoint">
                    <span className="method delete">DELETE</span>
                    <code>/reports/:id</code>
                    <span className="desc">Delete a report</span>
                  </div>
                  <div className="endpoint">
                    <span className="method post">POST</span>
                    <code>/reports/:id/export</code>
                    <span className="desc">Export report to DOCX/PDF</span>
                  </div>
                  <div className="endpoint">
                    <span className="method post">POST</span>
                    <code>/reports/:id/images</code>
                    <span className="desc">Upload images to a report</span>
                  </div>
                  <div className="endpoint">
                    <span className="method post">POST</span>
                    <code>/reports/analyze-images</code>
                    <span className="desc">Analyze damage images with AI</span>
                  </div>
                </div>

                <div className="endpoint-group">
                  <h2>Users</h2>
                  <div className="endpoint">
                    <span className="method get">GET</span>
                    <code>/users/profile</code>
                    <span className="desc">Get user profile</span>
                  </div>
                  <div className="endpoint">
                    <span className="method get">GET</span>
                    <code>/users/usage</code>
                    <span className="desc">Get usage statistics</span>
                  </div>
                  <div className="endpoint">
                    <span className="method get">GET</span>
                    <code>/users/api-access</code>
                    <span className="desc">Check API access status</span>
                  </div>
                </div>

                <div className="endpoint-group">
                  <h2>AI Status</h2>
                  <div className="endpoint">
                    <span className="method get">GET</span>
                    <code>/reports/ai-status</code>
                    <span className="desc">Check AI providers health</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Reports API Section */}
          {activeSection === 'reports' && (
            <section className="doc-section">
              <h1>Reports API</h1>

              <h2>Generate Report</h2>
              <p className="endpoint-url">
                <span className="method post">POST</span>
                <code>/reports/generate</code>
              </p>

              <h3>Request Body</h3>
              <table className="params-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>claimNumber</code></td>
                    <td>string</td>
                    <td>Yes</td>
                    <td>Unique claim identifier</td>
                  </tr>
                  <tr>
                    <td><code>insuredName</code></td>
                    <td>string</td>
                    <td>Yes</td>
                    <td>Name of the insured party</td>
                  </tr>
                  <tr>
                    <td><code>lossType</code></td>
                    <td>string</td>
                    <td>Yes</td>
                    <td>Type of loss (Fire, Water, Wind, etc.)</td>
                  </tr>
                  <tr>
                    <td><code>propertyAddress</code></td>
                    <td>string</td>
                    <td>No</td>
                    <td>Property address</td>
                  </tr>
                  <tr>
                    <td><code>lossDate</code></td>
                    <td>string</td>
                    <td>No</td>
                    <td>Date of loss (YYYY-MM-DD)</td>
                  </tr>
                  <tr>
                    <td><code>reportType</code></td>
                    <td>string</td>
                    <td>No</td>
                    <td>Type of report (Field Inspection, Desk Review, etc.)</td>
                  </tr>
                  <tr>
                    <td><code>notes</code></td>
                    <td>string</td>
                    <td>No</td>
                    <td>Additional notes for AI consideration</td>
                  </tr>
                </tbody>
              </table>

              <h3>Response</h3>
              <div className="code-block">
                <pre><code>{`{
  "success": true,
  "reportId": "abc123def456",
  "report": {
    "id": "abc123def456",
    "claimNumber": "CLM-2024-001234",
    "insuredName": "John Smith",
    "content": "... AI-generated report content ...",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Report generated successfully"
}`}</code></pre>
              </div>

              <h2>Export Report</h2>
              <p className="endpoint-url">
                <span className="method post">POST</span>
                <code>/reports/:id/export</code>
              </p>

              <h3>Request Body</h3>
              <table className="params-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>format</code></td>
                    <td>string</td>
                    <td>"docx", "pdf", or "html"</td>
                  </tr>
                </tbody>
              </table>

              <h3>Response</h3>
              <div className="code-block">
                <pre><code>{`{
  "success": true,
  "fileName": "report_CLM-2024-001234.pdf",
  "downloadUrl": "https://storage.googleapis.com/...",
  "format": "pdf"
}`}</code></pre>
              </div>
            </section>
          )}

          {/* Errors Section */}
          {activeSection === 'errors' && (
            <section className="doc-section">
              <h1>Error Handling</h1>
              <p>
                The API uses standard HTTP status codes to indicate success or failure.
                All error responses include a JSON body with details.
              </p>

              <h2>Error Response Format</h2>
              <div className="code-block">
                <pre><code>{`{
  "success": false,
  "error": "Description of what went wrong",
  "code": "ERROR_CODE"
}`}</code></pre>
              </div>

              <h2>HTTP Status Codes</h2>
              <table className="status-codes-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Meaning</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>200</code></td>
                    <td>OK</td>
                    <td>Request successful</td>
                  </tr>
                  <tr>
                    <td><code>201</code></td>
                    <td>Created</td>
                    <td>Resource created successfully</td>
                  </tr>
                  <tr>
                    <td><code>400</code></td>
                    <td>Bad Request</td>
                    <td>Invalid parameters or missing required fields</td>
                  </tr>
                  <tr>
                    <td><code>401</code></td>
                    <td>Unauthorized</td>
                    <td>Missing or invalid API key</td>
                  </tr>
                  <tr>
                    <td><code>403</code></td>
                    <td>Forbidden</td>
                    <td>API key valid but lacks permission</td>
                  </tr>
                  <tr>
                    <td><code>404</code></td>
                    <td>Not Found</td>
                    <td>Resource not found</td>
                  </tr>
                  <tr>
                    <td><code>429</code></td>
                    <td>Too Many Requests</td>
                    <td>Rate limit exceeded</td>
                  </tr>
                  <tr>
                    <td><code>500</code></td>
                    <td>Server Error</td>
                    <td>Internal server error</td>
                  </tr>
                </tbody>
              </table>

              <h2>Common Error Codes</h2>
              <table className="error-codes-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>INVALID_API_KEY</code></td>
                    <td>The API key is invalid or has been revoked</td>
                  </tr>
                  <tr>
                    <td><code>NO_API_ACCESS</code></td>
                    <td>Your tier does not include API access</td>
                  </tr>
                  <tr>
                    <td><code>RATE_LIMIT_EXCEEDED</code></td>
                    <td>You have exceeded your rate limit</td>
                  </tr>
                  <tr>
                    <td><code>REPORT_LIMIT_REACHED</code></td>
                    <td>Monthly report generation limit reached</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {/* Code Examples Section */}
          {activeSection === 'examples' && (
            <section className="doc-section">
              <h1>Code Examples</h1>

              <h2>cURL</h2>
              <div className="code-block">
                <div className="code-header">
                  <span>Generate Report</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(codeExamples.curlGenerate, 'curl')}
                  >
                    {copiedCode === 'curl' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre><code>{codeExamples.curlGenerate}</code></pre>
              </div>

              <h2>Node.js</h2>
              <div className="code-block">
                <div className="code-header">
                  <span>Using Axios</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(codeExamples.nodeExample, 'node')}
                  >
                    {copiedCode === 'node' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre><code>{codeExamples.nodeExample}</code></pre>
              </div>

              <h2>Python</h2>
              <div className="code-block">
                <div className="code-header">
                  <span>Using Requests</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(codeExamples.pythonExample, 'python')}
                  >
                    {copiedCode === 'python' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre><code>{codeExamples.pythonExample}</code></pre>
              </div>

              <h2>Export to PDF</h2>
              <div className="code-block">
                <div className="code-header">
                  <span>JavaScript</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(codeExamples.exportExample, 'export')}
                  >
                    {copiedCode === 'export' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre><code>{codeExamples.exportExample}</code></pre>
              </div>
            </section>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ApiDocs;
