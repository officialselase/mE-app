import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '../../context/AuthContext';

// Mock AnimatedBear component
vi.mock('../../components/AnimatedBear', () => ({
  default: ({ isPasswordFocused, isEmailFocused, authState }) => (
    <div data-testid="animated-bear" data-password-focused={isPasswordFocused} data-email-focused={isEmailFocused} data-auth-state={authState}>
      Animated Bear
    </div>
  ),
}));

describe('Login Page', () => {
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  describe('Rendering', () => {
    it('should render login form with all fields', () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    it('should render animated bear component', () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      expect(screen.getByTestId('animated-bear')).toBeInTheDocument();
    });

    it('should render link to registration page', () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const registerLink = screen.getByRole('link', { name: /create one/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty email', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.click(emailInput);
      await user.tab(); // Blur the field

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty password', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const passwordInput = screen.getByLabelText(/password/i);
      await user.click(passwordInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for password less than 8 characters', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'short');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      await user.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });

    it('should not submit form with validation errors', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should successfully submit form with valid credentials', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({ id: '1', email: 'test@example.com' });

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    it('should disable form fields during submission', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });

    it('should display error message on failed login', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
      });
    });

    it('should display generic error message when error has no message', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error());

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/login failed/i);
      });
    });
  });

  describe('Bear Animation States', () => {
    it('should set password focused state when password field is focused', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const passwordInput = screen.getByLabelText(/password/i);
      await user.click(passwordInput);

      const bear = screen.getByTestId('animated-bear');
      expect(bear).toHaveAttribute('data-password-focused', 'true');
    });

    it('should set email focused state when email field is focused', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.click(emailInput);

      const bear = screen.getByTestId('animated-bear');
      expect(bear).toHaveAttribute('data-email-focused', 'true');
    });

    it('should set success auth state on successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({ id: '1', email: 'test@example.com' });

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        const bear = screen.getByTestId('animated-bear');
        expect(bear).toHaveAttribute('data-auth-state', 'success');
      });
    });

    it('should set error auth state on failed login', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        const bear = screen.getByTestId('animated-bear');
        expect(bear).toHaveAttribute('data-auth-state', 'error');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should mark invalid fields with aria-invalid', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should associate error messages with fields using aria-describedby', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      });
    });

    it('should announce errors with aria-live', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'polite');
      });
    });
  });
});
