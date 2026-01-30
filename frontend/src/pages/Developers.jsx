import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  Code,
  Key,
  Zap,
  Shield,
  Book,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Play,
  FileJson,
  Lock,
  Clock,
  Server,
  Webhook,
  BarChart3
} from 'lucide-react';
import '../styles/developers.css';

function Developers() {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('javascript');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'endpoints', label: 'API Endpoints', icon: Server },
    { id: 'reports', label: 'Reports API', icon: FileJson },
    { id: 'rate-limits', label: 'Rate Limits', icon: Clock },
    { id: 'errors', label: 'Error Handling', icon: Shield },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'sdks', label: 'SDKs & Libraries', icon: Code }
  ];

  const codeExamples = {
    javascript: `// Generate a report using FlacronAI API
const response = await fetch('https://api.flacronai.com/api/reports/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'flac_live_your_api_key_here'
  },
  body: JSON.stringify({
    claimNumber: 'CLM-2024-001',
    insuredName: 'John Doe',
    lossDate: '2024-01-15',
    lossType: 'Water Damage',
    reportType: 'Property Inspection',
    propertyAddress: '123 Main St, City, State 12345',
    lossDescription: 'Water damage from burst pipe in basement'
  })
});

const data = await response.json();
console.log('Report ID:', data.reportId);`,

    python: `# Generate a report using FlacronAI API
import requests

response = requests.post(
    'https://api.flacronai.com/api/reports/generate',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'flac_live_your_api_key_here'
    },
    json={
        'claimNumber': 'CLM-2024-001',
        'insuredName': 'John Doe',
        'lossDate': '2024-01-15',
        'lossType': 'Water Damage',
        'reportType': 'Property Inspection',
        'propertyAddress': '123 Main St, City, State 12345',
        'lossDescription': 'Water damage from burst pipe in basement'
    }
)

data = response.json()
print('Report ID:', data['reportId'])`,

    curl: `# Generate a report using FlacronAI API
curl -X POST https://api.flacronai.com/api/reports/generate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: flac_live_your_api_key_here" \\
  -d '{
    "claimNumber": "CLM-2024-001",
    "insuredName": "John Doe",
    "lossDate": "2024-01-15",
    "lossType": "Water Damage",
    "reportType": "Property Inspection",
    "propertyAddress": "123 Main St, City, State 12345",
    "lossDescription": "Water damage from burst pipe in basement"
  }'`
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/reports/generate',
      description: 'Generate a new insurance report',
      auth: true
    },
    {
      method: 'GET',
      path: '/api/reports',
      description: 'List all reports for the authenticated user',
      auth: true
    },
    {
      method: 'GET',
      path: '/api/reports/:id',
      description: 'Get a specific report by ID',
      auth: true
    },
    {
      method: 'PUT',
      path: '/api/reports/:id',
      description: 'Update an existing report',
      auth: true
    },
    {
      method: 'DELETE',
      path: '/api/reports/:id',
      description: 'Delete a report',
      auth: true
    },
    {
      method: 'POST',
      path: '/api/reports/:id/export',
      description: 'Export report to PDF/DOCX/HTML',
      auth: true
    },
    {
      method: 'GET',
      path: '/api/users/profile',
      description: 'Get current user profile',
      auth: true
    },
    {
      method: 'GET',
      path: '/api/users/usage',
      description: 'Get usage statistics',
      auth: true
    }
  ];

  const rateLimits = [
    { tier: 'Starter', calls: '0 calls/hour', monthly: 'No API access', keys: '0' },
    { tier: 'Professional', calls: '100 calls/hour', monthly: '1,000 calls/month', keys: '2' },
    { tier: 'Agency', calls: '500 calls/hour', monthly: '5,000 calls/month', keys: '5' },
    { tier: 'Enterprise', calls: '10,000 calls/hour', monthly: 'Unlimited', keys: 'Unlimited' }
  ];

  const errorCodes = [
    { code: 400, name: 'Bad Request', description: 'Invalid request parameters' },
    { code: 401, name: 'Unauthorized', description: 'Missing or invalid API key' },
    { code: 403, name: 'Forbidden', description: 'Insufficient permissions or plan limitations' },
    { code: 404, name: 'Not Found', description: 'Resource not found' },
    { code: 429, name: 'Too Many Requests', description: 'Rate limit exceeded' },
    { code: 500, name: 'Server Error', description: 'Internal server error' }
  ];

  return (
    <div className="developers-page">
      <Navbar />

      {/* Hero Section */}
      <section className="dev-hero">
        <div className="dev-hero-content">
          <span className="hero-badge">
            <Terminal size={16} />
            Developer Documentation
          </span>
          <h1>Build with FlacronAI API</h1>
          <p>
            Integrate AI-powered insurance report generation into your applications with our comprehensive REST API.
          </p>
          <div className="hero-buttons">
            <Link to="/settings" className="btn-primary">
              <Key size={18} />
              Get API Key
            </Link>
            <a href="#quickstart" className="btn-secondary">
              <Play size={18} />
              Quick Start
            </a>
          </div>
        </div>
        <div className="hero-code-preview">
          <div className="code-window">
            <div className="window-header">
              <div className="window-dots">
                <span></span><span></span><span></span>
              </div>
              <span className="window-title">api-example.js</span>
            </div>
            <pre className="code-content">
              <code>{`const report = await flacronai.reports.generate({
  claimNumber: 'CLM-2024-001',
  lossType: 'Water Damage',
  propertyAddress: '123 Main St'
});

console.log(report.id); // => "rpt_abc123"`}</code>
            </pre>
          </div>
        </div>
        <div className="hero-gradient-orb"></div>
      </section>

      {/* Features Grid */}
      <section className="dev-features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={24} />
              </div>
              <h3>Fast & Reliable</h3>
              <p>Generate comprehensive reports in under 30 seconds with 99.9% uptime SLA.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={24} />
              </div>
              <h3>Secure by Default</h3>
              <p>TLS 1.3 encryption, API key authentication, and rate limiting built-in.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Code size={24} />
              </div>
              <h3>RESTful Design</h3>
              <p>Clean, intuitive API design following REST best practices.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={24} />
              </div>
              <h3>Real-time Analytics</h3>
              <p>Track API usage, monitor performance, and analyze trends.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Documentation */}
      <section className="dev-main">
        <div className="container">
          <div className="dev-layout">
            {/* Sidebar Navigation */}
            <aside className="dev-sidebar">
              <nav className="dev-nav">
                {sections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`nav-link ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <section.icon size={18} />
                    <span>{section.label}</span>
                  </a>
                ))}
              </nav>

              <div className="sidebar-help">
                <h4>Need Help?</h4>
                <p>Our team is here to help you integrate FlacronAI.</p>
                <Link to="/contact" className="help-link">
                  Contact Support
                  <ChevronRight size={16} />
                </Link>
              </div>
            </aside>

            {/* Documentation Content */}
            <div className="dev-content">
              {/* Overview */}
              <section id="overview" className="doc-section">
                <h2>API Overview</h2>
                <p className="section-intro">
                  The FlacronAI API allows you to programmatically generate professional insurance inspection reports.
                  Our REST API uses standard HTTP methods and returns JSON responses.
                </p>

                <div className="info-card">
                  <h4>Base URL</h4>
                  <div className="code-inline">
                    <code>https://api.flacronai.com/api</code>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard('https://api.flacronai.com/api', 'baseurl')}
                    >
                      {copiedCode === 'baseurl' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <h3>What You Can Do</h3>
                <ul className="feature-list">
                  <li>Generate AI-powered insurance reports from claim data</li>
                  <li>Upload and analyze property damage photos</li>
                  <li>Export reports to PDF, DOCX, or HTML formats</li>
                  <li>Manage reports (list, update, delete)</li>
                  <li>Track usage and analytics</li>
                  <li>Receive webhook notifications</li>
                </ul>
              </section>

              {/* Authentication */}
              <section id="authentication" className="doc-section">
                <h2>Authentication</h2>
                <p className="section-intro">
                  All API requests require authentication using an API key. Include your API key in the
                  <code>X-API-Key</code> header with every request.
                </p>

                <div className="code-block">
                  <div className="code-header">
                    <span>HTTP Header</span>
                  </div>
                  <pre><code>X-API-Key: flac_live_your_api_key_here</code></pre>
                </div>

                <div className="warning-box">
                  <Lock size={20} />
                  <div>
                    <strong>Keep your API key secure!</strong>
                    <p>Never expose your API key in client-side code or public repositories. Use environment variables to store your key securely.</p>
                  </div>
                </div>

                <h3>Getting Your API Key</h3>
                <ol className="numbered-list">
                  <li>Subscribe to a Professional, Agency, or Enterprise plan</li>
                  <li>Navigate to Settings → API Keys in your dashboard</li>
                  <li>Click "Create API Key" and give it a descriptive name</li>
                  <li>Copy the key immediately – it won't be shown again</li>
                </ol>

                <Link to="/settings" className="inline-link">
                  Go to API Keys Settings
                  <ExternalLink size={14} />
                </Link>
              </section>

              {/* Quick Start */}
              <section id="quickstart" className="doc-section">
                <h2>Quick Start</h2>
                <p className="section-intro">
                  Get started with the FlacronAI API in minutes. Here's how to generate your first report.
                </p>

                <div className="language-tabs">
                  <button
                    className={activeLanguage === 'javascript' ? 'active' : ''}
                    onClick={() => setActiveLanguage('javascript')}
                  >
                    JavaScript
                  </button>
                  <button
                    className={activeLanguage === 'python' ? 'active' : ''}
                    onClick={() => setActiveLanguage('python')}
                  >
                    Python
                  </button>
                  <button
                    className={activeLanguage === 'curl' ? 'active' : ''}
                    onClick={() => setActiveLanguage('curl')}
                  >
                    cURL
                  </button>
                </div>

                <div className="code-block large">
                  <div className="code-header">
                    <span>{activeLanguage === 'javascript' ? 'JavaScript' : activeLanguage === 'python' ? 'Python' : 'cURL'}</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(codeExamples[activeLanguage], 'quickstart')}
                    >
                      {copiedCode === 'quickstart' ? <Check size={16} /> : <Copy size={16} />}
                      {copiedCode === 'quickstart' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre><code>{codeExamples[activeLanguage]}</code></pre>
                </div>

                <h3>Response</h3>
                <div className="code-block">
                  <div className="code-header">
                    <span>JSON Response</span>
                  </div>
                  <pre><code>{`{
  "success": true,
  "reportId": "rpt_abc123def456",
  "report": {
    "id": "rpt_abc123def456",
    "claimNumber": "CLM-2024-001",
    "status": "completed",
    "content": "PROPERTY INSPECTION REPORT\\n\\n...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}`}</code></pre>
                </div>
              </section>

              {/* Endpoints */}
              <section id="endpoints" className="doc-section">
                <h2>API Endpoints</h2>
                <p className="section-intro">
                  Complete reference of all available API endpoints.
                </p>

                <div className="endpoints-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Method</th>
                        <th>Endpoint</th>
                        <th>Description</th>
                        <th>Auth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoints.map((endpoint, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`method-badge ${endpoint.method.toLowerCase()}`}>
                              {endpoint.method}
                            </span>
                          </td>
                          <td><code>{endpoint.path}</code></td>
                          <td>{endpoint.description}</td>
                          <td>{endpoint.auth ? <Lock size={16} /> : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Reports API */}
              <section id="reports" className="doc-section">
                <h2>Reports API</h2>
                <p className="section-intro">
                  The Reports API is the core of FlacronAI. Use it to generate, retrieve, and manage insurance inspection reports.
                </p>

                <h3>Generate Report</h3>
                <div className="endpoint-detail">
                  <div className="endpoint-header">
                    <span className="method-badge post">POST</span>
                    <code>/api/reports/generate</code>
                  </div>

                  <h4>Request Body Parameters</h4>
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
                        <td>Type of loss (e.g., "Water Damage", "Fire")</td>
                      </tr>
                      <tr>
                        <td><code>lossDate</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Date of loss (ISO 8601 format)</td>
                      </tr>
                      <tr>
                        <td><code>propertyAddress</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Full property address</td>
                      </tr>
                      <tr>
                        <td><code>lossDescription</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Detailed description of the loss</td>
                      </tr>
                      <tr>
                        <td><code>reportType</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Type of report to generate</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Rate Limits */}
              <section id="rate-limits" className="doc-section">
                <h2>Rate Limits</h2>
                <p className="section-intro">
                  API rate limits are based on your subscription tier. Limits are applied per API key.
                </p>

                <div className="rate-limits-grid">
                  {rateLimits.map((limit, index) => (
                    <div key={index} className={`rate-card ${limit.tier.toLowerCase()}`}>
                      <h4>{limit.tier}</h4>
                      <div className="rate-details">
                        <div className="rate-item">
                          <span className="rate-label">Hourly</span>
                          <span className="rate-value">{limit.calls}</span>
                        </div>
                        <div className="rate-item">
                          <span className="rate-label">Monthly</span>
                          <span className="rate-value">{limit.monthly}</span>
                        </div>
                        <div className="rate-item">
                          <span className="rate-label">API Keys</span>
                          <span className="rate-value">{limit.keys}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <h3>Rate Limit Headers</h3>
                <p>Every API response includes rate limit information in the headers:</p>
                <div className="code-block">
                  <div className="code-header">
                    <span>Response Headers</span>
                  </div>
                  <pre><code>{`X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 2024-01-15T11:00:00Z`}</code></pre>
                </div>
              </section>

              {/* Error Handling */}
              <section id="errors" className="doc-section">
                <h2>Error Handling</h2>
                <p className="section-intro">
                  The API uses conventional HTTP response codes to indicate success or failure.
                </p>

                <table className="errors-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorCodes.map((error, index) => (
                      <tr key={index}>
                        <td><code>{error.code}</code></td>
                        <td>{error.name}</td>
                        <td>{error.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3>Error Response Format</h3>
                <div className="code-block">
                  <div className="code-header">
                    <span>Error Response</span>
                  </div>
                  <pre><code>{`{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "hint": "Upgrade your plan for higher limits"
}`}</code></pre>
                </div>
              </section>

              {/* Webhooks */}
              <section id="webhooks" className="doc-section">
                <h2>Webhooks</h2>
                <p className="section-intro">
                  Receive real-time notifications when events occur in your FlacronAI account.
                  Webhooks are available on Agency and Enterprise plans.
                </p>

                <h3>Supported Events</h3>
                <ul className="feature-list">
                  <li><code>report.generated</code> – A new report has been generated</li>
                  <li><code>report.exported</code> – A report has been exported</li>
                  <li><code>report.deleted</code> – A report has been deleted</li>
                  <li><code>usage.limit_approaching</code> – Usage is approaching the monthly limit</li>
                </ul>

                <div className="code-block">
                  <div className="code-header">
                    <span>Webhook Payload Example</span>
                  </div>
                  <pre><code>{`{
  "event": "report.generated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "reportId": "rpt_abc123",
    "claimNumber": "CLM-2024-001",
    "status": "completed"
  }
}`}</code></pre>
                </div>
              </section>

              {/* SDKs */}
              <section id="sdks" className="doc-section">
                <h2>SDKs & Libraries</h2>
                <p className="section-intro">
                  Official SDKs are coming soon. In the meantime, you can use any HTTP client to interact with our REST API.
                </p>

                <div className="sdk-grid">
                  <div className="sdk-card coming-soon">
                    <div className="sdk-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                        <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
                      </svg>
                    </div>
                    <h4>JavaScript SDK</h4>
                    <span className="sdk-status">Coming Soon</span>
                  </div>
                  <div className="sdk-card coming-soon">
                    <div className="sdk-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                        <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                      </svg>
                    </div>
                    <h4>Python SDK</h4>
                    <span className="sdk-status">Coming Soon</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="dev-cta">
        <div className="container">
          <h2>Ready to Build?</h2>
          <p>Get your API key and start integrating FlacronAI into your applications today.</p>
          <div className="cta-buttons">
            <Link to="/settings" className="btn-primary">
              <Key size={18} />
              Get Your API Key
            </Link>
            <Link to="/contact" className="btn-secondary">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Developers;
