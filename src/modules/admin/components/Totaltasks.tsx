import { Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Notice } from '../../projects/models/Notice';

interface LotProps {
    notice: Notice;
}

export const TotalTasks = ({ notice }: LotProps): React.ReactElement => {
    const { t } = useTranslation();

    let totalTasks = 0;
    if (notice.lots) {
        notice.lots.map((lot) => {
            if (lot.estimation_tasks) {
                totalTasks = lot.estimation_tasks.length + totalTasks;
            }
        });
    }

    return (
        <Typography variant="body2">
            {totalTasks} {t('inTotal')}
        </Typography>
    );
};
