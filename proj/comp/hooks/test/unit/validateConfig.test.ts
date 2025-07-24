import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { validateConfig } from '../../src/validateConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test data
const testDataPath = join(__dirname, '../../test-data/unit/validateConfig.json');
const testData = JSON.parse(readFileSync(testDataPath, 'utf8'));

// Run tests
describe('validateConfig', () => {
  testData.cases.forEach((testCase: any) => {
    test(testCase.name, () => {
      const [config] = testCase.input;
      
      if (testCase.throws) {
        expect(() => validateConfig(config)).toThrow();
      } else {
        const result = validateConfig(config);
        expect(result).toEqual(testCase.expected);
      }
    });
  });
});