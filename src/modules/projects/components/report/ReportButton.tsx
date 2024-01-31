import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';

export function ReportButton(): React.ReactElement {
    const { t } = useTranslation();
    return (
        <Box display={'flex'}>
            <Button variant={'contained'} color={'secondary'}>
                {t('exportButton')}
            </Button>
        </Box>
    );
}
