import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseYamlConfig } from '../../src/parseYamlConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test data
const testDataPath = join(__dirname, '../../test-data/unit/parseYamlConfig.json');
const testData = JSON.parse(readFileSync(testDataPath, 'utf8'));

// Run tests
describe('parseYamlConfig', () => {
  testData.cases.forEach((testCase: any) => {
    test(testCase.name, () => {
      const [content] = testCase.input;
      
      if (testCase.throws) {
        expect(() => parseYamlConfig(content)).toThrow();
      } else {
        const result = parseYamlConfig(content);
        expect(result).toEqual(testCase.expected);
      }
    });
  });
});