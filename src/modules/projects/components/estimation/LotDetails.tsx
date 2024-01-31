import React, { useState } from 'react';
import { Box, Button, Grid, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Plus } from 'react-feather';
import { makeStyles } from '@mui/styles';
import { NEUTRAL } from '../../../../theme/palette';
import { Alert } from '../../../../components/alerts/Alert';
import { WRTable } from '../../../../components/WRTable';
import { deleteTask, updateTaskOrder } from '../../services/TaskService';
import { TaskTableRow } from './TaskTableRow';
import { convertToUiValue } from '../../../../utils';
import { Lot } from '../../models/Lot';
import { EstimationTask } from '../../models/Task';
import { LotSummary } from './LotSummary';
import { LotItemMobile } from './LotItemMobile';
import { small1 } from '../../../../theme/typography';

interface LotDetailsProps {
    lot: Lot;
    onDataLoad?: Function;
}
export const LotDetails = ({
    lot,
    onDataLoad = (): void => {}
}: LotDetailsProps): React.ReactElement => {
    const useStyles = makeStyles(() => ({
        arrow: {
            color: NEUTRAL.white
        },
        tooltip: {
            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            fontFamily: 'Open Sans',
            fontSize: '12px',
            maxWidth: '160px',
            backgroundColor: NEUTRAL.white,
            color: NEUTRAL.medium
        }
    }));
    const classes = useStyles();
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [taskList, setTaskList] = useState<EstimationTask[]>(lot.estimation_tasks ?? []);
    const [selectedRowId, setSelectedRowId] = useState('');
    const [tax, setTax] = useState(lot.tax);
    const { t } = useTranslation();
    const isLarge = useMediaQuery('(min-width:920px)');

    function compare(a: EstimationTask, b: EstimationTask): number {
        if (a.priority! < b.priority!) {
            return -1;
        }
        if (a.priority! > b.priority!) {
            return 1;
        }
        return 0;
    }

    if (taskList && taskList.length > 0) {
        taskList.sort(compare);
    }

    const UpdateOrder = (updatedTaskList?: EstimationTask[]): void => {
        const currentTaskList = updatedTaskList ?? taskList;
        if (currentTaskList && currentTaskList.length > 0) {
            const List: EstimationTask[] = currentTaskList.map((element, index) => {
                element.priority = index + 1;
                return element;
            });
            setTaskList(List);
            updateTaskOrder(taskList.map((item) => item.id));
        }
    };

    const deleteRow = async (): Promise<void> => {
        await deleteTask(selectedRowId);
        const filteredList = taskList.filter((item) => item.id !== selectedRowId);
        setDeleteModal(false);
        lot.estimation_tasks = filteredList;
        onDataLoad(lot);
        UpdateOrder(filteredList);
        setTaskList(filteredList);
    };
    const shiftRowUP = (row: EstimationTask, index: number): void => {
        if (index <= 0) {
            return;
        } else {
            const exchange_data = taskList![index - 1];
            const temp = exchange_data.priority;
            exchange_data.priority = row.priority;
            row.priority = temp;
            taskList![index - 1] = row;
            taskList![index] = exchange_data;
            UpdateOrder();
        }
    };

    const shiftRowDown = (row: EstimationTask, index: number): void => {
        if (index >= taskList!.length - 1) {
            return;
        } else {
            const exchange_data = taskList![index + 1];
            const temp = exchange_data.priority;
            exchange_data.priority = row.priority;
            row.priority = temp;
            taskList![index + 1] = row;
            taskList![index] = exchange_data;
            UpdateOrder();
        }
    };

    const calculateTotalWithoutTax = (unitPrice: number, quantity: number): number => {
        return convertToUiValue(unitPrice) * convertToUiValue(quantity);
    };

    const calculateTotalWithTax = (
        unitPrice: number,
        quantity: number,
        taskTax: number
    ): number => {
        return (
            convertToUiValue(unitPrice) * convertToUiValue(quantity) +
            (convertToUiValue(unitPrice) * convertToUiValue(quantity) * convertToUiValue(taskTax)) /
                100
        );
    };

    const tableHeaders = [
        '',
        t('task'),
        t('unit'),
        t('quantity'),
        t('pUExcludingTax'),
        t('vat'),
        t('pTotExcludingTax'),
        t('pTotIncludingTax'),
        <Stack direction="row" key={''}>
            <Typography sx={{ ...small1 }} color={NEUTRAL.darker}>
                {t('materials')}
            </Typography>
            <Tooltip
                classes={{ arrow: classes.arrow, tooltip: classes.tooltip }}
                sx={{ backgroundColor: 'lightgreen' }}
                arrow
                title={t('materialTooltipDescription')}>
                <HelpCircle style={{ paddingLeft: '5px', width: '20px', color: NEUTRAL.medium }} />
            </Tooltip>
        </Stack>,
        ''
    ];

    let totalAmountWithoutTax = 0;
    let totalAmountWithTax = 0;

    const tableRows = taskList.map((task: EstimationTask, index) => {
        totalAmountWithTax =
            totalAmountWithTax +
            calculateTotalWithTax(task.unit_price ?? 0, task.quantity ?? 0, task.tax);
        totalAmountWithoutTax =
            totalAmountWithoutTax +
            calculateTotalWithoutTax(task.unit_price ?? 0, task.quantity ?? 0);

        return (
            <TaskTableRow
                task={task}
                key={task.id + task.tax}
                onDeleteButtonClick={(): void => {
                    if (task.id === '') {
                        const temp = taskList.filter((singleTask) => {
                            if (singleTask.id !== '') {
                                return singleTask;
                            }
                        });
                        setTaskList(temp);
                    } else {
                        setSelectedRowId(task.id);
                        setDeleteModal(true);
                    }
                }}
                onUpButtonClick={(updatedTask: EstimationTask, save: boolean): void => {
                    taskList[index].quantity = updatedTask.quantity;
                    taskList[index].title = updatedTask.title;
                    taskList[index].unit = updatedTask.unit;
                    taskList[index].tax = updatedTask.tax;
                    taskList[index].unit_price = updatedTask.unit_price;
                    taskList[index].materials = updatedTask.materials;
                    taskList[index].saveButton = save;
                    shiftRowUP(task, index);
                }}
                onDownButtonClick={(updatedTask: EstimationTask, save: boolean): void => {
                    taskList[index].quantity = updatedTask.quantity;
                    taskList[index].title = updatedTask.title;
                    taskList[index].unit = updatedTask.unit;
                    taskList[index].tax = updatedTask.tax;
                    taskList[index].unit_price = updatedTask.unit_price;
                    taskList[index].materials = updatedTask.materials;
                    taskList[index].saveButton = save;
                    shiftRowDown(task, index);
                }}
                onSaveButtonClick={(newTask: EstimationTask, isNew: boolean): void => {
                    let temp = taskList.filter((singleTask) => {
                        if (singleTask.id !== '') {
                            return singleTask;
                        }
                    });
                    if (isNew) {
                        temp.push(newTask);
                    } else {
                        temp = temp.map((item) => {
                            if (item.id === newTask.id) {
                                return newTask;
                            } else {
                                return item;
                            }
                        });
                    }
                    temp.sort((item) => item.priority);
                    setTaskList([...temp]);
                }}
            />
        );
    });

    const getLotList = (): React.ReactElement | null => {
        if (isLarge) {
            return <WRTable headers={tableHeaders} row={tableRows} maxHeight={'unset'} />;
        } else {
            return (
                <Stack marginTop={'24px'} spacing={'16px'} width={'100%'}>
                    {taskList.map((task) => (
                        <LotItemMobile key={task.id} task={task} />
                    ))}
                </Stack>
            );
        }
    };

    const getDetails = (): React.ReactElement => {
        return (
            <>
                <Grid container>
                    {LotSummary({
                        id: lot.id,
                        tax,
                        setTax,
                        totalAmountWithoutTax,
                        totalAmountWithTax,
                        taskList,
                        setTaskList
                    })}
                    <Stack direction="column" width={'100%'}>
                        {getLotList()}
                        {isLarge ? (
                            <Button
                                variant={'outlined'}
                                color={'secondary'}
                                onClick={(): void => {
                                    const tempTask = {
                                        title: '',
                                        unit: 'ENS',
                                        quantity: undefined,
                                        unit_price: undefined,
                                        tax: 200000,
                                        priority: taskList.length + 1,
                                        id: '',
                                        materials: false,
                                        lot_id: lot.id,
                                        start_date: '',
                                        end_date: ''
                                    };
                                    setTaskList([...taskList, tempTask]);
                                }}
                                sx={{ width: '214px', marginTop: '16px' }}>
                                <Plus /> <Box sx={{ width: '10px' }}></Box>
                                {t('addTask')}
                            </Button>
                        ) : (
                            <></>
                        )}
                    </Stack>
                </Grid>
            </>
        );
    };
    return (
        <>
            {getDetails()}
            <Alert
                width="440px"
                height="392px"
                title={t('doYouWantToDeleteTask')}
                subtitle={t('deleteTaskDescription')}
                open={deleteModal}
                onClick={deleteRow}
                onClose={(): void => setDeleteModal(false)}
                onSecondaryButtonClick={(): void => {
                    setDeleteModal(false);
                }}
                primaryButton={t('remove')}
                primaryButtonType="error"
                secondaryButton={t('toCancel')}
            />
        </>
    );
};
