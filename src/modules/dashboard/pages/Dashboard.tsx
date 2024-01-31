import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProjectEmptyState } from '../../../components/emptyState/ProjectEmptyState';
import { UserContext } from '../../../provider/UserProvider';
import { useNavigate } from 'react-router-dom';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { OnGoingProjects } from './OnGoingProjects';
import { Project } from '../../projects/models/Project';
import { getProjects } from '../../projects/services/ProjectService';
import { Notifications } from './Notifications';
import { getProjectStatusByEnterpriseId } from '../../projects/services/StatusService';
import { ProjectStatus } from '../../projects/models/ProjectStatus';

export function Dashboard(): React.ReactElement {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [statusList, setStatusList] = useState<ProjectStatus[]>([]);
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const fetchProjects = async (): Promise<Project[]> => {
        return getProjects(user.user!.enterprises.at(0)!.enterprise_id.id);
    };

    const fetchStatus = async (): Promise<void> => {
        const list = await getProjectStatusByEnterpriseId(
            user.user!.enterprises.at(0)!.enterprise_id.id
        );
        setStatusList(
            list.filter((item) => item.name !== 'Chantier terminé' && item.name !== 'Projet perdu')
        );
    };

    const prepareData = useCallback(async () => {
        setLoading(true);
        const response = await fetchProjects();
        setProjects(response);
        fetchStatus();
        setLoading(false);
    }, []);

    useEffect(() => {
        prepareData();
        return (): void => {
            setProjects([]);
            setLoading(false);
        };
    }, []);

    useEffect(() => {
        if (user.user && user.user.enterprises.at(0)!.enterprise_id.id === null) {
            navigate('/onboarding', { replace: true });
        }
    }, [user.user]);

    const PageTitle = (): ReactElement => {
        return (
            <>
                {!isLarge && (
                    <Typography variant={'h4'} sx={{ textAlign: 'center' }}>
                        {t('dashboard')}
                    </Typography>
                )}
                {isLarge && (
                    <Typography variant={'h2'} sx={{ textAlign: 'center' }}>
                        {t('dashboard')}
                    </Typography>
                )}
            </>
        );
    };

    const DashboardComponent = (): React.ReactElement => {
        return (
            <Stack
                spacing={{ xs: '32px', sm: '32px', md: '48px' }}
                paddingLeft={{ md: '40px' }}
                marginBottom={'40px'}>
                <PageTitle />
                <OnGoingProjects projects={projects} status={statusList} />
                <Notifications />
            </Stack>
        );
    };

    const EmptyStateComponent = (): React.ReactElement => {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-evenly',
                    alignItems: 'center'
                }}>
                <PageTitle />
                <ProjectEmptyState prepareData={prepareData} />
            </Box>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else if (projects.length === 0) {
            return <>{EmptyStateComponent()}</>;
        } else {
            return <>{DashboardComponent()}</>;
        }
    };

    return <RenderComponents />;
}
