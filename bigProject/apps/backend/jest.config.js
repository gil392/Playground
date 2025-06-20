module.exports = {
  preset: "ts-jest", // Use ts-jest preset for TypeScript
  testEnvironment: "node", // or jsdom if browser-like environment
  transform: {
    "^.+\\.tsx?$": "ts-jest", // transform TypeScript files with ts-jest
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // optionally ignore dist folder or node_modules except for specific packages if needed
};
