import React, { useEffect, useState } from 'react';
import {
    Button,
    Checkbox,
    ListItemText,
    MenuItem,
    SelectChangeEvent,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../../theme/palette';
import { WRSelect } from '../../../../components/select/WRSelect';
import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import { PlanningViewData, TaskViewData } from '../../models/PlanningViewData';
import { GanttTasks } from '../../../../components/gantt/WRGantt';
import { updateLinkingTasks } from '../../services/PlanningHelper';

interface FormData {
    selectedTask: GanttTasks | undefined;
    linkedTasks: string[];
}

interface LinkTaskModalProps {
    viewData: PlanningViewData[];
    tasksList: TaskViewData[];
    selectedTask?: GanttTasks;
    filter: TaskViewData[];
    onClose: Function;
    onTaskChange: Function;
}

export function LinkTaskModal({
    viewData,
    tasksList,
    selectedTask,
    onClose,
    onTaskChange,
    filter
}: LinkTaskModalProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();

    const [loading, setLoading] = useState(false);
    const tasks: TaskViewData[] = filter.filter((task) => task.id !== selectedTask?.id);

    const initialValues: FormData = {
        selectedTask,
        linkedTasks: []
    };

    const form = useFormik({
        initialValues,
        onSubmit: async (values) => {
            onClose(
                await updateLinkingTasks(
                    values.selectedTask!.id,
                    selectedTask!.project!,
                    values.linkedTasks,
                    viewData
                )
            );
            form.resetForm();
        },
        onReset: () => {
            form.values = initialValues;
        }
    });

    useEffect(() => {
        if (selectedTask) {
            const dependencies: string[] = [];

            tasksList.filter((task) => {
                let check = 0;
                task.dependentTasks.map((obj) => {
                    if (Object.values(obj).includes(selectedTask.id)) {
                        check++;
                    }
                });
                if (check > 0) {
                    dependencies.push(task.id);
                }
            });

            form.setValues({
                selectedTask,
                linkedTasks: dependencies
            });
        }
    }, [selectedTask]);

    const { values, submitForm } = form;

    const handleSelectedTaskChange = (e: SelectChangeEvent<string | string[]>): void => {
        onTaskChange(e.target.value);
    };

    const handleMultiSelectChange = (event: SelectChangeEvent<string | string[]>): void => {
        const {
            target: { value }
        } = event;
        form.setValues({
            ...values,
            linkedTasks: typeof value === 'string' ? value.split(',') : value
        });
    };

    return (
        <Stack>
            <Typography textAlign={'center'} variant={'h4'} color={NEUTRAL.dark}>
                {t('linkTaskTitle')}
            </Typography>
            <Typography
                textAlign={'center'}
                variant={'body1'}
                color={NEUTRAL.medium}
                sx={{ marginTop: '16px' }}>
                {t('linkTaskSubTitle')}
            </Typography>
            <WRSelect
                sx={{ marginTop: '32px' }}
                label={t('selectTask')}
                value={values.selectedTask?.id ?? undefined}
                onChange={handleSelectedTaskChange}>
                {tasksList.map((item, index) => (
                    <MenuItem key={index} value={item.id}>
                        {item.title}
                    </MenuItem>
                ))}
            </WRSelect>

            <WRSelect
                disabled={tasks.length < 1}
                notrequired
                sx={{ marginTop: '12px' }}
                label={t('linkToTask')}
                values={values.linkedTasks}
                onChange={handleMultiSelectChange}
                multiple
                renderValue={(selected: string[]): string =>
                    selected.map((item) => tasks.find((obj) => obj.id === item)?.title).join(', ')
                }>
                {tasks.map((item, index) => (
                    <MenuItem key={index} value={item.id}>
                        <Checkbox checked={values.linkedTasks.indexOf(item.id) > -1} />
                        <ListItemText primary={item.title} />
                    </MenuItem>
                ))}
            </WRSelect>
            {tasks.length < 1 && (
                <Typography color={theme.palette.error.main} variant={'body2'}>
                    {t('noTasksAvailable')}
                </Typography>
            )}
            <LoadingButton
                loading={loading}
                color={'primary'}
                sx={{ marginTop: '48px' }}
                disabled={!values.selectedTask}
                variant={'contained'}
                fullWidth
                onClick={async (): Promise<void> => {
                    setLoading(true);
                    await submitForm();
                    setLoading(false);
                }}>
                {t('add')}
            </LoadingButton>
            <Button
                sx={{ marginTop: '20px' }}
                variant={'outlined'}
                fullWidth
                onClick={(): void => {
                    onClose();
                    form.resetForm();
                }}>
                {t('return')}
            </Button>
        </Stack>
    );
}
