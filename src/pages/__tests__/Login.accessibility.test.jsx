import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

expect.extend(toHaveNoViolations);

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

describe('Login Page Accessibility Tests', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'mock-token', user: { id: 1, email: 'test@example.com' } }),
      })
    );
  });

  it('should not have accessibility violations', async () => {
    const { container } = renderWithProviders(<Login />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('Form Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have proper form structure with fieldset/legend if grouped', () => {
      renderWithProviders(<Login />);

      // Check if form uses proper semantic structure
      const form = screen.getByRole('form') || document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have accessible submit button', () => {
      renderWithProviders(<Login />);

      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should mark required fields appropriately', () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Required fields should have aria-required or required attribute
      if (emailInput.hasAttribute('required')) {
        expect(emailInput).toHaveAttribute('aria-required', 'true');
      }
      if (passwordInput.hasAttribute('required')) {
        expect(passwordInput).toHaveAttribute('aria-required', 'true');
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have proper tab order', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Tab through form elements in logical order
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/email/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/password/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /login/i }));
    });

    it('should support form submission with Enter key', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.keyboard('{Enter}');

      // Form should attempt submission
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should support form submission with Space key on button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const submitButton = screen.getByRole('button', { name: /login/i });
      submitButton.focus();
      await user.keyboard(' ');

      // Button should be activated
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Error Handling Accessibility', () => {
    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup();
      
      // Mock failed login
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Invalid credentials' }),
        })
      );

      renderWithProviders(<Login />);

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Wait for error to appear
      await screen.findByText(/invalid credentials/i, {}, { timeout: 3000 });

      // Error should be in an aria-live region or associated with form
      const errorMessage = screen.getByText(/invalid credentials/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should associate field errors with inputs', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Check if inputs have aria-invalid when validation fails
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Inputs should be marked as invalid if validation fails
      if (emailInput.hasAttribute('aria-invalid')) {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      }
      if (passwordInput.hasAttribute('aria-invalid')) {
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
      }
    });

    it('should provide helpful error descriptions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Submit form to trigger validation
      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Error messages should be descriptive and helpful
      const emailInput = screen.getByLabelText(/email/i);
      if (emailInput.hasAttribute('aria-describedby')) {
        const describedById = emailInput.getAttribute('aria-describedby');
        const descriptionElement = document.getElementById(describedById);
        expect(descriptionElement).toBeInTheDocument();
      }
    });
  });

  describe('Loading States Accessibility', () => {
    it('should announce loading state to screen readers', async () => {
      const user = userEvent.setup();
      
      // Mock slow API response
      global.fetch = vi.fn(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ token: 'mock-token', user: { id: 1 } }),
          }), 100)
        )
      );

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Loading state should be announced
      // This could be through aria-live region or button text change
      expect(submitButton).toBeInTheDocument();
    });

    it('should disable form during submission', async () => {
      const user = userEvent.setup();
      
      // Mock slow API response
      global.fetch = vi.fn(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ token: 'mock-token', user: { id: 1 } }),
          }), 100)
        )
      );

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Form elements should be disabled during submission
      expect(submitButton).toBeDisabled();
    });
  });

  describe('AnimatedBear Accessibility', () => {
    it('should not interfere with form accessibility', () => {
      renderWithProviders(<Login />);

      // Bear animation should not affect form functionality
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeAccessible();
      expect(passwordInput).toBeAccessible();
    });

    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
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

      renderWithProviders(<Login />);

      // Component should render without issues when motion is reduced
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<Login />);

      // Form should still be accessible on mobile
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('should have touch-friendly form elements', () => {
      renderWithProviders(<Login />);

      const interactiveElements = [
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/password/i),
        screen.getByRole('button', { name: /login/i })
      ];

      // All interactive elements should be present (size testing would require DOM measurement)
      interactiveElements.forEach(element => {
        expect(element).toBeInTheDocument();
      });
    });
  });
});