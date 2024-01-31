import { Box, Stack, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import { Info } from 'react-feather';
import { ACCENT_SUNSET } from '../../../../theme/palette';
import { body3 } from '../../../../theme/typography';

export function DocumentsArchivedWarning(): React.ReactElement {
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    const BlueArea = styled(Stack)(() => ({
        background: 'rgba(251, 228, 179, 0.5)',
        padding: isLarge ? '25px 24px 26px 24px' : '12px',
        width: '100%'
    }));

    return (
        <BlueArea direction="row">
            <Info
                height={isLarge ? '24px' : '20px'}
                width={isLarge ? '24px' : '20px'}
                color={ACCENT_SUNSET.darker}
            />
            <Box minWidth={isLarge ? '14px' : '8px'} />
            <Typography
                variant={isLarge ? 'body2' : undefined}
                sx={!isLarge ? body3 : {}}
                color={ACCENT_SUNSET.darker}
                maxWidth="calc(100% - 28px)">
                {t('archivedWarning1')}
                <Box component="span" sx={{ fontWeight: '700 !important' }}>
                    {t('archivedWarning2')}
                </Box>
                {t('archivedWarning3')}
            </Typography>
        </BlueArea>
    );
}
