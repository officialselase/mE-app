import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import OfflineDetector from '../../components/OfflineDetector';

describe('OfflineDetector Integration Tests', () => {
  let originalFetch;

  beforeAll(() => {
    // Store original fetch
    originalFetch = global.fetch;
  });

  afterAll(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  it('should handle successful Django health check', async () => {
    // Mock successful health check response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00Z',
        version: '1.0.0',
        database: 'connected',
        services: {
          auth: 'available',
          portfolio: 'available',
          shop: 'available',
          learn: 'available'
        }
      })
    });

    render(<OfflineDetector />);

    // Should not show banner when connection is good
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle Django health check 404 error', async () => {
    // Mock 404 response (health endpoint not found)
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    render(<OfflineDetector />);

    // Should show banner for poor connection
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText(/Network connected but Django backend is unreachable/)).toBeInTheDocument();
  });

  it('should handle network timeout', async () => {
    // Mock network timeout
    global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));

    render(<OfflineDetector />);

    // Should show banner for offline state
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText(/Network connected but Django backend is unreachable/)).toBeInTheDocument();
  });

  it('should handle malformed health response', async () => {
    // Mock response with wrong format
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'unknown', // Not 'healthy'
        message: 'Service degraded'
      })
    });

    render(<OfflineDetector />);

    // Should show banner for poor connection
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText(/Network connected but Django backend is unreachable/)).toBeInTheDocument();
  });
});