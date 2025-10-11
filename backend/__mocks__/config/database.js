// Mock database module for testing

export const query = jest.fn();
export const queryOne = jest.fn();

const db = {
  prepare: jest.fn(() => ({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn()
  })),
  exec: jest.fn()
};

export default db;
