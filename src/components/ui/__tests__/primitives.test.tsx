import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import { Input } from '../Input';
import { Field } from '../Field';
import { StatusBadge, DifficultyBadge } from '../Badge';

describe('Frontend UI Primitives', () => {
  describe('Button', () => {
    it('renders primary button with children', () => {
      render(<Button variant="primary">Click Me</Button>);
      const btn = screen.getByRole('button', { name: 'Click Me' });
      expect(btn).toBeDefined();
      expect(btn.className).toContain('bg-primary-700');
    });

    it('renders loading state and disables button', () => {
      render(<Button isLoading>Submit</Button>);
      const btn = screen.getByRole('button');
      expect(btn.getAttribute('disabled')).toBeDefined();
      expect(screen.getByText('Loading...')).toBeDefined();
    });
  });

  describe('Card', () => {
    it('renders Card with header, title, and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
          </CardHeader>
          <CardContent>Test Content</CardContent>
        </Card>,
      );
      expect(screen.getByText('Test Title')).toBeDefined();
      expect(screen.getByText('Test Content')).toBeDefined();
    });
  });

  describe('Field & Input', () => {
    it('renders label, input, and error message', () => {
      render(
        <Field label="Email" htmlFor="email-input" error="Invalid email" required>
          <Input id="email-input" hasError />
        </Field>,
      );
      expect(screen.getByText('Email')).toBeDefined();
      expect(screen.getByText('*')).toBeDefined();
      expect(screen.getByText('Invalid email')).toBeDefined();
    });
  });

  describe('Badge', () => {
    it('renders StatusBadge with appropriate text and styles', () => {
      render(
        <>
          <StatusBadge status="PUBLISHED" />
          <StatusBadge status="IN_REVIEW" />
          <DifficultyBadge difficulty="HARD" />
        </>,
      );
      expect(screen.getByText('Published')).toBeDefined();
      expect(screen.getByText('In Review')).toBeDefined();
      expect(screen.getByText('Hard')).toBeDefined();
    });
  });
});
