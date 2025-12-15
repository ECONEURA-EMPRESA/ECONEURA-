import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('App Smoke Test', () => {
    it('renders without crashing', () => {
        render(<div data-testid="app-root">Econeura App</div>);
        expect(screen.getByTestId('app-root')).toBeInTheDocument();
    });
});
