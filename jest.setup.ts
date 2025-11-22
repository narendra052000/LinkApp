/**
 * Jest Setup
 */

import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    pathname: '/',
    push: jest.fn(),
    asPath: '/',
  }),
}));

// Mock next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: () => null,
  };
});
