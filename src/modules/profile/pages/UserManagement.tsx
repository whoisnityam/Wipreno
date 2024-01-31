import {
    Box,
    Button,
    Dialog,
    Slide,
    Stack,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Info, Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { UserContext } from '../../../provider/UserProvider';
import { ACCENT_SUNSET, NEUTRAL } from '../../../theme/palette';
import { body3, small1 } from '../../../theme/typography';
import { UsersTable } from '../components/UsersTable';
import { User } from '../models/User';
import { ModalContainer } from '../../../components/ModalContainer';
import { SaveUserForm } from './SaveUserForm';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { getUsers } from '../services/UserManagementService';
import { useNavigate } from 'react-router-dom';
import { ChangeSubscriptionAlert } from './ChangeSubscriptionAlert';

export function UserManagement(): React.ReactElement {
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [openAddUserForm, setOpenAddUserForm] = useState<boolean>(false);
    const [openInformationModal, setOpenInformationModal] = useState<boolean>(false);
    const [openChangeSubscription, setOpenChangeSubscription] = useState(false);
    const { t } = useTranslation();
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const [openAddUserSlide, setOpenAddUserSlide] = useState<boolean>(false);

    const handleClose = (): void => {
        setOpenAddUserSlide(false);
    };

    const fetchUsers = async (): Promise<User[]> => {
        if (user.user) {
            return getUsers(user.user.enterprises.at(0)!.enterprise_id.id);
        } else {
            return [];
        }
    };

    const prepareData = useCallback(async () => {
        if (isEmpty) {
            setLoading(true);
            const response = await fetchUsers();
            if (response && response.length > 0) {
                setIsEmpty(false);
            }
            setAllUsers(response);
            setLoading(false);
        } else {
            const response = await fetchUsers();
            setAllUsers(response);
        }
    }, []);

    useEffect(() => {
        prepareData();
    }, []);

    const handleAddUser = (): void => {
        if (user.user?.subscription_plan_id.is_pro) {
            setOpenInformationModal(true);
        } else {
            setOpenChangeSubscription(true);
        }
    };

    const openSuccessModal = (): void => {
        setOpenAddUserSlide(false);
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            prepareData();
        }, 3000);
    };
    const PageTitle = (): ReactElement => {
        return (
            <Typography variant={isLargeLandscape ? 'h2' : 'h6'} color={theme.palette.primary.main}>
                {t('userManagement')}
            </Typography>
        );
    };

    const renderAddUserForm = (): React.ReactElement => {
        return (
            <SaveUserForm
                handleCloseForm={(): void => {
                    setOpenInformationModal(false);
                    setOpenAddUserForm(false);
                    setOpenAddUserSlide(false);
                }}
                handleOpenSuccess={(): void => openSuccessModal()}
            />
        );
    };

    const renderInformationModal = (): React.ReactElement => {
        return (
            <Stack>
                <Typography variant="h4" textAlign="center" color={NEUTRAL.darker}>
                    {t('areYouSureAddUser')}
                </Typography>
                <Box height="24px" />
                <Typography variant="body1" textAlign="center" color={NEUTRAL.medium}>
                    {t('addUserInformation')}
                </Typography>
                <Box height="48px" />
                <Button
                    variant="contained"
                    onClick={(): void => {
                        if (isLargeLandscape) {
                            setOpenAddUserForm(true);
                        } else {
                            setOpenInformationModal(false);
                            setOpenAddUserSlide(true);
                        }
                    }}>
                    {t('addUserButtonTitle')}
                </Button>
                <Box height="20px" />
                <Button variant="outlined" onClick={(): void => setOpenInformationModal(false)}>
                    {t('cancelButtonTitle')}
                </Button>
            </Stack>
        );
    };

    const AddUserComponents = (): React.ReactElement => {
        return (
            <>
                <ModalContainer
                    isModalOpen={openAddUserForm && !successModalOpen}
                    content={renderAddUserForm()}
                    onClose={(): void => {
                        setOpenInformationModal(false);
                        setOpenAddUserForm(false);
                    }}
                />
                <ModalContainer
                    isModalOpen={openInformationModal && !successModalOpen}
                    content={renderInformationModal()}
                    onClose={(): void => setOpenInformationModal(false)}
                />
                <ChangeSubscriptionAlert
                    isOpen={openChangeSubscription}
                    onClose={(): void => setOpenChangeSubscription(false)}
                />
                <SuccessAlert
                    onClose={(): void => {}}
                    open={successModalOpen}
                    title={t('theUserHasbeenAdded')}
                    subtitle={t('YouWillBeRedirectedToAccount')}
                />
            </>
        );
    };

    const UsersComponentDesktop = (): React.ReactElement => {
        return (
            <>
                {AddUserComponents()}
                <Box>
                    <Stack justifyContent={'space-between'} direction={'row'} alignItems={'center'}>
                        <PageTitle />
                        <Stack direction={'row'}>
                            <Button
                                variant={'outlined'}
                                color={'secondary'}
                                onClick={(): void => handleAddUser()}
                                sx={{
                                    borderRadius: '4px',
                                    justifyContent: 'space-between'
                                }}
                                startIcon={<Plus />}>
                                {t('addUserButtonTitle')}
                            </Button>
                        </Stack>
                    </Stack>
                    <Box width={'100%'} mt={'8px'}>
                        <Typography variant="body1" color={theme.palette.grey[200]}>
                            {t('myUserEmptystateDescription')}
                        </Typography>
                    </Box>
                    <Stack
                        mt={'16px'}
                        width={'100%'}
                        direction={'row'}
                        flexWrap={'wrap'}
                        alignItems={'center'}
                        padding={'16px'}
                        sx={{ backgroundColor: ACCENT_SUNSET.lighter }}>
                        <Box mr={2}>
                            <Info style={{ color: ACCENT_SUNSET.darker, marginTop: '5px' }} />
                        </Box>
                        <Box>
                            <Typography
                                sx={{ ...small1 }}
                                color={ACCENT_SUNSET.darker}
                                fontWeight={'700'}>
                                {t('addUserInfo')}
                            </Typography>
                        </Box>
                    </Stack>
                    <UsersTable key={'list'} users={allUsers} />
                </Box>
            </>
        );
    };
    const UsersComponentMobile = (): React.ReactElement => {
        return (
            <Box sx={{ padding: '12px' }}>
                {AddUserComponents()}
                <Box>
                    <Stack justifyContent={'space-between'} direction={'column'}>
                        <PageTitle />
                        <Box width={'100%'} mt={'8px'}>
                            <Typography sx={{ ...body3 }} color={theme.palette.grey[200]}>
                                {t('myUserEmptystateDescription')}
                            </Typography>
                        </Box>
                        <Stack direction={'row'} width={'100%'} mt={3}>
                            <Button
                                variant={'outlined'}
                                color={'secondary'}
                                fullWidth
                                onClick={(): void => {
                                    handleAddUser();
                                }}
                                sx={{
                                    borderRadius: '4px'
                                }}
                                startIcon={<Plus />}>
                                {t('addUserButtonTitle')}
                            </Button>
                        </Stack>
                    </Stack>
                    <Stack
                        mt={'16px'}
                        width={'100%'}
                        direction={'row'}
                        flexWrap={'nowrap'}
                        alignItems={'flex-start'}
                        padding={'16px'}
                        sx={{ backgroundColor: ACCENT_SUNSET.lighter }}>
                        <Box mr={2}>
                            <Info style={{ color: ACCENT_SUNSET.darker }} />
                        </Box>
                        <Box>
                            <Typography
                                sx={{ ...body3 }}
                                color={ACCENT_SUNSET.darker}
                                fontWeight={'700'}>
                                {t('addUserInfo')}
                            </Typography>
                        </Box>
                    </Stack>
                    <UsersTable key={'list'} users={allUsers} />
                </Box>
            </Box>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else if (!user.user?.is_enterprise_owner) {
            navigate('/error/404');
            return <></>;
        } else {
            return (
                <>
                    <>{isLargeLandscape ? UsersComponentDesktop() : UsersComponentMobile()}</>
                    <>
                        {!isLargeLandscape && (
                            <>
                                <Slide direction="up" in={openAddUserSlide}>
                                    <Dialog
                                        open={openAddUserSlide}
                                        keepMounted
                                        onClose={handleClose}
                                        aria-describedby="alert-dialog-history-of-project"
                                        sx={{
                                            '.MuiDialog-paper': {
                                                minHeight: 'calc(100% - 40px)',
                                                maxHeight: 'calc(100% - 40px)',
                                                minWidth: '100%',
                                                maxWidth: '100%',
                                                margin: 'unset',
                                                marginTop: '40px',
                                                padding: '25px',
                                                overflowY: 'scroll',
                                                '&::-webkit-scrollbar': { display: 'none' },
                                                scrollbarWidth: 'none',
                                                msOverflowStyle: 'none'
                                            }
                                        }}>
                                        {renderAddUserForm()}
                                    </Dialog>
                                </Slide>
                                <SuccessAlert
                                    onClose={(): void => {}}
                                    open={successModalOpen}
                                    title={t('theUserHasbeenAdded')}
                                    subtitle={t('YouWillBeRedirectedToAccount')}
                                />
                            </>
                        )}
                    </>
                </>
            );
        }
    };

    return <> {RenderComponents()}</>;
}
