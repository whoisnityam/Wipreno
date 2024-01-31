import {
    Box,
    Button,
    Dialog,
    Divider,
    MenuItem,
    Slide,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { CreateNotice } from '../components/estimation/CreateNotice';
import { ProjectContext } from '../layout/ProjectDetailLayout';
import calendar from '../../../assets/calendar.svg';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { small1, small2 } from '../../../theme/typography';
import { Filter } from '../components/Filter';
import { PlanningView } from '../components/planning/PlanningView';
import { Alert } from '../../../components/alerts/Alert';
import { createLot, getLots, updateLotDate } from '../services/LotService';
import { Edit3, Plus } from 'react-feather';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { Lot } from '../models/Lot';
import { CollapsableList } from '../../../components/collapsable/CollapsableList';
import { Collapsable } from '../../../components/collapsable/Collapsable';
import { TaskItem } from '../components/planning/TaskItem';
import { ModifyStatus, RenderTaskStatusModal } from '../components/planning/TaskStatusModal';
import { DatePicker } from '../../../components/DatePicker';
import { updateProjectStartDate } from '../services/ProjectService';
import { updateTaskDate } from '../services/TaskService';

export function ProjectPlanning(): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const projectContext = useContext(ProjectContext);
    const notice = projectContext?.project?.notices?.at(0);
    const project = projectContext?.project;
    const [lots, setLots] = useState<Lot[]>([]);
    const [duration, setDuration] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
    const [displayCreateNoticeModal, setDisplayCreateNoticeModal] = React.useState(false);
    const [title, setTitle] = React.useState('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [isDateChanged, setIsDateChanged] = useState(false);
    const [taskStatusModal, setTaskStatusModal] = useState(false);
    const [modifyModal, setModifyModal] = useState(false);
    const [projectStartDate, setProjetStartDate] = useState<Date | null>(
        project ? project.start_date : null
    );
    const [modifyTask, setModifyTask] = useState<ModifyStatus>();
    const [modifyStatusSuccess, setModifyStatusSuccess] = useState(false);

    const fetchDetails = async (): Promise<void> => {
        if (notice) {
            const receivedLots = await getLots(notice.id!);
            setLots(receivedLots);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, []);

    const Heading = (): React.ReactElement => {
        return (
            <Stack spacing={{ xs: '8px', md: '16px' }}>
                <Typography variant={'h5'} color={'primary'}>
                    {isLarge ? t('projectSchedule') : t('planning')}
                </Typography>
                <Stack direction={'row'} spacing={'12px'} alignItems={'center'}>
                    {isLarge ? <Box component={'img'} src={calendar} /> : <></>}
                    <Stack direction={{ xs: 'row', md: 'column' }} spacing={'4px'}>
                        <Typography variant={'body2'} color={NEUTRAL.medium}>
                            {t('constructionStartDate')}
                            {!isLarge ? ' :' : ''}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Typography
                                sx={{ ...small1, color: isLarge ? NEUTRAL.dark : NEUTRAL.medium }}>
                                {project?.start_date
                                    ? new Date(project.start_date.toString()).toLocaleDateString()
                                    : ''}
                            </Typography>
                            <Edit3
                                color={NEUTRAL.medium}
                                size={20}
                                onClick={(): void => {
                                    setModifyModal(true);
                                }}
                            />
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        );
    };

    useEffect(() => {
        const isEmpty = title === '';

        if (!isEmpty) {
            setIsChanged(true);
        } else {
            setIsChanged(false);
        }
    }, [title]);

    useEffect(() => {
        let isModified = false;
        if (project) {
            const oldDate = new Date(project.start_date);
            const newDate = new Date(projectStartDate!);
            isModified = oldDate.getTime() !== newDate.getTime();
        }
        setIsDateChanged(isModified);
    }, [projectStartDate]);

    function handleModalClose(): void {
        setTitle('');
    }

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            projectContext.refreshData();
        }, 3000);
    };

    function success(): React.ReactElement {
        return (
            <SuccessAlert
                onClose={(): void => {
                    projectContext.refreshData();
                }}
                open={successModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToNoticePredefined')}
            />
        );
    }

    function addLots(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="420px"
                title={t('addLot')}
                subtitle={t('addLotsDescription')}
                open={isModalOpen}
                onClick={async (): Promise<void> => {
                    try {
                        await createLot(title.trim(), lots.length + 1, null, notice?.id!);
                        openSuccessModal();
                    } catch (e) {
                        console.log(e);
                    }
                    handleModalClose();
                    setIsModalOpen(false);
                }}
                onClose={(): void => {
                    setIsModalOpen(false);
                    handleModalClose();
                }}
                onSecondaryButtonClick={(): void => {
                    handleModalClose();
                    setIsModalOpen(false);
                }}
                primaryButton={t('add')}
                primaryButtonType="primary"
                primaryButtonEnabled={isChanged}
                secondaryButton={t('return')}>
                <>
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'title'}
                        value={title}
                        onChange={(event): void => setTitle(event.target.value)}
                        label={t('lotNameLabel')}
                    />
                </>
            </Alert>
        );
    }

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

    const ModifyDateModal = (): React.ReactElement => {
        return (
            <Alert
                width="440px"
                title={t('modifyPlanningDateTitle')}
                subtitle={t('modifyPlanningDateDescription')}
                open={modifyModal}
                onClick={async (): Promise<void> => {
                    const newDate = new Date(projectStartDate!);
                    const oldDate = new Date(project!.start_date!);
                    const difference = newDate.getTime() - oldDate.getTime();
                    await updateProjectStartDate(project?.id!, projectStartDate!);
                    if (project!.notices) {
                        project!.notices[0].lots?.map(async (lot) => {
                            if (lot.planning_tasks) {
                                lot.planning_tasks.map(async (task) => {
                                    if (task.start_date !== null && task.end_date !== null) {
                                        const startDate = new Date(task.start_date).getTime();
                                        const endDate = new Date(task.end_date).getTime();
                                        const newStartDate = new Date(startDate + difference);
                                        const newEndDate = new Date(endDate + difference);
                                        await updateTaskDate(task.id, newStartDate, newEndDate);
                                    }
                                });
                                if (lot.start_date !== null && lot.end_date !== null) {
                                    const startDate = new Date(lot.start_date).getTime();
                                    const endDate = new Date(lot.end_date).getTime();
                                    const newStartDate = new Date(startDate + difference);
                                    const newEndDate = new Date(endDate + difference);
                                    await updateLotDate(lot.id, newStartDate, newEndDate);
                                }
                            }
                        });
                        projectContext.refreshData();
                    }
                    setModifyModal(false);
                }}
                onClose={(): void => {
                    setModifyModal(false);
                }}
                onSecondaryButtonClick={(): void => {
                    setModifyModal(false);
                }}
                primaryButton={t('add')}
                primaryButtonType="primary"
                primaryButtonEnabled={isDateChanged}
                secondaryButton={t('return')}>
                <>
                    <DatePicker
                        sx={{ width: '100%' }}
                        required={true}
                        value={projectStartDate ?? null}
                        onDateChange={(newValue: Date | null): void => {
                            setProjetStartDate(newValue);
                        }}
                        label={t('constructionStart')}
                    />
                </>
            </Alert>
        );
    };

    const DesktopView = (): React.ReactElement => {
        return (
            <>
                <Box height={'42px'} />
                <Stack>
                    {DurationFilter()}
                    <Divider variant={'fullWidth'} />
                </Stack>
                <Box height={'32px'} />
                <PlanningView duration={duration} noticeId={notice!.id} />
                <Button
                    variant={'outlined'}
                    color={'secondary'}
                    onClick={(): void => {
                        setIsModalOpen(true);
                    }}
                    sx={{ width: '186px', marginRight: '20px' }}>
                    <Plus /> <Box sx={{ width: '10px' }}></Box>
                    {t('addLot')}
                </Button>

                {addLots()}
                {success()}
            </>
        );
    };

    const MobileView = (): React.ReactElement => {
        return (
            <CollapsableList>
                {lots?.map((lot) => {
                    return (
                        <Collapsable
                            key={lot.id}
                            title={lot.title}
                            titleColor={NEUTRAL.darker}
                            subtitle={
                                lot.start_date ? (
                                    <Box
                                        sx={{
                                            background: PINK.lighter,
                                            padding: '4px 8px',
                                            width: 'fit-content'
                                        }}>
                                        <Typography sx={{ ...small2 }} color={PINK.darker}>
                                            {new Date(lot.start_date).toLocaleDateString()} {' - '}
                                            {new Date(lot.end_date).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <></>
                                )
                            }>
                            <Stack spacing={'16px'}>
                                {lot.planning_tasks?.map((task, index) => {
                                    return (
                                        <TaskItem
                                            setModifyTask={setModifyTask}
                                            setTaskStatusModal={setTaskStatusModal}
                                            key={index}
                                            task={task}
                                        />
                                    );
                                })}
                            </Stack>
                        </Collapsable>
                    );
                })}
            </CollapsableList>
        );
    };

    if (notice) {
        return (
            <Stack width={'100%'} height={'100%'}>
                {Heading()}
                {ModifyDateModal()}
                {isLarge ? DesktopView() : MobileView()}
                {!isLarge && (
                    <>
                        <Slide direction="up" in={taskStatusModal && modifyTask !== undefined}>
                            <Dialog
                                open={taskStatusModal && modifyTask !== undefined}
                                keepMounted
                                onClose={(): void => {
                                    setTaskStatusModal(false);
                                    setModifyTask(undefined);
                                }}
                                sx={{
                                    '.MuiDialog-paper': {
                                        height: 'calc(100vh - 80px)',
                                        minWidth: '100%',
                                        maxWidth: '100%',
                                        margin: 'unset',
                                        marginTop: '80px',
                                        padding: '24px 16px'
                                    }
                                }}>
                                <RenderTaskStatusModal
                                    modifyTask={modifyTask}
                                    setModifyTask={setModifyTask}
                                    setTaskStatusModal={setTaskStatusModal}
                                    onStatusUpdated={(task): void => {
                                        for (const data of lots) {
                                            if (data.id === task.lot_id) {
                                                for (const tsk of data?.planning_tasks ?? []) {
                                                    if (tsk.id === task.id) {
                                                        tsk.status = task.status;
                                                    }
                                                }
                                            }
                                        }
                                        setLots([...lots]);
                                        setModifyStatusSuccess(true);
                                        setTimeout(() => {
                                            setModifyStatusSuccess(false);
                                        }, 3000);
                                    }}
                                />
                            </Dialog>
                        </Slide>
                        <SuccessAlert
                            title={t('requestHasBeenTaken')}
                            subtitle={t('youWillBeRedirectedToProjectSheetMobile')}
                            open={modifyStatusSuccess}
                            onClose={(): void => setModifyStatusSuccess(false)}
                        />
                    </>
                )}
            </Stack>
        );
    } else {
        return (
            <Box width={'100%'}>
                <EmptyState
                    title={''}
                    subtitle={t('planningEmptyStateTitle')}
                    description={isLarge ? t('planningEmptyStateDescription') : ''}
                    buttonTitle={isLarge ? t('planningEmptyStateButtonTitle') : undefined}
                    buttonType={'contained'}
                    buttonOnClick={(): void => {
                        setDisplayCreateNoticeModal(true);
                    }}
                />
                {displayCreateNoticeModal && isLarge && (
                    <CreateNotice
                        projectId=""
                        onClose={(): void => {
                            setDisplayCreateNoticeModal(false);
                        }}
                    />
                )}
            </Box>
        );
    }
}
