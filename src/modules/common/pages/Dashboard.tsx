import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectCard } from '../../../components/cards/ProjectCard';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { UserContext } from '../../../provider/UserProvider';
import { ProjectAccess } from '../../projects/models/ProjectAccess';
import { getAccessProjectsByuserId } from '../services/CommonServices';

export function Dashboard(): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const [loading, setLoading] = useState<boolean>();
    const [projectAccess, setProjectAccess] = useState<ProjectAccess[]>();
    const user = useContext(UserContext);
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    const prepareData = async (): Promise<void> => {
        setLoading(true);
        if (user && user.user) {
            const res = await getAccessProjectsByuserId(user.user?.id);
            setProjectAccess(res);
        }
        setLoading(false);
    };

    useEffect(() => {
        prepareData();
    }, []);

    const renderComponent = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return (
                <Box sx={{ height: '100%', padding: '30px' }}>
                    <Typography
                        variant={isLargeLandscape ? 'h2' : 'h4'}
                        sx={{ width: isLargeLandscape ? '40%' : '100%' }}
                        color={theme.palette.primary.main}>
                        {t('welcomeToTheWiprenoSpace')}
                    </Typography>
                    <Typography
                        variant="body1"
                        color={theme.palette.grey[200]}
                        sx={{ marginTop: isLargeLandscape ? '24px' : '32px' }}>
                        {t('welcomeToTheWiprenoSpaceSubtitle')}
                    </Typography>
                    <Stack
                        marginTop={'48px'}
                        direction={isLargeLandscape ? 'row' : 'column'}
                        flexWrap={'wrap'}>
                        {projectAccess?.map((access) => (
                            <ProjectCard
                                key={access.project_id.id}
                                id={access.project_id.id}
                                title={access.project_id.name ?? ''}
                                status={access.project_id.status_id.name ?? ''}
                                firstName={access.project_id.manager_id?.first_name ?? ''}
                                lastName={access.project_id.manager_id.last_name ?? ''}
                                width={isLargeLandscape ? '30%' : '100%'}
                            />
                        ))}
                    </Stack>
                </Box>
            );
        }
    };

    return <>{renderComponent()}</>;
}
