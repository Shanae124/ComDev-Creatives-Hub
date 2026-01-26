// Course Content Interactive Initializer
// This script ensures all interactive elements in course content work properly

(function() {
  'use strict';

  // Function to initialize interactive elements
  window.initializeCourseContent = function() {
    console.log('Initializing course content interactive elements...');

    // Find all content containers
    const containers = document.querySelectorAll('.course-content, .module-content');
    
    containers.forEach(function(container) {
      // Make all buttons clickable
      const buttons = container.querySelectorAll('button, .btn, [role="button"]');
      buttons.forEach(function(btn) {
        btn.style.cursor = 'pointer';
        btn.style.pointerEvents = 'auto';
      });

      // Make all links clickable
      const links = container.querySelectorAll('a');
      links.forEach(function(link) {
        link.style.cursor = 'pointer';
        link.style.pointerEvents = 'auto';
      });

      // Make all inputs interactive
      const inputs = container.querySelectorAll('input, select, textarea');
      inputs.forEach(function(input) {
        input.style.pointerEvents = 'auto';
      });

      console.log('Initialized', buttons.length, 'buttons,', links.length, 'links,', inputs.length, 'inputs');
    });
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeCourseContent);
  } else {
    window.initializeCourseContent();
  }

  // Re-initialize on navigation or content changes
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      let shouldReinit = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          shouldReinit = true;
        }
      });
      if (shouldReinit) {
        setTimeout(window.initializeCourseContent, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
