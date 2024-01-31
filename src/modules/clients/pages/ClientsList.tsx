import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { useTranslation } from 'react-i18next';
import { ClientTable } from '../components/ClientTable';
import { Download, Plus } from 'react-feather';
import { exportClients, getClients, getProjectsByEnterpriseId } from '../services/ClientService';
import { UserContext } from '../../../provider/UserProvider';
import { User } from '../../profile/models/User';
import { Project } from '../../projects/models/Project';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { ModalContainer } from '../../../components/ModalContainer';
import { NewClientForm } from '../components/NewClientForm';
import { AddModal } from '../../../components/addModal';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { Searchbar } from '../../../components/textfield/Searchbar';
import { SaveImportClients } from './SaveImportClients';
import { CheckSentenceStartsWith } from '../../../utils';

export function ClientsList(): React.ReactElement {
    const user = useContext(UserContext);
    const [clients, setClients] = useState<User[]>([]);
    const [searchText, setSearchText] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredClients, setFilteredClients] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [addClientModalOpen, setAddClientModalOpen] = useState<boolean>(false);
    const [openNewClientForm, setOpenNewClientForm] = useState<boolean>(false);
    const [importClientModalOpen, setImportClientModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    const { t } = useTranslation();

    const fetchClients = async (): Promise<User[]> => {
        if (user.user) {
            return getClients(user.user!.enterprises.at(0)!.enterprise_id.id);
        } else {
            return [];
        }
    };

    const fetchProjects = async (): Promise<Project[]> => {
        if (user.user) {
            return getProjectsByEnterpriseId(user.user!.enterprises.at(0)!.enterprise_id.id);
        } else {
            return [];
        }
    };

    const prepareData = useCallback(async () => {
        setLoading(true);
        const responseClients = await fetchClients();
        const responseProjects = await fetchProjects();
        if (responseClients) {
            const List: User[] = [];
            for (const element of responseClients) {
                if (element.id !== null) {
                    const item = element;
                    List.push(item);
                }
                setClients(List);
            }
        }
        setProjects(responseProjects);
        setLoading(false);
    }, [searchText]);

    useEffect(() => {
        prepareData();
        return (): void => {
            setLoading(false);
        };
    }, []);

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            prepareData();
        }, 3000);
    };

    // Filter table content based on search text
    useEffect(() => {
        if (searchText.trim() !== '') {
            const tempFilteredClients = clients.filter((client) => {
                const name = client.first_name + ' ' + client.last_name;

                let isProjectName = false;
                projects
                    .filter(
                        (project) =>
                            project.client_id !== null && project.client_id.id === client.id
                    )
                    .map((project) => {
                        isProjectName =
                            isProjectName || CheckSentenceStartsWith(project.name, searchText);
                    });
                if (
                    (client.phone &&
                        client.phone.toLowerCase().includes(searchText.toLowerCase())) ||
                    (client.email &&
                        client.email.toLowerCase().includes(searchText.toLowerCase())) ||
                    CheckSentenceStartsWith(name, searchText) ||
                    isProjectName
                ) {
                    return client;
                }
                return null;
            });
            setFilteredClients(tempFilteredClients);
        } else {
            setFilteredClients(clients);
        }
    }, [searchText, clients]);

    const ClientsComponent1 = (): React.ReactElement => {
        return (
            <Stack marginLeft="30px">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h2" color="primary">
                        {t('clients')}
                    </Typography>
                    <Stack direction="row">
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<Plus />}
                            onClick={(): void => {
                                setAddClientModalOpen(true);
                            }}
                            sx={{
                                justifyContent: 'space-between'
                            }}>
                            {t('createClientButton')}
                        </Button>
                        <Box width="20px" />
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={async (): Promise<void> => {
                                if (user.user) {
                                    await exportClients(
                                        user.user.enterprises.at(0)!.enterprise_id.id
                                    );
                                }
                            }}>
                            {t('exportButton')}
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        );
    };

    const ClientsComponent2 = (): React.ReactElement => {
        return (
            <Stack marginLeft="30px">
                <ClientTable
                    clients={filteredClients}
                    enterpriseId={user.user!.enterprises.at(0)!.enterprise_id.id}
                    projects={projects}
                    removeDeletedClient={(deletedClient: User): void => {
                        const tempClients = clients.filter((item) => item.id !== deletedClient.id);
                        setClients(tempClients);
                    }}
                    changeModifiedClient={(modifiedClient: User): void => {
                        const index = clients.findIndex((item) => item.id === modifiedClient.id);
                        const tempClients = [...clients];
                        tempClients[index] = modifiedClient;
                        setClients(tempClients);
                    }}
                />
            </Stack>
        );
    };

    const renderImportClient = (): React.ReactElement => {
        return (
            <SaveImportClients
                handleCloseForm={(): void => setImportClientModalOpen(false)}
                handleOpenSuccess={(): void => openSuccessModal()}
            />
        );
    };

    const EmptyStateComponent = (): React.ReactElement => {
        return (
            <EmptyState
                title={t('clients')}
                subtitle={t('clientEmptyStateTitle')}
                description={t('clientEmptyStateSubtitle')}
                buttonTitle={t('createClientButton')}
                buttonOnClick={(): void => setAddClientModalOpen(true)}
            />
        );
    };

    const renderClientForm = (): React.ReactElement => {
        return (
            <NewClientForm
                handleCloseForm={(): void => setOpenNewClientForm(false)}
                handleOpenSuccess={(): void => openSuccessModal()}
                appendNewClient={(newClient: User): void => setClients([newClient, ...clients])}
            />
        );
    };

    const ClientsComponentDesktop = (): React.ReactElement => {
        return (
            <Box>
                <ClientsComponent1 />
                <Stack marginLeft="30px">
                    <Box height="32px" />
                    <Searchbar
                        type={'outlined'}
                        searchText={searchText}
                        onChange={(searchTerm): void => setSearchText(searchTerm)}
                        width="265px"
                    />
                </Stack>
                <ClientsComponent2 />
            </Box>
        );
    };

    const ClientsComponentMobile = (): React.ReactElement => {
        return (
            <Box sx={{ padding: '15px' }}>
                <Stack
                    width="100%"
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ marginTop: '12px' }}>
                    <Typography variant="h4" color={theme.palette.primary.main}>
                        {t('clients')}
                    </Typography>
                    <Button
                        sx={{
                            padding: '0',
                            minWidth: '0',
                            height: 'fit-content'
                        }}
                        onClick={async (): Promise<void> => {
                            if (user.user) {
                                await exportClients(user.user.enterprises.at(0)!.enterprise_id.id);
                            }
                        }}
                        startIcon={<Download />}></Button>
                </Stack>
                <Stack width="100%" sx={{ marginTop: '24px' }}>
                    <Box>
                        <Searchbar
                            type={'outlined'}
                            searchText={searchText}
                            onChange={(searchTerm): void => setSearchText(searchTerm)}
                            width="100%"
                        />
                    </Box>
                </Stack>
                <ClientTable
                    clients={filteredClients}
                    enterpriseId={user.user!.enterprises.at(0)!.enterprise_id.id}
                    projects={projects}
                    removeDeletedClient={(deletedClient: User): void => {
                        const tempClients = clients.filter((item) => item.id !== deletedClient.id);
                        setClients(tempClients);
                    }}
                    changeModifiedClient={(modifiedClient: User): void => {
                        const index = clients.findIndex((item) => item.id === modifiedClient.id);
                        const tempClients = [...clients];
                        tempClients[index] = modifiedClient;
                        setClients(tempClients);
                    }}
                />{' '}
            </Box>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else if (clients.length === 0) {
            return (
                <>
                    <EmptyStateComponent />
                    <AddModal
                        onClose={(): void => setAddClientModalOpen(false)}
                        isModalOpen={addClientModalOpen}
                        title={t('clientAddMethodTitle')}
                        subtitle={t('clientAddChoice')}
                        createButtonText={t('createCustomer')}
                        createFunction={(): void => {
                            setAddClientModalOpen(false);
                            setOpenNewClientForm(true);
                        }}
                        importFunction={(): void => {
                            setAddClientModalOpen(false);
                            setImportClientModalOpen(true);
                        }}
                    />
                    <ModalContainer
                        onClose={(): void => {
                            setOpenNewClientForm(false);
                        }}
                        isModalOpen={openNewClientForm && !successModalOpen}
                        content={renderClientForm()}
                    />
                    <ModalContainer
                        isModalOpen={importClientModalOpen && !successModalOpen}
                        content={renderImportClient()}
                        onClose={(): void => setImportClientModalOpen(false)}
                    />
                    <SuccessAlert
                        onClose={(): void => {
                            setSuccessModalOpen(false);
                        }}
                        open={successModalOpen}
                        title={t('yourRequestBeenAccounted')}
                        subtitle={t('youWillBeRedirectedToCustomers')}
                    />
                </>
            );
        } else {
            return (
                <>
                    {isLargeLandscape ? ClientsComponentDesktop() : ClientsComponentMobile()}
                    <AddModal
                        onClose={(): void => setAddClientModalOpen(false)}
                        isModalOpen={addClientModalOpen}
                        title={t('clientAddMethodTitle')}
                        subtitle={t('clientAddChoice')}
                        createButtonText={t('createCustomer')}
                        createFunction={(): void => {
                            setAddClientModalOpen(false);
                            setOpenNewClientForm(true);
                        }}
                        importFunction={(): void => {
                            setAddClientModalOpen(false);
                            setImportClientModalOpen(true);
                        }}
                    />
                    <ModalContainer
                        onClose={(): void => {
                            setOpenNewClientForm(false);
                        }}
                        isModalOpen={openNewClientForm && !successModalOpen}
                        content={renderClientForm()}
                    />
                    <ModalContainer
                        isModalOpen={importClientModalOpen && !successModalOpen}
                        content={renderImportClient()}
                        onClose={(): void => setImportClientModalOpen(false)}
                    />
                    <SuccessAlert
                        onClose={(): void => {
                            setSuccessModalOpen(false);
                        }}
                        open={successModalOpen}
                        title={t('yourRequestBeenAccounted')}
                        subtitle={t('youWillBeRedirectedToCustomers')}
                    />
                </>
            );
        }
    };

    return <>{RenderComponents()}</>;
}
