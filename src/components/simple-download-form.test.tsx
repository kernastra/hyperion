import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DownloadProvider } from '@/contexts/DownloadContext';
import SimpleDownloadForm from './simple-download-form';

describe('SimpleDownloadForm', () => {
  it('renders the URL input and submit button', () => {
    render(
      <DownloadProvider>
        <SimpleDownloadForm />
      </DownloadProvider>
    );

    // getBy* throws if the element isn't found, so a successful call is
    // itself the assertion that these elements rendered.
    expect(screen.getByPlaceholderText(/youtube\.com\/watch/i).tagName).toBe('INPUT');
    expect(screen.getByRole('button', { name: /analyze/i }).tagName).toBe('BUTTON');
  });
});
