import React from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DashboardCards } from '../components/DashboardCards';
import { NEUTRAL } from '../../../theme/palette';
import { Project } from '../../projects/models/Project';
import { useNavigate } from 'react-router-dom';
import { ProjectStatus } from '../../projects/models/ProjectStatus';

interface OnGoingProjectsProps {
    projects: Project[];
    status: ProjectStatus[];
}

export function OnGoingProjects({ projects, status }: OnGoingProjectsProps): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const statusList: { status: string; value: number; id?: string }[] = status.map((item) => {
        return {
            status: item.name,
            value: projects.filter((project) => project.status_id.id === item.id).length,
            id: item.id
        };
    });

    const getProjectDetails = (): React.ReactElement => {
        return (
            <Stack
                spacing={'10px'}
                sx={{ width: '100%', paddingLeft: '20px', paddingRight: '10px' }}>
                <Typography variant="h3" sx={{ color: NEUTRAL.darker }}>
                    {t('currentProjects')}
                </Typography>
                <Grid
                    container
                    rowSpacing={{ xs: 1, sm: 2, md: 3 }}
                    columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                    sx={{ width: '30%' }}>
                    <Grid item xs={12} sm={3} sx={{ paddingLeft: '0 !important' }}>
                        <DashboardCards
                            direction={'column'}
                            icon={'YELLOW'}
                            sx={{
                                height: '100%',
                                alignItems: 'flexStart'
                            }}>
                            <Typography variant="h4" color={NEUTRAL.dark}>
                                {projects.length}
                            </Typography>
                            <Typography variant="subtitle1" color={NEUTRAL.medium}>
                                {t('totalOnGoingProjects')}
                            </Typography>
                        </DashboardCards>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <Grid
                            container
                            rowSpacing={{ xs: 1, sm: 2, md: 3 }}
                            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                            sx={{
                                width: '70%'
                            }}>
                            {statusList.map((data) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={4}
                                    key={data.status}
                                    sx={{
                                        cursor: 'pointer',
                                        paddingLeft: {
                                            xs: '0 !important',
                                            sm: '20px !important',
                                            md: '20px !important'
                                        }
                                    }}
                                    onClick={(): void => {
                                        if (data.id) {
                                            navigate(`/projects/current?filter=${data.id}`);
                                        }
                                    }}>
                                    <DashboardCards
                                        sx={{
                                            alignItems: 'center',
                                            height: '88px'
                                        }}
                                        icon={'BLUE'}>
                                        <Stack ml="12px" width="100%">
                                            <Typography variant="body2" color={NEUTRAL.medium}>
                                                {data.status}
                                            </Typography>
                                            <Typography variant="h6" color={NEUTRAL.dark}>
                                                {data.value}
                                            </Typography>
                                        </Stack>
                                    </DashboardCards>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Stack>
        );
    };

    return (
        <Box sx={{ paddingRight: { xs: '20px', sm: '40px' }, margin: 'auto' }}>
            {getProjectDetails()}
        </Box>
    );
}
