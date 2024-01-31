import React, { useCallback, useEffect, useState } from 'react';
import { GanttTasks, WRGantt } from '../../../../components/gantt/WRGantt';
import { Task } from 'gantt-task-react';
import { PlanningViewData, TaskViewData } from '../../models/PlanningViewData';
import { useTranslation } from 'react-i18next';
import { ModalContainer } from '../../../../components/ModalContainer';
import { AddTaskAndDateModal } from './AddTaskAndDateModal';
import { LinkTaskModal } from './LinkTaskModal';
import { constructPlanningData, getGanttTasks } from '../../services/PlanningHelper';
import { LoadingIndicator } from '../../../../components/LoadingIndicator';
import { ModifyStatus, RenderTaskStatusModal } from './TaskStatusModal';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';

interface ProjectPlanningProps {
    duration: 'WEEK' | 'MONTH' | 'YEAR';
    noticeId: string;
    readonly?: boolean;
}
export function PlanningView({
    duration,
    noticeId,
    readonly
}: ProjectPlanningProps): React.ReactElement {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState<GanttTasks[]>([]);
    const [selectedTasks, setSelectedTasks] = useState<TaskViewData[]>([]);
    const [viewData, setViewData] = useState<PlanningViewData[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | GanttTasks>();
    const [filter, setFilter] = useState<TaskViewData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [openAddTaskModal, setOpenAddTaskModal] = useState(false);
    const [openAddDateModal, setOpenAddDateModal] = useState(false);
    const [openLinkTaskModal, setOpenLinkTaskModal] = useState(false);
    const [openLinkModal, setOpenLinkModal] = useState(false);
    const idsToBeExcluded: string[] = [];
    const [taskStatusModal, setTaskStatusModal] = useState(false);
    const [modifyTask, setModifyTask] = useState<ModifyStatus>();
    const [modifyStatusSuccess, setModifyStatusSuccess] = useState(false);
    const theme = useTheme();

    const prepareData = useCallback(async () => {
        const data: PlanningViewData[] = await constructPlanningData(noticeId);
        setViewData(data);
    }, []);

    useEffect(() => {
        prepareData();
    }, []);

    useEffect(() => {
        setLoading(true);
        setTasks(getGanttTasks(viewData, readonly ?? false));
        setLoading(false);
    }, [viewData]);

    const handleExpanderClick = (task: Task): void => {
        setTasks(
            tasks.map((item) => {
                if (item.id === task.id) {
                    return {
                        start: task.start,
                        end: task.end,
                        title: item.title,
                        taskCount: item.taskCount,
                        isAdd: item.isAdd,
                        name: '',
                        id: task.id,
                        taskType: task.type,
                        hideChildren: task.hideChildren,
                        displayOrder: task.displayOrder,
                        color: task.styles?.backgroundColor,
                        companyName: item.companyName
                    };
                } else {
                    return item;
                }
            })
        );
    };

    const handleTaskClick = (task: Task): void => {
        setSelectedTask(task);
        setOpenAddDateModal(true);
    };

    const handleCircularDependency = (depId: string[], tasksList: TaskViewData[]): void => {
        const dependentIds: string[] = [];

        for (const id in depId) {
            tasksList.map((item) => {
                if (depId[id] === item.id) {
                    item.dependentTasks.map((tsk) => {
                        dependentIds.push(tsk.task_id);
                        idsToBeExcluded.push(tsk.task_id);
                    });
                }
            });
            if (dependentIds && dependentIds.length > 0) {
                handleCircularDependency(dependentIds, tasksList);
            }
        }
    };

    const handleTaskLinkClick = (task: GanttTasks): void => {
        if (task.taskType === 'task') {
            const tasksList = viewData.find((item) => item.id === task.project)?.tasks;
            const depId: string[] = [];

            tasksList?.map((item) => {
                if (task.dependencies) {
                    for (const dep of task.dependencies) {
                        if (dep.task_id === item.id) {
                            depId.push(dep.task_id);
                            idsToBeExcluded.push(dep.task_id);
                        }
                    }
                }
                if (depId && depId.length > 0) {
                    handleCircularDependency(depId, tasksList);
                }
            });

            const filteredData = tasksList?.filter((item) => {
                if (item.start_date && !idsToBeExcluded?.includes(item.id)) {
                    return item;
                }
            });

            setFilter(filteredData ?? []);

            setSelectedTasks(tasksList ?? []);
            const selected = tasksList?.find((item) => item.id === task.id);
            if (selected?.start_date) {
                setOpenLinkTaskModal(true);
            }
        }
    };

    const handleTaskAdd = (lotID: string, task: Task): void => {
        setSelectedTask(task);
        setOpenAddTaskModal(true);
    };
    const handleOnSelect = (task: Task, isSelected: boolean): void => {
        const gTask = tasks.find((item) => item.id === task.id)!;
        if (isSelected && !gTask.id.includes('Add') && !gTask.isAdd) {
            gTask.name = `${task.start.toLocaleDateString()} - ${task.end.toLocaleDateString()}`;
        } else {
            gTask.name = gTask.isAdd ? t('addDatesButtonBar') : '';
        }
        const tasksList = tasks.filter((item) => item.id !== gTask.id);
        tasksList.splice(task.displayOrder! - 1, 0, gTask);
        setTasks([...tasksList]);
    };
    const renderLinkModal = (): React.ReactElement => {
        return (
            <Stack>
                <Typography
                    variant="h4"
                    textAlign="center"
                    color={NEUTRAL.darker}
                    sx={{ margin: '0px 25px' }}>
                    {t('doYouWantToLinkTaskTitle')}
                </Typography>
                <Box height="24px" />
                <Typography variant="body1" textAlign="center" color={theme.palette.grey[200]}>
                    {t('doYouWantToLinkTaskSubtitle')}
                </Typography>
                <Box height="48px" />
                <Button
                    variant="contained"
                    onClick={(): void => {
                        setOpenLinkModal(false);
                        handleTaskLinkClick(selectedTask as GanttTasks);
                    }}>
                    {t('linkTheTask')}
                </Button>
                <Box height="20px" />
                <Button variant="outlined" onClick={(): void => setOpenLinkModal(false)}>
                    {t('return')}
                </Button>
            </Stack>
        );
    };

    return (
        <>
            <ModalContainer
                isModalOpen={openAddDateModal}
                content={AddTaskAndDateModal({
                    viewData,
                    task: selectedTask as Task,
                    onClose: (data: PlanningViewData[] | undefined): void => {
                        setOpenAddDateModal(false);
                        if (data) {
                            setViewData(data);
                        }
                    }
                })}
                onClose={(): void => setOpenAddDateModal(false)}
            />
            <ModalContainer
                isModalOpen={openAddTaskModal}
                content={AddTaskAndDateModal({
                    addTask: true,
                    viewData,
                    task: selectedTask as Task,
                    onClose: (data: PlanningViewData[] | undefined): void => {
                        setOpenAddTaskModal(false);
                        if (data) {
                            setViewData([...data]);
                        }
                    }
                })}
                onClose={(): void => setOpenAddTaskModal(false)}
            />
            <ModalContainer
                isModalOpen={openLinkTaskModal}
                content={LinkTaskModal({
                    onTaskChange: (id: string): void => {
                        const newTask = tasks.find((checkTask) => checkTask.id === id);
                        if (newTask) {
                            handleTaskLinkClick(newTask);
                        }
                    },
                    viewData,
                    filter,
                    tasksList: selectedTasks,
                    selectedTask: selectedTask as GanttTasks,
                    onClose: (data: PlanningViewData[] | undefined): void => {
                        setSelectedTask(undefined);
                        setSelectedTasks([]);
                        setOpenLinkTaskModal(false);
                        if (data) {
                            setViewData(data);
                        }
                    }
                })}
                onClose={(): void => setOpenLinkTaskModal(false)}
            />
            <ModalContainer
                isModalOpen={openLinkModal}
                onClose={(): void => setOpenLinkModal(false)}
                content={renderLinkModal()}
            />
            {loading ? (
                <LoadingIndicator />
            ) : (
                <WRGantt
                    tasks={tasks}
                    duration={duration}
                    handleExpanderClick={handleExpanderClick}
                    handleTaskClick={readonly ? (): void => {} : handleTaskClick}
                    handleTaskLinkClick={
                        readonly
                            ? (): void => {}
                            : (task: GanttTasks): void => {
                                  setSelectedTask(task);
                                  setOpenLinkModal(true);
                              }
                    }
                    handleOnSelect={handleOnSelect}
                    handleTaskAdd={readonly ? (): void => {} : handleTaskAdd}
                    readonly={readonly}
                    setModifyTask={readonly ? (): void => {} : setModifyTask}
                    setTaskStatusModal={readonly ? (): void => {} : setTaskStatusModal}
                />
            )}
            <ModalContainer
                isModalOpen={taskStatusModal && modifyTask !== undefined}
                onClose={(): void => {
                    setTaskStatusModal(false);
                    setModifyTask(undefined);
                }}
                content={
                    <RenderTaskStatusModal
                        modifyTask={modifyTask}
                        setModifyTask={setModifyTask}
                        setTaskStatusModal={setTaskStatusModal}
                        onStatusUpdated={(task): void => {
                            for (const data of viewData) {
                                if (data.id === task.lot_id) {
                                    for (const tsk of data.tasks) {
                                        if (tsk.id === task.id) {
                                            tsk.status = task.status;
                                        }
                                    }
                                }
                            }
                            setViewData([...viewData]);
                            setModifyStatusSuccess(true);
                            setTimeout(() => {
                                setModifyStatusSuccess(false);
                            }, 3000);
                        }}
                    />
                }
            />
            <SuccessAlert
                title={t('requestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToProjectSheetMobile')}
                open={modifyStatusSuccess}
                onClose={(): void => setModifyStatusSuccess(false)}
            />
        </>
    );
}
