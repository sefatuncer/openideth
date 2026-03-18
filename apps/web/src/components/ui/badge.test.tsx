import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('applies success variant', () => {
    render(<Badge variant="success">Approved</Badge>);
    const badge = screen.getByText('Approved');
    expect(badge.className).toContain('success');
  });

  it('applies error variant', () => {
    render(<Badge variant="error">Failed</Badge>);
    const badge = screen.getByText('Failed');
    expect(badge.className).toContain('error');
  });
});
