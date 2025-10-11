import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';

vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '../../context/AuthContext';

vi.mock('../../components/AnimatedBear', () => ({
  default: ({ isPasswordFocused, isEmailFocused, authState }) => (
    <div data-testid="animated-bear" data-password-focused={isPasswordFocused} data-email-focused={isEmailFocused} data-auth-state={authState}>
      Animated Bear
    </div>
  ),
}));

describe('Register Page', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  it('should render registration form', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('should validate display name', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const displayNameInput = screen.getByLabelText(/display name/i);
    await user.click(displayNameInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/display name is required/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should validate password length', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
        </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, 'short');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce({ id: '1', email: 'test@example.com', displayName: 'Test User' });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/display name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/display name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
  });

  it('should display error on failed registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(new Error('Email already exists'));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/display name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email already exists/i);
    });
  });

  it('should set bear password focused state', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.click(passwordInput);

    const bear = screen.getByTestId('animated-bear');
    expect(bear).toHaveAttribute('data-password-focused', 'true');
  });

  it('should set bear email focused state', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await user.click(emailInput);

    const bear = screen.getByTestId('animated-bear');
    expect(bear).toHaveAttribute('data-email-focused', 'true');
  });

  it('should have proper ARIA labels', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('should mark invalid fields with aria-invalid', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await user.click(emailInput);
    await user.tab();

    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
