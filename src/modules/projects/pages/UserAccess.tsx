import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAccessTable } from '../components/userAccess/UserAccessTable';
import { Plus } from 'react-feather';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { AddUserModal } from '../components/userAccess/AddUserModal';
import { ModalContainer } from '../../../components/ModalContainer';
import { CreateNewUserForms } from '../components/userAccess/CreateNewUserForms';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { ProjectAccess } from '../models/ProjectAccess';
import { UserContext } from '../../../provider/UserProvider';
import { getUserAccessByProjectId } from '../services/UserAccessService';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { useParams } from 'react-router-dom';
import { ModifyuserAccess } from '../models/ModifyuserAccess';

export function UserAccess(): React.ReactElement {
    const user = useContext(UserContext);
    const [openAddUserModal, setOpenAddUserModal] = useState<boolean>(false);
    const [openNewUserModal, setOpenNewUserModal] = useState<boolean>(false);
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [createExistingUser, setCreateExistingUser] = useState<boolean>(false);
    const [allAccessUsers, setAllAccessUsers] = useState<ProjectAccess[]>([]);
    const { t } = useTranslation();
    const { id } = useParams();
    const [loading, setLoading] = useState<boolean>(false);
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('sm'));

    const fetchUserProjectAccess = async (): Promise<ProjectAccess[]> => {
        if (user.user) {
            const data = await getUserAccessByProjectId(
                id!,
                user.user.enterprises.at(0)!.enterprise_id.id
            );
            return data;
        } else {
            return [];
        }
    };

    const prepareData = useCallback(async () => {
        setLoading(true);
        const response = await fetchUserProjectAccess();
        setAllAccessUsers(response.filter((item: ProjectAccess) => !item.full_access));
        setLoading(false);
    }, []);

    useEffect(() => {
        prepareData();
    }, []);

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            prepareData();
        }, 3000);
    };
    const AddUserComponents = (): React.ReactElement => {
        return (
            <>
                <AddUserModal
                    isModalOpen={openAddUserModal}
                    title={t('whatTypeOfUserYouWantToAdd')}
                    subtitle={t('whatTypeOfUserYouWantToAddSubtitle')}
                    onCrossClick={(): void => {
                        setOpenAddUserModal(false);
                        setCreateExistingUser(false);
                    }}
                    newUserbuttonText={t('newUserButtonLable')}
                    createNewUserFunction={(): void => {
                        setOpenAddUserModal(false);
                        setOpenNewUserModal(true);
                        setCreateExistingUser(false);
                    }}
                    onClose={(): void => {
                        setOpenAddUserModal(false);
                        setCreateExistingUser(false);
                    }}
                    existingUserbuttonText={t('existingUser')}
                    extistingUserFunction={(): void => {
                        setOpenAddUserModal(false);
                        setCreateExistingUser(true);
                        setOpenNewUserModal(true);
                    }}
                />
            </>
        );
    };

    const RenderUserAccessTable = (): React.ReactElement => {
        return (
            <>
                {AddUserComponents()}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant={'h4'}>{t('accessTabLabel')}</Typography>
                    <Button
                        variant={'outlined'}
                        color={'secondary'}
                        onClick={(): void => {
                            setOpenAddUserModal(true);
                        }}
                        sx={{
                            borderRadius: '4px',
                            justifyContent: 'space-between'
                        }}
                        startIcon={<Plus />}>
                        {t('addGuestButtonLable')}
                    </Button>
                </Box>
                <Box>
                    <UserAccessTable
                        userProjectAccess={allAccessUsers}
                        onDelete={(deleteId: string): void => {
                            const filterData = allAccessUsers.filter((projectAccessTable) => {
                                if (projectAccessTable.id !== deleteId) {
                                    return projectAccessTable;
                                }
                            });
                            setAllAccessUsers(filterData);
                        }}
                        onModify={(
                            updatedData: ModifyuserAccess,
                            projectAccessTableId: string
                        ): void => {
                            const filterData = allAccessUsers.filter((projectAccessTable) => {
                                if (projectAccessTable.id === projectAccessTableId) {
                                    projectAccessTable.has_discussions = updatedData.discussion;
                                    projectAccessTable.has_documents = updatedData.documents;
                                    projectAccessTable.has_planning = updatedData.planning;
                                    projectAccessTable.has_reports = updatedData.reports;
                                    projectAccessTable.user_id.first_name = updatedData.firstName;
                                    projectAccessTable.user_id.last_name = updatedData.lastName;
                                }
                                return projectAccessTable;
                            });
                            setAllAccessUsers(filterData);
                        }}
                    />
                </Box>
            </>
        );
    };

    const EmptyStateComponent = (): React.ReactElement => {
        return (
            <>
                {isLarge ? (
                    <>
                        <EmptyState
                            title={''}
                            subtitle={t('noGuestHasBeenAddedYet')}
                            description={t('inviteArtisanOrClientToProject')}
                            buttonTitle={t('addGuestButtonLable')}
                            buttonOnClick={(): void => {
                                setOpenAddUserModal(true);
                            }}
                        />
                    </>
                ) : (
                    <></>
                )}
            </>
        );
    };

    const renderNewUserForm = (): React.ReactElement => {
        return (
            <>
                <CreateNewUserForms
                    handleCloseForm={(): void => setOpenNewUserModal(false)}
                    handleOpenSuccess={(): void => openSuccessModal()}
                    createExistingUser={createExistingUser}
                    project={id!}
                />
            </>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else if (allAccessUsers.length === 0) {
            return (
                <>
                    <EmptyStateComponent />
                    <> {AddUserComponents()}</>
                </>
            );
        } else {
            return <>{isLarge ? <>{RenderUserAccessTable()}</> : <></>}</>;
        }
    };

    return (
        <Box width={'100%'} justifyContent="space-between">
            {RenderComponents()}
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('requestHasBeenTaken')}
                subtitle={t('addUserAccessSuccess')}
            />
            <ModalContainer
                isModalOpen={openNewUserModal}
                content={renderNewUserForm()}
                onClose={(): void => setOpenNewUserModal(false)}
            />
        </Box>
    );
}
