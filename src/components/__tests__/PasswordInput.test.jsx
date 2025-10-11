import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PasswordInput from '../PasswordInput';

describe('PasswordInput', () => {
  it('renders password input with label', () => {
    render(
      <PasswordInput
        id="test-password"
        value=""
        onChange={() => {}}
        label="Test Password"
      />
    );

    expect(screen.getByLabelText(/test password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(
      <PasswordInput
        id="test-password"
        value="testpassword"
        onChange={() => {}}
        label="Test Password"
      />
    );

    const input = screen.getByLabelText(/test password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Initially password should be hidden
    expect(input).toHaveAttribute('type', 'password');

    // Click to show password
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('shows password strength indicator when enabled', () => {
    render(
      <PasswordInput
        id="test-password"
        value="TestPass123!"
        onChange={() => {}}
        label="Test Password"
        showStrengthIndicator={true}
      />
    );

    expect(screen.getByText(/password strength:/i)).toBeInTheDocument();
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('shows error message when provided', () => {
    render(
      <PasswordInput
        id="test-password"
        value=""
        onChange={() => {}}
        label="Test Password"
        error="Password is required"
      />
    );

    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/test password/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('calls onChange when input value changes', () => {
    const handleChange = vi.fn();
    render(
      <PasswordInput
        id="test-password"
        value=""
        onChange={handleChange}
        label="Test Password"
      />
    );

    const input = screen.getByLabelText(/test password/i);
    fireEvent.change(input, { target: { value: 'newpassword' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('disables input and toggle button when disabled prop is true', () => {
    render(
      <PasswordInput
        id="test-password"
        value=""
        onChange={() => {}}
        label="Test Password"
        disabled={true}
      />
    );

    const input = screen.getByLabelText(/test password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(input).toBeDisabled();
    expect(toggleButton).toHaveAttribute('tabIndex', '-1');
  });
});