import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../../theme/palette';

export const NoMessages = (): React.ReactElement => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <Stack height={'100%'} justifyContent={'center'}>
            <Typography
                variant="h4"
                color={theme.palette.primary.medium}
                sx={{ fontFamily: 'Poppins', fontWeight: 700, textAlign: 'center' }}>
                {t('noGroupSelected')}
            </Typography>
            <Typography
                variant="h5"
                color={NEUTRAL.medium}
                sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 400,
                    textAlign: 'center',
                    marginTop: '5%'
                }}>
                {t('noGroupSelectedDescription')}
            </Typography>
        </Stack>
    );
};
