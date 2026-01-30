import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/layout';
import '../styles/elite-landing.css';

const Blog = () => {
  useEffect(() => {
    document.title = 'Blog - FlacronAI';
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
    {
      id: 1,
      title: 'The Future of AI in Insurance Claim Processing',
      excerpt: 'Discover how artificial intelligence is revolutionizing the insurance industry and streamlining claim workflows.',
      date: 'January 8, 2025',
      category: 'Industry Insights',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&q=80',
      author: 'Sarah Johnson',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'How FlacronAI Reduces Report Generation Time by 80%',
      excerpt: 'Learn about the innovative technology behind FlacronAI that helps insurance professionals save valuable time.',
      date: 'January 5, 2025',
      category: 'Product Updates',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&q=80',
      author: 'Michael Chen',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'Best Practices for Property Damage Assessment',
      excerpt: 'Expert tips and techniques for conducting thorough and accurate property damage assessments.',
      date: 'January 2, 2025',
      category: 'Best Practices',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop&q=80',
      author: 'Emily Rodriguez',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'Understanding IBM WatsonX AI Integration',
      excerpt: 'Deep dive into how we leverage IBM WatsonX AI to deliver accurate and reliable insurance reports.',
      date: 'December 28, 2024',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop&q=80',
      author: 'John Smith',
      readTime: '8 min read'
    },
    {
      id: 5,
      title: 'Compliance and Security in Insurance Tech',
      excerpt: 'How FlacronAI ensures data security and regulatory compliance for all insurance reports.',
      date: 'December 25, 2024',
      category: 'Security',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=500&fit=crop&q=80',
      author: 'Sarah Johnson',
      readTime: '5 min read'
    },
    {
      id: 6,
      title: 'Customer Success Story: 500+ Reports Generated',
      excerpt: 'How one insurance agency transformed their workflow with FlacronAI and achieved remarkable results.',
      date: 'December 20, 2024',
      category: 'Case Studies',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=80',
      author: 'Michael Chen',
      readTime: '4 min read'
    }
  ];

  const categories = ['All', 'Industry Insights', 'Product Updates', 'Best Practices', 'Technology', 'Security', 'Case Studies'];

  return (
    <>
      <Navbar />

      <div className="blog-page" style={{ paddingTop: '100px', paddingBottom: '80px', background: '#FFFFFF' }}>
        {/* Hero Section */}
        <section style={{ padding: '60px 0', background: 'linear-gradient(to bottom, rgba(255, 124, 8, 0.15) 0%, rgba(255, 124, 8, 0.05) 50%, transparent 100%)' }}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
            >
              <h1 style={{ fontSize: '3rem', fontWeight: '700', color: '#000000', marginBottom: '1rem' }}>
                Blog & Insights
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'rgba(0, 0, 0, 0.7)', lineHeight: '1.6' }}>
                Stay updated with the latest insights, product updates, and industry trends in insurance technology.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section style={{ padding: '40px 0' }}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              {categories.map((category, index) => (
                <button
                  key={index}
                  style={{
                    padding: '0.5rem 1.5rem',
                    background: index === 0 ? '#FF7C08' : '#FFFFFF',
                    color: index === 0 ? '#FFFFFF' : '#000000',
                    border: `1px solid ${index === 0 ? '#FF7C08' : 'rgba(255, 124, 8, 0.3)'}`,
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section style={{ padding: '40px 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(255, 124, 8, 0.2)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                    <img
                      src={post.image}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: '#FF7C08',
                      color: '#FFFFFF',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {post.category}
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#000000', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                      {post.title}
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'rgba(0, 0, 0, 0.7)', lineHeight: '1.6', marginBottom: '1rem' }}>
                      {post.excerpt}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgba(0, 0, 0, 0.7)' }}>
                        By {post.author}
                      </span>
                      <Link
                        to={`/blog/${post.id}`}
                        style={{
                          color: '#FF7C08',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        Read More
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section style={{ padding: '80px 0', background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 124, 8, 0.05) 50%, transparent 100%)' }}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                maxWidth: '700px',
                margin: '0 auto',
                textAlign: 'center',
                background: '#FFFFFF',
                border: '1px solid rgba(255, 124, 8, 0.2)',
                borderRadius: '8px',
                padding: '3rem 2rem'
              }}
            >
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#000000', marginBottom: '1rem' }}>
                Subscribe to Our Newsletter
              </h2>
              <p style={{ fontSize: '1rem', color: 'rgba(0, 0, 0, 0.7)', marginBottom: '2rem', lineHeight: '1.6' }}>
                Get the latest insights, product updates, and industry trends delivered directly to your inbox.
              </p>
              <div style={{ display: 'flex', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.25rem',
                    border: '1px solid rgba(255, 124, 8, 0.3)',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <button
                  style={{
                    padding: '0.75rem 2rem',
                    background: '#FF7C08',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Subscribe
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Blog;
