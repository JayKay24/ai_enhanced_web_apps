import { generateUniqueId } from './generateUniqueId';

describe('generateUniqueId', () => {
  it('should return a string in the correct format', () => {
    const id = generateUniqueId();
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });

  it('should generate unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateUniqueId());
    }
    // If it's unique, the Set size should equal the number of iterations
    expect(ids.size).toBe(1000);
  });
});
