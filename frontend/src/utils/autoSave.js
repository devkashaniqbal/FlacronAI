// Auto-Save Functionality for React
// Automatically saves form data to prevent data loss

import { useEffect, useRef, useCallback } from 'react';

/**
 * React Hook for Auto-Save functionality
 * @param {string} formId - Unique identifier for the form
 * @param {Object} formData - Current form data object
 * @param {Object} options - Configuration options
 * @returns {Object} - Auto-save utilities
 */
export const useAutoSave = (formId, formData, options = {}) => {
  const {
    saveInterval = 3000, // 3 seconds
    excludeFields = ['password', 'passwordConfirm'],
    onSave = null,
    enabled = true
  } = options;

  const saveTimeoutRef = useRef(null);
  const lastSavedRef = useRef(null);
  const storageKey = `autosave_${formId}`;

  // Save data to localStorage
  const saveData = useCallback(() => {
    if (!enabled) return;

    try {
      const dataToSave = {};

      // Filter out excluded fields
      Object.keys(formData).forEach(key => {
        if (!excludeFields.includes(key) && formData[key] !== null && formData[key] !== undefined) {
          // Skip file inputs
          if (!(formData[key] instanceof FileList) && !(formData[key] instanceof File)) {
            dataToSave[key] = formData[key];
          }
        }
      });

      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      lastSavedRef.current = new Date();

      // Call custom onSave callback
      if (onSave) {
        onSave(dataToSave);
      }

      // Show save indicator
      showSaveIndicator();
    } catch (error) {
      console.error('Failed to auto-save form data:', error);
    }
  }, [formData, excludeFields, onSave, enabled, storageKey]);

  // Schedule save with debouncing
  useEffect(() => {
    if (!enabled) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule new save
    saveTimeoutRef.current = setTimeout(() => {
      saveData();
    }, saveInterval);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, saveInterval, saveData, enabled]);

  // Restore saved data
  const restoreData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (!savedData) return null;

      const data = JSON.parse(savedData);
      return data;
    } catch (error) {
      console.error('Failed to restore form data:', error);
      return null;
    }
  }, [storageKey]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      console.log('Auto-saved data cleared');
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  }, [storageKey]);

  // Manual save trigger
  const manualSave = useCallback(() => {
    saveData();
  }, [saveData]);

  return {
    restoreData,
    clearSavedData,
    manualSave,
    lastSaved: lastSavedRef.current
  };
};

/**
 * Show save indicator notification
 */
const showSaveIndicator = () => {
  // Remove existing indicator
  const existing = document.getElementById('autosave-indicator');
  if (existing) {
    existing.remove();
  }

  // Create new indicator
  const indicator = document.createElement('div');
  indicator.id = 'autosave-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 16px;
    background: #10b981;
    color: white;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-out 1.7s;
  `;

  indicator.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span>Draft saved</span>
  `;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  if (!document.getElementById('autosave-animations')) {
    style.id = 'autosave-animations';
    document.head.appendChild(style);
  }

  document.body.appendChild(indicator);

  // Remove after animation
  setTimeout(() => {
    indicator.remove();
  }, 2000);
};

/**
 * Class-based AutoSave (for non-React usage)
 */
export class AutoSave {
  constructor(formId, options = {}) {
    this.form = document.getElementById(formId);
    if (!this.form) {
      console.error(`Form with id "${formId}" not found`);
      return;
    }

    this.storageKey = options.storageKey || `autosave_${formId}`;
    this.saveInterval = options.saveInterval || 3000; // 3 seconds
    this.onSave = options.onSave || null;
    this.excludeFields = options.excludeFields || ['password', 'passwordConfirm'];

    this.saveTimeout = null;
    this.lastSaved = null;
    this.indicator = null;

    this.init();
  }

  init() {
    // Create save indicator
    this.createSaveIndicator();

    // Restore saved data
    this.restoreData();

    // Listen to form changes
    this.form.addEventListener('input', () => this.scheduleSave());
    this.form.addEventListener('change', () => this.scheduleSave());

    // Clear data on successful submit
    this.form.addEventListener('submit', () => this.clearSavedData());

    console.log(`✓ Auto-save enabled for form: ${this.form.id}`);
  }

  createSaveIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'autosave-indicator';
    this.indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 8px 16px;
      background: #10b981;
      color: white;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(this.indicator);
  }

  scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveData();
    }, this.saveInterval);
  }

  saveData() {
    const formData = new FormData(this.form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      if (!this.excludeFields.includes(key)) {
        const input = this.form.elements[key];
        if (input && input.type === 'file') {
          continue;
        }
        data[key] = value;
      }
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.lastSaved = new Date();
      this.showSaveIndicator();

      if (this.onSave) {
        this.onSave(data);
      }
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }

  restoreData() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (!savedData) return;

      const data = JSON.parse(savedData);
      let restoredCount = 0;

      for (let [key, value] of Object.entries(data)) {
        const input = this.form.elements[key];
        if (input && value) {
          if (input.type === 'checkbox') {
            input.checked = value === 'on' || value === true;
          } else if (input.type === 'radio') {
            const radio = this.form.querySelector(`input[name="${key}"][value="${value}"]`);
            if (radio) radio.checked = true;
          } else {
            input.value = value;
          }
          restoredCount++;
        }
      }

      if (restoredCount > 0) {
        this.showRestoreNotification(restoredCount);
      }
    } catch (error) {
      console.error('Failed to restore form data:', error);
    }
  }

  showSaveIndicator() {
    const timeText = this.formatTime(this.lastSaved);
    this.indicator.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>Saved ${timeText}</span>
    `;
    this.indicator.style.opacity = '1';

    setTimeout(() => {
      this.indicator.style.opacity = '0';
    }, 2000);
  }

  showRestoreNotification(count) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: #3b82f6;
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Previous draft restored (${count} fields)</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  formatTime(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 120) return '1 minute ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 7200) return '1 hour ago';
    return `${Math.floor(seconds / 3600)} hours ago`;
  }

  clearSavedData() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('Auto-saved data cleared');
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  }

  destroy() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    if (this.indicator) {
      this.indicator.remove();
    }
  }
}

export default { useAutoSave, AutoSave };
