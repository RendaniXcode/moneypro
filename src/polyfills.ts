// This file provides polyfills for Node.js globals needed by some libraries

// Polyfill for Node.js 'global' object
if (typeof window !== 'undefined' && !window.global) {
  (window as any).global = window;
}

// Polyfill for process.env
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}

// Polyfill for Buffer
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = {
    from: (str: string) => ({ toString: () => str }),
    isBuffer: () => false
  };
}

export default {};
