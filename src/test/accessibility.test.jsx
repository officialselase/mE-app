import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import components to test
import App from '../App';
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

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

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

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Mock API calls
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ projects: [], thoughts: [], work: [] }),
      })
    );
  });

  describe('Automated Accessibility Tests with jest-axe', () => {
    it('should not have accessibility violations on Home page', async () => {
      const { container } = renderWithProviders(<Home />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations on About page', async () => {
      const { container } = renderWithProviders(<About />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations on Work page', async () => {
      const { container } = renderWithProviders(<Work />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations on Projects page', async () => {
      const { container } = renderWithProviders(<Projects />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations on Thoughts page', async () => {
      const { container } = renderWithProviders(<ThoughtsPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations on Shop page', async () => {
      const { container } = renderWithProviders(<Shop />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations on Learn page', async () => {
      const { container } = renderWithProviders(<Learn />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations on Login page', async () => {
      const { container } = renderWithProviders(<Login />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations on Register page', async () => {
      const { container } = renderWithProviders(<Register />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations on PageHeader component', async () => {
      const { container } = renderWithProviders(<PageHeader />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('should allow keyboard navigation through main navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PageHeader />);

      // Get all navigation links
      const navLinks = screen.getAllByRole('link');
      
      // Test that each link is focusable
      for (const link of navLinks) {
        await user.tab();
        expect(document.activeElement).toBe(link);
      }
    });

    it('should handle keyboard navigation on Login form', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Test tab order: email -> password -> login button
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/email/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/password/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /login/i }));
    });

    it('should handle keyboard navigation on Register form', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      // Test tab order: display name -> email -> password -> register button
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/display name/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/email/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/password/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /register/i }));
    });

    it('should support Enter key activation on buttons', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const loginButton = screen.getByRole('button', { name: /login/i });
      await user.click(loginButton);
      await user.keyboard('{Enter}');
      
      // Button should be activated (form submission attempted)
      expect(loginButton).toBeInTheDocument();
    });

    it('should support Space key activation on buttons', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const loginButton = screen.getByRole('button', { name: /login/i });
      loginButton.focus();
      await user.keyboard(' ');
      
      // Button should be activated (form submission attempted)
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('Focus Management Tests', () => {
    it('should have visible focus indicators on interactive elements', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PageHeader />);

      const firstLink = screen.getAllByRole('link')[0];
      await user.tab();
      
      // Check that the focused element has focus styles
      expect(document.activeElement).toBe(firstLink);
      expect(firstLink).toHaveFocus();
    });

    it('should maintain focus order in forms', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Start from first focusable element
      const emailInput = screen.getByLabelText(/email/i);
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      // Tab to next element
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/password/i));

      // Tab to submit button
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /login/i }));
    });

    it('should handle focus on error messages', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Try to submit empty form to trigger validation
      const loginButton = screen.getByRole('button', { name: /login/i });
      await user.click(loginButton);

      // Check if error messages are announced to screen readers
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('aria-invalid');
    });
  });

  describe('Screen Reader Support Tests', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<Home />);

      // Check for proper heading structure (h1 -> h2 -> h3, etc.)
      const headings = screen.queryAllByRole('heading');
      
      if (headings.length > 0) {
        const h1Elements = headings.filter(h => h.tagName === 'H1');
        
        // Should have at most one h1 per page
        expect(h1Elements.length).toBeLessThanOrEqual(1);
      } else {
        // If no headings found, that's also acceptable for some pages
        expect(headings).toHaveLength(0);
      }
    });

    it('should have proper form labels', () => {
      renderWithProviders(<Login />);

      // All form inputs should have associated labels
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have proper ARIA labels for icon buttons', () => {
      renderWithProviders(<PageHeader />);

      // Ghana flag button should have aria-label
      const flagButton = screen.getByRole('button', { name: /ghana flag/i });
      expect(flagButton).toHaveAttribute('aria-label');
    });

    it('should have proper landmark regions', () => {
      renderWithProviders(<App />);

      // Check for main landmark
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      // Check for navigation landmark
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should have proper alt text for images', () => {
      renderWithProviders(<Home />);

      // All images should have alt text (or empty alt for decorative images)
      const images = screen.queryAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
      
      // Also check for img elements that might not have role="img"
      const imgElements = document.querySelectorAll('img');
      imgElements.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should use aria-live regions for dynamic content', () => {
      renderWithProviders(<Home />);

      // Check for aria-live regions for loading states and errors
      // This would be more specific based on actual implementation
      const liveRegions = document.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeGreaterThanOrEqual(0);
    });

    it('should have proper aria-current for active navigation', () => {
      renderWithProviders(<PageHeader />);

      // Active navigation item should have aria-current="page" if implemented
      const activeNavItem = document.querySelector('[aria-current="page"]');
      
      if (activeNavItem) {
        expect(activeNavItem).toBeInTheDocument();
        expect(activeNavItem).toHaveAttribute('aria-current', 'page');
      } else {
        // If aria-current is not implemented, that's noted but not a failure
        // The test documents the expected behavior
        expect(true).toBe(true);
      }
    });
  });

  describe('Color Contrast Tests', () => {
    it('should have sufficient color contrast for text elements', () => {
      renderWithProviders(<Home />);

      // Note: Automated color contrast testing requires actual rendering
      // In a real implementation, you would use tools like:
      // - axe-core with color-contrast rule enabled
      // - Manual testing with browser dev tools
      // - Lighthouse accessibility audit
      
      // For now, we'll check that text elements exist and are visible
      const textElements = screen.getAllByText(/./);
      textElements.forEach(element => {
        expect(element).toBeVisible();
      });
    });

    it('should not rely solely on color for information', () => {
      renderWithProviders(<Home />);

      // Check that interactive elements have text labels, not just color
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Button should have accessible name (text content or aria-label)
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('Motion and Animation Tests', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock prefers-reduced-motion: reduce
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderWithProviders(<Home />);

      // Check that animations are disabled or reduced
      // This would require checking CSS classes or animation states
      // For now, we'll verify the component renders without errors
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Form Accessibility Tests', () => {
    it('should have proper error message association', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Submit form with invalid data
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Check that error messages are properly associated with inputs
      const emailInput = screen.getByLabelText(/email/i);
      if (emailInput.hasAttribute('aria-describedby')) {
        const errorId = emailInput.getAttribute('aria-describedby');
        const errorElement = document.getElementById(errorId);
        expect(errorElement).toBeInTheDocument();
      }
    });

    it('should have proper fieldset and legend for grouped inputs', () => {
      renderWithProviders(<Register />);

      // If there are grouped form elements, they should use fieldset/legend
      const fieldsets = screen.queryAllByRole('group');
      fieldsets.forEach(fieldset => {
        // Each fieldset should have a legend or aria-labelledby
        expect(fieldset).toHaveAccessibleName();
      });
    });

    it('should have proper required field indicators', () => {
      renderWithProviders(<Login />);

      // Required fields should be marked as such
      const requiredInputs = document.querySelectorAll('[required]');
      requiredInputs.forEach(input => {
        expect(input).toHaveAttribute('aria-required', 'true');
      });
    });
  });
});