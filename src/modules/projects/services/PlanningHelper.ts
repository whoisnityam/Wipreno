import { GanttTasks } from '../../../components/gantt/WRGantt';
import { addDateToLot, getLots } from './LotService';
import { PlanningTask as WRTask } from '../models/Task';
import { PlanningViewData, TaskViewData } from '../models/PlanningViewData';
import { Lot } from '../models/Lot';
import { addDateToTask, linkTasks } from './TaskService';
import { getDate } from '../../../utils';
import { planningColors } from '../../../constants';

export const getMinDate = (list: TaskViewData[] | Lot[]): Date | null => {
    const date = new Date(
        Math.min(
            ...list.map((task) => {
                if (task.start_date === null) {
                    return Number.POSITIVE_INFINITY;
                } else {
                    return Date.parse(task.start_date!);
                }
            })
        )
    );
    if (date.toString() !== 'Invalid Date') {
        return date;
    } else {
        return null;
    }
};

export const getMaxDate = (list: TaskViewData[] | Lot[]): Date | null => {
    const date = new Date(
        Math.max(
            ...list.map((task) => {
                if (task.end_date === null) {
                    return Number.NEGATIVE_INFINITY;
                } else {
                    return Date.parse(task.end_date!);
                }
            })
        )
    );
    if (date.toString() !== 'Invalid Date') {
        return date;
    } else {
        return null;
    }
};

export const getColorFor = (item: string, _alpha = 1): string => {
    item = item?.trim();
    const color = planningColors.find((obj) => obj.name === item)?.color;
    if (color) {
        return color;
    } else {
        return '#283583';
    }
};

export const constructPlanningData = async (noticeId: string): Promise<PlanningViewData[]> => {
    const data: PlanningViewData[] = [];
    const lots = await getLots(noticeId);

    lots.map((lot) => {
        if (lot.planning_tasks) {
            const lotTasks = lot.planning_tasks as WRTask[];
            data.push({
                id: lot.id,
                title: lot.title,
                start_date: lot.start_date,
                end_date: lot.end_date,
                color: lot.lot_color,
                priority: lot.priority,
                companyName: lot.artisan_id === null ? '' : lot.artisan_id.company_name,
                tasks: lotTasks.map((task) => {
                    return {
                        id: task.id,
                        title: task.title,
                        start_date: task.start_date,
                        end_date: task.end_date,
                        status: task.status,
                        color: '',
                        dependentTasks:
                            task.dependencies?.map((item) => {
                                return {
                                    id: item.id,
                                    task_id: item.task_id.id
                                };
                            }) ?? []
                    };
                })
            });
        }
    });

    return data;
};

export const getGanttTasks = (viewData: PlanningViewData[], readonly: boolean): GanttTasks[] => {
    const ganttTasks: GanttTasks[] = [];
    let displayOrder = 1;
    viewData.map((data) => {
        // Setting lot start and end date
        // if the start and end date are not present,
        // the current date is taken as start date and +7 days is taken as end date
        const tasks = data.tasks;

        let lotStartDate = getDate(new Date());
        let lotEndDate = getDate(new Date());
        lotEndDate = getDate(new Date(lotEndDate.setDate(lotEndDate.getDate() + 7)));
        lotStartDate = data.start_date ? getDate(new Date(data.start_date)) : lotStartDate;
        lotEndDate = data.end_date ? getDate(new Date(data.end_date)) : lotEndDate;
        if (tasks.length > 0) {
            // if the lot has tasks, use the min date of all the tasks as the lot's start date
            // and max date as the lot's end date
            lotStartDate = getMinDate(tasks) ?? lotStartDate;
            lotEndDate = getMaxDate(tasks) ?? lotEndDate;
        }
        let lotName = '';
        if (data.start_date === null) {
            lotName = '+ Ajouter des dates';
        }
        ganttTasks.push({
            start: new Date(lotStartDate),
            end: new Date(lotEndDate.setHours(23, 59, 59, 999)),
            title: data.title,
            name: lotName,
            taskCount: tasks.length,
            id: data.id,
            taskType: 'project',
            hideChildren: false,
            displayOrder: displayOrder++,
            color: getColorFor(data.color),
            isAdd: data.start_date === null,
            companyName: data.companyName
        });
        tasks.map((task) => {
            // Setting task stat and end date
            // if the start and end date are not present, lot's dates is taken
            const taskStartDate = task.start_date
                ? getDate(new Date(task.start_date))
                : new Date(lotStartDate);
            let taskEndDate = new Date(lotStartDate);
            if (task.end_date) {
                taskEndDate = getDate(new Date(task.end_date));
            } else {
                taskEndDate = getDate(new Date(taskEndDate.setDate(taskEndDate.getDate() + 5)));
            }
            let name = '';
            if (task.start_date === null) {
                name = '+ Ajouter des dates';
            }
            ganttTasks.push({
                start: new Date(taskStartDate),
                end: new Date(taskEndDate.setHours(23, 59, 59, 999)),
                title: task.title,
                name,
                status: task.status,
                id: task.id,
                taskType: 'task',
                project: data.id,
                displayOrder: displayOrder++,
                dependencies: task.dependentTasks,
                color: getColorFor(data.color, 0.5),
                isAdd: task.start_date === null
            });
        });
        if (!readonly) {
            ganttTasks.push({
                start: new Date(),
                end: new Date(),
                title: '',
                name: '',
                id: `${data.title} Add`,
                taskType: 'task',
                project: data.id,
                displayOrder: displayOrder++,
                dependencies: [],
                color: 'transparent'
            });
        }
    });
    return ganttTasks;
};

export const updateLot = async (
    name: string,
    taskStartDate: Date,
    taskEndDate: Date,
    lot: PlanningViewData,
    color?: string
): Promise<PlanningViewData> => {
    const minDate = getMinDate(lot.tasks);
    const maxDate = getMaxDate(lot.tasks);
    const lotColor = color ?? lot.color;
    lot.color = color ?? lot.color;
    lot.title = name;
    if (!minDate && !maxDate) {
        await addDateToLot(lot.id, name, taskStartDate, taskEndDate, lotColor);
        lot.start_date = taskStartDate.toISOString();
        lot.end_date = taskEndDate.toISOString();
    } else if (
        taskStartDate.getTime() < minDate!.getTime() &&
        taskEndDate.getTime() > maxDate!.getTime()
    ) {
        await addDateToLot(lot.id, name, taskStartDate, taskEndDate, lotColor);
        lot.start_date = taskStartDate.toISOString();
        lot.end_date = taskEndDate.toISOString();
    } else if (taskStartDate.getTime() < minDate!.getTime()) {
        await addDateToLot(lot.id, name, taskStartDate, maxDate!, lotColor);
        lot.start_date = taskStartDate.toISOString();
        lot.end_date = maxDate!.toISOString();
    } else if (taskEndDate.getTime() > maxDate!.getTime()) {
        await addDateToLot(lot.id, name, minDate!, taskEndDate, lotColor);
        lot.start_date = minDate!.toISOString();
        lot.end_date = taskEndDate.toISOString();
    } else {
        await addDateToLot(lot.id, name, taskStartDate, taskEndDate, lotColor);
        lot.start_date = taskStartDate.toISOString();
        lot.end_date = taskEndDate.toISOString();
    }
    return lot;
};

export const updateTasks = async (
    id: string,
    name: string,
    projectId: string,
    startTime: Date,
    endTime: Date,
    data: PlanningViewData[]
): Promise<PlanningViewData[]> => {
    const planningView = data.find((view) => view.id === projectId)!;
    await addDateToTask(id, name, startTime, endTime);
    const linkedTasks = planningView.tasks
        .filter((item) => item.dependentTasks.filter((dep) => dep.task_id === id).length > 0)
        .map((item) => item.id);

    let updatedLotStartDate = planningView.tasks[0].start_date
        ? new Date(planningView.tasks[0].start_date)
        : new Date();
    let updatedLotEndDate = planningView.tasks[0].end_date
        ? new Date(planningView.tasks[0].end_date)
        : new Date();
    for (const task of planningView.tasks) {
        if (task.id === id) {
            task.title = name;
            task.start_date = startTime.toISOString();
            task.end_date = endTime.toISOString();
        }
        if (linkedTasks.includes(task.id)) {
            const currentTaskStartDate = new Date(task.start_date!).getTime();
            const currentTaskEndDate = new Date(task.end_date!).getTime();
            if (endTime.getTime() > currentTaskStartDate) {
                const difference = currentTaskEndDate - currentTaskStartDate;
                const newStart = new Date(endTime);
                const newEnd = new Date(endTime.getTime() + difference);
                await addDateToTask(task.id, task.title, newStart, newEnd);
                for (const tsk of planningView.tasks) {
                    for (const obj of tsk.dependentTasks) {
                        if (Object.values(obj).includes(task.id)) {
                            await updateTasks(
                                task.id,
                                task.title,
                                projectId,
                                newStart,
                                newEnd,
                                data
                            );
                        }
                    }
                }
                task.start_date = newStart.toISOString();
                task.end_date = newEnd.toISOString();
            }
        }
        if (task.start_date && task.end_date) {
            if (new Date(task.start_date) < updatedLotStartDate) {
                updatedLotStartDate = new Date(task.start_date);
            }
            if (new Date(task.end_date) > updatedLotEndDate) {
                updatedLotEndDate = new Date(task.end_date);
            }
        }
    }

    const newLot = await updateLot(
        planningView.title,
        updatedLotStartDate,
        updatedLotEndDate,
        planningView
    );
    planningView.start_date = newLot.start_date;
    planningView.end_date = newLot.end_date;

    return data.map((view) => {
        if (view.id === projectId) {
            return planningView;
        } else {
            return view;
        }
    });
};

export const updateLinkingTasks = async (
    taskId: string,
    projectId: string,
    linkedIds: string[],
    data: PlanningViewData[]
): Promise<PlanningViewData[]> => {
    let viewData = data;
    const planningView = viewData.find((view) => view.id === projectId)!;
    const selectedTask = planningView.tasks.find((t) => t.id === taskId)!;
    const linkedTasks = planningView.tasks.filter(
        (item) => item.dependentTasks.filter((dep) => dep.task_id === taskId).length > 0
    );
    let dependents: string[] = [];
    for (const dep of linkedTasks) {
        const list = dep.dependentTasks.filter((item) => item.task_id === taskId);
        dependents = [...dependents, ...list.map((item) => item.id)];
    }
    const response = await linkTasks(taskId, linkedIds, dependents);
    for (const task of planningView.tasks) {
        task.dependentTasks = task.dependentTasks.filter((item) => item.task_id !== taskId);
        const links = response.filter((item) => item.dependent_task_id === task.id);
        task.dependentTasks = [
            ...task.dependentTasks,
            ...links.map((item) => {
                return { id: item.id, task_id: item.task_id };
            })
        ];
    }

    viewData = data.map((view) => {
        if (view.id === projectId) {
            return planningView;
        } else {
            return view;
        }
    });

    return updateTasks(
        taskId,
        selectedTask.title,
        projectId,
        new Date(selectedTask.start_date!),
        new Date(selectedTask.end_date!),
        viewData
    );
};
