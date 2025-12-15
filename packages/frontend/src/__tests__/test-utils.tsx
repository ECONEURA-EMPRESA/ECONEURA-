import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Import providers here if available. For now, we'll start with Router which is commonly needed.
// If you have AuthProvider or ThemeProvider, import them as well.

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <BrowserRouter>
            {children}
        </BrowserRouter>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
