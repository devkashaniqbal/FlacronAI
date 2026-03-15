import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, User, Tag, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BLOG_POSTS } from './Blog';

function parseHeadings(content) {
  const lines = content.split('\n');
  return lines
    .filter(l => l.startsWith('## '))
    .map(l => ({ text: l.replace('## ', '').trim(), id: l.replace('## ', '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
}

function renderContent(content) {
  const lines = content.split('\n');
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      const text = line.replace('## ', '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      elements.push(
        <h2 key={i} id={id} className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-24">{text}</h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold text-gray-900 mt-6 mb-2">{line.replace('### ', '')}</h3>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      const text = line.replace(/\*\*/g, '');
      elements.push(
        <p key={i} className="text-gray-900 font-semibold mt-4 mb-1">{text}</p>
      );
    } else if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].replace('- ', ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-3 text-gray-700 text-sm leading-relaxed ml-2">
          {items.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      );
      continue;
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      // Inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((p, pi) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          return <strong key={pi} className="text-gray-900 font-semibold">{p.replace(/\*\*/g, '')}</strong>;
        }
        return p;
      });
      elements.push(
        <p key={i} className="text-gray-700 text-sm leading-relaxed my-1">{rendered}</p>
      );
    }
    i++;
  }
  return elements;
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.slug === slug);
  const [activeHeading, setActiveHeading] = useState('');
  const contentRef = useRef();

  const headings = post ? parseHeadings(post.content) : [];
  const related = post ? BLOG_POSTS.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 2) : [];

  useEffect(() => {
    if (!post) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveHeading(e.target.id); });
    }, { rootMargin: '-20% 0px -70% 0px' });
    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [post, headings]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#ffffff]">
        <Navbar />
        <div className="pt-24 text-center py-20">
          <p className="text-gray-600 text-lg mb-4">Post not found.</p>
          <button onClick={() => navigate('/blog')} className="btn-primary text-sm py-2 px-6">Back to Blog</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate('/blog')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Article */}
            <article className="lg:col-span-3" ref={contentRef}>
              <div className="mb-6">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mb-4 inline-block ${
                  post.category === 'Technology' ? 'bg-orange-500/20 text-orange-400' :
                  post.category === 'Industry' ? 'bg-orange-500/20 text-orange-400' :
                  post.category === 'Tips' ? 'bg-green-500/20 text-green-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>{post.category}</span>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" /> {post.author.name}
                    <span className="text-gray-600">· {post.author.role}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {post.readingTime}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 text-base leading-relaxed mb-8 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 italic">
                {post.excerpt}
              </p>

              <div className="prose-content">
                {renderContent(post.content)}
              </div>

              {/* Author Card */}
              <div className="card p-5 mt-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-lg font-bold text-orange-400 shrink-0">
                  {post.author.name[0]}
                </div>
                <div>
                  <p className="text-gray-900 font-semibold">{post.author.name}</p>
                  <p className="text-gray-600 text-sm">{post.author.role} at FlacronAI</p>
                  <p className="text-gray-500 text-sm mt-1">Expert in insurance claims technology and AI-assisted documentation.</p>
                </div>
              </div>

              {/* Related Posts */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Related Posts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {related.map(r => (
                      <div key={r.slug} className="card p-4 cursor-pointer hover:border-orange-500/40 transition-colors group"
                        onClick={() => navigate(`/blog/${r.slug}`)}>
                        <span className="text-xs text-gray-500">{r.category}</span>
                        <h4 className="text-gray-900 text-sm font-semibold mt-1 mb-2 group-hover:text-orange-300 transition-colors leading-snug">{r.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" /> {r.readingTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* TOC Sidebar */}
            {headings.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="card p-4">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">Table of Contents</h3>
                    <nav className="space-y-1">
                      {headings.map(h => (
                        <a key={h.id} href={`#${h.id}`}
                          className={`block text-xs py-1.5 px-2 rounded-lg transition-colors leading-snug ${
                            activeHeading === h.id ? 'bg-orange-500/20 text-orange-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                          {h.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
