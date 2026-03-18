import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText('Email')).toBeTruthy();
  });

  it('shows error message', () => {
    render(<Input label="Email" name="email" error="Required" />);
    expect(screen.getByText('Required')).toBeTruthy();
  });

  it('shows helper text', () => {
    render(<Input label="Email" name="email" helperText="Enter your email" />);
    expect(screen.getByText('Enter your email')).toBeTruthy();
  });

  it('hides helper when error is shown', () => {
    render(<Input label="Email" name="email" error="Bad" helperText="Help" />);
    expect(screen.getByText('Bad')).toBeTruthy();
    expect(screen.queryByText('Help')).toBeNull();
  });

  it('sets aria-invalid on error', () => {
    render(<Input label="Email" name="email" error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });
});
