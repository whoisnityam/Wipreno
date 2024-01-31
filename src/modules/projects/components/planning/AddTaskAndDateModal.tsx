import React, { useEffect, useState } from 'react';
import { Task } from 'gantt-task-react';
import { Button, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../../theme/palette';
import { small1 } from '../../../../theme/typography';
import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import { WRSelect } from '../../../../components/select/WRSelect';
import { PlanningViewData, TaskViewData } from '../../models/PlanningViewData';
import { Circle } from '@mui/icons-material';
import { DatePicker } from '../../../../components/DatePicker';
import { object, string } from 'yup';
import * as yup from 'yup';
import { checkDate, getDate, getFormatedDate } from '../../../../utils';
import {
    getColorFor,
    getMaxDate,
    getMinDate,
    updateLot,
    updateTasks
} from '../../services/PlanningHelper';
import { createPlanningTask, deletePlanningTask } from '../../services/TaskService';
import { addDateToLot, deleteLot } from '../../services/LotService';
import { X } from 'react-feather';
import { planningColors } from '../../../../constants';

interface AddDateModalProps {
    viewData: PlanningViewData[];
    task?: Task;
    addTask?: Boolean;
    onClose: (data?: PlanningViewData[]) => void;
}

interface FormValues {
    id: string;
    name: string;
    startDate: Date | null;
    endDate: Date | null;
    color: string;
}

export function AddTaskAndDateModal({
    viewData,
    task,
    onClose,
    addTask
}: AddDateModalProps): React.ReactElement {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [valid, setValid] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    let allTasks: TaskViewData[] = [];
    viewData.map((data) => {
        allTasks = [...allTasks, ...data.tasks];
    });

    let selectedTask: PlanningViewData | TaskViewData | undefined;
    if (task?.type === 'project') {
        selectedTask = viewData.find((item) => item.id === task?.id);
    } else {
        selectedTask = allTasks.find((item) => item.id === task?.id);
    }

    const initialValue: FormValues = {
        id: '',
        name: '',
        startDate: null,
        endDate: null,
        color: ''
    };
    const validationSchema = object({
        name: string(),
        startDate: yup.date(),
        endDate: yup.date(),
        color: string()
    });

    const form = useFormik({
        initialValues: initialValue,
        validationSchema,
        onSubmit: async (values) => {
            if (addTask) {
                const newTask = {
                    id: '',
                    title: taskTitle,
                    lot_id: values.id,
                    start_date: getDate(values.startDate!),
                    end_date: getDate(values.endDate!)
                };
                const response = await createPlanningTask(newTask);
                viewData.map(async (view) => {
                    if (view.id === response.lot_id) {
                        view.tasks.push({
                            id: response.id,
                            title: response.title,
                            start_date: response.start_date,
                            end_date: response.end_date,
                            color: getColorFor(view.color, 0.5),
                            dependentTasks: [],
                            status: response.status
                        });
                        const minDate = getMinDate(view.tasks);
                        const maxDate = getMaxDate(view.tasks);
                        const lotResponse = await addDateToLot(
                            values.id,
                            values.name,
                            minDate!,
                            maxDate!,
                            view.color
                        );

                        view.title = lotResponse.title;
                        view.start_date = lotResponse.start_date!;
                        view.end_date = lotResponse.end_date!;
                    }
                });
                onClose(viewData);
            } else {
                if (task?.type === 'project') {
                    const response = await updateLot(
                        values.name,
                        values.startDate!,
                        values.endDate!,
                        selectedTask as PlanningViewData,
                        values.color
                    );

                    onClose(
                        viewData.map((view) => {
                            if (view.id === response.id) {
                                return response;
                            } else {
                                return view;
                            }
                        })
                    );
                } else {
                    onClose(
                        await updateTasks(
                            values.id,
                            values.name,
                            task!.project!,
                            values.startDate!,
                            values.endDate!,
                            viewData
                        )
                    );
                }
            }
        }
    });
    const { values, submitForm } = form;
    function reset(): void {
        form.values.color = '';
        form.values.id = '';
        form.values.name = '';
        form.values.startDate = null;
        form.values.endDate = null;
        setTaskTitle('');
    }

    const onItemChange = (selectedItem: string): void => {
        let selected: PlanningViewData | TaskViewData | undefined;
        if (addTask) {
            if (selectedItem.includes('Add')) {
                selected = viewData.find((item) => item.id === task?.project);
            } else {
                selected = viewData.find((item) => item.id === selectedItem);
            }
        } else if (task?.type === 'project') {
            selected = viewData.find((item) => item.id === selectedItem);
        } else {
            selected = allTasks.find((item) => item.id === selectedItem);
        }
        form.setValues({
            id: selected?.id ?? '',
            name: selected?.title ?? '',
            startDate: addTask ? null : selected?.start_date ? new Date(selected.start_date) : null,
            endDate: addTask ? null : selected?.end_date ? new Date(selected.end_date) : null,
            color: addTask ? '' : selected?.color?.trim() ?? ''
        });
    };

    useEffect(() => {
        if (task) {
            onItemChange(task.id);
        }
    }, [task]);

    function checkIsValid(): boolean {
        const current = new Date(new Date().setHours(0, 0, 0, 0));
        const dependentTasksArray: TaskViewData[] = [];
        allTasks.map((singleTask) => {
            if (selectedTask && (selectedTask as TaskViewData).dependentTasks) {
                for (const dep of (selectedTask as TaskViewData).dependentTasks) {
                    if (Object.values(dep).includes(singleTask.id)) {
                        dependentTasksArray.push(singleTask);
                    }
                }
            }
        });

        const taskTitleCheck = addTask ? taskTitle !== '' : true;
        const checkLot = viewData.find((data) => data.id === task?.id);

        if (task?.type === 'project') {
            if (checkLot?.tasks && checkLot?.tasks.length > 0) {
                if (form.values.color !== '') {
                    return true;
                } else return false;
            } else {
                if (
                    form.values.endDate !== null &&
                    form.values.startDate !== null &&
                    !isNaN(Date.parse(form.values.startDate.toString())) &&
                    checkDate(getFormatedDate(form.values.startDate)) &&
                    !isNaN(Date.parse(form.values.endDate.toString())) &&
                    checkDate(getFormatedDate(form.values.endDate)) &&
                    form.values.endDate >= form.values.startDate &&
                    form.values.color !== ''
                ) {
                    if (selectedTask?.start_date) {
                        return true;
                    } else if (form.values.endDate >= current && form.values.startDate >= current) {
                        return true;
                    }
                }
            }
        } else {
            if (
                form.values.endDate !== null &&
                form.values.startDate !== null &&
                !isNaN(Date.parse(form.values.startDate.toString())) &&
                checkDate(getFormatedDate(form.values.startDate)) &&
                !isNaN(Date.parse(form.values.endDate.toString())) &&
                checkDate(getFormatedDate(form.values.endDate)) &&
                form.values.endDate >= form.values.startDate &&
                taskTitleCheck
            ) {
                if (selectedTask?.start_date) {
                    const check = dependentTasksArray.map((dependentTask) => {
                        return new Date(dependentTask.end_date!) <= form.values.startDate!;
                    });
                    return !check.includes(false);
                } else if (form.values.endDate >= current && form.values.startDate >= current) {
                    return true;
                }
            }
        }

        return false;
    }

    useEffect(() => {
        const isCorrect = checkIsValid();

        setValid(!isCorrect);
    }, [form, taskTitle]);

    const handleStartDateChange = (newValue: Date | null): void => {
        form.setValues({ ...values, startDate: newValue });
    };

    const handleEndDateChange = (newValue: Date | null): void => {
        form.setValues({ ...values, endDate: newValue });
    };

    const onColorChange = (color: string): void => {
        form.setValues({ ...values, color });
    };
    const lotFields = (): React.ReactElement => {
        const check = viewData.find((data) => data.id === task?.id);
        return (
            <Stack>
                {selectedTask?.start_date ? (
                    <TextField
                        sx={{ marginTop: '12px' }}
                        required
                        label={t('lotNameLabel')}
                        value={values.name}
                        onChange={(event): void => {
                            form.setValues({ ...values, name: event.target.value });
                        }}
                    />
                ) : (
                    <WRSelect
                        sx={{ marginTop: '12px' }}
                        label={t('forTheLot')}
                        value={values.id}
                        onChange={(event): void => onItemChange(event.target.value as string)}>
                        {viewData.map((item, index) => (
                            <MenuItem key={index} value={item.id}>
                                {item.title}
                            </MenuItem>
                        ))}
                    </WRSelect>
                )}
                <Stack direction={'row'} marginTop={'12px'} spacing={'12px'}>
                    <DatePicker
                        disabled={check?.tasks && check?.tasks.length > 0}
                        required={true}
                        startFromToday={!selectedTask?.start_date}
                        value={values.startDate}
                        onDateChange={handleStartDateChange}
                        label={t('startDate')}
                    />
                    <DatePicker
                        disabled={check?.tasks && check?.tasks.length > 0}
                        required={true}
                        startFromToday={!selectedTask?.start_date}
                        value={values.endDate}
                        onDateChange={handleEndDateChange}
                        label={t('endDate')}
                    />
                </Stack>
                <WRSelect
                    sx={{ marginTop: '12px' }}
                    label={t('lotColor')}
                    value={values.color.trim() ?? ''}
                    onChange={(event): void => {
                        onColorChange(event.target.value as string);
                    }}>
                    {planningColors.map((item, index) => (
                        <MenuItem key={index} value={item.name}>
                            <Stack direction={'row'} spacing={'12px'} alignItems={'center'}>
                                <Circle sx={{ color: item.color }} height={'18px'} width={'18px'} />
                                <Typography variant={'body2'} color={NEUTRAL.medium}>
                                    {item.name}
                                </Typography>
                            </Stack>
                        </MenuItem>
                    ))}
                </WRSelect>
            </Stack>
        );
    };

    const taskFields = (): React.ReactElement => {
        return (
            <Stack>
                {selectedTask?.start_date ? (
                    <TextField
                        sx={{ marginTop: '12px' }}
                        required
                        label={t('taskTitle')}
                        value={values.name}
                        onChange={(event): void => {
                            form.setValues({ ...values, name: event.target.value });
                        }}
                    />
                ) : (
                    <WRSelect
                        sx={{ marginTop: '12px' }}
                        label={t('forTask')}
                        value={values.id}
                        onChange={(event): void => onItemChange(event.target.value as string)}>
                        {allTasks.map((item, index) => (
                            <MenuItem key={index} value={item.id}>
                                {item.title}
                            </MenuItem>
                        ))}
                    </WRSelect>
                )}
                <Stack direction={'row'} marginTop={'12px'} spacing={'12px'}>
                    <DatePicker
                        required={true}
                        startFromToday={!selectedTask?.start_date}
                        value={values.startDate}
                        onDateChange={handleStartDateChange}
                        label={t('startDate')}
                    />
                    <DatePicker
                        required={true}
                        startFromToday={!selectedTask?.start_date}
                        value={values.endDate}
                        onDateChange={handleEndDateChange}
                        label={t('endDate')}
                    />
                </Stack>
            </Stack>
        );
    };

    const addTaskFields = (): React.ReactElement => {
        return (
            <Stack>
                <WRSelect
                    sx={{ marginTop: '12px' }}
                    label={t('inTheBundle')}
                    value={values.id}
                    onChange={(event): void => onItemChange(event.target.value as string)}>
                    {viewData.map((item, index) => (
                        <MenuItem key={index} value={item.id}>
                            {item.title}
                        </MenuItem>
                    ))}
                </WRSelect>
                <TextField
                    sx={{ marginTop: '12px' }}
                    label={t('taskTitle')}
                    value={taskTitle}
                    fullWidth
                    onChange={(event): void => setTaskTitle(event.target.value)}
                />

                <Stack direction={'row'} marginTop={'12px'} spacing={'12px'}>
                    <DatePicker
                        required={true}
                        startFromToday={!selectedTask?.start_date}
                        value={values.startDate}
                        onDateChange={handleStartDateChange}
                        label={t('startDate')}
                    />
                    <DatePicker
                        required={true}
                        startFromToday={!selectedTask?.start_date}
                        value={values.endDate}
                        onDateChange={handleEndDateChange}
                        label={t('endDate')}
                    />
                </Stack>
            </Stack>
        );
    };

    const getTitle = (): string => {
        if (addTask) {
            return t('addTask');
        } else {
            if (selectedTask?.start_date) {
                return task?.type === 'project' ? t('modifyLot') : t('modifyTask');
            } else {
                return t('addDatesTitle');
            }
        }
    };

    return (
        <Stack>
            {selectedTask?.start_date ? (
                <Stack alignItems={'flex-end'}>
                    <IconButton
                        sx={{ width: 'fit-content' }}
                        onClick={(): void => {
                            onClose();
                            reset();
                        }}>
                        <X />
                    </IconButton>
                </Stack>
            ) : (
                <></>
            )}

            <Typography textAlign={'center'} variant={'h4'} color={NEUTRAL.dark}>
                {getTitle()}
            </Typography>
            <Typography
                textAlign={'center'}
                variant={'body1'}
                color={NEUTRAL.medium}
                sx={{ marginTop: '16px' }}>
                {addTask
                    ? t('addPlanningTaskDescription')
                    : task?.type === 'project'
                    ? t('addLotDatesSubtitle')
                    : t('addTaskDatesSubtitle')}
            </Typography>
            <Typography color={'secondary'} sx={{ ...small1, marginTop: '32px' }}>
                {t('requiredFields')}
            </Typography>
            {addTask ? addTaskFields() : task?.type === 'project' ? lotFields() : taskFields()}
            <LoadingButton
                loading={loading}
                color={'primary'}
                sx={{ marginTop: '48px' }}
                variant={'contained'}
                disabled={valid}
                fullWidth
                onClick={async (): Promise<void> => {
                    setLoading(true);
                    if (values.startDate === null) {
                        values.startDate = new Date();
                        values.endDate = new Date();
                    }
                    await submitForm();
                    reset();
                    setLoading(false);
                }}>
                {selectedTask?.start_date ? t('modifyButtonTitle') : t('add')}
            </LoadingButton>
            {selectedTask?.start_date ? (
                <Button
                    sx={{ marginTop: '20px' }}
                    variant={'outlined'}
                    color={'error'}
                    fullWidth
                    onClick={async (): Promise<void> => {
                        let data: PlanningViewData[] = viewData;
                        if (task?.type === 'project') {
                            data = viewData.filter((item) => item.id !== selectedTask!.id);
                            await deleteLot(selectedTask!.id);
                        } else {
                            for (const lot of data) {
                                lot.tasks = lot.tasks.filter(
                                    (item) => item.id !== selectedTask!.id
                                );
                            }
                            await deletePlanningTask(selectedTask!.id);
                        }
                        onClose([...data]);
                        reset();
                    }}>
                    {task?.type === 'project' ? t('deleteLotButton') : t('deleteTaskButton')}
                </Button>
            ) : (
                <Button
                    sx={{ marginTop: '20px' }}
                    variant={'outlined'}
                    fullWidth
                    onClick={(): void => {
                        onClose();
                        reset();
                    }}>
                    {t('return')}
                </Button>
            )}
        </Stack>
    );
}
