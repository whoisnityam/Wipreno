import React, { useCallback, useContext, useEffect, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { body3, fontWeightSemiBold, small1, small2 } from '../../../theme/typography';
import { User } from '../models/User';
import { WRTable } from '../../../components/WRTable';
import { deleteUser, getUsers } from '../services/UserManagementService';
import { UserContext } from '../../../provider/UserProvider';
import { Role } from '../models/Role';
import { UserInfoAlert } from './UserInfoAlert';
import { ModalContainer } from '../../../components/ModalContainer';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { SaveUserForm } from '../pages/SaveUserForm';
import { getFormatedDate } from '../../../utils';
import { Alert } from '../../../components/alerts/Alert';
import { HighlightBox } from '../../clients/components/HighlightBox';
import { MoreHorizontal, X } from 'react-feather';

interface UsersTableProps {
    users: User[];
}

export function UsersTable({ users }: UsersTableProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const currentUser = useContext(UserContext);
    const [fetchUsers, setFetchUsers] = useState<User[] | null>(users);
    const [displayUsers, setDisplayUsers] = useState<User[] | null>(null);
    const [selectedUser, setselectedUser] = useState<User>();
    const [userDetailsModalOpen, setUserDetailsModalOpen] = useState<boolean>(false);
    const [userDeleteAlertOpen, setUserDeleteAlertOpen] = useState<boolean>(false);
    const [openAddUserForm, setOpenAddUserForm] = useState<boolean>(false);
    const [deletesuccessModalOpen, setDeleteSuccessModalOpen] = useState<boolean>(false);
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const [openViewMoreButton, setOpenViewMoreButton] = useState<boolean>(false);
    const [openModifyUserMobile, setOpenModifyUserMobile] = useState<boolean>(false);

    const handleClose = (): void => {
        if (openViewMoreButton) {
            setOpenViewMoreButton(false);
        }
        if (openModifyUserMobile) {
            setOpenModifyUserMobile(false);
        }
    };

    const fetchAllUsers = async (): Promise<User[]> => {
        if (currentUser.user) {
            return getUsers(currentUser.user.enterprises.at(0)!.enterprise_id.id);
        } else {
            return [];
        }
    };

    const RefreshData = useCallback(async () => {
        const response = await fetchAllUsers();
        if (response && response.length > 0) {
            setFetchUsers(response);
        }
    }, []);

    useEffect(() => {
        if (fetchUsers) {
            const adminList: User[] = [];
            const projectManagerList: User[] = [];
            for (const element of fetchUsers) {
                if (
                    element.is_enterprise_owner &&
                    element.enterprises?.at(0)?.enterprise_id.id ===
                        currentUser.user?.enterprises?.at(0)?.enterprise_id.id
                ) {
                    adminList.push(element);
                } else {
                    projectManagerList.push(element);
                }
            }
            const all: User[] = [...adminList, ...projectManagerList];
            if (all.length === fetchUsers.length) {
                setDisplayUsers(all);
            }
        }
    }, [fetchUsers]);

    const openSuccessModal = (): void => {
        RefreshData();
    };

    const openDeleteSuccessModal = (): void => {
        setUserDeleteAlertOpen(false);
        setDeleteSuccessModalOpen(true);
        setTimeout(async () => {
            setOpenViewMoreButton(false);
            setDeleteSuccessModalOpen(false);
            RefreshData();
        }, 3000);
    };

    const handleDelete = async (): Promise<void> => {
        if (selectedUser) {
            const deleteResponse = await deleteUser(
                selectedUser.id,
                selectedUser.enterprises.at(0)!.enterprise_id.id
            );
            if (deleteResponse) {
                openDeleteSuccessModal();
            }
        }
    };

    const UserDeleteSection = (): React.ReactElement => {
        return (
            <React.Fragment>
                <Alert
                    width="440px"
                    title={t('wantToDeleteUser')}
                    subtitle={t('deleteUSerSubtitle')}
                    open={userDeleteAlertOpen}
                    onClick={(): Promise<void> => handleDelete()}
                    onSecondaryButtonClick={(): void => {
                        setUserDeleteAlertOpen(false);
                    }}
                    primaryButton={t('remove')}
                    primaryButtonType="error"
                    secondaryButton={t('cancelButtonTitle')}
                    secondaryButtonType={'text'}
                />
                <SuccessAlert
                    onClose={(): void => {}}
                    open={deletesuccessModalOpen}
                    title={t('userDeleted')}
                    subtitle={t('YouWillBeRedirectedToAccount')}
                />
            </React.Fragment>
        );
    };

    const renderAddUserForm = (): React.ReactElement => {
        return (
            <SaveUserForm
                handleCloseForm={(): void => {
                    setOpenAddUserForm(false);
                    handleClose();
                }}
                handleOpenSuccess={(): void => {
                    openSuccessModal();
                    handleClose();
                }}
                selectedUser={selectedUser}
            />
        );
    };

    const UserModifySection = (): React.ReactElement => {
        return (
            <React.Fragment>
                <ModalContainer
                    isModalOpen={openAddUserForm}
                    content={renderAddUserForm()}
                    onClose={(): void => setOpenAddUserForm(false)}
                />
            </React.Fragment>
        );
    };

    const tableHeaders = [t('lastName'), t('firstName'), t('emailField'), t('type'), ''];
    const tableBody = displayUsers?.map((user, index) => {
        const getUserTypes = (type: string): string => {
            switch (type) {
                case Role.projectManager:
                    return t('projectManager');
                default:
                    return '';
            }
        };

        const type = (): string => {
            if (user.is_enterprise_owner && user.id === currentUser.user?.id) {
                return t('admin');
            } else {
                return getUserTypes(user.role.name);
            }
        };

        return [
            user.last_name,
            user.first_name,
            user.email,
            <Box
                key={index}
                sx={{
                    background: PINK.lighter,
                    width: 'fit-content'
                }}>
                <Typography
                    sx={{
                        ...small2,
                        color: PINK.darker,
                        padding: '4px 8px',
                        fontWeight: fontWeightSemiBold,
                        whiteSpace: 'nowrap'
                    }}>
                    {type()}
                </Typography>
            </Box>,
            <Box key={index}>
                {user.is_enterprise_owner && user.id === currentUser.user?.id ? null : (
                    <Button
                        key={index}
                        variant={'outlined'}
                        color={'secondary'}
                        fullWidth
                        onClick={(): void => {
                            setselectedUser(user);
                            setUserDetailsModalOpen(true);
                        }}>
                        {t('seeNoticeButtonTitle')}
                    </Button>
                )}
            </Box>
        ];
    });

    const responsiveTable = (): React.ReactElement[] => {
        if (displayUsers) {
            return displayUsers.map((user, index) => {
                const getUserTypes = (type: string): string => {
                    switch (type) {
                        case Role.projectManager:
                            return t('projectManager');
                        default:
                            return '';
                    }
                };

                const type = (): string => {
                    if (user.is_enterprise_owner && user.id === currentUser.user?.id) {
                        return t('admin');
                    } else {
                        return getUserTypes(user.role.name);
                    }
                };

                return (
                    <Stack key={index} sx={{ marginTop: '24px' }}>
                        <Box
                            sx={{
                                border: `1px solid ${theme.palette.grey['100']}`,
                                borderRadius: '4px',
                                padding: '12px'
                            }}>
                            <Stack
                                width={'100%'}
                                direction={'row'}
                                justifyContent="space-between"
                                alignItems="center">
                                <Typography color={NEUTRAL.darker} sx={{ ...small1 }}>
                                    {`${user?.first_name ?? ''} ${user?.last_name ?? ''}`}
                                </Typography>
                                {user.is_enterprise_owner &&
                                user.id === currentUser.user?.id ? null : (
                                    <MoreHorizontal
                                        onClick={(): void => {
                                            setselectedUser(user);
                                            setOpenViewMoreButton(true);
                                        }}
                                    />
                                )}
                            </Stack>
                            <Typography color={theme.palette.grey[200]} sx={{ ...body3 }}>
                                {user.email}
                            </Typography>
                            <Stack
                                width={'100%'}
                                direction={'row'}
                                sx={{ ...small2, marginTop: '15px' }}>
                                <HighlightBox
                                    text={type()}
                                    fontColour={PINK.darker}
                                    backgroundColour={PINK.lighter}
                                />
                            </Stack>
                        </Box>
                    </Stack>
                );
            });
        } else {
            return [];
        }
    };

    const TableSection = (): React.ReactElement => {
        return (
            <>
                {isLargeLandscape ? (
                    <WRTable
                        headers={tableHeaders}
                        body={tableBody}
                        marginTop={'24px'}
                        maxHeight={'calc(100vh - 360px)'}
                    />
                ) : (
                    responsiveTable()
                )}
            </>
        );
    };

    const RenderMobileOptionsModal = (): React.ReactElement => {
        return (
            <Stack spacing={'12px'}>
                <Stack alignItems="flex-end">
                    <X
                        onClick={(): void => {
                            setOpenViewMoreButton(false);
                        }}
                    />
                </Stack>
                <Button
                    variant="outlined"
                    onClick={(): void => {
                        setOpenModifyUserMobile(true);
                    }}>
                    {t('modifyButtonTitle')}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={(): void => {
                        setUserDeleteAlertOpen(true);
                    }}>
                    {t('deleteButtonTitle')}
                </Button>
            </Stack>
        );
    };

    return (
        <React.Fragment>
            {selectedUser !== undefined && (
                <UserInfoAlert
                    width={'440px'}
                    title={t('userDetails')}
                    open={userDetailsModalOpen}
                    onClose={(): void => {
                        setUserDetailsModalOpen(false);
                    }}
                    onCrossClick={(): void => {
                        setUserDetailsModalOpen(false);
                    }}
                    primaryButton={t('modifyButtonTitle')}
                    secondaryButton={t('deleteButtonTitle')}
                    secondaryButtonType="outlined"
                    primaryButtonType="outlined"
                    onSecondaryButtonClick={(): void => {
                        setUserDetailsModalOpen(false);
                        setUserDeleteAlertOpen(true);
                    }}
                    onprimaryButtonClick={(): void => {
                        setUserDetailsModalOpen(false);
                        setOpenAddUserForm(true);
                    }}>
                    <>
                        <Stack direction="row" justifyContent="space-between" width={'100%'}>
                            <Stack width="49%">
                                <Typography color={NEUTRAL.darker} variant="subtitle2">
                                    {t('lastName')}
                                </Typography>
                                <Typography
                                    sx={{ wordWrap: 'break-word' }}
                                    variant="body2"
                                    color={NEUTRAL.darker}>
                                    {`${selectedUser.first_name} ${selectedUser.last_name}`}
                                </Typography>
                            </Stack>
                            <Stack width="49%">
                                <Typography variant="subtitle2" color={NEUTRAL.darker}>
                                    {t('emailFieldLabel')}
                                </Typography>
                                <Typography
                                    sx={{ wordWrap: 'break-word' }}
                                    variant="body2"
                                    color={NEUTRAL.darker}>
                                    {selectedUser.email}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack mt={4} mb={4} direction="row" width={'100%'}>
                            <Stack width="49%">
                                <Typography color={NEUTRAL.darker} variant="subtitle2">
                                    {t('addDate')}
                                </Typography>
                                <Typography
                                    sx={{ wordWrap: 'break-word' }}
                                    variant="body2"
                                    color={NEUTRAL.darker}>
                                    {getFormatedDate(selectedUser.created_at)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </>
                </UserInfoAlert>
            )}
            <>{UserModifySection()}</>
            <>{UserDeleteSection()}</>
            <>{TableSection()}</>
            <>
                {!isLargeLandscape && (
                    <>
                        <Slide direction="up" in={openViewMoreButton}>
                            <Dialog
                                open={openViewMoreButton}
                                keepMounted
                                onClose={handleClose}
                                aria-describedby="alert-dialog-history-of-project"
                                sx={{
                                    '.MuiDialog-paper': {
                                        height: '240px',
                                        minWidth: '100%',
                                        maxWidth: '100%',
                                        margin: 'unset',
                                        marginTop: 'calc(100vh - 135px)',
                                        padding: '12px 16px'
                                    }
                                }}>
                                <>{RenderMobileOptionsModal()}</>
                            </Dialog>
                        </Slide>
                        <Slide direction="up" in={openModifyUserMobile}>
                            <Dialog
                                open={openModifyUserMobile}
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
                                <>{renderAddUserForm()}</>
                            </Dialog>
                        </Slide>
                    </>
                )}
            </>
        </React.Fragment>
    );
}
