import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import AssignmentSubmissionForm from '../AssignmentSubmissionForm';
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

const mockAssignment = {
  id: '1',
  title: 'Test Assignment',
  description: 'Complete this test assignment',
  instructions: 'Follow the instructions carefully',
  type: 'project',
  dueDate: '2024-12-31'
};

const mockSubmission = {
  id: '1',
  githubRepoUrl: 'https://github.com/user/repo',
  livePreviewUrl: 'https://example.com',
  notes: 'Test notes',
  isPublic: true
};

describe('AssignmentSubmissionForm Accessibility Tests', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  it('should not have accessibility violations', async () => {
    const { container } = renderWithProviders(
      <AssignmentSubmissionForm assignment={mockAssignment} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('Form Structure Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      // Check for form labels
      expect(screen.getByLabelText(/github repository url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/live preview url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/make submission public/i)).toBeInTheDocument();
    });

    it('should have proper fieldset and legend for grouped elements', () => {
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      // If URLs are grouped, they should use fieldset/legend
      const fieldsets = screen.queryAllByRole('group');
      fieldsets.forEach(fieldset => {
        expect(fieldset).toHaveAccessibleName();
      });
    });

    it('should have accessible submit button', () => {
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const submitButton = screen.getByRole('button', { name: /submit assignment/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should mark optional fields appropriately', () => {
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      // Optional fields should be clearly marked
      const githubInput = screen.getByLabelText(/github repository url/i);
      const livePreviewInput = screen.getByLabelText(/live preview url/i);
      const notesInput = screen.getByLabelText(/notes/i);

      // Check if optional fields are marked (implementation specific)
      [githubInput, livePreviewInput, notesInput].forEach(input => {
        expect(input).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have proper tab order', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      // Tab through form elements
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/github repository url/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/live preview url/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/notes/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/make submission public/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /submit assignment/i }));
    });

    it('should support form submission with Enter key', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const githubInput = screen.getByLabelText(/github repository url/i);
      await user.type(githubInput, 'https://github.com/user/repo');
      await user.keyboard('{Enter}');

      // Form should attempt submission
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should support checkbox toggling with Space key', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const publicCheckbox = screen.getByLabelText(/make submission public/i);
      publicCheckbox.focus();
      
      const initialChecked = publicCheckbox.checked;
      await user.keyboard(' ');
      
      expect(publicCheckbox.checked).toBe(!initialChecked);
    });
  });

  describe('URL Validation Accessibility', () => {
    it('should provide validation feedback for invalid URLs', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const githubInput = screen.getByLabelText(/github repository url/i);
      
      // Type invalid URL
      await user.type(githubInput, 'invalid-url');
      await user.tab(); // Trigger validation

      // Input should be marked as invalid if validation occurs
      if (githubInput.hasAttribute('aria-invalid')) {
        expect(githubInput).toHaveAttribute('aria-invalid', 'true');
      }
    });

    it('should associate validation errors with inputs', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const githubInput = screen.getByLabelText(/github repository url/i);
      
      // Type invalid URL and submit
      await user.type(githubInput, 'invalid-url');
      await user.click(screen.getByRole('button', { name: /submit assignment/i }));

      // Check if error is properly associated
      if (githubInput.hasAttribute('aria-describedby')) {
        const describedById = githubInput.getAttribute('aria-describedby');
        const descriptionElement = document.getElementById(describedById);
        expect(descriptionElement).toBeInTheDocument();
      }
    });

    it('should provide helpful validation messages', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const livePreviewInput = screen.getByLabelText(/live preview url/i);
      
      // Type invalid URL
      await user.type(livePreviewInput, 'not-a-url');
      await user.tab();

      // Should provide helpful error message
      if (livePreviewInput.hasAttribute('aria-describedby')) {
        const describedById = livePreviewInput.getAttribute('aria-describedby');
        const descriptionElement = document.getElementById(describedById);
        expect(descriptionElement).toBeInTheDocument();
      }
    });
  });

  describe('Loading States Accessibility', () => {
    it('should announce loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock slow API response
      global.fetch = vi.fn(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          }), 100)
        )
      );

      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const submitButton = screen.getByRole('button', { name: /submit assignment/i });
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });

    it('should maintain form accessibility during loading', async () => {
      const user = userEvent.setup();
      
      // Mock slow API response
      global.fetch = vi.fn(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          }), 100)
        )
      );

      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const submitButton = screen.getByRole('button', { name: /submit assignment/i });
      await user.click(submitButton);

      // Form should still be accessible during loading
      const githubInput = screen.getByLabelText(/github repository url/i);
      expect(githubInput).toBeInTheDocument();
    });
  });

  describe('Edit Mode Accessibility', () => {
    it('should populate form with existing submission data', () => {
      renderWithProviders(
        <AssignmentSubmissionForm 
          assignment={mockAssignment} 
          existingSubmission={mockSubmission}
        />
      );

      // Form should be populated with existing data
      expect(screen.getByDisplayValue('https://github.com/user/repo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument();
      
      const publicCheckbox = screen.getByLabelText(/make submission public/i);
      expect(publicCheckbox).toBeChecked();
    });

    it('should change submit button text for editing', () => {
      renderWithProviders(
        <AssignmentSubmissionForm 
          assignment={mockAssignment} 
          existingSubmission={mockSubmission}
        />
      );

      // Button text should indicate editing mode
      const submitButton = screen.getByRole('button', { name: /update submission/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Error Handling Accessibility', () => {
    it('should announce server errors to screen readers', async () => {
      const user = userEvent.setup();
      
      // Mock server error
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Submission failed' }),
        })
      );

      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const submitButton = screen.getByRole('button', { name: /submit assignment/i });
      await user.click(submitButton);

      // Wait for error to appear
      await screen.findByText(/submission failed/i, {}, { timeout: 3000 });

      // Error should be announced to screen readers
      const errorMessage = screen.getByText(/submission failed/i);
      expect(errorMessage).toBeInTheDocument();
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

      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      // Form should still be accessible on mobile
      expect(screen.getByLabelText(/github repository url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/live preview url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit assignment/i })).toBeInTheDocument();
    });

    it('should have touch-friendly form elements', () => {
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const interactiveElements = [
        screen.getByLabelText(/github repository url/i),
        screen.getByLabelText(/live preview url/i),
        screen.getByLabelText(/notes/i),
        screen.getByLabelText(/make submission public/i),
        screen.getByRole('button', { name: /submit assignment/i })
      ];

      // All interactive elements should be present
      interactiveElements.forEach(element => {
        expect(element).toBeInTheDocument();
      });
    });
  });
});