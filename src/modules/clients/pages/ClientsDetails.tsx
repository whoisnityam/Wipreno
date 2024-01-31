import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { button2, fontWeightSemiBold, small1, small2 } from '../../../theme/typography';
import { User } from '../../profile/models/User';
import { Project } from '../../projects/models/Project';
import { getClientById, getProjectsByClientId } from '../services/ClientService';

export function ClientsDetails(): React.ReactElement {
    const { id } = useParams();
    const { t } = useTranslation();
    const [client, setClient] = useState<User>();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const theme = useTheme();
    const navigate = useNavigate();

    const fetchClientDetails = async (): Promise<void> => {
        if (id) {
            setLoading(true);
            const data = await getClientById(id);
            setClient(data);
            const projectList = await getProjectsByClientId(id);
            setProjects(projectList);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClientDetails();
        return (): void => {
            setLoading(false);
        };
    }, []);

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return (
                <>
                    <Box sx={{ padding: '15px' }} mt={1}>
                        <Typography variant="h6" color={NEUTRAL.darker}>
                            {t('customerDetails')}
                        </Typography>
                        <Typography sx={{ ...small1 }} color={theme.palette.primary.main} mt={3}>
                            {t('client')}
                        </Typography>
                        <Divider sx={{ marginTop: '10px' }} />
                        <Stack direction={'column'}>
                            <Typography color={NEUTRAL.darker} variant="subtitle2" mt={2}>
                                {t('lastName')}
                            </Typography>
                            <Typography
                                sx={{ wordWrap: 'break-word' }}
                                variant="body2"
                                color={NEUTRAL.darker}>
                                {`${client?.first_name ?? ''} ${client?.last_name ?? ''}`}
                            </Typography>
                            <Typography variant="subtitle2" color={NEUTRAL.darker} mt={2}>
                                {t('emailFieldLabel')}
                            </Typography>
                            <Typography
                                sx={{ wordWrap: 'break-word' }}
                                variant="body2"
                                color={NEUTRAL.darker}>
                                {client?.email ?? ''}
                            </Typography>
                            <Typography color={NEUTRAL.darker} variant="subtitle2" mt={2}>
                                {t('phoneNumber')}
                            </Typography>
                            <Typography variant="body2" color={NEUTRAL.darker}>
                                {client?.phone ?? ''}
                            </Typography>
                            <Typography variant="subtitle2" color={NEUTRAL.darker} mt={2}>
                                {t('address')}
                            </Typography>
                            <Typography
                                sx={{ wordWrap: 'break-word' }}
                                variant="body2"
                                color={NEUTRAL.darker}>
                                {`${client?.address ?? '' + ','} ${client?.postal_code ?? ''} ${
                                    client?.city ?? ''
                                }`}
                            </Typography>
                        </Stack>
                        <Typography sx={{ ...small1 }} color={theme.palette.primary.main} mt={3}>
                            {t('projet(s)')}
                        </Typography>
                        <Divider sx={{ marginTop: '10px' }} />
                        {projects.map((project) => (
                            <Box key={project.id} mt={1}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Stack width="49%">
                                        <Typography
                                            color={NEUTRAL.darker}
                                            variant="subtitle2"
                                            sx={{
                                                width: '170px',
                                                maxHeight: '40px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                            {project.name}
                                        </Typography>
                                        <Box height="8px" />
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                background:
                                                    project.status_id.name === 'Chantier terminé'
                                                        ? theme.palette.success.light
                                                        : PINK.lighter,
                                                width: 'max-content'
                                            }}>
                                            <Typography
                                                sx={{
                                                    ...small2,
                                                    color:
                                                        project.status_id.name ===
                                                        'Chantier terminé'
                                                            ? theme.palette.success.dark
                                                            : PINK.darker,
                                                    padding: '4px 8px',
                                                    fontWeight: fontWeightSemiBold
                                                }}>
                                                {project.status_id.name}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Typography
                                        color={theme.palette.secondary.main}
                                        sx={{
                                            ...button2,
                                            fontWeight: 'bold',
                                            margin: '0% 3%',
                                            marginTop: '18px',
                                            textTransform: 'none'
                                        }}
                                        onClick={(): void =>
                                            navigate(`/project/details/${project.id}`)
                                        }>
                                        {t('seeMore')}
                                    </Typography>
                                </Stack>
                                <Box height="14px" />
                            </Box>
                        ))}
                    </Box>
                </>
            );
        }
    };

    return <>{RenderComponents()}</>;
}
