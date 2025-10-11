import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { configureAxe } from 'jest-axe';

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock fetch globally
global.fetch = vi.fn();

// Configure axe for accessibility testing
const axe = configureAxe({
  rules: {
    // Disable color-contrast rule for automated tests as it requires actual rendering
    'color-contrast': { enabled: false }
  }
});

// Make axe available globally
global.axe = axe;
