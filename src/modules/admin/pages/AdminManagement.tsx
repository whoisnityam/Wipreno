import { Box, Button, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { User } from '../../profile/models/User';
import { AdminListTable } from '../components/AdminListTable';
import { CreateAdminUser } from '../components/CreateAdminUser';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { getAdmins } from '../services/AdminManagementService';

export const AdminManagement = (): React.ReactElement => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [adminList, setAdminList] = useState<User[]>([]);
    const [openCreateAdmin, setOpenCreateAdmin] = useState<boolean>(false);
    const [openDeleteSuccess, setOpenDeleteSuccess] = useState<boolean>(false);

    const fetchAdmins = async (): Promise<User[]> => {
        return getAdmins();
    };

    const prepareData = useCallback(async () => {
        setLoading(true);
        const response = await fetchAdmins();
        setAdminList([...response]);
        setLoading(false);
    }, []);

    useEffect(() => {
        prepareData();
    }, []);

    const PageTitle = (): React.ReactElement => {
        return <Typography variant={'h2'}>{t('adminManagement')}</Typography>;
    };

    const openSuccessModal = (): void => {
        setOpenDeleteSuccess(true);
        setOpenCreateAdmin(false);
        setTimeout(async () => {
            prepareData();
            setOpenDeleteSuccess(false);
        }, 3000);
    };

    const EmptyStateComponent = (): React.ReactElement => {
        return (
            <>
                <EmptyState
                    title={''}
                    subtitle={t('noAdminCreated')}
                    description={t('addAdminNow')}
                    buttonTitle={t('addAdmin')}
                    buttonType={'outlined'}
                    buttonOnClick={(): void => {}}
                />
            </>
        );
    };

    const DashboardComponent = (): React.ReactElement => {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0 80px'
                }}>
                <Stack
                    direction="row"
                    justifyContent={'space-between'}
                    sx={{ padding: '0 0 10px 0' }}>
                    <PageTitle />
                    <Button
                        variant={'outlined'}
                        color={'secondary'}
                        onClick={(): void => {
                            setOpenCreateAdmin(true);
                        }}
                        sx={{ width: '217px', height: '48px' }}>
                        <Plus /> <Box sx={{ width: '10px' }}></Box>
                        {t('addAdmin')}
                    </Button>
                </Stack>
                <AdminListTable adminList={adminList} prepareData={prepareData} />
            </Box>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else if (adminList.length === 0) {
            return (
                <>
                    <EmptyStateComponent />
                    {openCreateAdmin ? (
                        <>
                            <CreateAdminUser
                                openForm={openCreateAdmin}
                                handleClose={(): void => setOpenCreateAdmin(false)}
                                isModify={false}
                                initialValues={{
                                    email: '',
                                    first_name: '',
                                    last_name: ''
                                }}
                                handleSuccess={(): void => openSuccessModal()}
                            />
                            <SuccessAlert
                                title={t('requestHasBeenTaken')}
                                subtitle={t('youWillRedirectToAdminManagement')}
                                open={openDeleteSuccess}
                            />
                        </>
                    ) : (
                        ''
                    )}
                </>
            );
        } else {
            return (
                <>
                    <DashboardComponent />
                    <CreateAdminUser
                        openForm={openCreateAdmin}
                        handleClose={(): void => setOpenCreateAdmin(false)}
                        isModify={false}
                        initialValues={{
                            email: '',
                            first_name: '',
                            last_name: ''
                        }}
                        handleSuccess={(): void => openSuccessModal()}
                    />
                    <SuccessAlert
                        title={t('requestHasBeenTaken')}
                        subtitle={t('youWillRedirectToAdminManagement')}
                        open={openDeleteSuccess}
                    />
                </>
            );
        }
    };

    return <RenderComponents />;
};
