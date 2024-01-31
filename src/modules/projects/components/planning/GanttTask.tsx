import React from 'react';
import { Task } from 'gantt-task-react';
import { ChevronDown, ChevronUp, Link, Plus } from 'react-feather';
import { Box, Button, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';
import { GanttTasks } from '../../../../components/gantt/WRGantt';
import linkTaskCross from '../../../../assets/linkTaskCross.svg';
import { useTranslation } from 'react-i18next';
import { small2 } from '../../../../theme/typography';
import { statusColor, statusTextColor } from './TaskItem';

interface Props {
    rowHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    locale: string;
    tasks: Task[];
    selectedTaskId: string;
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: Task) => void;
}

export const GanttTask = (
    readonly: boolean,
    gTasks: GanttTasks[],
    onLinkClicked: (task: GanttTasks) => void,
    onAddTask: (id: string, task: Task) => void,
    setTaskStatusModal: Function,
    setModifyTask: Function
): React.FunctionComponent<{
    rowHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    locale: string;
    tasks: Task[];
    selectedTaskId: string;
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: Task) => void;
}> => {
    // eslint-disable-next-line react/display-name
    return ({
        tasks,
        fontFamily,
        fontSize,
        selectedTaskId,
        setSelectedTask,
        onExpanderClick
    }: Props): React.ReactElement => {
        const { t } = useTranslation();
        const theme = useTheme();

        return (
            <div
                className="Gantt-Task-List_Wrapper"
                style={{
                    fontFamily,
                    fontSize
                }}>
                {tasks.map((ts, index) => {
                    const ganttTask = gTasks.find((item) => item.id === ts.id)!;
                    let showExpand = false;
                    if (ts.hideChildren === false) {
                        showExpand = true;
                    } else if (ts.hideChildren === true) {
                        showExpand = true;
                    }
                    const showBorder = !(
                        index !== tasks.length - 1 && tasks[index + 1].type === 'task'
                    );

                    const isButton = ganttTask.status === undefined;

                    return (
                        <Stack
                            sx={{
                                paddingTop: ts.hideChildren === false ? '15px' : '0',
                                justifyContent: 'center',
                                height: '50px',
                                width: '320px',
                                borderLeft: `1px solid ${NEUTRAL.light}`,
                                borderRight: `1px solid ${NEUTRAL.light}`,
                                borderBottom: showBorder ? `1px solid ${NEUTRAL.light}` : 'none'
                            }}
                            key={`${ts.id}row`}
                            onClick={(): void => {
                                if (selectedTaskId === ts.id) {
                                    setSelectedTask('');
                                } else {
                                    setSelectedTask(ts.id);
                                }
                            }}>
                            <Stack direction={'column'}>
                                <Stack
                                    direction={'row'}
                                    sx={{ paddingLeft: '22px' }}
                                    alignItems={'center'}>
                                    {showExpand ? (
                                        <Box
                                            onClick={(e): void => {
                                                onExpanderClick(
                                                    tasks.find((item) => item.id === ts.id)!
                                                );
                                                e.stopPropagation();
                                            }}>
                                            {ts.hideChildren === true ? (
                                                <ChevronUp
                                                    color={theme.palette.secondary.main}
                                                    style={{ marginRight: '14px' }}
                                                />
                                            ) : (
                                                <ChevronDown
                                                    color={theme.palette.secondary.main}
                                                    style={{ marginRight: '14px' }}
                                                />
                                            )}
                                        </Box>
                                    ) : (
                                        <></>
                                    )}

                                    {ts.type === 'task' ? (
                                        ts.name !== t('addDatesButtonBar') ? (
                                            showBorder && !readonly ? (
                                                <Button
                                                    variant={'outlined'}
                                                    color={'secondary'}
                                                    onClick={(): void => {
                                                        onAddTask(ts.project!, ts);
                                                    }}
                                                    sx={{
                                                        marginLeft: '40px',
                                                        width: '140px',
                                                        height: '24px',
                                                        fontSize: '10px',
                                                        border: '1px dashed '
                                                    }}>
                                                    <Plus width={'15px'} />{' '}
                                                    <Box sx={{ width: '2px' }}></Box>
                                                    {t('addTask')}
                                                </Button>
                                            ) : (
                                                <IconButton
                                                    style={{
                                                        marginLeft: '40px',
                                                        height: '20px',
                                                        width: '20px',
                                                        marginRight: '8px',
                                                        padding: 0
                                                    }}
                                                    onClick={(): void => onLinkClicked(ganttTask)}>
                                                    <Link color={NEUTRAL.light} />
                                                </IconButton>
                                            )
                                        ) : (
                                            <IconButton
                                                style={{
                                                    marginLeft: '40px',
                                                    height: '20px',
                                                    width: '20px',
                                                    marginRight: '8px',
                                                    padding: 0
                                                }}>
                                                <img src={linkTaskCross} alt="TaskLink" />
                                            </IconButton>
                                        )
                                    ) : (
                                        ''
                                    )}
                                    <Stack
                                        direction={'row'}
                                        alignItems={'center'}
                                        flexWrap={'wrap'}
                                        spacing={'16px'}>
                                        <Box sx={{ overflow: 'hidden' }}>
                                            <Typography
                                                variant={ts.type === 'task' ? 'body2' : 'h6'}
                                                color={NEUTRAL.dark}
                                                sx={{
                                                    display: '-webkit-box',
                                                    textOverflow: 'ellipsis',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    marginRight: '8px'
                                                }}>
                                                {ganttTask?.title ?? ''}{' '}
                                            </Typography>
                                        </Box>
                                        {ts.type === 'task' &&
                                        !isButton &&
                                        ganttTask?.title !== t('addDatesButtonBar') ? (
                                            <div
                                                onClick={(): void => {
                                                    setTaskStatusModal(true);
                                                    setModifyTask(ganttTask);
                                                }}>
                                                <Box
                                                    sx={{
                                                        padding: '4px 8px',
                                                        background: statusColor(
                                                            ganttTask?.status,
                                                            theme
                                                        ),
                                                        width: 'fit-content',
                                                        cursor: 'pointer'
                                                    }}>
                                                    <Typography
                                                        sx={small2}
                                                        color={statusTextColor(
                                                            ganttTask?.status,
                                                            theme
                                                        )}>
                                                        {ganttTask?.status ?? t('taskNotStarted')}
                                                    </Typography>
                                                </Box>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                    </Stack>

                                    {ganttTask?.taskCount ? (
                                        <Typography
                                            variant={'body2'}
                                            color={NEUTRAL.medium}
                                            sx={{ marginRight: '8px' }}>
                                            ({ganttTask.taskCount})
                                        </Typography>
                                    ) : (
                                        <></>
                                    )}
                                </Stack>
                            </Stack>
                            {ts.hideChildren === false && (
                                <>
                                    <Typography
                                        variant={'body2'}
                                        ml={'59px'}
                                        color={NEUTRAL.medium}>
                                        {ganttTask?.companyName ?? ''}
                                    </Typography>
                                </>
                            )}
                        </Stack>
                    );
                })}
            </div>
        );
    };
};
