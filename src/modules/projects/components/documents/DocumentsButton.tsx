import { Box, Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function DocumentsButton(): React.ReactElement {
    const { t } = useTranslation();

    return (
        <Box display={'flex'} minWidth="220px">
            <Button variant="contained" color="secondary">
                {t('downloadDocuments')}
            </Button>
        </Box>
    );
}
