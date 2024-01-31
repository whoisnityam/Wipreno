import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n/config';
import { ThemeConfig } from './theme';
import { Router as AppRouter } from './routes';
import { UserProvider } from './provider/UserProvider';

export function App(): JSX.Element {
    return (
        <ThemeConfig>
            <Router>
                <UserProvider>
                    <AppRouter />
                </UserProvider>
            </Router>
        </ThemeConfig>
    );
}
