import React, { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { User } from '../../profile/models/User';
import { Project } from '../../projects/models/Project';
import { ClientDetailsModal } from './ClientDetailsModal';
import { HighlightBox } from './HighlightBox';
import { ClientDeleteModal } from './ClientDeleteModal';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { ClientContactData, ClientModifyModal } from './ClientModifyModal';
import { AddtionalContactDataErrorsInterface } from './NewClientForm';
import { getClientContacts } from '../services/ClientService';
import { WRTable } from '../../../components/WRTable';
import { body3, button2, small1, small2 } from '../../../theme/typography';
import { useNavigate } from 'react-router-dom';

interface ClientTableProps {
    clients: User[];
    enterpriseId: string;
    projects: Project[];
    removeDeletedClient: Function;
    changeModifiedClient: Function;
}

export function ClientTable({
    clients,
    enterpriseId,
    projects,
    removeDeletedClient,
    changeModifiedClient
}: ClientTableProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const navigate = useNavigate();

    const [selectedClient, setSelectedClient] = useState<User>();
    const [selectedClientProjects, setSelectedClientProjects] = useState<Project[]>([]);

    // Client Details Modal useState
    const [clientDetailsModalOpen, setClientDetailsModalOpen] = useState<boolean>(false);

    // Client Delete useState
    const [clientDeleteModalOpen, setClientDeleteModalOpen] = useState<boolean>(false);
    const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);
    const [deletedClient, setDeletedClient] = useState<User>();

    // Client Modify useState
    const [clientModifyModalOpen, setClientModifyModalOpen] = useState<boolean>(false);
    const [modifySuccess, setModifySuccess] = useState<boolean>(false);
    const [modifiedClient, setModifiedClient] = useState<User>();
    const [initialContacts, setInitialContacts] = useState<ClientContactData[]>();
    const [initialErrors, setInitialErrors] = useState<AddtionalContactDataErrorsInterface[]>();

    useEffect(() => {
        if (selectedClient) {
            getClientContacts(selectedClient).then((items) => {
                const tempContacts: ClientContactData[] = [];
                const tempErrors: AddtionalContactDataErrorsInterface[] = [];
                items.map((item) => {
                    tempContacts.push({
                        id: item.id,
                        firstName: item.first_name,
                        lastName: item.last_name,
                        email: item.email,
                        telephone: item.phone
                    });
                    tempErrors.push({
                        email: false,
                        telephone: false,
                        lastName: false,
                        firstName: false
                    });
                });
                setInitialContacts(tempContacts);
                setInitialErrors(tempErrors);
            });
        }
        return (): void => {
            setInitialContacts([]);
            setInitialErrors([]);
        };
    }, [selectedClient]);

    const ClientDeleteSection = (): React.ReactElement => {
        return (
            <React.Fragment>
                {selectedClient !== undefined && (
                    <ClientDeleteModal
                        client={selectedClient}
                        projects={selectedClientProjects}
                        enterpriseId={enterpriseId}
                        isOpen={clientDeleteModalOpen}
                        onClose={(): void => setClientDeleteModalOpen(false)}
                        onSuccess={(): void => {
                            setDeleteSuccess(true);
                            setClientDeleteModalOpen(false);
                        }}
                        setDeletedClient={(deleted: User): void => setDeletedClient(deleted)}
                    />
                )}
            </React.Fragment>
        );
    };

    const ClientModifySection = (): React.ReactElement => {
        return (
            <React.Fragment>
                {selectedClient !== undefined &&
                    initialContacts !== undefined &&
                    initialErrors !== undefined && (
                        <ClientModifyModal
                            clientContactData={initialContacts}
                            clientContactErrorData={initialErrors}
                            client={selectedClient}
                            isOpen={clientModifyModalOpen}
                            onClose={(): void => setClientModifyModalOpen(false)}
                            onSuccess={(): void => {
                                setModifySuccess(true);
                                setClientModifyModalOpen(false);
                            }}
                            setModifiedClient={(modified: User): void =>
                                setModifiedClient(modified)
                            }
                        />
                    )}
            </React.Fragment>
        );
    };

    const ClientSuccessSection = (): React.ReactElement => {
        return (
            <SuccessAlert
                onClose={(): void => {
                    if (deleteSuccess) {
                        setDeleteSuccess(false);
                        if (deletedClient) {
                            removeDeletedClient(deletedClient);
                        }
                    } else if (modifySuccess) {
                        setModifySuccess(false);
                        if (modifiedClient) {
                            changeModifiedClient(modifiedClient);
                        }
                    }
                }}
                open={deleteSuccess}
                title={t('yourRequestBeenAccounted')}
                subtitle={t('youWillBeRedirectedToCustomers')}
            />
        );
    };
    useEffect(() => {
        if (deleteSuccess) {
            setTimeout(async () => {
                setDeleteSuccess(false);
                if (deletedClient) {
                    removeDeletedClient(deletedClient);
                }
            }, 3000);
        }
    }, [deleteSuccess]);

    useEffect(() => {
        if (modifySuccess) {
            if (modifiedClient) {
                setModifySuccess(false);
                if (modifiedClient) {
                    changeModifiedClient(modifiedClient);
                }
            }
        }
    }, [modifySuccess]);

    const tableHeaders = [
        t('lastNameTextFieldLabel'),
        t('firstNameTextFieldLabel'),
        t('emailFieldLabel'),
        t('phoneNumber'),
        t('Projet'),
        ''
    ];

    const tableBody = clients.map((client, index) => {
        const clientProjects = projects.filter(
            (project) => project.client_id !== null && project.client_id.id === client.id
        );
        return [
            client.last_name,
            client.first_name,
            client.email,
            client.phone,
            <Box display="flex" key={index}>
                {clientProjects.length >= 1 && (
                    <HighlightBox
                        text={clientProjects[0].name}
                        fontColour={PINK.darker}
                        backgroundColour={PINK.lighter}
                    />
                )}
                {clientProjects.length >= 2 && <Box width="8px" />}
                {clientProjects.length >= 2 && (
                    <HighlightBox
                        text={clientProjects[1].name}
                        fontColour={PINK.darker}
                        backgroundColour={PINK.lighter}
                    />
                )}
                <Box width="8px" />
                {clientProjects.length >= 3 && (
                    <HighlightBox
                        text={clientProjects.length - 2}
                        fontColour={PINK.darker}
                        backgroundColour={PINK.lighter}
                    />
                )}
            </Box>,
            <Button
                key={index}
                sx={{ width: '147px' }}
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={(): void => {
                    setSelectedClient(client);
                    setClientDetailsModalOpen(true);
                    setSelectedClientProjects(clientProjects);
                }}>
                {t('seeNoticeButtonTitle')}
            </Button>
        ];
    });

    const responsiveTable = (): React.ReactElement[] => {
        return clients.map((client, index) => {
            const clientProjects = projects.filter(
                (project) => project.client_id !== null && project.client_id.id === client.id
            );
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
                                {`${client?.first_name} ${client?.last_name}`}
                            </Typography>
                            <Typography
                                color={theme.palette.secondary.main}
                                sx={{
                                    ...button2,
                                    fontWeight: 'bold',
                                    margin: '0% 3%',
                                    marginTop: '18px',
                                    textTransform: 'none'
                                }}
                                onClick={(): void => navigate(`/clients/details/${client.id}`)}>
                                {t('seeMore')}
                            </Typography>
                        </Stack>
                        <Typography color={theme.palette.grey[200]} sx={{ ...body3 }}>
                            {client.email}
                        </Typography>
                        <Stack
                            width={'100%'}
                            direction={'row'}
                            sx={{ ...small2, marginTop: '15px' }}>
                            {clientProjects.length >= 1 && (
                                <HighlightBox
                                    text={clientProjects[0].name}
                                    fontColour={PINK.darker}
                                    backgroundColour={PINK.lighter}
                                />
                            )}
                            {clientProjects.length >= 2 && <Box width="8px" />}
                            {clientProjects.length >= 2 && (
                                <HighlightBox
                                    text={clientProjects[1].name}
                                    fontColour={PINK.darker}
                                    backgroundColour={PINK.lighter}
                                />
                            )}
                            <Box width="8px" />
                            {clientProjects.length >= 3 && (
                                <HighlightBox
                                    text={clientProjects.length - 2}
                                    fontColour={PINK.darker}
                                    backgroundColour={PINK.lighter}
                                />
                            )}
                        </Stack>
                    </Box>
                </Stack>
            );
        });
    };

    const TableSection = (): React.ReactElement => {
        return (
            <>
                {isLargeLandscape ? (
                    <WRTable headers={tableHeaders} body={tableBody} />
                ) : (
                    responsiveTable()
                )}
            </>
        );
    };

    return (
        <React.Fragment>
            {selectedClient !== undefined && (
                <ClientDetailsModal
                    client={selectedClient}
                    projects={selectedClientProjects}
                    isOpen={clientDetailsModalOpen}
                    onClose={(): void => setClientDetailsModalOpen(false)}
                    onDelete={(): void => {
                        setClientDetailsModalOpen(false);
                        setClientDeleteModalOpen(true);
                    }}
                    onModify={(): void => {
                        setClientDetailsModalOpen(false);
                        setClientModifyModalOpen(true);
                    }}
                />
            )}
            <ClientDeleteSection />
            <ClientModifySection />
            <ClientSuccessSection />
            <TableSection />
        </React.Fragment>
    );
}
