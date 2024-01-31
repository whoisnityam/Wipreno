import { Box, Button, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../components/alerts/Alert';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { WRBreadcrumb } from '../../../components/breadcumbs/WRBreadcrumb';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ACCENT_SUNSET, NEUTRAL } from '../../../theme/palette';
import { small1 } from '../../../theme/typography';
import { Notice } from '../../projects/models/Notice';
import { deleteNotice } from '../../projects/services/NoticeService';
import { ModeleDuplicate } from '../components/ModeleDuplicate';
import { getNoticeById, modifyPredefinedNotice } from '../services/ModelesServices';

export interface NoticeViewData {
    notice?: Notice;
    refreshData: Function;
}

export const NoticeContext = createContext<NoticeViewData | undefined>(undefined);

export function ModeleDetailLayout(): React.ReactElement {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [viewData, setViewData] = useState<NoticeViewData>({
        notice: undefined,
        refreshData: (): void => {}
    });
    const [deleteModal, setDeleteModal] = useState(false);
    const [title, setTitle] = useState('');
    const [modifyNoticeModal, setModifyNoticeModal] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    let currentTab = 0;
    let isMyModels = false;
    let isAdmin = false;

    if (pathname.includes('/modele/estimation/')) {
        currentTab = 0;
        isMyModels = false;
    } else if (pathname.includes('/modele/planning/')) {
        currentTab = 1;
        isMyModels = false;
    } else if (pathname.includes('/modele/vos-modeles/estimation/')) {
        currentTab = 0;
        isMyModels = true;
    } else if (pathname.includes('/modele/vos-modeles/planning/')) {
        currentTab = 1;
        isMyModels = true;
    } else if (pathname.includes('/predefined-notice/estimation/')) {
        currentTab = 0;
        isAdmin = true;
    } else if (pathname.includes('/predefined-notice/planning/')) {
        currentTab = 1;
        isAdmin = true;
    }

    const [selectedTab, setSelectedTab] = useState(currentTab);
    const [loading, setLoading] = useState<boolean>(false);

    const prepareData = useCallback(async () => {
        setLoading(true);
        const response = await getNoticeById(id!);
        setViewData({ notice: response, refreshData: prepareData });
        setTitle(response.title);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!id) {
            navigate('/modeles', { replace: true });
        } else {
            prepareData();
        }
    }, []);

    useEffect(() => {
        if (isMyModels) {
            switch (selectedTab) {
                case 0:
                    navigate(`/modele/vos-modeles/estimation/${id}`);
                    break;
                case 1:
                    navigate(`/modele/vos-modeles/planning/${id}`);
                    break;
                default:
                    navigate(`/modele/vos-modeles/estimation/${id}`);
                    break;
            }
        } else if (isAdmin) {
            switch (selectedTab) {
                case 0:
                    navigate(`/predefined-notice/estimation/${id}`);
                    break;
                case 1:
                    navigate(`/predefined-notice/planning/${id}`);
                    break;
                default:
                    navigate(`/predefined-notice/estimation/${id}`);
                    break;
            }
        } else {
            switch (selectedTab) {
                case 0:
                    navigate(`/modele/estimation/${id}`);
                    break;
                case 1:
                    navigate(`/modele/planning/${id}`);
                    break;
                default:
                    navigate(`/modele/estimation/${id}`);
                    break;
            }
        }
    }, [selectedTab]);

    const breadcrumbData: {
        link: string;
        label: string;
    }[] = [
        { link: '/modeles', label: t('models') },
        { link: '/modeles', label: t('modelsPredefined') },
        { link: '#', label: viewData.notice ? viewData.notice.title : '' }
    ];

    const mymodelsBreadcrumbData: {
        link: string;
        label: string;
    }[] = [
        { link: '/modeles/vos-modeles', label: t('models') },
        { link: '/modeles/vos-modeles', label: t('yourModels') },
        { link: '#', label: viewData.notice ? viewData.notice.title : '' }
    ];

    const adminBreadcrumbsData: {
        link: string;
        label: string;
    }[] = [
        { link: '/predefined-notices', label: t('predefinedRecords') },
        { link: '#', label: viewData.notice ? viewData.notice.title : '' }
    ];

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            if (isAdmin) {
                navigate('/predefined-notices', { replace: true });
            } else {
                navigate('/modeles/vos-modeles', { replace: true });
            }
        }, 3000);
    };

    function success(): React.ReactElement {
        return (
            <SuccessAlert
                onClose={(): void => {
                    navigate('/modeles/vos-modeles', { replace: true });
                }}
                open={successModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToNoticePredefined')}
            />
        );
    }
    const DeleteMyModel = async (): Promise<void> => {
        await deleteNotice(id!);
        setDeleteModal(false);
        openSuccessModal();
    };
    function deleteNoticeModal(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="392px"
                title={t('wantToDeleteNotice')}
                subtitle={t('deleteNoticeSubtitle')}
                open={deleteModal}
                onClick={DeleteMyModel}
                onClose={(): void => setDeleteModal(false)}
                onSecondaryButtonClick={(): void => {
                    setDeleteModal(false);
                }}
                primaryButton={t('remove')}
                primaryButtonType="error"
                secondaryButton={t('cancelButtonTitle')}
            />
        );
    }

    const ActionButtons = (): React.ReactElement => {
        return (
            <Stack direction={'row'} spacing={'20px'}>
                {isAdmin ? (
                    <Button
                        variant={'outlined'}
                        color={'secondary'}
                        onClick={(): void => {
                            setModifyNoticeModal(true);
                        }}>
                        {t('modifyButtonTitle')}
                    </Button>
                ) : (
                    <></>
                )}
                {!isMyModels && !isAdmin ? (
                    <ModeleDuplicate />
                ) : (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={(): void => {
                            setDeleteModal(true);
                        }}>
                        {t('remove')}
                    </Button>
                )}
            </Stack>
        );
    };

    const getBreadcrumbs = (): React.ReactElement => {
        if (isAdmin) {
            return (
                <WRBreadcrumb
                    onBackPress={(): void => navigate('/predefined-notices', { replace: true })}
                    links={adminBreadcrumbsData}
                />
            );
        } else if (isMyModels) {
            return (
                <WRBreadcrumb
                    onBackPress={(): void => navigate('/modeles/vos-modeles', { replace: true })}
                    links={mymodelsBreadcrumbData}
                />
            );
        } else {
            return (
                <WRBreadcrumb
                    onBackPress={(): void => navigate('/modeles', { replace: true })}
                    links={breadcrumbData}
                />
            );
        }
    };

    function handleClose(): void {
        setModifyNoticeModal(false);
    }

    function PredefinedNoticeAlert(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="410px"
                title={t('modifyNotice')}
                subtitle={t('modifyNoticeSubtitle')}
                open={modifyNoticeModal}
                onClick={async (): Promise<void> => {
                    const notice = await modifyPredefinedNotice(viewData.notice!.id, title);
                    setViewData({ ...viewData, notice });
                    handleClose();
                }}
                onClose={handleClose}
                onSecondaryButtonClick={handleClose}
                primaryButton={t('modifyNoticeButton')}
                primaryButtonEnabled={title.trim().length > 0}
                secondaryButton={t('return')}>
                <>
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'title'}
                        value={title ?? ''}
                        onChange={(event): void => {
                            setTitle(event.target.value);
                        }}
                        label={t('noticeNameLabel')}
                    />
                </>
            </Alert>
        );
    }

    const Header = (): React.ReactElement => {
        return (
            <Stack>
                {getBreadcrumbs()}
                <Box height={'30px'} />
                <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant={'h4'} color={NEUTRAL.darker}>
                        {viewData.notice ? viewData.notice.title : ''}
                    </Typography>
                    <ActionButtons />
                </Box>
            </Stack>
        );
    };

    const Nav = (): React.ReactElement => {
        return (
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: NEUTRAL.light
                }}>
                <Tabs
                    sx={{
                        '.MuiTab-root': {
                            ...small1
                        },
                        '.MuiTabs-indicator': {
                            backgroundColor: ACCENT_SUNSET.medium
                        }
                    }}
                    value={selectedTab}
                    onChange={(_, newValue): void => setSelectedTab(newValue)}
                    aria-label="Modele Tabs">
                    <Tab label={t('estimate')} />
                    <Tab label={t('planning')} />
                </Tabs>
            </Box>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return (
                <NoticeContext.Provider value={viewData}>
                    <Box sx={{ padding: '0px 80px' }}>
                        <Header />
                        <Box height={'37px'} />
                        <Nav />
                        <Box height={'33px'} />
                        <Outlet />
                    </Box>
                </NoticeContext.Provider>
            );
        }
    };

    return (
        <>
            {deleteNoticeModal()}
            {success()}
            {isAdmin ? PredefinedNoticeAlert() : <></>}
            {RenderComponents()}
        </>
    );
}
