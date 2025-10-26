// UX Enhancement Utilities for FlacronAI React
// Collection of micro-interactions and delightful features

// ============================================
// 1. COPY TO CLIPBOARD
// ============================================
export async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);

    // Show success feedback
    const originalHTML = button ? button.innerHTML : null;
    if (button) {
      button.innerHTML = `
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Copied!
      `;
      button.style.background = '#10b981';

      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = '';
      }, 2000);
    }

    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
}

// ============================================
// 2. SMART FIELD FORMATTING
// ============================================
export class SmartFieldFormatter {
  static formatPhone(value) {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      cleaned = `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
    }
    return cleaned;
  }

  static capitalizeName(value) {
    return value.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  static formatCurrency(value) {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const number = parseFloat(cleaned);
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(number);
  }

  static formatDate(value) {
    // Format as YYYY-MM-DD for input[type="date"]
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }
}

// ============================================
// 3. BROWSER NOTIFICATIONS
// ============================================
export class BrowserNotifications {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Browser notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async notify(title, options = {}) {
    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      console.log('Notification permission denied');
      return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) options.onClick();
    };

    return notification;
  }
}

// ============================================
// 4. LOADING STATES WITH PERSONALITY
// ============================================
const loadingMessages = [
  { text: 'Analyzing property details... 🏠', delay: 0 },
  { text: 'AI is thinking... 🤔', delay: 2000 },
  { text: 'Generating your report... ✨', delay: 4000 },
  { text: 'Adding final touches... 🎨', delay: 6000 },
  { text: 'Almost there... 🎯', delay: 8000 }
];

export class PersonalizedLoading {
  constructor(updateCallback) {
    this.updateCallback = updateCallback;
    this.messageIndex = 0;
    this.interval = null;
  }

  start() {
    this.messageIndex = 0;
    this.updateMessage();

    this.interval = setInterval(() => {
      this.messageIndex++;
      if (this.messageIndex < loadingMessages.length) {
        this.updateMessage();
      }
    }, 2500);
  }

  updateMessage() {
    if (this.updateCallback && loadingMessages[this.messageIndex]) {
      this.updateCallback(loadingMessages[this.messageIndex].text);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// ============================================
// 5. SUCCESS ANIMATIONS & CELEBRATIONS
// ============================================
export function celebrate(message, type = 'success') {
  // Create celebration overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 2rem 3rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    z-index: 10000;
    text-align: center;
    animation: scaleIn 0.3s ease-out;
  `;

  overlay.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 1rem;">
      ${type === 'success' ? '🎉' : type === 'milestone' ? '🏆' : '✨'}
    </div>
    <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 0.5rem;">
      ${message}
    </h2>
    ${type === 'milestone' ? '<p style="color: #6b7280;">Keep up the great work!</p>' : ''}
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes scaleIn {
      from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
      to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    @keyframes confettiFall {
      to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
  `;
  if (!document.getElementById('celebration-animations')) {
    style.id = 'celebration-animations';
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);

  // Add confetti effect for milestones
  if (type === 'milestone' || type === 'success') {
    createConfetti();
  }

  // Remove after 3 seconds
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  }, 3000);
}

function createConfetti() {
  const colors = ['#FF7C08', '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      top: -10px;
      left: ${Math.random() * 100}%;
      opacity: 1;
      animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
      z-index: 9999;
    `;
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 4000);
  }
}

// ============================================
// 6. KEYBOARD SHORTCUTS
// ============================================
export class KeyboardShortcuts {
  static init(onSave, onSubmit) {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          onSave();
          showToast('Draft saved!', 'success');
        }
      }

      // Ctrl/Cmd + Enter to submit form
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (onSubmit) {
          onSubmit();
        }
      }
    });
  }

  static cleanup() {
    // Remove event listeners if needed
  }
}

// ============================================
// 7. SESSION TIMEOUT WARNING
// ============================================
export class SessionManager {
  constructor(timeoutMinutes = 30, onTimeout) {
    this.timeoutMs = timeoutMinutes * 60 * 1000;
    this.warningMs = 2 * 60 * 1000; // Warn 2 minutes before
    this.timeoutId = null;
    this.warningId = null;
    this.onTimeout = onTimeout;

    this.init();
  }

  init() {
    this.resetTimer();

    // Reset on user activity
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimer(), true);
    });
  }

  resetTimer() {
    clearTimeout(this.timeoutId);
    clearTimeout(this.warningId);

    // Set warning
    this.warningId = setTimeout(() => this.showWarning(), this.timeoutMs - this.warningMs);

    // Set timeout
    this.timeoutId = setTimeout(() => this.handleTimeout(), this.timeoutMs);
  }

  showWarning() {
    const modal = document.createElement('div');
    modal.id = 'sessionWarningModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    modal.innerHTML = `
      <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 400px; text-align: center;">
        <h3 style="margin-bottom: 1rem;">Still there?</h3>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">Your session will expire in 2 minutes due to inactivity.</p>
        <button id="extendSessionBtn" style="padding: 0.75rem 2rem; background: #FF7C08; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Extend Session
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('extendSessionBtn').addEventListener('click', () => {
      modal.remove();
      this.resetTimer();
    });
  }

  handleTimeout() {
    if (this.onTimeout) {
      this.onTimeout();
    }
  }

  cleanup() {
    clearTimeout(this.timeoutId);
    clearTimeout(this.warningId);
  }
}

// ============================================
// 8. TOAST NOTIFICATIONS
// ============================================
export function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toasts
  const existing = document.querySelectorAll('.toast');
  existing.forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideUp 0.3s ease-out;
  `;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  toast.innerHTML = `<strong>${icon}</strong> ${message}`;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  if (!document.getElementById('toast-animations')) {
    style.id = 'toast-animations';
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// 9. FORM VALIDATION HELPERS
// ============================================
export class FormValidation {
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  }

  static isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  }

  static validateField(value, rules) {
    const errors = [];

    if (rules.required && !value) {
      errors.push('This field is required');
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Minimum ${rules.minLength} characters required`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Maximum ${rules.maxLength} characters allowed`);
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.patternMessage || 'Invalid format');
    }

    return errors;
  }
}

// ============================================
// 10. DEBOUNCE UTILITY
// ============================================
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// EXPORTS
// ============================================
export default {
  copyToClipboard,
  SmartFieldFormatter,
  BrowserNotifications,
  PersonalizedLoading,
  celebrate,
  showToast,
  KeyboardShortcuts,
  SessionManager,
  FormValidation,
  debounce
};
