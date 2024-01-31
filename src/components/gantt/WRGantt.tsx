import React from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import { TaskType } from 'gantt-task-react/dist/types/public-types';
import { useTheme } from '@mui/material';
import { FONT_SECONDARY } from '../../theme/typography';
import './Gantt.css';
import { GanttTask } from '../../modules/projects/components/planning/GanttTask';
import { Tooltip } from './Tooltip';

export interface GanttTasks {
    start: Date;
    end: Date;
    title: string;
    name: string;
    id: string;
    status?: string;
    color?: string;
    taskType?: TaskType;
    project?: string;
    dependencies?: {
        id: string;
        task_id: string;
    }[];
    hideChildren?: boolean | undefined;
    displayOrder: number | undefined;
    isAdd?: boolean;
    taskCount?: number;
    companyName?: string;
}

interface WRGanttProps {
    tasks: GanttTasks[];
    duration: 'WEEK' | 'MONTH' | 'YEAR';
    setTaskStatusModal?: Function;
    setModifyTask?: Function;
    handleExpanderClick?: (task: Task) => void;
    handleTaskClick?: (task: Task) => void;
    handleTaskLinkClick?: (task: GanttTasks) => void;
    handleOnSelect?: (task: Task, isSelected: boolean) => void;
    handleTaskAdd?: (id: string, task: Task) => void;
    readonly?: boolean;
}

export function WRGantt({
    tasks,
    duration,
    setTaskStatusModal = (): void => {},
    setModifyTask = (): void => {},
    handleExpanderClick = (): void => {},
    handleTaskClick = (): void => {},
    handleTaskLinkClick = (): void => {},
    handleOnSelect = (): void => {},
    handleTaskAdd = (): void => {},
    readonly
}: WRGanttProps): React.ReactElement {
    const theme = useTheme();
    const ganttTasks: Task[] = tasks.map((item) => {
        let dependenciesData: string[] = [];
        if (item.dependencies) {
            dependenciesData = item.dependencies.map((result) => {
                return result.task_id;
            });
        }
        const color = item.color ?? theme.palette.secondary.medium;

        return {
            start: item.start,
            end: item.end,
            name: item.name,
            id: item.id,
            type: item.taskType ?? 'task',
            progress: 100,
            isDisabled: true,
            fontSize: '10px',
            styles: {
                progressColor: color,
                backgroundColor: color,
                progressSelectedColor: color,
                backgroundSelectedColor: color
            },
            project: item.project,
            dependencies: dependenciesData,
            hideChildren: item.hideChildren,
            displayOrder: item.displayOrder,
            status: item.status
        };
    });

    const getDuration = (): ViewMode => {
        if (duration === 'WEEK') {
            return ViewMode.Day;
        } else if (duration === 'MONTH') {
            return ViewMode.Week;
        } else {
            return ViewMode.Month;
        }
    };

    return (
        <>
            {ganttTasks.length > 0 ? (
                <Gantt
                    tasks={ganttTasks}
                    viewMode={getDuration()}
                    locale={'FR'}
                    headerHeight={80}
                    fontFamily={FONT_SECONDARY}
                    fontSize={'12px'}
                    columnWidth={179}
                    listCellWidth={'124px'}
                    barCornerRadius={4}
                    onExpanderClick={handleExpanderClick}
                    onDoubleClick={handleTaskClick}
                    TooltipContent={Tooltip()}
                    TaskListTable={GanttTask(
                        readonly ?? false,
                        tasks,
                        handleTaskLinkClick,
                        handleTaskAdd,
                        setTaskStatusModal,
                        setModifyTask
                    )}
                    ganttHeight={0}
                    onSelect={handleOnSelect}
                />
            ) : (
                <></>
            )}
        </>
    );
}
