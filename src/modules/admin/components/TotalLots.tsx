import { Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Notice } from '../../projects/models/Notice';

interface LotProps {
    notice: Notice;
}

export const TotalLots = ({ notice }: LotProps): React.ReactElement => {
    const { t } = useTranslation();

    return (
        <Typography variant="body2">
            {notice.lots ? notice.lots.length : 0} {t('inTotal')}
        </Typography>
    );
};
