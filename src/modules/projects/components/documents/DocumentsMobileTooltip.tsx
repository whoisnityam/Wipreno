import { Box, Stack, styled, Typography, useTheme } from '@mui/material';
import React from 'react';
import { Info } from 'react-feather';
import { body3 } from '../../../../theme/typography';

interface DocumentsMobileTooltipProps {
    tooltipContent: string;
}

const BlueArea = styled(Stack)(() => ({
    background:
        'linear-gradient(0deg, rgba(196, 237, 251, 0.5), rgba(196, 237, 251, 0.5)), #FFFFFF',
    padding: '12px',
    width: '100%'
}));

export function DocumentsMobileTooltip({
    tooltipContent
}: DocumentsMobileTooltipProps): React.ReactElement {
    const theme = useTheme();

    return (
        <BlueArea direction="row">
            <Info height="20px" width="20px" color={theme.palette.info.dark} />
            <Box minWidth="8px" />
            <Typography sx={body3} color={theme.palette.info.dark} maxWidth="calc(100% - 28px)">
                {tooltipContent}
            </Typography>
        </BlueArea>
    );
}
