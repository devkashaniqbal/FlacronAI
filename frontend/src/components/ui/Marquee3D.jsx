import { motion } from 'framer-motion';
import ReviewCard from './ReviewCard';

const Marquee3D = () => {
  // High-quality fake reviews for Insurance AI
  const reviews = [
    {
      name: "Jennifer Martinez",
      initials: "JM",
      role: "VP of Claims Operations",
      company: "National Insurance Group",
      rating: 5,
      text: "FlacronAI has revolutionized our claims processing workflow. What used to take 3-5 days now takes mere hours. The AI-generated reports are incredibly accurate and our adjusters can focus on complex cases instead of routine paperwork.",
      useCase: "Claims Processing",
      date: "2 weeks ago",
      verified: true,
      aiVerified: true
    },
    {
      name: "David Chen",
      initials: "DC",
      role: "Chief Technology Officer",
      company: "SecureLife Insurance",
      rating: 5,
      text: "The integration with IBM watsonx and Microsoft gives us confidence in the accuracy and security of every report. Our compliance team loves the audit trail, and the API access makes automation seamless.",
      useCase: "Policy Automation",
      date: "1 month ago",
      verified: true,
      aiVerified: true
    },
    {
      name: "Sarah Thompson",
      initials: "ST",
      role: "Director of Underwriting",
      company: "Premier Health Insurance",
      rating: 5,
      text: "We process over 500 insurance reports monthly, and FlacronAI has cut our turnaround time by 70%. The custom branding feature means our clients don't even know we're using AI—it looks like our in-house team.",
      useCase: "Underwriting",
      date: "3 weeks ago",
      verified: true,
      aiVerified: true
    },
    {
      name: "Michael Rodriguez",
      initials: "MR",
      role: "Senior Claims Manager",
      company: "Atlantic Insurance Partners",
      rating: 5,
      text: "The accuracy is astounding. FlacronAI picks up on details our manual process sometimes missed. The SOC 2 compliance and enterprise-grade security were critical for us, and they delivered flawlessly.",
      useCase: "Claims Processing",
      date: "2 months ago",
      verified: true,
      aiVerified: true
    },
    {
      name: "Emily Watson",
      initials: "EW",
      role: "Head of Digital Transformation",
      company: "Global Insurance Solutions",
      rating: 5,
      text: "Implementing FlacronAI was the easiest AI integration we've done. The API documentation is excellent, support is responsive, and the white-label portal fits perfectly into our existing infrastructure.",
      useCase: "Digital Transformation",
      date: "1 week ago",
      verified: true,
      aiVerified: true
    },
    {
      name: "Robert Kim",
      initials: "RK",
      role: "Operations Director",
      company: "Midwest Claims Bureau",
      rating: 5,
      text: "Our team was skeptical about AI, but FlacronAI proved itself immediately. The reports are comprehensive, legally sound, and our clients actually prefer them. We've scaled from 50 to 200 reports per month effortlessly.",
      useCase: "Operations Scaling",
      date: "2 weeks ago",
      verified: true,
      aiVerified: true
    },
    {
      name: "Amanda Foster",
      initials: "AF",
      role: "Chief Operating Officer",
      company: "TechGuard Insurance",
      rating: 5,
      text: "The ROI was evident within the first month. We've reduced labor costs, improved accuracy, and our customer satisfaction scores have increased. The unlimited reports on the Enterprise plan are a game-changer.",
      useCase: "Cost Optimization",
      date: "3 weeks ago",
      verified: true,
      aiVerified: true
    },
    {
      name: "James Wilson",
      initials: "JW",
      role: "Lead Underwriter",
      company: "Precision Risk Analytics",
      rating: 5,
      text: "FlacronAI understands insurance nuances better than any other AI tool we tested. The reports include all necessary regulatory language, and the DOCX export feature makes editing effortless when needed.",
      useCase: "Risk Analytics",
      date: "1 month ago",
      verified: true,
      aiVerified: true
    }
  ];

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <div className="marquee-3d-container">
      <div className="marquee-3d-header">
        <motion.h2
          className="marquee-3d-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Trusted by Insurance Professionals
        </motion.h2>
        <motion.p
          className="marquee-3d-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          See what industry leaders are saying about FlacronAI
        </motion.p>
      </div>

      <div className="marquee-3d-wrapper">
        <motion.div
          className="marquee-3d-track"
          animate={{
            x: ['0%', '-50%']
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          {duplicatedReviews.map((review, index) => (
            <ReviewCard key={`review-${index}`} review={review} index={index} />
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .marquee-3d-container {
          width: 100%;
          background: #FFFFFF;
          padding: 6rem 0;
          overflow: hidden;
          position: relative;
        }

        .marquee-3d-header {
          max-width: 1200px;
          margin: 0 auto 4rem;
          text-align: center;
          padding: 0 2rem;
        }

        .marquee-3d-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: #000000;
          margin: 0 0 1rem 0;
          letter-spacing: -0.02em;
        }

        .marquee-3d-subtitle {
          font-size: 1.1rem;
          color: rgba(0, 0, 0, 0.6);
          margin: 0;
        }

        .marquee-3d-wrapper {
          width: 100%;
          overflow: hidden;
          position: relative;
          perspective: 1500px;
          transform-style: preserve-3d;
          padding: 2rem 0;

          /* Fade mask on edges for 3D effect */
          mask-image: linear-gradient(
            to right,
            transparent,
            black 5%,
            black 95%,
            transparent
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 5%,
            black 95%,
            transparent
          );
        }

        .marquee-3d-track {
          display: flex;
          gap: 2.5rem;
          width: max-content;
          will-change: transform;
          transform: rotateX(0deg) rotateY(0deg);
          transform-style: preserve-3d;
        }

        @media (max-width: 768px) {
          .marquee-3d-container {
            padding: 4rem 0;
          }

          .marquee-3d-header {
            margin-bottom: 3rem;
            padding: 0 1rem;
          }

          .marquee-3d-subtitle {
            font-size: 1rem;
          }

          .marquee-3d-track {
            gap: 1.5rem;
            transform: rotateX(0deg) rotateY(0deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Marquee3D;
