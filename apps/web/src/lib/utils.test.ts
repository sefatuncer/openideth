import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, truncate } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('merges tailwind conflicts', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });
});

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1,500');
  });

  it('formats with decimals', () => {
    const result = formatCurrency(99.99);
    expect(result).toContain('99.99');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });
});

describe('formatDate', () => {
  it('formats date with default pattern', () => {
    const result = formatDate('2024-03-15');
    expect(result).toBe('Mar 15, 2024');
  });

  it('formats with custom pattern', () => {
    const result = formatDate('2024-03-15', 'yyyy-MM-dd');
    expect(result).toBe('2024-03-15');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('keeps short strings intact', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});
