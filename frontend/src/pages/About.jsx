import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/layout';
import '../styles/about.css';
import '../styles/elite-landing.css';

const About = () => {
  useEffect(() => {
    document.title = 'About Us - FlacronAI';
    window.scrollTo(0, 0);
  }, []);

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      bio: 'Former insurance executive with 15+ years of experience in claims processing and digital transformation.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      bio: 'AI/ML expert with background in natural language processing and enterprise software development.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Product',
      bio: 'Product leader passionate about building tools that solve real-world problems in the insurance industry.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Customer Success',
      bio: 'Dedicated to ensuring every customer achieves their goals with FlacronAI.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80'
    }
  ];

  const values = [
    {
      icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>,
      title: 'Accuracy First',
      description: 'We believe in delivering precise, reliable reports that insurance professionals can trust.'
    },
    {
      icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>,
      title: 'Innovation',
      description: 'Constantly pushing the boundaries of what AI can do for the insurance industry.'
    },
    {
      icon: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round"/>,
      title: 'Customer Success',
      description: 'Your success is our success. We are committed to helping you achieve your goals.'
    },
    {
      icon: <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"/>,
      title: 'Security & Privacy',
      description: 'Enterprise-grade security to protect your sensitive data at all times.'
    }
  ];

  return (
    <>
      <Navbar />

      <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div
            className="about-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>Transforming Insurance Reporting with AI</h1>
            <p>
              We're on a mission to revolutionize how insurance professionals create reports,
              saving time and improving accuracy through the power of artificial intelligence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-grid">
            <motion.div
              className="story-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2>Our Story</h2>
              <p>
                FlacronAI was born from firsthand experience with the challenges of insurance
                report generation. Our founders spent years in the insurance industry, witnessing
                adjusters spending countless hours on repetitive paperwork instead of focusing
                on complex claims and customer service.
              </p>
              <p>
                In 2024, we decided to do something about it. By combining cutting-edge AI
                technology from IBM WatsonX and Microsoft with deep insurance industry expertise,
                we created FlacronAI - a platform that generates professional, accurate reports
                in seconds instead of hours.
              </p>
              <p>
                Today, we're proud to serve hundreds of insurance professionals, helping them
                process thousands of claims more efficiently while maintaining the highest
                standards of quality and compliance.
              </p>
            </motion.div>
            <motion.div
              className="story-image"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80" alt="Team collaboration" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </motion.div>
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="value-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="value-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {value.icon}
                  </svg>
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Meet Our Team</h2>
            <p>The people behind FlacronAI</p>
          </motion.div>
          <div className="team-grid">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="team-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <img src={member.image} alt={member.name} />
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to Transform Your Workflow?</h2>
            <p>Join hundreds of insurance professionals using FlacronAI</p>
            <Link to="/auth" className="cta-button">
              Get Started Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
      </div>

      <Footer />
    </>
  );
};

export default About;
