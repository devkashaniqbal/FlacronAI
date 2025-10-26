// Demo Data & Templates for FlacronAI
// Helps users quickly try the system with sample data

export const DEMO_TEMPLATES = {
  waterDamage: {
    name: 'Water Damage - Kitchen',
    icon: '💧',
    data: {
      claimNumber: 'CLM-' + Date.now(),
      insuredName: 'John Smith',
      lossDate: new Date().toISOString().split('T')[0],
      lossType: 'Water',
      reportType: 'First Report',
      propertyAddress: '123 Main Street, Springfield, IL 62701',
      propertyDetails: '2-story single-family home, built in 1995, 2,200 sq ft, 3 bedrooms, 2.5 bathrooms',
      lossDescription: 'Homeowner discovered water damage in kitchen area on morning of ' + new Date().toLocaleDateString() + '. Water was leaking from dishwasher supply line connection. Homeowner immediately shut off water supply to dishwasher and contacted insurance company.',
      damages: 'Kitchen: Hardwood flooring buckled and warped in 150 sq ft area. Lower cabinets show water staining and swelling. Drywall along base of walls showing moisture damage approximately 18 inches high. Baseboards damaged and require replacement.',
      recommendations: '1. Extract remaining moisture from affected areas\n2. Set up dehumidifiers and air movers for 3-5 days\n3. Remove damaged flooring, baseboards, and lower portion of drywall\n4. Inspect subfloor for moisture damage\n5. Replace damaged dishwasher supply line\n6. Monitor for mold growth over next 2 weeks'
    }
  },

  fireDamage: {
    name: 'Fire Damage - Garage',
    icon: '🔥',
    data: {
      claimNumber: 'CLM-' + Date.now(),
      insuredName: 'Sarah Johnson',
      lossDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lossType: 'Fire',
      reportType: 'Interim Report',
      propertyAddress: '456 Oak Avenue, Portland, OR 97205',
      propertyDetails: '1-story ranch home, built in 2005, 1,800 sq ft, attached 2-car garage',
      lossDescription: 'Fire started in garage from electrical short in wall outlet. Homeowner noticed smoke and called 911. Fire department responded within 8 minutes. Fire was contained to garage area but smoke damage extends to adjacent living areas.',
      damages: 'Garage: Complete fire damage to interior walls, ceiling, and contents. Roof structure compromised in 200 sq ft area. Two garage door openers destroyed. All stored items total loss.\n\nAdjacent Rooms: Smoke damage to living room, hallway, and master bedroom. Walls and ceilings require cleaning and repainting. HVAC system contaminated with smoke and requires cleaning.',
      recommendations: '1. Board up garage opening for security\n2. Tarp damaged roof section\n3. Conduct air quality testing in living areas\n4. Clean HVAC system and replace filters\n5. Schedule structural engineer evaluation of roof framing\n6. Obtain contractor estimates for garage rebuild'
    }
  },

  windDamage: {
    name: 'Wind Damage - Roof',
    icon: '💨',
    data: {
      claimNumber: 'CLM-' + Date.now(),
      insuredName: 'Michael Chen',
      lossDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lossType: 'Wind',
      reportType: 'Final Report',
      propertyAddress: '789 Elm Street, Miami, FL 33130',
      propertyDetails: '2-story colonial home, built in 1988, 3,000 sq ft, composition shingle roof installed 2015',
      lossDescription: 'Severe thunderstorm with winds estimated at 70 mph passed through area on loss date. Multiple shingles blown off roof. Homeowner noticed missing shingles and water stain on upstairs ceiling the following day.',
      damages: 'Roof: Approximately 45 shingles missing from southwest facing slope. Exposed underlayment visible in 3 areas. Some granule loss on remaining shingles.\n\nInterior: Water stain on master bedroom ceiling, approximately 2 ft x 3 ft. Insulation in attic shows moisture. No structural damage observed.',
      recommendations: '1. Replace missing shingles and damaged underlayment\n2. Inspect and repair flashing around chimney\n3. Apply matching shingles to blend with existing roof\n4. Repair ceiling damage in master bedroom\n5. Replace wet insulation in attic\n6. Monitor for additional leaks after next rainfall'
    }
  },

  moldInspection: {
    name: 'Mold Inspection - Bathroom',
    icon: '🦠',
    data: {
      claimNumber: 'CLM-' + Date.now(),
      insuredName: 'Emily Rodriguez',
      lossDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lossType: 'Mold',
      reportType: 'First Report',
      propertyAddress: '321 Pine Road, Seattle, WA 98101',
      propertyDetails: 'Condo unit, built in 2010, 1,200 sq ft, 2 bedrooms, 2 bathrooms',
      lossDescription: 'Homeowner noticed musty odor and visible mold growth behind toilet in master bathroom. Investigation revealed slow leak from toilet supply line that went unnoticed for extended period.',
      damages: 'Master Bathroom: Mold growth visible on drywall behind toilet and along base of wall. Flooring shows signs of water damage. Subfloor potentially compromised. Visible mold covers approximately 8 sq ft area.',
      recommendations: '1. Conduct professional mold testing to identify species\n2. Contain affected area to prevent spore spread\n3. Remove and dispose of moldy drywall and flooring\n4. Inspect and treat subfloor\n5. Apply antimicrobial treatment to affected areas\n6. Repair toilet supply line\n7. Install new drywall, flooring, and baseboard\n8. Recommend dehumidifier for bathroom to prevent future growth'
    }
  }
};

/**
 * Template Manager Class
 */
export class TemplateManager {
  constructor() {
    this.userTemplates = this.loadUserTemplates();
  }

  loadUserTemplates() {
    try {
      const templates = localStorage.getItem('flacronai_user_templates');
      return templates ? JSON.parse(templates) : {};
    } catch (error) {
      console.error('Failed to load templates:', error);
      return {};
    }
  }

  saveUserTemplate(name, formData) {
    try {
      this.userTemplates[name] = {
        ...formData,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('flacronai_user_templates', JSON.stringify(this.userTemplates));
      return true;
    } catch (error) {
      console.error('Failed to save template:', error);
      return false;
    }
  }

  deleteUserTemplate(name) {
    delete this.userTemplates[name];
    localStorage.setItem('flacronai_user_templates', JSON.stringify(this.userTemplates));
  }

  getAllTemplates() {
    const all = {};

    // Add demo templates
    for (let [key, template] of Object.entries(DEMO_TEMPLATES)) {
      all[key] = { ...template, isDemo: true };
    }

    // Add user templates
    for (let [key, template] of Object.entries(this.userTemplates)) {
      all[key] = { name: key, data: template, isDemo: false, icon: '⭐' };
    }

    return all;
  }

  applyTemplate(templateKey, setFormData) {
    const templates = this.getAllTemplates();
    const template = templates[templateKey];

    if (!template) {
      console.error('Template not found:', templateKey);
      return false;
    }

    // Apply template data to form
    if (setFormData && typeof setFormData === 'function') {
      setFormData(template.data);
      return true;
    }

    return false;
  }
}

/**
 * React Component for Template Selector
 */
export const TemplateSelector = ({ onTemplateSelect, onTemplateSave, currentFormData }) => {
  const templateManager = new TemplateManager();
  const templates = templateManager.getAllTemplates();

  const handleTemplateClick = (templateKey) => {
    const template = templates[templateKey];
    if (template && onTemplateSelect) {
      onTemplateSelect(template.data);
    }
  };

  const handleSaveTemplate = () => {
    const templateName = prompt('Enter a name for this template:');
    if (!templateName) return;

    if (templateManager.saveUserTemplate(templateName, currentFormData)) {
      if (onTemplateSave) {
        onTemplateSave(templateName);
      }
      alert('Template saved successfully!');
    } else {
      alert('Failed to save template');
    }
  };

  return null; // This is exported as a utility, actual rendering done in components
};

/**
 * Get template selector HTML for vanilla JS
 */
export function createTemplateSelector(formId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const templateManager = new TemplateManager();
  const templates = templateManager.getAllTemplates();

  const selectorHTML = `
    <div class="template-selector" style="margin-bottom: 2rem; padding: 1.5rem; background: #f3f4f6; border-radius: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="margin: 0; font-size: 1.125rem; color: #1f2937;">
          <svg style="display: inline; width: 20px; height: 20px; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          Quick Start Templates
        </h3>
        <button id="saveTemplateBtn" class="btn-outline" style="padding: 6px 12px; font-size: 14px;">
          Save as Template
        </button>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 1rem;">Try it now with sample data or use a saved template</p>
      <div class="template-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
        ${Object.entries(templates).map(([key, template]) => `
          <button class="template-card" data-template="${key}" style="
            padding: 1rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="font-size: 24px; margin-bottom: 0.5rem;">${template.icon || '📋'}</div>
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 0.25rem;">${template.name}</div>
            <div style="font-size: 12px; color: #6b7280;">
              ${template.isDemo ? '📋 Demo' : '⭐ My Template'}
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = selectorHTML;

  // Add event listeners
  container.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      const templateKey = card.dataset.template;
      const form = document.getElementById(formId);

      if (form) {
        const template = templates[templateKey];
        const data = template.data;

        // Fill form with template data
        for (let [key, value] of Object.entries(data)) {
          const input = form.elements[key];
          if (input) {
            input.value = value;

            // Trigger multiple events for React compatibility
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

            // Force React state update by setting the value descriptor
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              'value'
            ).set;
            nativeInputValueSetter.call(input, value);

            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }

        // Show toast notification if available
        if (window.showToast) {
          window.showToast(`Template "${template.name}" applied!`, 'success');
        }
      }

      // Visual feedback
      card.style.borderColor = '#FF7C08';
      card.style.background = '#fff7ed';
      setTimeout(() => {
        card.style.borderColor = '';
        card.style.background = '';
      }, 1000);
    });

    // Hover effect
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = '#FF7C08';
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 4px 12px rgba(255, 124, 8, 0.15)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '#e5e7eb';
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  // Save template button
  document.getElementById('saveTemplateBtn')?.addEventListener('click', () => {
    const templateName = prompt('Enter a name for this template:');
    if (!templateName) return;

    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    if (templateManager.saveUserTemplate(templateName, data)) {
      if (window.showToast) {
        window.showToast('Template saved successfully!', 'success');
      }
      // Refresh selector
      createTemplateSelector(formId, containerId);
    }
  });

  return templateManager;
}

export default {
  DEMO_TEMPLATES,
  TemplateManager,
  TemplateSelector,
  createTemplateSelector
};
