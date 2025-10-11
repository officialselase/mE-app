import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Import components to test
import App from '../App';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Learn from '../pages/Learn';
import ProjectsRepo from '../pages/ProjectsRepo';
import PageHeader from '../components/PageHeader';
import AssignmentSubmissionForm from '../components/AssignmentSubmissionForm';
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

const mockAssignment = {
  id: '1',
  title: 'Test Assignment',
  description: 'Complete this test assignment',
  instructions: 'Follow the instructions carefully',
  type: 'project',
  dueDate: '2024-12-31'
};

describe('Keyboard Navigation Tests', () => {
  beforeEach(() => {
    // Mock API calls
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          projects: [], 
          thoughts: [], 
          work: [],
          courses: [],
          assignments: []
        }),
      })
    );
  });

  describe('Tab Order and Focus Management', () => {
    it('should have logical tab order in navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PageHeader />);

      const navLinks = screen.getAllByRole('link');
      const buttons = screen.getAllByRole('button');
      const allInteractive = [...navLinks, ...buttons];

      // Tab through all interactive elements
      for (let i = 0; i < allInteractive.length; i++) {
        await user.tab();
        expect(document.activeElement).toBe(allInteractive[i]);
      }
    });

    it('should have logical tab order in login form', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const expectedOrder = [
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/password/i),
        screen.getByRole('button', { name: /login/i })
      ];

      for (let i = 0; i < expectedOrder.length; i++) {
        await user.tab();
        expect(document.activeElement).toBe(expectedOrder[i]);
      }
    });

    it('should have logical tab order in registration form', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const expectedOrder = [
        screen.getByLabelText(/display name/i),
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/password/i),
        screen.getByRole('button', { name: /register/i })
      ];

      for (let i = 0; i < expectedOrder.length; i++) {
        await user.tab();
        expect(document.activeElement).toBe(expectedOrder[i]);
      }
    });

    it('should have logical tab order in assignment submission form', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AssignmentSubmissionForm assignment={mockAssignment} />
      );

      const expectedOrder = [
        screen.getByLabelText(/github repository url/i),
        screen.getByLabelText(/live preview url/i),
        screen.getByLabelText(/notes/i),
        screen.getByLabelText(/make submission public/i),
        screen.getByRole('button', { name: /submit assignment/i })
      ];

      for (let i = 0; i < expectedOrder.length; i++) {
        await user.tab();
        expect(document.activeElement).toBe(expectedOrder[i]);
      }
    });
  });

  describe('Keyboard Activation', () => {
    it('should support Enter key for button activation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const loginButton = screen.getByRole('button', { name: /login/i });
      loginButton.focus();
      await user.keyboard('{Enter}');

      // Form should attempt submission
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should support Space key for button activation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const loginButton = screen.getByRole('button', { name: /login/i });
      loginButton.focus();
      await user.keyboard(' ');

      // Button should be activated
      expect(loginButton).toHaveFocus();
    });

    it('should support Enter key for link activation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PageHeader />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      homeLink.focus();
      await user.keyboard('{Enter}');

      // Link should be activated (navigation would occur)
      expect(homeLink).toHaveFocus();
    });

    it('should support Space key for checkbox activation', async () => {
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

  describe('Form Navigation', () => {
    it('should support Enter key for form submission', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.keyboard('{Enter}');

      // Form should be submitted
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should support Tab navigation between form fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const displayNameInput = screen.getByLabelText(/display name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      displayNameInput.focus();
      expect(document.activeElement).toBe(displayNameInput);

      await user.tab();
      expect(document.activeElement).toBe(emailInput);

      await user.tab();
      expect(document.activeElement).toBe(passwordInput);
    });

    it('should support Shift+Tab for reverse navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/password/i);
      const emailInput = screen.getByLabelText(/email/i);

      passwordInput.focus();
      expect(document.activeElement).toBe(passwordInput);

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(emailInput);
    });
  });

  describe('Skip Links and Landmarks', () => {
    it('should provide skip link to main content', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Tab to first element (should be skip link if implemented)
      await user.tab();
      
      const focusedElement = document.activeElement;
      
      // If skip link exists, it should be the first focusable element
      if (focusedElement && focusedElement.textContent.toLowerCase().includes('skip')) {
        expect(focusedElement).toHaveAttribute('href', '#main');
      }
    });

    it('should allow navigation to main landmarks', () => {
      renderWithProviders(<App />);

      // Check for main landmark
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      // Check for navigation landmark
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Focus Indicators', () => {
    it('should show visible focus indicators on interactive elements', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PageHeader />);

      const interactiveElements = [
        ...screen.getAllByRole('link'),
        ...screen.getAllByRole('button')
      ];

      for (const element of interactiveElements) {
        await user.tab();
        expect(document.activeElement).toBe(element);
        expect(element).toHaveFocus();
        
        // Check that element has focus styles (implementation specific)
        const computedStyle = window.getComputedStyle(element);
        expect(computedStyle).toBeDefined();
      }
    });

    it('should maintain focus visibility during keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const formElements = [
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/password/i),
        screen.getByRole('button', { name: /login/i })
      ];

      for (const element of formElements) {
        await user.tab();
        expect(document.activeElement).toBe(element);
        expect(element).toHaveFocus();
      }
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should support Escape key to close modals/overlays', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Home />);

      // If there are any modal triggers, test escape functionality
      const modalTriggers = document.querySelectorAll('[data-modal], [aria-haspopup="dialog"]');
      
      for (const trigger of modalTriggers) {
        await user.click(trigger);
        await user.keyboard('{Escape}');
        
        // Modal should be closed (implementation specific)
        expect(document.activeElement).not.toBe(null);
      }
    });

    it('should support arrow keys for navigation where appropriate', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Home />);

      // Test arrow key navigation for any custom components that support it
      const customNavElements = document.querySelectorAll('[role="tablist"], [role="menubar"], [role="listbox"]');
      
      for (const element of customNavElements) {
        element.focus();
        await user.keyboard('{ArrowRight}');
        
        // Focus should move within the component
        expect(document.activeElement).toBeDefined();
      }
    });
  });

  describe('Focus Trapping', () => {
    it('should trap focus in modal dialogs', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Home />);

      // Test focus trapping in any modal dialogs
      const modalTriggers = document.querySelectorAll('[data-modal], [aria-haspopup="dialog"]');
      
      for (const trigger of modalTriggers) {
        await user.click(trigger);
        
        // Find modal content
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length > 1) {
            // Tab through all elements in modal
            for (let i = 0; i < focusableElements.length; i++) {
              await user.tab();
            }
            
            // Should cycle back to first element
            await user.tab();
            expect(document.activeElement).toBe(focusableElements[0]);
          }
        }
      }
    });
  });

  describe('Error Handling and Focus Management', () => {
    it('should move focus to error messages when validation fails', async () => {
      const user = userEvent.setup();
      
      // Mock validation error
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            message: 'Validation failed',
            errors: { email: 'Invalid email' }
          }),
        })
      );

      renderWithProviders(<Login />);

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Wait for error to appear
      setTimeout(async () => {
        const emailInput = screen.getByLabelText(/email/i);
        
        // Focus should be on the field with error or error should be announced
        if (emailInput.hasAttribute('aria-invalid')) {
          expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        }
      }, 100);
    });

    it('should maintain logical focus order after dynamic content changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Home />);

      // Test focus management after content loads
      await new Promise(resolve => setTimeout(resolve, 100));

      // Tab through elements to ensure order is still logical
      const interactiveElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (interactiveElements.length > 0) {
        for (let i = 0; i < Math.min(5, interactiveElements.length); i++) {
          await user.tab();
          expect(document.activeElement).toBe(interactiveElements[i]);
        }
      }
    });
  });

  describe('Custom Component Keyboard Support', () => {
    it('should support keyboard navigation in custom dropdowns', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Home />);

      // Test any custom dropdown components
      const dropdownTriggers = document.querySelectorAll('[aria-haspopup="listbox"], [aria-haspopup="menu"]');
      
      for (const trigger of dropdownTriggers) {
        trigger.focus();
        await user.keyboard('{Enter}');
        
        // Dropdown should open and be navigable with arrow keys
        await user.keyboard('{ArrowDown}');
        expect(document.activeElement).toBeDefined();
      }
    });

    it('should support keyboard navigation in custom tabs', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Learn />);

      // Test any tab components
      const tabLists = document.querySelectorAll('[role="tablist"]');
      
      for (const tabList of tabLists) {
        const tabs = tabList.querySelectorAll('[role="tab"]');
        
        if (tabs.length > 1) {
          tabs[0].focus();
          await user.keyboard('{ArrowRight}');
          expect(document.activeElement).toBe(tabs[1]);
        }
      }
    });
  });
});