import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using the FlacronAI platform ("Service") at flacronai.com, you ("User" or "you") agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legally binding agreement between you and FlacronAI, Inc. ("FlacronAI," "Company," "we," or "us"), a corporation incorporated in the State of Florida.

If you are using the Service on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms. If you do not have such authority, or if you do not agree to these Terms, you must not access or use the Service.

We reserve the right to modify these Terms at any time. We will notify users of material changes by email and by posting a notice on the platform at least 30 days before changes take effect. Continued use of the Service after the effective date constitutes acceptance of the revised Terms. If you do not agree to the modified Terms, you must discontinue use of the Service.`,
  },
  {
    id: 'service',
    title: '2. Service Description',
    content: `FlacronAI provides an AI-powered insurance claim report generation platform. The Service enables users to submit claim data and damage photographs for analysis by artificial intelligence systems, resulting in professionally formatted insurance claim reports.

**Core service capabilities include:**
- AI-powered damage photo analysis using computer vision
- Structured report generation using FlacronAI language models
- Report export in PDF, DOCX, and HTML formats (plan-dependent)
- A customer relationship management (CRM) module for client and claim tracking
- White-label portal configuration for enterprise users
- A REST API for programmatic integration (Agency and Enterprise plans)

The Service is provided on an "as-is" and "as-available" basis. FlacronAI does not guarantee that the Service will be uninterrupted, error-free, or that AI-generated content will be free of inaccuracies. Generated reports are AI-assisted drafts and require review and verification by qualified human professionals before submission to insurance carriers or courts.`,
  },
  {
    id: 'account',
    title: '3. Account Terms',
    content: `**Registration:** You must provide accurate, complete, and current information when creating an account. You are responsible for maintaining the accuracy of this information.

**Security:** You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify FlacronAI at support@flacronenterprises.com of any unauthorized use of your account or suspected security breach.

**Responsibility:** You are responsible for all activity that occurs under your account, whether or not authorized by you. FlacronAI is not liable for any loss or damage arising from your failure to maintain account security.

**Eligibility:** The Service is intended for users who are 18 years of age or older. By using the Service, you represent that you are at least 18 years old and are legally competent to enter into a binding contract.

**Professional licensing:** If you are using the Service to generate insurance claim reports for professional use, you represent that you hold all required professional licenses in the jurisdictions where you practice.

**Account termination:** You may close your account at any time by contacting support@flacronenterprises.com. FlacronAI reserves the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or remain inactive for more than 24 consecutive months.`,
  },
  {
    id: 'payment',
    title: '4. Payment Terms',
    content: `**Subscription fees:** Paid plan subscriptions are billed on a recurring basis (monthly or annual) using the credit card on file. All prices are listed in US dollars and are exclusive of applicable taxes.

**Billing cycle:** Monthly subscriptions renew on the same date each month. Annual subscriptions renew on the same date each year. You will receive a reminder email 7 days before renewal.

**Annual prepayment:** Annual subscriptions are billed in full at the beginning of each 12-month term. Annual subscriptions receive a 20% discount compared to equivalent monthly billing.

**Price changes:** We reserve the right to change subscription prices. You will receive 30 days notice before any price increase takes effect. If you do not cancel before the effective date of a price change, your subscription will automatically renew at the new price.

**Refunds:** All payments are non-refundable except as required by law. If you experience a service outage or material defect that prevents you from using core features for more than 48 consecutive hours, you may request a prorated credit to your account.

**Taxes:** You are responsible for all applicable taxes. If FlacronAI is required to collect taxes in your jurisdiction, the applicable tax will be added to your invoice.

**Late payments:** If payment fails, we will retry the charge up to 3 times over 7 days. If payment is not recovered, your account will be downgraded to the Starter plan. Reactivation of a paid plan requires updating your payment method and paying any outstanding balance.`,
  },
  {
    id: 'acceptable-use',
    title: '5. Acceptable Use',
    content: `You agree to use the Service only for lawful purposes and in compliance with these Terms. You must not:

**Prohibited activities:**
- Use the Service to generate fraudulent, misleading, or intentionally inaccurate insurance claim reports.
- Submit photos or claim data that you do not own or do not have the right to use.
- Attempt to reverse-engineer, decompile, or extract the underlying AI models.
- Use automated scraping, crawling, or data extraction tools on the platform.
- Attempt to access other users' accounts, data, or systems without authorization.
- Upload content containing malware, viruses, or malicious code.
- Transmit unsolicited commercial communications or spam through any platform feature.
- Use the API to circumvent rate limits, plan restrictions, or authentication controls.
- Misrepresent your identity or professional credentials to any party using information from the Service.
- Use the Service in violation of any applicable law, regulation, or professional standard.

**Consequences:** Violation of this Acceptable Use policy may result in immediate suspension or termination of your account without refund. FlacronAI reserves the right to cooperate with law enforcement regarding activities that may constitute criminal violations.`,
  },
  {
    id: 'intellectual-property',
    title: '6. Intellectual Property',
    content: `**FlacronAI's intellectual property:** The Service, including its software, AI models, user interface, design, documentation, and trademarks, is owned by FlacronAI, Inc. and protected by applicable intellectual property laws. Nothing in these Terms grants you any right to use FlacronAI's trademarks, logos, or brand elements.

**Your content:** You retain all ownership rights to claim data, photos, and other content you submit to the Service ("Your Content"). By submitting content, you grant FlacronAI a limited, non-exclusive, worldwide, royalty-free license to process, store, and use Your Content solely to provide the Service to you.

**Generated reports:** You own the AI-generated reports created from your claim data. FlacronAI does not claim ownership of the output of report generation using your content.

**Restrictions:** The limited license you receive to use the Service does not include the right to sublicense, sell, resell, transfer, assign, or otherwise commercialize the Service or any portion of it, except as explicitly permitted under API terms for Agency and Enterprise plan holders.

**Feedback:** Any feedback, suggestions, or ideas you provide to FlacronAI may be used by us without restriction or compensation to you. You waive any claims relating to such feedback.`,
  },
  {
    id: 'privacy',
    title: '7. Privacy',
    content: `Your privacy is important to us. Our Privacy Policy, incorporated by reference into these Terms, describes how we collect, use, store, and share your personal information. By using the Service, you agree to our Privacy Policy.

**Data processing:** For users in the European Economic Area, FlacronAI acts as a Data Processor for claim data you submit and as a Data Controller for account and usage data. Our Data Processing Agreement (DPA) is available to Enterprise customers upon request.

**Insurance data sensitivity:** We recognize that claim data may contain sensitive personal information about insured parties. You are responsible for ensuring that your collection, submission, and use of third-party personal data complies with applicable privacy laws, including GDPR and CCPA, and with the privacy policies disclosed to insured parties.

**AI model training:** We do not use your submitted claim data, photos, or report content to train, fine-tune, or evaluate AI models, except with your explicit written consent.`,
  },
  {
    id: 'liability',
    title: '8. Limitation of Liability',
    content: `**Disclaimer of warranties:** THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. FLACRONAI DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT AI-GENERATED REPORTS WILL BE ACCURATE OR SUITABLE FOR ANY PURPOSE.

**AI-generated content disclaimer:** AI-generated reports are provided as drafts to assist qualified professionals. FlacronAI makes no representation that generated reports comply with all applicable legal, regulatory, or professional standards. Users are solely responsible for reviewing, verifying, and taking professional responsibility for reports before submission.

**Limitation of damages:** TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FLACRONAI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, LOSS OF DATA, OR LOSS OF GOODWILL, ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

**Cap on liability:** OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) THE TOTAL FEES PAID BY YOU TO FLACRONAI IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) ONE HUNDRED US DOLLARS ($100).`,
  },
  {
    id: 'indemnification',
    title: '9. Indemnification',
    content: `You agree to indemnify, defend, and hold harmless FlacronAI, Inc., its officers, directors, employees, agents, licensors, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:

- Your violation of these Terms.
- Your use or misuse of the Service.
- Your submission of content that infringes third-party intellectual property rights.
- Your violation of any applicable law or regulation.
- Your use of AI-generated reports in professional contexts, including claims submissions, litigation support, or client representations.
- Any false, misleading, or fraudulent claim data or photographs you submit.

FlacronAI reserves the right to assume exclusive defense and control of any matter subject to indemnification by you, in which case you agree to cooperate fully with FlacronAI in asserting available defenses.`,
  },
  {
    id: 'governing-law',
    title: '10. Governing Law and Disputes',
    content: `**Governing law:** These Terms shall be governed by and construed in accordance with the laws of the State of Florida, United States, without regard to its conflict of law provisions. The United Nations Convention on Contracts for the International Sale of Goods does not apply.

**Dispute resolution:** Before initiating any formal legal proceedings, both parties agree to attempt in good faith to resolve any dispute through direct negotiation. If a dispute cannot be resolved within 30 days of written notice, the parties shall submit to binding arbitration administered by JAMS under its Commercial Arbitration Rules, with arbitration conducted in Hillsborough County, Florida.

**Class action waiver:** You agree that any arbitration shall be conducted in your individual capacity only and not as a class action. You expressly waive any right to file a class action or seek class-wide relief.

**Small claims:** Either party may bring an individual claim in small claims court if the claim qualifies.

**Injunctive relief:** Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to prevent irreparable harm pending arbitration.

**Severability:** If any provision of these Terms is held to be unenforceable, the remaining provisions shall continue in full force and effect.

**Entire agreement:** These Terms, together with the Privacy Policy and any applicable DPA, constitute the entire agreement between you and FlacronAI with respect to the Service and supersede all prior agreements.

**Contact:** For questions about these Terms, contact support@flacronenterprises.com.`,
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600 text-sm">Last updated: March 1, 2026 · Effective: March 1, 2026</p>
            <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-orange-300 text-sm">Please read these Terms of Service carefully before using FlacronAI. By creating an account or using any part of the Service, you agree to be bound by these Terms.</p>
            </div>
          </div>

          <div className="flex gap-8">
            {/* TOC */}
            <aside className="hidden lg:block w-48 shrink-0">
              <nav className="sticky top-24 space-y-1">
                {SECTIONS.map(s => (
                  <a key={s.id} href={`#${s.id}`}
                    className="block text-xs text-gray-500 hover:text-orange-400 py-1.5 px-2 rounded-lg hover:bg-gray-100 transition-colors leading-snug">
                    {s.title}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 space-y-8">
              {SECTIONS.map((section, i) => (
                <motion.div key={section.id} id={section.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 scroll-mt-24">{section.title}</h2>
                  <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                    {section.content.split('\n\n').map((para, pi) => {
                      const parts = para.split(/(\*\*[^*]+\*\*)/g);
                      return (
                        <p key={pi} className={para === para.toUpperCase() && para.length > 30 ? 'text-xs uppercase text-gray-500 leading-relaxed' : ''}>
                          {parts.map((p, ppi) => {
                            if (p.startsWith('**') && p.endsWith('**')) {
                              return <strong key={ppi} className="text-gray-900 font-semibold">{p.replace(/\*\*/g, '')}</strong>;
                            }
                            if (p.startsWith('- ')) {
                              return <span key={ppi} className="block ml-4 mb-1">• {p.slice(2)}</span>;
                            }
                            return p;
                          })}
                        </p>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
