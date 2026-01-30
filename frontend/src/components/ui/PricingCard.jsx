import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import RainbowButton from './RainbowButton';
import ShimmerButton from './ShimmerButton';

const PricingCard = ({
  name,
  price,
  period,
  description,
  features,
  link,
  onClick,
  isFeatured = false,
  isAnnual = false,
  index = 0
}) => {
  // Calculate annual price (20% discount)
  const displayPrice = isAnnual && price !== '0' && price !== 'Custom'
    ? (parseFloat(price) * 0.8 * 12).toFixed(0)
    : price;

  const displayPeriod = isAnnual && price !== '0' && price !== 'Custom' ? '/year' : period;

  return (
    <motion.div
      className={`pricing-card-premium ${isFeatured ? 'featured-card' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -8, scale: isFeatured ? 1.02 : 1 }}
    >
      {isFeatured && (
        <div className="featured-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#000000"/>
          </svg>
          Most Popular
        </div>
      )}

      {/* Glassmorphic border glow */}
      <div className="card-border-glow" />

      {/* Card content */}
      <div className="card-header-premium">
        <h3 className="plan-name-premium">{name}</h3>
        {description && <p className="plan-description-premium">{description}</p>}
      </div>

      <div className="price-display-premium">
        {price === 'Custom' ? (
          <div className="custom-price">Contact Us</div>
        ) : (
          <>
            <span className="price-currency-premium">$</span>
            <span className="price-amount-premium">{displayPrice}</span>
            <span className="price-period-premium">{displayPeriod}</span>
          </>
        )}
      </div>

      <ul className="features-list-premium">
        {features.map((feature, idx) => (
          <li key={idx} className={!feature.available ? 'unavailable' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              {feature.available ? (
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#FF7C08"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            <span>{feature.text}</span>
            {feature.tooltip && (
              <div className="feature-tooltip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="tooltip-text">{feature.tooltip}</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {isFeatured ? (
        <RainbowButton to={link} className="pricing-cta-premium">
          Get Started
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </RainbowButton>
      ) : onClick ? (
        <motion.button
          className="pricing-shimmer-btn"
          onClick={onClick}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="shimmer-btn-content">
            {name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.button>
      ) : (
        <Link to={link} className="pricing-link-wrapper">
          <motion.button
            className="pricing-shimmer-btn"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="shimmer-btn-content">
              {name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.button>
        </Link>
      )}

      <style jsx>{`
        .pricing-card-premium {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          padding-top: 4rem;
          margin-top: 1.5rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: visible;
        }

        .pricing-card-premium.featured-card {
          border: 2px solid rgba(255, 124, 8, 0.6);
          background: rgba(255, 124, 8, 0.05);
          transform: scale(1.05);
        }

        .pricing-card-premium:hover {
          border-color: rgba(255, 124, 8, 0.4);
          box-shadow: 0 20px 60px rgba(255, 124, 8, 0.2);
        }

        .pricing-card-premium.featured-card:hover {
          box-shadow: 0 30px 80px rgba(255, 124, 8, 0.4);
        }

        .card-border-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(
            135deg,
            transparent,
            rgba(255, 124, 8, 0.1),
            transparent
          );
          border-radius: 24px;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .pricing-card-premium:hover .card-border-glow {
          opacity: 1;
        }

        .featured-badge {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.8rem;
          background: linear-gradient(135deg, #FF7C08 0%, #FF9F40 100%);
          color: #000000;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 100px;
          box-shadow: 0 10px 30px rgba(255, 124, 8, 0.5);
          z-index: 10;
          white-space: nowrap;
        }

        .card-header-premium {
          margin-bottom: 2rem;
          text-align: center;
        }

        .plan-name-premium {
          font-size: 1.75rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 0.5rem;
        }

        .plan-description-premium {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
        }

        .price-display-premium {
          display: flex;
          align-items: baseline;
          justify-content: center;
          margin-bottom: 2.5rem;
          min-height: 80px;
        }

        .custom-price {
          font-size: 2rem;
          font-weight: 800;
          color: #FF7C08;
        }

        .price-currency-premium {
          font-size: 1.5rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          margin-right: 0.25rem;
        }

        .price-amount-premium {
          font-size: 4rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, #FFFFFF 0%, #FF7C08 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .price-period-premium {
          font-size: 1rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.4);
          margin-left: 0.5rem;
        }

        .features-list-premium {
          list-style: none;
          margin-bottom: 2.5rem;
        }

        .features-list-premium li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 0;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .features-list-premium li.unavailable {
          color: rgba(255, 255, 255, 0.3);
          text-decoration: line-through;
        }

        .features-list-premium li svg {
          flex-shrink: 0;
        }

        .feature-tooltip {
          position: relative;
          display: inline-flex;
          margin-left: auto;
          color: rgba(255, 124, 8, 0.8);
          cursor: help;
        }

        .tooltip-text {
          position: absolute;
          bottom: 100%;
          right: 0;
          margin-bottom: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #000000;
          color: #FFFFFF;
          font-size: 0.8rem;
          border: 1px solid rgba(255, 124, 8, 0.3);
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 10;
        }

        .feature-tooltip:hover .tooltip-text {
          opacity: 1;
        }

        .pricing-cta-premium {
          width: 100%;
          display: flex !important;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .pricing-cta-premium-shimmer {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .pricing-link-wrapper {
          display: block;
          text-decoration: none;
          width: 100%;
        }

        .pricing-shimmer-btn {
          width: 100%;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 124, 8, 0.3);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .pricing-shimmer-btn:hover {
          border-color: rgba(255, 124, 8, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 24px rgba(255, 124, 8, 0.25);
        }

        .shimmer-btn-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1.05rem;
          font-weight: 600;
          color: #FFFFFF;
          text-transform: none;
        }

        @media (max-width: 768px) {
          .pricing-card-premium {
            padding: 2rem 1.5rem;
          }

          .pricing-card-premium.featured-card {
            transform: scale(1);
          }

          .price-amount-premium {
            font-size: 3rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default PricingCard;
