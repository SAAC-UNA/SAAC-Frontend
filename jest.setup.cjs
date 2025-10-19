const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock para window.matchMedia en Jest
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para import.meta.env (Vite)
global.import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:8000/api',
      MODE: 'test',
      DEV: false,
      PROD: false,
    },
  },
};
