/**
 * Basic validation test for djangoApi.js
 * Simple test to verify the module loads without the original initialization error
 */

import { describe, it, expect } from 'vitest';

describe('Django API Basic Validation', () => {
  it('should import the module without "Cannot access before initialization" errors', async () => {
    // This test specifically validates that the original error is fixed
    // If withGracefulDegradation was still being used before declaration,
    // this import would throw an error
    
    let importError = null;
    let module = null;
    
    try {
      module = await import('../djangoApi.js');
    } catch (error) {
      importError = error;
    }
    
    // Verify no import error occurred
    expect(importError).toBeNull();
    
    // Verify the module loaded successfully
    expect(module).toBeDefined();
    
    // Verify key exports are available
    expect(module.default).toBeDefined(); // axios instance
    expect(module.authAPI).toBeDefined();
    expect(module.portfolioAPI).toBeDefined();
    expect(module.learnAPI).toBeDefined();
    expect(module.shopAPI).toBeDefined();
    expect(module.healthAPI).toBeDefined();
    expect(module.withGracefulDegradation).toBeDefined();
    expect(module.handleDjangoError).toBeDefined();
    expect(module.testDjangoConnection).toBeDefined();
  });

  it('should have withGracefulDegradation function available for use', async () => {
    const module = await import('../djangoApi.js');
    
    // Verify withGracefulDegradation is a function
    expect(typeof module.withGracefulDegradation).toBe('function');
    
    // Verify it can be called without errors (this would fail if there were initialization issues)
    const testFunction = () => Promise.resolve('test');
    const wrappedFunction = module.withGracefulDegradation(testFunction, [], 'fallback');
    
    expect(typeof wrappedFunction).toBe('function');
  });

  it('should have handleDjangoError function working correctly', async () => {
    const module = await import('../djangoApi.js');
    
    // Test that handleDjangoError works
    const mockError = {
      response: {
        status: 400,
        data: { detail: 'Test error' }
      }
    };

    const errorInfo = module.handleDjangoError(mockError);
    
    expect(errorInfo).toBeDefined();
    expect(errorInfo.type).toBe('validation');
    expect(errorInfo.message).toBe('Test error');
    expect(errorInfo.status).toBe(400);
  });

  it('should have portfolio API methods that use graceful degradation', async () => {
    const module = await import('../djangoApi.js');
    
    // These methods use withGracefulDegradation, so if there were initialization issues,
    // they wouldn't be properly defined
    expect(module.portfolioAPI.getProjects).toBeDefined();
    expect(module.portfolioAPI.getThoughts).toBeDefined();
    expect(module.portfolioAPI.getWorkExperience).toBeDefined();
    
    expect(typeof module.portfolioAPI.getProjects).toBe('function');
    expect(typeof module.portfolioAPI.getThoughts).toBe('function');
    expect(typeof module.portfolioAPI.getWorkExperience).toBe('function');
  });
});