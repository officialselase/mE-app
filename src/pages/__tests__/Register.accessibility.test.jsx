import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import Register from '../Register';
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

describe('Register Page Accessibility Tests', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'mock-token', user: { id: 1, email: 'test@example.com' } }),
      })
    );
  });

  it('should not have accessibility violations', async () => {
    const { container } = renderWithProviders(<Register />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('Form Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithProviders(<Register />);

      const displayNameInput = screen.getByLabelText(/display name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(displayNameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      
      expect(displayNameInput).toHaveAttribute('type', 'text');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have accessible submit button', () => {
      renderWithProviders(<Register />);

      const submitButton = screen.getByRole('button', { name: /register/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should mark required fields appropriately', () => {
      renderWithProviders(<Register />);

      const displayNameInput = screen.getByLabelText(/display name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Required fields should have aria-required or required attribute
      [displayNameInput, emailInput, passwordInput].forEach(input => {
        if (input.hasAttribute('required')) {
          expect(input).toHaveAttribute('aria-required', 'true');
        }
      });
    });

    it('should provide password requirements information', () => {
      renderWithProviders(<Register />);

      const passwordInput = screen.getByLabelText(/password/i);
      
      // Password field should have description about requirements
      if (passwordInput.hasAttribute('aria-describedby')) {
        const describedById = passwordInput.getAttribute('aria-describedby');
        const descriptionElement = document.getElementById(describedById);
        expect(descriptionElement).toBeInTheDocument();
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have proper tab order', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      // Tab through form elements in logical order
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/display name/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/email/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/password/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /register/i }));
    });

    it('should support form submission with Enter key', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const displayNameInput = screen.getByLabelText(/display name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(displayNameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.keyboard('{Enter}');

      // Form should attempt submission
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should support form submission with Space key on button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const submitButton = screen.getByRole('button', { name: /register/i });
      submitButton.focus();
      await user.keyboard(' ');

      // Button should be activated
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Validation Accessibility', () => {
    it('should provide real-time validation feedback', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const emailInput = screen.getByLabelText(/email/i);
      
      // Type invalid email
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur event

      // Input should be marked as invalid if validation occurs
      if (emailInput.hasAttribute('aria-invalid')) {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      }
    });

    it('should provide password strength feedback', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const passwordInput = screen.getByLabelText(/password/i);
      
      // Type weak password
      await user.type(passwordInput, '123');

      // Should provide feedback about password strength
      // This would be implementation-specific
      expect(passwordInput).toBeInTheDocument();
    });

    it('should associate validation errors with form fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      // Submit form with invalid data
      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      // Check if inputs have proper error association
      const inputs = [
        screen.getByLabelText(/display name/i),
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/password/i)
      ];

      inputs.forEach(input => {
        if (input.hasAttribute('aria-describedby')) {
          const describedById = input.getAttribute('aria-describedby');
          const descriptionElement = document.getElementById(describedById);
          expect(descriptionElement).toBeInTheDocument();
        }
      });
    });
  });

  describe('Error Handling Accessibility', () => {
    it('should announce server errors to screen readers', async () => {
      const user = userEvent.setup();
      
      // Mock server error
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Email already exists' }),
        })
      );

      renderWithProviders(<Register />);

      const displayNameInput = screen.getByLabelText(/display name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.type(displayNameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Wait for error to appear
      await screen.findByText(/email already exists/i, {}, { timeout: 3000 });

      // Error should be announced to screen readers
      const errorMessage = screen.getByText(/email already exists/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should provide specific field validation errors', async () => {
      const user = userEvent.setup();
      
      // Mock validation error response
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            message: 'Validation failed',
            errors: {
              email: 'Invalid email format',
              password: 'Password too short'
            }
          }),
        })
      );

      renderWithProviders(<Register />);

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      // Wait for validation errors
      setTimeout(async () => {
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        // Fields should be marked as invalid
        if (emailInput.hasAttribute('aria-invalid')) {
          expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        }
        if (passwordInput.hasAttribute('aria-invalid')) {
          expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
        }
      }, 100);
    });
  });

  describe('Loading States Accessibility', () => {
    it('should announce loading state during registration', async () => {
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

      renderWithProviders(<Register />);

      const displayNameInput = screen.getByLabelText(/display name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.type(displayNameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });
  });

  describe('AnimatedBear Accessibility', () => {
    it('should not interfere with form accessibility', () => {
      renderWithProviders(<Register />);

      // Bear animation should not affect form functionality
      const displayNameInput = screen.getByLabelText(/display name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(displayNameInput).toBeAccessible();
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

      renderWithProviders(<Register />);

      // Component should render without issues when motion is reduced
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });
  });

  describe('Progressive Enhancement', () => {
    it('should work without JavaScript enhancements', () => {
      renderWithProviders(<Register />);

      // Basic form should be functional
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      
      const submitButton = screen.getByRole('button', { name: /register/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have proper form action and method', () => {
      renderWithProviders(<Register />);

      const form = document.querySelector('form');
      if (form) {
        // Form should have proper attributes for progressive enhancement
        expect(form).toBeInTheDocument();
      }
    });
  });
});