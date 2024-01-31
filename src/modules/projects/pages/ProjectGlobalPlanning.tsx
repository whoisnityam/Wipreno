import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Divider, MenuItem, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { WRBreadcrumb } from '../../../components/breadcumbs/WRBreadcrumb';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../theme/palette';
import { Filter } from '../components/Filter';
import { GanttTasks, WRGantt } from '../../../components/gantt/WRGantt';
import { UserContext } from '../../../provider/UserProvider';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { getMaxDate, getMinDate } from '../services/PlanningHelper';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { getProjects } from '../services/ProjectService';
import { small2 } from '../../../theme/typography';

export function ProjectGlobalPlanning(): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const user = useContext(UserContext);
    const [duration, setDuration] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
    const [allProjects, setAllProjects] = useState<GanttTasks[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const breadcrumbData: {
        link: string;
        label: string;
    }[] = [
        { link: '/projects', label: t('projects') },
        { link: '/projects/current', label: t('currentProjects') },
        { link: '#', label: t('planning') }
    ];

    const prepareData = useCallback(async () => {
        setLoading(true);
        let displayOrder = 1;
        const response = await getProjects(user.user!.enterprises.at(0)!.enterprise_id.id);
        const tasks: GanttTasks[] = [];
        response.map((item) => {
            if (item.notices && item.notices.length > 0) {
                const lots = item.notices[0].lots;
                if (lots) {
                    const minDate = getMinDate(lots);
                    const maxDate = getMaxDate(lots);
                    if (maxDate && minDate) {
                        tasks.push({
                            start: minDate,
                            end: maxDate,
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

        setAllProjects(tasks);
        setLoading(false);
    }, []);

    useEffect(() => {
        prepareData();
    }, []);

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

    const renderGantt = (): React.ReactElement => {
        if (allProjects.length > 0) {
            return (
                <WRGantt
                    tasks={allProjects}
                    duration={duration}
                    handleExpanderClick={(): void => {}}
                />
            );
        } else {
            return (
                <Box sx={{ height: '80%' }}>
                    <EmptyState
                        title={t('')}
                        subtitle={t('viewNotAvailable')}
                        description={t('viewNotAvailableSubtitle')}
                    />
                </Box>
            );
        }
    };

    const desktop = (): React.ReactElement => {
        return (
            <Box sx={{ height: '100%' }}>
                <WRBreadcrumb links={breadcrumbData} />
                <Box height={'33px'} />
                <Typography variant={'h4'} color={NEUTRAL.darker}>
                    {t('globalPlanningTitle')}
                </Typography>
                {allProjects.length > 0 ? (
                    <Box marginTop={'50px'}>
                        <Box display={'flex'} justifyContent={'space-between'}>
                            <DurationFilter key={'duration filters'} />
                        </Box>
                        <Divider variant={'fullWidth'} />
                    </Box>
                ) : (
                    <></>
                )}
                {loading ? <LoadingIndicator /> : renderGantt()}
            </Box>
        );
    };

    const mobile = (): React.ReactElement => {
        return (
            <Stack paddingTop={'24px'} height={'87%'}>
                <Typography variant={'h5'} color={NEUTRAL.darker}>
                    {t('globalPlanningTitle')}
                </Typography>
                <Stack marginTop={'20px'} spacing={'32px'} flexGrow={1}>
                    {allProjects.length === 0 ? (
                        <EmptyState
                            title={t('')}
                            subtitle={t('viewNotAvailable')}
                            description={t('viewNotAvailableSubtitle')}
                        />
                    ) : (
                        <></>
                    )}
                    {allProjects.map((project) => {
                        return (
                            <Stack key={project.id} spacing={'12px'}>
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
                </Stack>
            </Stack>
        );
    };

    return <>{isLarge ? desktop() : mobile()}</>;
}
