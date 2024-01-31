import { Box, Button, MenuItem, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../theme/palette';
import { Filter } from '../components/Filter';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { GanttTasks, WRGantt } from '../../../components/gantt/WRGantt';
import { useParams } from 'react-router-dom';
import { Project } from '../../projects/models/Project';
import { getMaxDate, getMinDate } from '../../projects/services/PlanningHelper';
import { EmptyStateProject } from '../components/EmptyStateProject';
import { getProjectsByArtisanId } from '../services/artisanService';
import { getDate } from '../../../utils';
import { small2 } from '../../../theme/typography';
import { Download } from 'react-feather';

export function ArtisanPlanning(): React.ReactElement {
    const { t } = useTranslation();
    const [duration, setDuration] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [allGanttProjects, setAllGanttProjects] = useState<GanttTasks[]>([]);
    const { id } = useParams();
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        const response = await getProjectsByArtisanId(id!);
        setAllProjects(response);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchDetails();
    }, []);

    const prepareData = useCallback(async () => {
        let displayOrder = 1;
        const tasks: GanttTasks[] = [];
        allProjects.map((item) => {
            if (item.notices && item.notices.length > 0) {
                const lots = item.notices[0].lots;
                if (lots) {
                    const minDate = getMinDate(lots);
                    const maxDate = getMaxDate(lots);
                    if (maxDate && minDate) {
                        tasks.push({
                            start: getDate(minDate),
                            end: getDate(new Date(maxDate.setDate(maxDate.getDate() + 1))),
                            title: item.name,
                            name: '',
                            id: item.id,
                            taskType: 'project',
                            displayOrder: displayOrder++
                        });
                    }
                }
            }
        });
        setAllGanttProjects(tasks);
    }, [allProjects]);

    useEffect(() => {
        if (allProjects) {
            prepareData();
        }
    }, [allProjects]);

    const EmptyStatePlanningComponent = (): React.ReactElement => {
        return (
            <Box marginTop={'81px'}>
                <EmptyStateProject
                    title={''}
                    subtitle={t('viewNotAvailable')}
                    description={t('viewNotAvailableSubtitle')}
                />
            </Box>
        );
    };

    const DurationFilter = (): React.ReactElement => {
        return (
            <Box display={'flex'} alignItems={'center'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {t('durationFilterLabel')}
                </Typography>
                <Filter
                    selected={duration}
                    onChange={(value: 'WEEK' | 'MONTH' | 'YEAR'): void => setDuration(value)}>
                    <MenuItem value={'WEEK'}>{t('week')}</MenuItem>
                    <MenuItem value={'MONTH'}>{t('month')}</MenuItem>
                    <MenuItem value={'YEAR'}>{t('year')}</MenuItem>
                </Filter>
            </Box>
        );
    };

    const desktop = (): React.ReactElement => {
        return (
            <Stack spacing={4} width={'100%'} height={'100%'}>
                {allGanttProjects.length === 0 ? (
                    <>{EmptyStatePlanningComponent()}</>
                ) : (
                    <>
                        <Stack>{DurationFilter()}</Stack>
                        {loading ? (
                            <LoadingIndicator />
                        ) : (
                            <WRGantt
                                tasks={allGanttProjects}
                                duration={duration}
                                handleExpanderClick={(): void => {}}
                            />
                        )}
                    </>
                )}
            </Stack>
        );
    };
    const mobile = (): React.ReactElement => {
        return (
            <Stack height={'87%'}>
                {allGanttProjects.length === 0 ? (
                    <>{EmptyStatePlanningComponent()}</>
                ) : (
                    <>
                        <Stack
                            width="100%"
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <Typography variant={'h6'} color={'primary'}>
                                {t('planning')}
                            </Typography>
                            <Button
                                sx={{
                                    padding: '0',
                                    minWidth: '0',
                                    height: 'fit-content'
                                }}
                                onClick={(): void => {}}
                                startIcon={<Download />}></Button>
                        </Stack>
                        {allGanttProjects.map((project) => {
                            return (
                                <Stack key={project.id} spacing={'12px'} mt={3}>
                                    <Typography variant={'h6'} color={NEUTRAL.darker}>
                                        {project.title}
                                    </Typography>
                                    <Box
                                        padding={'4px 8px'}
                                        sx={{
                                            background: theme.palette.primary.main,
                                            width: 'fit-content'
                                        }}>
                                        <Typography
                                            sx={{
                                                ...small2,
                                                color: theme.palette.grey['50']
                                            }}>{`${project.start.toLocaleDateString()} - ${project.end.toLocaleDateString()}`}</Typography>
                                    </Box>
                                </Stack>
                            );
                        })}
                    </>
                )}
            </Stack>
        );
    };

    return <>{isLargeLandscape ? desktop() : mobile()}</>;
}
