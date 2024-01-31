import React, { ReactElement } from 'react';
import SimpleBarReact from 'simplebar-react';
import { Box, alpha, styled } from '@mui/material';

// ----------------------------------------------------------------------

const RootStyle = styled('div')({
    flexGrow: 1,
    height: '100%',
    overflow: 'hidden'
});

const SimpleBarStyle = styled(SimpleBarReact)(({ theme }) => ({
    maxHeight: '100%',
    '& .simplebar-scrollbar': {
        '&:before': {
            backgroundColor: alpha(theme.palette.grey[600], 0.48)
        },
        '&.simplebar-visible:before': {
            opacity: 1
        }
    },
    '& .simplebar-track.simplebar-vertical': {
        width: 10
    },
    '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': {
        height: 6
    },
    '& .simplebar-mask': {
        zIndex: 'inherit'
    }
}));

// ----------------------------------------------------------------------

interface ScrollbarProps {
    children: ReactElement[];
    sx: object;
}

export function Scrollbar({ children, sx }: ScrollbarProps): JSX.Element {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );

    if (isMobile) {
        return <Box sx={{ overflowX: 'auto', ...sx }}>{children}</Box>;
    }

    return (
        <RootStyle>
            <SimpleBarStyle timeout={500} clickOnTrack={false} sx={sx}>
                {children}
            </SimpleBarStyle>
        </RootStyle>
    );
}
