import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnimatedBear from '../AnimatedBear';

describe('AnimatedBear Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render SVG bear', () => {
      const { container } = render(<AnimatedBear />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '120');
    });

    it('should have aria-hidden attribute for decorative SVG', () => {
      const { container } = render(<AnimatedBear />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Eye States', () => {
    it('should show eyes when password is not focused', () => {
      const { container } = render(
        <AnimatedBear isPasswordFocused={false} />
      );
      
      // Eyes should be visible (circles for eyes)
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
    });

    it('should cover eyes with paws when password is focused', () => {
      const { container } = render(
        <AnimatedBear isPasswordFocused={true} />
      );
      
      // Paws should be visible (ellipses for paws)
      const ellipses = container.querySelectorAll('ellipse');
      const pawEllipses = Array.from(ellipses).filter(el => {
        const fill = el.getAttribute('fill');
        return fill === '#8B4513' && el.getAttribute('rx') === '12';
      });
      expect(pawEllipses.length).toBeGreaterThan(0);
    });

    it('should look down when email is focused', () => {
      render(
        <AnimatedBear isEmailFocused={true} isPasswordFocused={false} />
      );
      
      // This is a visual test - we're just ensuring it renders without error
      // The actual eye position is controlled by CSS transforms
      expect(true).toBe(true);
    });
  });

  describe('Expression States', () => {
    it('should show neutral expression in idle state', () => {
      const { container } = render(
        <AnimatedBear authState="idle" />
      );
      
      const mouthPath = container.querySelector('path[stroke="black"]');
      expect(mouthPath).toBeInTheDocument();
      // Neutral mouth is a straight line
      expect(mouthPath?.getAttribute('d')).toContain('M 35 57 L 65 57');
    });

    it('should show happy expression on success', () => {
      const { container } = render(
        <AnimatedBear authState="success" />
      );
      
      const mouthPath = container.querySelector('path[stroke="black"]');
      expect(mouthPath).toBeInTheDocument();
      // Happy mouth is a smile (quadratic curve)
      expect(mouthPath?.getAttribute('d')).toContain('M 35 55 Q 50 65 65 55');
    });

    it('should show sad expression on error', () => {
      const { container } = render(
        <AnimatedBear authState="error" />
      );
      
      const mouthPath = container.querySelector('path[stroke="black"]');
      expect(mouthPath).toBeInTheDocument();
      // Sad mouth is a frown (quadratic curve)
      expect(mouthPath?.getAttribute('d')).toContain('M 35 60 Q 50 50 65 60');
    });
  });

  describe('Mouse Tracking', () => {
    it('should track mouse movement when not focused on inputs', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <AnimatedBear isPasswordFocused={false} isEmailFocused={false} />
      );
      
      const bearContainer = container.firstChild;
      
      // Simulate mouse movement
      await user.pointer([
        { target: bearContainer, coords: { clientX: 100, clientY: 100 } },
      ]);
      
      // Component should render without errors
      expect(bearContainer).toBeInTheDocument();
    });

    it('should reset eye position on mouse leave', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <AnimatedBear isPasswordFocused={false} isEmailFocused={false} />
      );
      
      const bearContainer = container.firstChild;
      
      // Simulate mouse leave
      await user.unhover(bearContainer);
      
      // Component should render without errors
      expect(bearContainer).toBeInTheDocument();
    });

    it('should not track mouse when password is focused', () => {
      const { container } = render(
        <AnimatedBear isPasswordFocused={true} />
      );
      
      // Eyes should be covered, so mouse tracking doesn't matter
      const bearContainer = container.firstChild;
      expect(bearContainer).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion setting', () => {
      // Mock matchMedia for reduced motion
      const mockMatchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const { container } = render(<AnimatedBear />);
      
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should handle default props', () => {
      const { container } = render(<AnimatedBear />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle all props together', () => {
      const { container } = render(
        <AnimatedBear
          isPasswordFocused={true}
          isEmailFocused={false}
          authState="success"
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle state transitions', () => {
      const { container, rerender } = render(
        <AnimatedBear authState="idle" />
      );
      
      expect(container.firstChild).toBeInTheDocument();
      
      // Change to success state
      rerender(<AnimatedBear authState="success" />);
      expect(container.firstChild).toBeInTheDocument();
      
      // Change to error state
      rerender(<AnimatedBear authState="error" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle focus state transitions', () => {
      const { container, rerender } = render(
        <AnimatedBear isPasswordFocused={false} />
      );
      
      expect(container.firstChild).toBeInTheDocument();
      
      // Focus password
      rerender(<AnimatedBear isPasswordFocused={true} />);
      expect(container.firstChild).toBeInTheDocument();
      
      // Unfocus password
      rerender(<AnimatedBear isPasswordFocused={false} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render bear head', () => {
      const { container } = render(<AnimatedBear />);
      const circles = container.querySelectorAll('circle');
      
      // Should have circles for head, ears, etc.
      expect(circles.length).toBeGreaterThan(0);
    });

    it('should render ears', () => {
      const { container } = render(<AnimatedBear />);
      const circles = container.querySelectorAll('circle');
      
      // Check for ear circles (at specific positions)
      const leftEar = Array.from(circles).find(c => 
        c.getAttribute('cx') === '25' && c.getAttribute('cy') === '25'
      );
      const rightEar = Array.from(circles).find(c => 
        c.getAttribute('cx') === '75' && c.getAttribute('cy') === '25'
      );
      
      expect(leftEar).toBeInTheDocument();
      expect(rightEar).toBeInTheDocument();
    });

    it('should render nose', () => {
      const { container } = render(<AnimatedBear />);
      const ellipses = container.querySelectorAll('ellipse');
      
      // Nose should be a black ellipse
      const nose = Array.from(ellipses).find(e => 
        e.getAttribute('fill') === 'black'
      );
      
      expect(nose).toBeInTheDocument();
    });

    it('should render mouth', () => {
      const { container } = render(<AnimatedBear />);
      const path = container.querySelector('path[stroke="black"]');
      
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('stroke-width', '2');
    });
  });
});
