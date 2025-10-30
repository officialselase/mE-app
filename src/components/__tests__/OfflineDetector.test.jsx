import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import OfflineDetector from '../OfflineDetector';
import * as djangoApi from '../../utils/djangoApi';

// Mock the djangoApi module
vi.mock('../../utils/djangoApi', () => ({
  healthAPI: {
    check: vi.fn()
  }
}));

// Mock the error handler
vi.mock('../../utils/errorHandler', () => ({
  retryRequest: vi.fn(),
  handleAPIError: vi.fn().mockReturnValue({
    type: 'network',
    message: 'Network error',
    status: null,
    shouldRetry: true
  }),
  formatErrorMessage: vi.fn().mockReturnValue('Network error occurred')
}));

describe('OfflineDetector', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render banner when connection is good', async () => {
    // Mock successful health check
    djangoApi.healthAPI.check.mockResolvedValue({
      data: { status: 'healthy' }
    });

    render(<OfflineDetector />);

    // Wait for initial health check
    await waitFor(() => {
      expect(djangoApi.healthAPI.check).toHaveBeenCalled();
    });

    // Banner should not be visible when connection is good
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should show banner when Django API is unreachable', async () => {
    // Mock failed health check
    djangoApi.healthAPI.check.mockRejectedValue(new Error('Network error'));

    render(<OfflineDetector />);

    // Wait for health check to fail and banner to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/Network connected but Django backend is unreachable/)).toBeInTheDocument();
  });

  it('should show offline banner when navigator is offline', async () => {
    // Set navigator to offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    render(<OfflineDetector />);

    // Should show offline banner immediately
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/You're offline/)).toBeInTheDocument();
  });

  it('should show retry button when connection is poor', async () => {
    // Mock failed health check
    djangoApi.healthAPI.check.mockRejectedValue(new Error('Server error'));

    render(<OfflineDetector />);

    // Wait for banner to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should show retry button
    expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument();
  });

  it('should handle retry functionality', async () => {
    const { retryRequest } = await import('../../utils/errorHandler');
    
    // Mock initial failure, then success on retry
    djangoApi.healthAPI.check
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: { status: 'healthy' } });
    
    retryRequest.mockImplementation((fn) => fn());

    render(<OfflineDetector />);

    // Wait for initial failure
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry connection/i });
    fireEvent.click(retryButton);

    // Should show retrying state
    expect(screen.getByText(/Retrying.../)).toBeInTheDocument();

    // Wait for retry to complete and banner to hide
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should dispatch custom events on connection changes', async () => {
    const eventSpy = vi.spyOn(window, 'dispatchEvent');

    // Mock successful health check
    djangoApi.healthAPI.check.mockResolvedValue({
      data: { status: 'healthy' }
    });

    render(<OfflineDetector />);

    // Simulate going offline then online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    // Trigger offline event
    fireEvent(window, new Event('offline'));

    await waitFor(() => {
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'django-connection-lost'
        })
      );
    });

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });

    // Trigger online event
    fireEvent(window, new Event('online'));

    await waitFor(() => {
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'django-connection-restored'
        })
      );
    });
  });
});