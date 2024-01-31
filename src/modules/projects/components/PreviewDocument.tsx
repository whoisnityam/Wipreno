import React from 'react';
import { useLocation } from 'react-router-dom';
import { APP_BASE_URL } from '../../../services/ApiService';

export function PreviewDocument(): React.ReactElement {
    const location = useLocation();

    return (
        <iframe
            id="viewer"
            src={`
            blob:${APP_BASE_URL}${location.pathname}`}
            style={{
                display: 'block',
                border: 'none',
                height: '100vh',
                width: '100vw'
            }}></iframe>
    );
}
