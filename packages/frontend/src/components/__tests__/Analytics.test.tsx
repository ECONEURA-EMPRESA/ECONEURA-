import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Analytics } from '../Analytics';

describe('Analytics', () => {
  it('renders analytics metrics', async () => {
    render(<Analytics />);

    // Wait for mock data to load
    await waitFor(() => {
      expect(screen.getByText('Ejecuciones')).toBeInTheDocument();
    });

    expect(screen.getByText('Tiempo Promedio')).toBeInTheDocument();
    expect(screen.getByText('Tokens')).toBeInTheDocument();
    expect(screen.getByText('Usuarios Activos')).toBeInTheDocument();
  });

  it('supports dark mode', () => {
    const { container } = render(<Analytics darkMode={true} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('bg-slate-800/50');
  });

  it('displays formatted values', async () => {
    render(<Analytics />);

    await waitFor(() => {
      // Use regex to match numbers regardless of locale formatting (1247, 1,247, 1.247)
      expect(screen.getByText(/1[.,]?247/)).toBeInTheDocument();
    });

    expect(screen.getByText('2.3s')).toBeInTheDocument();
    // Match formatted number with optional thousands separator
    expect(screen.getByText(/45[.,]?678/)).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
  });
});

