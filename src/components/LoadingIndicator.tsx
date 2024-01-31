import React from 'react';
import { Box, CircularProgress, SxProps } from '@mui/material';

interface LoadingIndicatorProps {
    sx?: SxProps;
}

export function LoadingIndicator({ sx }: LoadingIndicatorProps): React.ReactElement {
    return (
        <Box
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                ...sx
            }}>
            <CircularProgress key={'loading'} />
        </Box>
    );
}
