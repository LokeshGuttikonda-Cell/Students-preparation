import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from '../page';
import { AuthProvider } from '../../context/AuthContext';

describe('Home Page', () => {
  it('renders the project heading and practice action', () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Students-preparation',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Topic-Wise Practice')).toBeInTheDocument();
  });

  it('shows the timer sample with tabular numerals', () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>,
    );

    expect(screen.getByText('29:00')).toHaveClass('tabular');
  });
});
