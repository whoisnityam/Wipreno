import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { Download } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { useIsMounted } from '../../../components/Hooks/useIsMounted';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { UserContext } from '../../../provider/UserProvider';
import { ProjectStatus } from '../../artisans/models/projectStatus';
import { DocumentFolderComponent } from '../components/documents/DocumentFolderComponent';
import { DocumentsArchivedWarning } from '../components/documents/DocumentsArchivedWarning';
import { DocumentsBreadCrumb } from '../components/documents/DocumentsBreadCrumb';
import { ProjectContext } from '../layout/ProjectDetailLayout';
import { getUserAccessByProjectId } from '../services/UserAccessService';

export function ProjectDocuments(): React.ReactElement {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const [hasClients, setHasClients] = useState<boolean>(false);
    const [hasArtisans, setHasArtisans] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isArchived, setIsArchived] = useState<boolean>(false);
    const project = useContext(ProjectContext).project;
    const user = useContext(UserContext);
    const isMounted = useIsMounted();

    const prepareData = async (): Promise<void> => {
        if (isMounted) {
            setLoading(true);
        }
        if (id && user.user) {
            if (isMounted && project) {
                setIsArchived(
                    project.status_id.name === ProjectStatus.completedProject ||
                        project.status_id.name === ProjectStatus.lostProject
                );
            }
            const projectAccessData = await getUserAccessByProjectId(
                id!,
                user.user.enterprises.at(0)!.enterprise_id.id
            );
            if (
                projectAccessData.find(
                    (item) =>
                        item.user_id.role.name === 'CLIENT' &&
                        (item.full_access || item.has_documents)
                ) !== undefined
            ) {
                if (isMounted) {
                    setHasClients(true);
                }
            }
            if (
                projectAccessData.find(
                    (item) =>
                        item.user_id.role.name === 'ARTISAN' &&
                        (item.full_access || item.has_documents)
                ) !== undefined
            ) {
                if (isMounted) {
                    setHasArtisans(true);
                }
            }
        }
        if (isMounted) {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isMounted) {
            prepareData();
        }
    }, []);

    const EmptyStateComponent = (): React.ReactElement => {
        return isLarge ? (
            <EmptyState
                title={''}
                subtitle={t('documentsEmptyStateSubtitle')}
                description={t('documentsEmptyStateDescription')}
                buttonTitle={t('manageAccess')}
                buttonType={'contained'}
                buttonOnClick={(): void => {
                    window.location.href = `/project/user-access/${id}`;
                }}
            />
        ) : (
            <EmptyState title={''} subtitle={t('documentsEmptyStateSubtitle')} description={''} />
        );
    };

    if (loading) {
        return (
            <Stack width="100%">
                <LoadingIndicator />
            </Stack>
        );
    } else if (!hasClients && !hasArtisans) {
        return (
            <Stack width="100%">
                <EmptyStateComponent />
            </Stack>
        );
    } else {
        return (
            <Stack width="100%">
                {isArchived && <DocumentsArchivedWarning />}
                <Stack
                    alignItems={'center'}
                    direction="row"
                    marginBottom={{ xs: '24px', md: '33px' }}
                    marginTop={{ xs: isArchived ? '24px' : '', md: isArchived ? '32px' : '9px' }}>
                    {isLarge ? (
                        <DocumentsBreadCrumb
                            items={[
                                {
                                    title: t('documents'),
                                    path: `/project/documents/${id}`
                                }
                            ]}
                        />
                    ) : (
                        <Stack
                            width="100%"
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <Typography variant="h5">{t('documents')}</Typography>
                            <Button
                                sx={{
                                    padding: '0',
                                    minWidth: '0',
                                    height: 'fit-content'
                                }}
                                onClick={(): void => {
                                    //Download logic for all files
                                }}>
                                <Download />
                            </Button>
                        </Stack>
                    )}
                </Stack>
                <Stack direction={isLarge ? 'row' : 'column'}>
                    {hasArtisans && (
                        <Stack direction={isLarge ? 'row' : 'column'}>
                            <DocumentFolderComponent
                                title={t('artisanDocumentFolder')}
                                documentOnClick={(): void =>
                                    navigate(`/project/documents/craftsman/${id}`)
                                }
                                fullWidth
                            />
                            <Box width="20px" height="16px" />
                        </Stack>
                    )}
                    {hasClients && (
                        <DocumentFolderComponent
                            title={t('clientDocumentFolder')}
                            documentOnClick={(): void =>
                                navigate(`/project/documents/client/${id}`)
                            }
                            fullWidth
                        />
                    )}
                </Stack>
            </Stack>
        );
    }
}
