module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  setupFiles: ["<rootDir>/jest.setup.cjs"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },

  // 📊 Configuración de cobertura
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts"
  ],
  
  // 📋 Reportes HTML para navegador
  coverageReporters: ["text", "html"],
  coverageDirectory: "coverage",
  
  // 🎯 Reporte de tests HTML para navegador
  reporters: [
    "default",
    ["jest-html-reporters", {
      publicPath: "test-results",
      filename: "test-report.html",
      pageTitle: "SAAC Frontend - Test Results",
      expand: true,
      openReport: false
    }]
  ],
  
  verbose: true,
  collectCoverage: false
};
