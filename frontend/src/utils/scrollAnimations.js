// Scroll Animations for React
// Adds smooth entrance animations as elements come into view

import { useEffect, useRef } from 'react';

/**
 * React Hook for Scroll Animations
 * @param {Object} options - Animation options
 * @returns {ref} - Ref to attach to elements
 */
export const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    animationClass = 'animated'
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(animationClass);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            entry.target.classList.remove(animationClass);
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold
      }
    );

    element.classList.add('animate-on-scroll');
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, animationClass]);

  return elementRef;
};

/**
 * Class-based Scroll Animations
 */
export class ScrollAnimations {
  constructor(options = {}) {
    this.observer = null;
    this.options = {
      threshold: 0.1,
      rootMargin: '0px',
      animationClass: 'animated',
      ...options
    };
    this.init();
  }

  init() {
    // Create Intersection Observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(this.options.animationClass);
            // Optionally stop observing after animation
            // this.observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );

    // Start observing
    this.observe();
  }

  observe() {
    // Add animate-on-scroll class to elements that should animate
    const animateElements = document.querySelectorAll(`
      .feature-card,
      .pricing-card,
      .hero-card,
      .form-section,
      .result-header,
      .animate-on-scroll
    `);

    animateElements.forEach((el, index) => {
      el.classList.add('animate-on-scroll');
      el.style.transitionDelay = `${index * 0.1}s`;
      this.observer.observe(el);
    });
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Initialize scroll animations (for non-React usage)
 */
export const initScrollAnimations = () => {
  const animations = new ScrollAnimations();
  console.log('✨ Scroll animations initialized');
  return animations;
};

/**
 * Parallax scroll effect
 */
export const addParallaxEffect = (selector = '.hero') => {
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll(selector);

    parallaxElements.forEach(element => {
      element.style.transform = `translateY(${scrolled * 0.5}px)`;
    });
  };

  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

/**
 * React Hook for Parallax Effect
 */
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      element.style.transform = `translateY(${scrolled * speed}px)`;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return elementRef;
};

/**
 * Add smooth hover effect to cards
 */
export const addCardHoverEffect = () => {
  const cards = document.querySelectorAll('.feature-card, .pricing-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
};

/**
 * React Hook for Card Hover Effect
 */
export const useCardHover = () => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return cardRef;
};

/**
 * Add ripple effect to buttons
 */
export const addRippleEffect = () => {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple-effect');

      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add CSS for ripple effect
  const style = document.createElement('style');
  style.textContent = `
    .btn {
      position: relative;
      overflow: hidden;
    }

    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    }

    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;
  if (!document.getElementById('ripple-animations')) {
    style.id = 'ripple-animations';
    document.head.appendChild(style);
  }
};

/**
 * React Hook for Ripple Effect
 */
export const useRipple = () => {
  const buttonRef = useRef(null);

  const createRipple = (e) => {
    const button = buttonRef.current;
    if (!button) return;

    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  };

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    // Ensure button has proper styles
    button.style.position = 'relative';
    button.style.overflow = 'hidden';

    // Add CSS animation if not already present
    if (!document.getElementById('ripple-animations')) {
      const style = document.createElement('style');
      style.id = 'ripple-animations';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return { buttonRef, createRipple };
};

/**
 * Fade in on scroll with stagger effect
 */
export const fadeInOnScroll = (selector, staggerDelay = 100) => {
  const elements = document.querySelectorAll(selector);

  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.6s ease-out ${index * staggerDelay}ms, transform 0.6s ease-out ${index * staggerDelay}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
  });
};

/**
 * Export all utilities
 */
export default {
  useScrollAnimation,
  ScrollAnimations,
  initScrollAnimations,
  addParallaxEffect,
  useParallax,
  addCardHoverEffect,
  useCardHover,
  addRippleEffect,
  useRipple,
  fadeInOnScroll
};
