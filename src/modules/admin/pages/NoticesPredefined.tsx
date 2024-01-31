import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../../components/alerts/Alert';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import {
    createAdminPredefinedNotices,
    getAdminPredefinedNotices
} from '../../modeles/services/ModelesServices';
import { Notice } from '../../projects/models/Notice';
import { NoticePredefinedTable } from '../components/NoticePredefinedTable';

export const NoticesPredefined = (): React.ReactElement => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [createNoticeModal, setCreateNoticeModal] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [notice, setNotice] = useState<Notice[]>([]);
    const [onCreate, setOnCreate] = useState(false);

    const fetchNotices = async (): Promise<Notice[]> => {
        return getAdminPredefinedNotices();
    };
    const handleClose = (): void => {
        setCreateNoticeModal(false);
        setTitle('');
    };

    const prepareData = useCallback(async () => {
        setLoading(true);
        const response = await fetchNotices();
        setNotice(response);
        setLoading(false);
    }, []);

    useEffect(() => {
        prepareData();
        return (): void => {
            setNotice([]);
            setLoading(false);
        };
    }, [onCreate]);

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
        }, 3000);
    };

    function createPredefinedNotice(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="410px"
                title={t('createNoticeModalTitle')}
                subtitle={t('createPredefinedNoticeSubtitle')}
                open={createNoticeModal}
                onClick={async (): Promise<void> => {
                    const data = {
                        id: '',
                        title: title.trim(),
                        is_predefined: true
                    };
                    try {
                        await createAdminPredefinedNotices(data);
                        setOnCreate(!onCreate);
                        openSuccessModal();
                    } catch (e) {
                        console.log(e);
                    }
                    handleClose();
                }}
                onClose={handleClose}
                onSecondaryButtonClick={handleClose}
                primaryButton={t('createNoticeModalButtonTitle')}
                primaryButtonEnabled={title.trim().length > 0}
                secondaryButton={t('return')}>
                <>
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'title'}
                        value={title}
                        onChange={(event): void => {
                            setTitle(event.target.value);
                        }}
                        label={t('noticeNameLabel')}
                    />
                </>
            </Alert>
        );
    }

    function success(): React.ReactElement {
        return (
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToNoticePredefined')}
            />
        );
    }

    const PageTitle = (): React.ReactElement => {
        return <Typography variant={'h2'}>{t('predefinedRecords')}</Typography>;
    };

    const EmptyStateComponent = (): React.ReactElement => {
        return (
            <>
                <EmptyState
                    title={''}
                    subtitle={t('createNoticeEmptyStateTitle')}
                    description={t('createNoticeEmptyStateDescription')}
                    buttonTitle={t('createNoticeEmptyStateButtonTitle')}
                    buttonType={'outlined'}
                    buttonOnClick={(): void => {
                        setCreateNoticeModal(true);
                    }}
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
                            setCreateNoticeModal(true);
                        }}
                        sx={{ width: '217px', height: '48px' }}>
                        <Plus /> <Box sx={{ width: '10px' }}></Box>
                        {t('createNoticeEmptyStateButtonTitle')}
                    </Button>
                </Stack>
                <NoticePredefinedTable notice={notice} />
            </Box>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else if (notice.length === 0) {
            return <EmptyStateComponent />;
        } else {
            return <>{DashboardComponent()}</>;
        }
    };

    return (
        <>
            {RenderComponents()}
            {createPredefinedNotice()}
            {success()}
        </>
    );
};
