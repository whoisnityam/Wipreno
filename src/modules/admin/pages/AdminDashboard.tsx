import { Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import React, { ReactElement } from 'react';
import { AdminDashboardStats } from '../components/AdminDashboardStats';

export const AdminDashboard = (): React.ReactElement => {
    const PageTitle = (): ReactElement => {
        return <Typography variant={'h2'}>{t('dashboard')}</Typography>;
    };

    return (
        <Stack height="100%" justifyContent="space-evenly" alignItems="center">
            <PageTitle />
            <AdminDashboardStats />
        </Stack>
    );
};
