import { motion } from 'framer-motion';
import { Zap, Target, Shield, Smile, Building2, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const VALUES = [
  {
    icon: Zap, title: 'Speed',
    desc: 'We believe every hour an adjuster spends writing is an hour not spent helping people. We obsess over reducing the time between inspection and submission.',
    color: 'text-yellow-400 bg-yellow-500/10',
  },
  {
    icon: Target, title: 'Accuracy',
    desc: 'Our AI is trained on thousands of real claims. We measure and improve output quality constantly, because a wrong report doesn\'t just waste time — it damages trust.',
    color: 'text-orange-400 bg-orange-500/10',
  },
  {
    icon: Shield, title: 'Security',
    desc: 'Insurance data is sensitive. We use enterprise-grade encryption, SOC 2 compliant infrastructure, and privacy-first architecture. Your data stays yours.',
    color: 'text-green-400 bg-green-500/10',
  },
  {
    icon: Smile, title: 'Simplicity',
    desc: 'We built the product we wished existed — no bloat, no confusing workflows. From photo upload to generated report in four steps. That\'s it.',
    color: 'text-pink-400 bg-pink-500/10',
  },
  {
    icon: Building2, title: 'Enterprise-Grade',
    desc: 'Whether you\'re an independent adjuster or a national agency, the platform scales to your needs. Custom branding, dedicated infrastructure, and SLA guarantees.',
    color: 'text-amber-400 bg-amber-500/10',
  },
  {
    icon: Heart, title: 'Customer First',
    desc: 'Our highest-priority features come from customer feedback. Our Enterprise clients get dedicated support and direct lines to our engineering team.',
    color: 'text-red-400 bg-red-500/10',
  },
];

const TEAM = [
  { name: 'Alex Morgan', role: 'Co-Founder & CEO', bio: 'Former insurance tech executive with 12+ years in the industry. Alex led claim operations for a top-5 national carrier before founding FlacronAI.' },
  { name: 'Sarah Chen', role: 'Co-Founder & CTO', bio: 'AI research background with expertise in computer vision and NLP. Sarah previously led ML teams at two enterprise SaaS companies before building the FlacronAI engine.' },
  { name: 'Marcus Davis', role: 'Head of Product', bio: 'Licensed independent adjuster turned product builder. Marcus brings real-world adjusting experience to every product decision, ensuring we build for how adjusters actually work.' },
];

const STATS = [
  { label: 'Founded', value: '2023' },
  { label: 'Reports Generated', value: '50,000+' },
  { label: 'Active Customers', value: '1,200+' },
  { label: 'Platform Uptime', value: '99.9%' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6">
            About Us
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Built by Adjusters, <span className="gradient-text">For Adjusters</span>
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            FlacronAI exists to eliminate the documentation bottleneck in insurance claims. We combine the latest AI technology with deep industry knowledge to give adjusters their time back.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-[#e5e7eb] bg-[#f8f8f8]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-gray-600 text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Story</h2>
            <div className="space-y-5 text-gray-600 leading-relaxed text-base">
              <p>
                FlacronAI began in a home office in Brooklyn, New York, in late 2023. Marcus Davis — a licensed independent adjuster with over eight years in the field — was sitting at his kitchen table at 11 PM, still writing reports for claims he'd inspected that morning. He had done the math: across his 20-claim week, he was spending more hours writing than he was on site. Something was deeply wrong with that ratio.
              </p>
              <p>
                Marcus reached out to his longtime friend Alex Morgan, who had spent a decade navigating the technology side of major insurance carriers, and Sarah Chen, who had been building machine learning systems for enterprise clients. The three of them agreed: the technology to fix this problem existed. It just hadn't been applied to this industry with the right domain depth.
              </p>
              <p>
                They spent six months building a proof of concept — combining GPT-4 Vision for photo analysis with IBM WatsonX for compliance structuring, wrapping it in an interface any adjuster could use without training. The first beta users reduced their per-report time from an average of 3.8 hours to under one hour. That data confirmed they were onto something real. FlacronAI launched publicly in February 2024 and has grown steadily through word-of-mouth within the adjusting community ever since.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-[#f8f8f8] border-y border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Values</h2>
            <p className="text-gray-600">The principles that guide every product decision we make.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.title} className="card p-5"
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <div className={`w-10 h-10 rounded-xl ${v.color.split(' ')[1]} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${v.color.split(' ')[0]}`} />
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-2">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">The Team</h2>
            <p className="text-gray-600">A small, focused team with deep insurance and AI expertise.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TEAM.map((member, i) => (
              <motion.div key={member.name} className="card p-5 text-center"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl font-bold text-orange-400 mx-auto mb-4">
                  {member.name[0]}
                </div>
                <h3 className="text-gray-900 font-semibold">{member.name}</h3>
                <p className="text-orange-400 text-xs font-medium mt-1 mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#f8f8f8] border-t border-[#e5e7eb]">
        <motion.div className="text-center max-w-xl mx-auto"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Try FlacronAI?</h2>
          <p className="text-gray-600 mb-6">Start free — no credit card required. Generate your first AI-powered claim report in minutes.</p>
          <a href="/auth" className="btn-primary inline-flex items-center gap-2">Get Started Free</a>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
