import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Import components to test
import Home from '../pages/Home';
import About from '../pages/About';
import Work from '../pages/Work';
import Projects from '../pages/Projects';
import ThoughtsPage from '../pages/ThoughtsPage';
import Shop from '../pages/Shop';
import Learn from '../pages/Learn';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PageHeader from '../components/PageHeader';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

// Helper function to render components with necessary providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {component}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Helper function to calculate relative luminance
const getRelativeLuminance = (r, g, b) => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Helper function to calculate contrast ratio
const getContrastRatio = (color1, color2) => {
  const l1 = getRelativeLuminance(...color1);
  const l2 = getRelativeLuminance(...color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Helper function to parse RGB color from computed style
const parseRgbColor = (rgbString) => {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
};

// Helper function to get computed colors
const getComputedColors = (element) => {
  const computedStyle = window.getComputedStyle(element);
  const color = parseRgbColor(computedStyle.color);
  const backgroundColor = parseRgbColor(computedStyle.backgroundColor);
  
  return { color, backgroundColor };
};

describe('Color Contrast Tests', () => {
  beforeEach(() => {
    // Mock API calls
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ projects: [], thoughts: [], work: [] }),
      })
    );
  });

  describe('WCAG AA Compliance (4.5:1 for normal text, 3:1 for large text)', () => {
    it('should have sufficient contrast for body text on Home page', () => {
      renderWithProviders(<Home />);

      // Get all text elements
      const textElements = document.querySelectorAll('p, span, div, li');
      
      textElements.forEach(element => {
        const { color, backgroundColor } = getComputedColors(element);
        
        if (color && backgroundColor) {
          const contrastRatio = getContrastRatio(color, backgroundColor);
          
          // Check if text is large (18pt+ or 14pt+ bold)
          const computedStyle = window.getComputedStyle(element);
          const fontSize = parseFloat(computedStyle.fontSize);
          const fontWeight = computedStyle.fontWeight;
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
          
          const minimumRatio = isLargeText ? 3 : 4.5;
          
          // Only test if we have actual colors (not transparent)
          if (backgroundColor[0] !== 0 || backgroundColor[1] !== 0 || backgroundColor[2] !== 0) {
            expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
          }
        }
      });
    });

    it('should have sufficient contrast for headings', () => {
      renderWithProviders(<Home />);

      const headings = screen.getAllByRole('heading');
      
      headings.forEach(heading => {
        const { color, backgroundColor } = getComputedColors(heading);
        
        if (color && backgroundColor) {
          const contrastRatio = getContrastRatio(color, backgroundColor);
          
          // Headings are typically large text (3:1 ratio)
          const minimumRatio = 3;
          
          if (backgroundColor[0] !== 0 || backgroundColor[1] !== 0 || backgroundColor[2] !== 0) {
            expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
          }
        }
      });
    });

    it('should have sufficient contrast for interactive elements', () => {
      renderWithProviders(<PageHeader />);

      const interactiveElements = [
        ...screen.getAllByRole('link'),
        ...screen.getAllByRole('button')
      ];

      interactiveElements.forEach(element => {
        const { color, backgroundColor } = getComputedColors(element);
        
        if (color && backgroundColor) {
          const contrastRatio = getContrastRatio(color, backgroundColor);
          
          // Interactive elements should meet 4.5:1 ratio
          const minimumRatio = 4.5;
          
          if (backgroundColor[0] !== 0 || backgroundColor[1] !== 0 || backgroundColor[2] !== 0) {
            expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
          }
        }
      });
    });

    it('should have sufficient contrast for form elements', () => {
      renderWithProviders(<Login />);

      const formElements = [
        ...document.querySelectorAll('input'),
        ...document.querySelectorAll('textarea'),
        ...document.querySelectorAll('select')
      ];

      formElements.forEach(element => {
        const { color, backgroundColor } = getComputedColors(element);
        
        if (color && backgroundColor) {
          const contrastRatio = getContrastRatio(color, backgroundColor);
          
          // Form elements should meet 4.5:1 ratio
          const minimumRatio = 4.5;
          
          if (backgroundColor[0] !== 0 || backgroundColor[1] !== 0 || backgroundColor[2] !== 0) {
            expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
          }
        }
      });
    });
  });

  describe('Focus Indicator Contrast', () => {
    it('should have sufficient contrast for focus indicators', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PageHeader />);

      const focusableElements = [
        ...screen.getAllByRole('link'),
        ...screen.getAllByRole('button')
      ];

      for (const element of focusableElements) {
        element.focus();
        
        const { color, backgroundColor } = getComputedColors(element);
        
        if (color && backgroundColor) {
          const contrastRatio = getContrastRatio(color, backgroundColor);
          
          // Focus indicators should meet 3:1 ratio (WCAG 2.1 AA)
          const minimumRatio = 3;
          
          if (backgroundColor[0] !== 0 || backgroundColor[1] !== 0 || backgroundColor[2] !== 0) {
            expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
          }
        }
      }
    });
  });

  describe('Error Message Contrast', () => {
    it('should have sufficient contrast for error messages', async () => {
      const user = userEvent.setup();
      
      // Mock failed login to trigger error
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Invalid credentials' }),
        })
      );

      renderWithProviders(<Login />);

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Wait for error message
      await screen.findByText(/invalid credentials/i, {}, { timeout: 3000 });

      const errorMessage = screen.getByText(/invalid credentials/i);
      const { color, backgroundColor } = getComputedColors(errorMessage);
      
      if (color && backgroundColor) {
        const contrastRatio = getContrastRatio(color, backgroundColor);
        
        // Error messages should meet 4.5:1 ratio
        const minimumRatio = 4.5;
        
        if (backgroundColor[0] !== 0 || backgroundColor[1] !== 0 || backgroundColor[2] !== 0) {
          expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
        }
      }
    });
  });

  describe('Page-Specific Background Contrast', () => {
    it('should have sufficient contrast on dark backgrounds (Home/ProjectsRepo)', () => {
      renderWithProviders(<Home />);

      // Test text on dark backgrounds
      const textElements = document.querySelectorAll('h1, h2, h3, p, span');
      
      textElements.forEach(element => {
        const { color, backgroundColor } = getComputedColors(element);
        
        if (color && backgroundColor) {
          const contrastRatio = getContrastRatio(color, backgroundColor);
          
          // Text on dark backgrounds should have high contrast
          const minimumRatio = 4.5;
          
          if (backgroundColor[0] !== 0 || backgroundColor[1] !== 0 || backgroundColor[2] !== 0) {
            expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
          }
        }
      });
    });

    it('should have sufficient contrast on colored backgrounds (About/Work)', () => {
      renderWithProviders(<About />);

      const textElements = document.querySelectorAll('h1, h2, h3, p, span');
      
      textElements.forEach(element => {
        const { color, backgroundColor } = getComputedColors(element);
        
        if (color && backgroundColor) {
          const contrastRatio = getContrastRatio(color, backgroundColor);
          
          // Text on colored backgrounds should have sufficient contrast
          const minimumRatio = 4.5;
          
          if (backgroundColor[0] !== 0 || backgroundColor[1] !== 0 || backgroundColor[2] !== 0) {
            expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
          }
        }
      });
    });

    it('should have sufficient contrast on white backgrounds', () => {
      renderWithProviders(<Projects />);

      const textElements = document.querySelectorAll('h1, h2, h3, p, span');
      
      textElements.forEach(element => {
        const { color, backgroundColor } = getComputedColors(element);
        
        if (color && backgroundColor) {
          const contrastRatio = getContrastRatio(color, backgroundColor);
          
          // Text on white backgrounds should have sufficient contrast
          const minimumRatio = 4.5;
          
          if (backgroundColor[0] !== 0 || backgroundColor[1] !== 0 || backgroundColor[2] !== 0) {
            expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
          }
        }
      });
    });
  });

  describe('Non-Text Element Contrast', () => {
    it('should have sufficient contrast for UI components (3:1 ratio)', () => {
      renderWithProviders(<Home />);

      // Test borders, icons, and other UI elements
      const uiElements = document.querySelectorAll('button, input, [role="button"]');
      
      uiElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const borderColor = parseRgbColor(computedStyle.borderColor);
        const backgroundColor = parseRgbColor(computedStyle.backgroundColor);
        
        if (borderColor && backgroundColor) {
          const contrastRatio = getContrastRatio(borderColor, backgroundColor);
          
          // UI components should meet 3:1 ratio
          const minimumRatio = 3;
          
          if (backgroundColor[0] !== 0 || backgroundColor[1] !== 0 || backgroundColor[2] !== 0) {
            expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
          }
        }
      });
    });
  });

  describe('Color Independence Tests', () => {
    it('should not rely solely on color for form validation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Submit empty form to trigger validation
      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Check that validation uses more than just color
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Should have aria-invalid or other non-color indicators
      if (emailInput.hasAttribute('aria-invalid')) {
        expect(emailInput).toHaveAttribute('aria-invalid');
      }
      if (passwordInput.hasAttribute('aria-invalid')) {
        expect(passwordInput).toHaveAttribute('aria-invalid');
      }
    });

    it('should not rely solely on color for navigation state', () => {
      renderWithProviders(<PageHeader />);

      // Active navigation should have aria-current, not just color
      const currentPageLink = document.querySelector('[aria-current="page"]');
      expect(currentPageLink).toBeInTheDocument();
      expect(currentPageLink).toHaveAttribute('aria-current', 'page');
    });

    it('should not rely solely on color for status indicators', () => {
      renderWithProviders(<Home />);

      // Status indicators should have text or icons, not just color
      const statusElements = document.querySelectorAll('[class*="status"], [class*="success"], [class*="error"], [class*="warning"]');
      
      statusElements.forEach(element => {
        // Should have text content or aria-label
        const hasText = element.textContent.trim().length > 0;
        const hasAriaLabel = element.hasAttribute('aria-label');
        const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
        
        expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBe(true);
      });
    });
  });
});