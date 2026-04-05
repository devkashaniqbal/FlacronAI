import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const METHOD_COLORS = {
  GET: 'bg-green-500/20 text-green-400 border border-green-500/30',
  POST: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  PUT: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const ENDPOINTS = {
  Authentication: [
    {
      method: 'POST', url: '/api/auth/register', description: 'Register a new user account.',
      params: [
        { name: 'email', type: 'string', required: true, desc: 'User email address' },
        { name: 'password', type: 'string', required: true, desc: 'Minimum 8 characters' },
        { name: 'displayName', type: 'string', required: false, desc: 'User display name' },
      ],
      response: `{ "user": { "uid": "...", "email": "...", "tier": "starter" }, "token": "eyJ..." }`,
      examples: {
        curl: `curl -X POST https://api.flacronai.com/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"securepassword"}'`,
        js: `const res = await fetch('https://api.flacronai.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'securepassword' })
});
const data = await res.json();`,
        python: `import requests
response = requests.post('https://api.flacronai.com/api/auth/register',
  json={'email': 'user@example.com', 'password': 'securepassword'})
data = response.json()`,
      },
    },
    {
      method: 'POST', url: '/api/auth/login', description: 'Authenticate with email and password. Returns a JWT token.',
      params: [
        { name: 'email', type: 'string', required: true, desc: 'User email address' },
        { name: 'password', type: 'string', required: true, desc: 'User password' },
      ],
      response: `{ "user": { "uid": "...", "email": "...", "tier": "professional" }, "token": "eyJ..." }`,
      examples: {
        curl: `curl -X POST https://api.flacronai.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"yourpassword"}'`,
        js: `const res = await fetch('https://api.flacronai.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'yourpassword' })
});
const { token } = await res.json();`,
        python: `import requests
response = requests.post('https://api.flacronai.com/api/auth/login',
  json={'email': 'user@example.com', 'password': 'yourpassword'})
token = response.json()['token']`,
      },
    },
  ],
  Reports: [
    {
      method: 'POST', url: '/api/reports/generate', description: 'Generate an AI-powered insurance claim report. Accepts multipart/form-data with photos.',
      params: [
        { name: 'claimNumber', type: 'string', required: true, desc: 'Unique claim identifier' },
        { name: 'insuredName', type: 'string', required: true, desc: 'Name of the insured party' },
        { name: 'propertyAddress', type: 'string', required: true, desc: 'Address of the damaged property' },
        { name: 'lossDate', type: 'string', required: true, desc: 'Date of loss (ISO 8601)' },
        { name: 'lossType', type: 'string', required: true, desc: 'Water Damage | Fire | Wind | Hail | Mold | Vandalism | Other' },
        { name: 'reportType', type: 'string', required: true, desc: 'Initial | Supplemental | Final | Re-Inspection' },
        { name: 'photos', type: 'file[]', required: false, desc: 'Up to 100 damage photos (JPEG/PNG)' },
        { name: 'notes', type: 'string', required: false, desc: 'Additional adjuster notes' },
      ],
      response: `{ "report": { "_id": "...", "claimNumber": "CLM-001", "content": "...", "qualityScore": 92, "aiModel": "FlacronAI", "status": "completed" } }`,
      examples: {
        curl: `curl -X POST https://api.flacronai.com/api/reports/generate \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "claimNumber=CLM-2024-001" \\
  -F "insuredName=John Smith" \\
  -F "propertyAddress=123 Main St, City, ST 12345" \\
  -F "lossDate=2024-01-15" \\
  -F "lossType=Water Damage" \\
  -F "reportType=Initial" \\
  -F "photos=@damage1.jpg" \\
  -F "photos=@damage2.jpg"`,
        js: `const formData = new FormData();
formData.append('claimNumber', 'CLM-2024-001');
formData.append('insuredName', 'John Smith');
formData.append('lossType', 'Water Damage');
formData.append('reportType', 'Initial');
photos.forEach(p => formData.append('photos', p));

const res = await fetch('https://api.flacronai.com/api/reports/generate', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
  body: formData
});`,
        python: `import requests
files = [('photos', open('damage1.jpg', 'rb')), ('photos', open('damage2.jpg', 'rb'))]
data = {'claimNumber': 'CLM-2024-001', 'lossType': 'Water Damage', 'reportType': 'Initial'}
response = requests.post('https://api.flacronai.com/api/reports/generate',
  headers={'Authorization': 'Bearer YOUR_TOKEN'}, data=data, files=files)`,
      },
    },
    {
      method: 'GET', url: '/api/reports', description: 'List all reports for the authenticated user. Supports pagination and filtering.',
      params: [
        { name: 'page', type: 'number', required: false, desc: 'Page number (default: 1)' },
        { name: 'limit', type: 'number', required: false, desc: 'Results per page (default: 10, max: 100)' },
        { name: 'status', type: 'string', required: false, desc: 'Filter by status: completed | processing | failed' },
        { name: 'search', type: 'string', required: false, desc: 'Search by claim number or insured name' },
      ],
      response: `{ "reports": [...], "total": 42, "page": 1, "totalPages": 5 }`,
      examples: {
        curl: `curl https://api.flacronai.com/api/reports?page=1&limit=10 \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
        js: `const res = await fetch('https://api.flacronai.com/api/reports?page=1&status=completed', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
const { reports, total } = await res.json();`,
        python: `response = requests.get('https://api.flacronai.com/api/reports',
  params={'page': 1, 'status': 'completed'},
  headers={'Authorization': 'Bearer YOUR_TOKEN'})`,
      },
    },
    {
      method: 'GET', url: '/api/reports/:id', description: 'Get a single report by ID.',
      params: [
        { name: 'id', type: 'string', required: true, desc: 'Report ID (path parameter)' },
      ],
      response: `{ "report": { "_id": "...", "claimNumber": "...", "content": "...", "createdAt": "..." } }`,
      examples: {
        curl: `curl https://api.flacronai.com/api/reports/64f8abc123def456 \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
        js: `const res = await fetch('https://api.flacronai.com/api/reports/REPORT_ID', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});`,
        python: `response = requests.get('https://api.flacronai.com/api/reports/REPORT_ID',
  headers={'Authorization': 'Bearer YOUR_TOKEN'})`,
      },
    },
    {
      method: 'POST', url: '/api/reports/:id/export', description: 'Export a report in PDF, DOCX, or HTML format.',
      params: [
        { name: 'id', type: 'string', required: true, desc: 'Report ID (path parameter)' },
        { name: 'format', type: 'string', required: true, desc: 'pdf | docx | html' },
      ],
      response: `Binary file stream (application/pdf, etc.)`,
      examples: {
        curl: `curl -X POST https://api.flacronai.com/api/reports/REPORT_ID/export \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"format":"pdf"}' --output report.pdf`,
        js: `const res = await fetch(\`https://api.flacronai.com/api/reports/\${id}/export\`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN', 'Content-Type': 'application/json' },
  body: JSON.stringify({ format: 'pdf' })
});
const blob = await res.blob();`,
        python: `response = requests.post(f'https://api.flacronai.com/api/reports/{report_id}/export',
  json={'format': 'pdf'},
  headers={'Authorization': 'Bearer YOUR_TOKEN'})
with open('report.pdf', 'wb') as f:
    f.write(response.content)`,
      },
    },
    {
      method: 'DELETE', url: '/api/reports/:id', description: 'Delete a report. Set permanent=true to permanently delete.',
      params: [
        { name: 'id', type: 'string', required: true, desc: 'Report ID (path parameter)' },
        { name: 'permanent', type: 'boolean', required: false, desc: 'Permanently delete (default: false = soft delete)' },
      ],
      response: `{ "message": "Report deleted successfully" }`,
      examples: {
        curl: `curl -X DELETE "https://api.flacronai.com/api/reports/REPORT_ID?permanent=false" \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
        js: `await fetch(\`https://api.flacronai.com/api/reports/\${id}\`, {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});`,
        python: `requests.delete(f'https://api.flacronai.com/api/reports/{report_id}',
  headers={'Authorization': 'Bearer YOUR_TOKEN'})`,
      },
    },
  ],
  Users: [
    {
      method: 'GET', url: '/api/users/profile', description: 'Get the authenticated user profile.',
      params: [],
      response: `{ "profile": { "uid": "...", "email": "...", "tier": "agency", "displayName": "...", "usage": {...} } }`,
      examples: {
        curl: `curl https://api.flacronai.com/api/users/profile \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
        js: `const res = await fetch('https://api.flacronai.com/api/users/profile', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});`,
        python: `response = requests.get('https://api.flacronai.com/api/users/profile',
  headers={'Authorization': 'Bearer YOUR_TOKEN'})`,
      },
    },
    {
      method: 'POST', url: '/api/users/api-keys', description: 'Create a new API key for programmatic access.',
      params: [
        { name: 'name', type: 'string', required: true, desc: 'Descriptive name for the key' },
      ],
      response: `{ "key": "flac_live_xxxxxxxxxxxx", "keyId": "...", "name": "Production App", "createdAt": "..." }`,
      examples: {
        curl: `curl -X POST https://api.flacronai.com/api/users/api-keys \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Production App"}'`,
        js: `const res = await fetch('https://api.flacronai.com/api/users/api-keys', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN', 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Production App' })
});`,
        python: `response = requests.post('https://api.flacronai.com/api/users/api-keys',
  json={'name': 'Production App'},
  headers={'Authorization': 'Bearer YOUR_TOKEN'})`,
      },
    },
  ],
  CRM: [
    {
      method: 'GET', url: '/api/crm/clients', description: 'List all CRM clients.',
      params: [
        { name: 'page', type: 'number', required: false, desc: 'Page number' },
        { name: 'search', type: 'string', required: false, desc: 'Search by name/email' },
      ],
      response: `{ "clients": [...], "total": 30, "page": 1 }`,
      examples: {
        curl: `curl https://api.flacronai.com/api/crm/clients \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
        js: `const res = await fetch('https://api.flacronai.com/api/crm/clients', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});`,
        python: `response = requests.get('https://api.flacronai.com/api/crm/clients',
  headers={'Authorization': 'Bearer YOUR_TOKEN'})`,
      },
    },
    {
      method: 'POST', url: '/api/crm/clients', description: 'Create a new CRM client.',
      params: [
        { name: 'name', type: 'string', required: true, desc: 'Client full name' },
        { name: 'email', type: 'string', required: false, desc: 'Client email address' },
        { name: 'phone', type: 'string', required: false, desc: 'Client phone number' },
        { name: 'company', type: 'string', required: false, desc: 'Client company name' },
      ],
      response: `{ "client": { "_id": "...", "name": "Jane Doe", "email": "...", "createdAt": "..." } }`,
      examples: {
        curl: `curl -X POST https://api.flacronai.com/api/crm/clients \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Jane Doe","email":"jane@example.com"}'`,
        js: `const res = await fetch('https://api.flacronai.com/api/crm/clients', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN', 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com' })
});`,
        python: `response = requests.post('https://api.flacronai.com/api/crm/clients',
  json={'name': 'Jane Doe', 'email': 'jane@example.com'},
  headers={'Authorization': 'Bearer YOUR_TOKEN'})`,
      },
    },
  ],
  'White-Label': [
    {
      method: 'GET', url: '/api/white-label/config', description: 'Get the current white-label configuration.',
      params: [],
      response: `{ "config": { "companyName": "...", "primaryColor": "#...", "subdomain": "...", ... } }`,
      examples: {
        curl: `curl https://api.flacronai.com/api/white-label/config \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
        js: `const res = await fetch('https://api.flacronai.com/api/white-label/config', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});`,
        python: `response = requests.get('https://api.flacronai.com/api/white-label/config',
  headers={'Authorization': 'Bearer YOUR_TOKEN'})`,
      },
    },
    {
      method: 'PUT', url: '/api/white-label/customize', description: 'Update white-label branding configuration.',
      params: [
        { name: 'companyName', type: 'string', required: false, desc: 'Company display name' },
        { name: 'primaryColor', type: 'string', required: false, desc: 'Hex color code for primary branding' },
        { name: 'subdomain', type: 'string', required: false, desc: 'Subdomain slug (alphanumeric, hyphens)' },
        { name: 'hideFlacronBranding', type: 'boolean', required: false, desc: 'Hide Powered by FlacronAI' },
      ],
      response: `{ "config": { "companyName": "Updated Corp", "primaryColor": "#ff6600", ... } }`,
      examples: {
        curl: `curl -X PUT https://api.flacronai.com/api/white-label/customize \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"companyName":"Acme Corp","primaryColor":"#ff6600"}'`,
        js: `await fetch('https://api.flacronai.com/api/white-label/customize', {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN', 'Content-Type': 'application/json' },
  body: JSON.stringify({ companyName: 'Acme Corp', primaryColor: '#ff6600' })
});`,
        python: `requests.put('https://api.flacronai.com/api/white-label/customize',
  json={'companyName': 'Acme Corp', 'primaryColor': '#ff6600'},
  headers={'Authorization': 'Bearer YOUR_TOKEN'})`,
      },
    },
  ],
  Payments: [
    {
      method: 'POST', url: '/api/payment/create-checkout-session', description: 'Create a Stripe checkout session to upgrade to a paid plan.',
      params: [
        { name: 'tier', type: 'string', required: true, desc: 'Target plan: professional | agency | enterprise' },
      ],
      response: `{ "url": "https://checkout.stripe.com/...", "sessionId": "cs_..." }`,
      examples: {
        curl: `curl -X POST https://api.flacronai.com/api/payment/create-checkout-session \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"tier":"professional"}'`,
        js: `const { url } = await (await fetch('https://api.flacronai.com/api/payment/create-checkout-session', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN', 'Content-Type': 'application/json' },
  body: JSON.stringify({ tier: 'professional' })
})).json();
window.location.href = url;`,
        python: `response = requests.post('https://api.flacronai.com/api/payment/create-checkout-session',
  json={'tier': 'professional'},
  headers={'Authorization': 'Bearer YOUR_TOKEN'})
checkout_url = response.json()['url']`,
      },
    },
    {
      method: 'GET', url: '/api/payment/invoices', description: 'Get the billing invoice history.',
      params: [],
      response: `{ "invoices": [{ "id": "...", "amount": 3999, "status": "paid", "date": "...", "pdfUrl": "..." }] }`,
      examples: {
        curl: `curl https://api.flacronai.com/api/payment/invoices \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
        js: `const { invoices } = await (await fetch('https://api.flacronai.com/api/payment/invoices', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})).json();`,
        python: `response = requests.get('https://api.flacronai.com/api/payment/invoices',
  headers={'Authorization': 'Bearer YOUR_TOKEN'})`,
      },
    },
  ],
};

const RATE_LIMITS = [
  { tier: 'Starter', rpm: '10 req/min', daily: '100 req/day', notes: 'No API key access' },
  { tier: 'Professional', rpm: '30 req/min', daily: '500 req/day', notes: 'JWT only' },
  { tier: 'Agency', rpm: '60 req/min', daily: '2,000 req/day', notes: 'API key supported' },
  { tier: 'Enterprise', rpm: '200 req/min', daily: 'Unlimited', notes: 'Custom limits available' },
];

const ERROR_CODES = [
  { code: 400, name: 'Bad Request', desc: 'Missing or invalid request parameters.' },
  { code: 401, name: 'Unauthorized', desc: 'Invalid or missing authentication token.' },
  { code: 403, name: 'Forbidden', desc: 'Insufficient tier permissions for this operation.' },
  { code: 404, name: 'Not Found', desc: 'The requested resource does not exist.' },
  { code: 429, name: 'Rate Limited', desc: 'Too many requests. Wait and retry with exponential backoff.' },
  { code: 500, name: 'Server Error', desc: 'Internal server error. Contact support if persistent.' },
  { code: 503, name: 'AI Unavailable', desc: 'AI service temporarily unavailable. Retry after 30s.' },
];

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative">
      <pre className="bg-black/50 rounded-xl p-4 overflow-x-auto text-xs font-mono leading-relaxed">
        <code className="text-green-300">{code}</code>
      </pre>
      <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900">
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function EndpointCard({ endpoint }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('curl');
  return (
    <div className="card overflow-hidden mb-3">
      <button onClick={() => setOpen(p => !p)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-100 transition-colors">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${METHOD_COLORS[endpoint.method]}`}>{endpoint.method}</span>
        <code className="text-sm font-mono text-orange-300 flex-1">{endpoint.url}</code>
        <span className="text-gray-600 text-sm hidden sm:block">{endpoint.description}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-[#e5e7eb] p-4 space-y-4">
          <p className="text-gray-700 text-sm">{endpoint.description}</p>
          {endpoint.params.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Parameters</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 px-2 text-xs text-gray-500">Name</th>
                    <th className="text-left py-1.5 px-2 text-xs text-gray-500">Type</th>
                    <th className="text-left py-1.5 px-2 text-xs text-gray-500">Required</th>
                    <th className="text-left py-1.5 px-2 text-xs text-gray-500">Description</th>
                  </tr></thead>
                  <tbody>{endpoint.params.map((p, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-1.5 px-2 font-mono text-orange-300 text-xs">{p.name}</td>
                      <td className="py-1.5 px-2 text-amber-400 text-xs">{p.type}</td>
                      <td className="py-1.5 px-2">{p.required ? <span className="text-xs text-red-400">required</span> : <span className="text-xs text-gray-500">optional</span>}</td>
                      <td className="py-1.5 px-2 text-gray-600 text-xs">{p.desc}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Response Schema</h4>
            <pre className="bg-black/50 rounded-xl p-3 text-xs font-mono text-green-300 overflow-x-auto">{endpoint.response}</pre>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Code Examples</h4>
            <div className="flex gap-1 mb-2">
              {['curl', 'js', 'python'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === t ? 'bg-orange-500 text-gray-900' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
                  {t === 'js' ? 'JavaScript' : t === 'curl' ? 'cURL' : 'Python'}
                </button>
              ))}
            </div>
            <CodeBlock code={endpoint.examples[activeTab]} lang={activeTab} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState('Authentication');
  const categories = Object.keys(ENDPOINTS);

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">API Reference</h1>
          <p className="text-gray-600 max-w-xl mx-auto">Complete documentation for the FlacronAI REST API. Integrate AI-powered claim reports into your applications.</p>
        </motion.div>

        <div className="flex gap-6">
          {/* Sticky Sidebar */}
          <aside className="w-48 shrink-0 hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase px-3 mb-3">Endpoints</p>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveSection(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === cat ? 'bg-orange-500/20 text-orange-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                  {cat}
                </button>
              ))}
              <div className="border-t border-[#e5e7eb] my-3" />
              {['Rate Limits', 'Errors', 'Auth Guide'].map(s => (
                <button key={s} onClick={() => setActiveSection(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === s ? 'bg-orange-500/20 text-orange-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                  {s}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Auth Guide */}
            {activeSection === 'Auth Guide' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentication Guide</h2>
                <div className="space-y-4">
                  <div className="card p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Bearer Token (JWT)</h3>
                    <p className="text-gray-600 text-sm mb-3">Login to get a JWT token, then include it in the Authorization header of all requests.</p>
                    <CodeBlock code={`Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...`} lang="text" />
                  </div>
                  <div className="card p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">API Key (Agency/Enterprise)</h3>
                    <p className="text-gray-600 text-sm mb-3">Create an API key in Settings. Pass it via the X-API-Key header for server-to-server requests.</p>
                    <CodeBlock code={`X-API-Key: flac_live_xxxxxxxxxxxxxxxxxxxx`} lang="text" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rate Limits */}
            {activeSection === 'Rate Limits' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate Limits</h2>
                <p className="text-gray-600 text-sm mb-6">Rate limits are enforced per API key or per user token. When exceeded, a 429 status is returned.</p>
                <div className="card overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-[#e5e7eb]">
                      {['Plan', 'Requests/Min', 'Requests/Day', 'Notes'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>{RATE_LIMITS.map((r, i) => (
                      <tr key={i} className="border-b border-[#e5e7eb]">
                        <td className="px-4 py-3 text-gray-900 text-sm font-medium">{r.tier}</td>
                        <td className="px-4 py-3 text-orange-400 text-sm font-mono">{r.rpm}</td>
                        <td className="px-4 py-3 text-orange-400 text-sm font-mono">{r.daily}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{r.notes}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Errors */}
            {activeSection === 'Errors' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Error Codes</h2>
                <div className="space-y-3">
                  {ERROR_CODES.map((e, i) => (
                    <div key={i} className="card p-4 flex items-start gap-4">
                      <span className={`text-sm font-bold font-mono px-3 py-1 rounded-lg shrink-0 ${
                        e.code >= 500 ? 'bg-red-500/20 text-red-400' : e.code === 429 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-600'}`}>{e.code}</span>
                      <div>
                        <p className="text-gray-900 text-sm font-semibold">{e.name}</p>
                        <p className="text-gray-600 text-sm mt-0.5">{e.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Endpoint Sections */}
            {categories.includes(activeSection) && (
              <motion.div key={activeSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeSection}</h2>
                {ENDPOINTS[activeSection].map((ep, i) => <EndpointCard key={i} endpoint={ep} />)}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
