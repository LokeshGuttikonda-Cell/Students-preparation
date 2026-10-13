import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RootLoading from '../loading';
import StudentSectionLoading from '../(student)/loading';

describe('Universal Loading Skeletons', () => {
  it('renders RootLoading with accessible status role and sr-only label', () => {
    render(<RootLoading />);
    const statusEl = screen.getByRole('status');
    expect(statusEl).toBeInTheDocument();
    expect(screen.getByText(/Loading preparation module.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading application content.../i)).toBeInTheDocument();
  });

  it('renders StudentSectionLoading with accessible status role and skeleton blocks', () => {
    render(<StudentSectionLoading />);
    const statusEl = screen.getByRole('status');
    expect(statusEl).toBeInTheDocument();
    expect(screen.getByText(/Loading section content.../i)).toBeInTheDocument();
  });
});
