import { Box, Button, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../../components/alerts/Alert';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { WRTable } from '../../../components/WRTable';
import { convertToUiValue } from '../../../utils';
import { Lot } from '../../projects/models/Lot';
import { EstimationTask } from '../../projects/models/Task';
import { deleteLot } from '../../projects/services/LotService';
import { deleteTask, updateTaskOrder } from '../../projects/services/TaskService';
import { EstimationTaskTable } from './EstimationTaskTable';

interface LotTableProps {
    lot: Lot;
    isEditable: Boolean;
    onUpButtonClick: Function;
    onDownButtonClick: Function;
    onLotDelete: (lotId: string) => void;
}
export const RenderLotTables = ({
    lot,
    isEditable,
    onUpButtonClick = (): void => {},
    onDownButtonClick = (): void => {},
    onLotDelete
}: LotTableProps): React.ReactElement => {
    const { t } = useTranslation();
    const [taskList, setTaskList] = useState<EstimationTask[]>(lot.estimation_tasks ?? []);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteTaskModal, setDeleteTaskModal] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(false);

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

    const headers = isEditable
        ? ['', t('task'), t('unit'), t('quantity'), t('pUExcludingTax'), '']
        : [t('task'), t('unit'), t('quantity'), t('pUExcludingTax')];
    const rows =
        taskList?.map((task, index) => {
            return (
                <EstimationTaskTable
                    onUpButtonClick={(updatedTask: EstimationTask, save: boolean): void => {
                        taskList[index].quantity = updatedTask.quantity;
                        taskList[index].title = updatedTask.title;
                        taskList[index].unit = updatedTask.unit;
                        taskList[index].unit_price = updatedTask.unit_price;
                        taskList[index].saveButton = save;
                        shiftRowUP(task, index);
                    }}
                    onDownButtonClick={(updatedTask: EstimationTask, save: boolean): void => {
                        taskList[index].quantity = updatedTask.quantity;
                        taskList[index].title = updatedTask.title;
                        taskList[index].unit = updatedTask.unit;
                        taskList[index].unit_price = updatedTask.unit_price;
                        taskList[index].saveButton = save;
                        shiftRowDown(task, index);
                    }}
                    key={task.id}
                    task={task}
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
                            setDeleteTaskModal(true);
                        }
                    }}
                    onTaskCreated={(newTask): void => {
                        const temp = taskList.filter((singleTask) => {
                            if (singleTask.id !== '') {
                                return singleTask;
                            }
                        });
                        temp.push(newTask);
                        temp.sort((a, b) => a.priority - b.priority);
                        setTaskList(temp);
                    }}
                    onTaskUpdated={(updatedTask): void => {
                        setTaskList(
                            taskList.map((item) => {
                                if (item.id === updatedTask.id) {
                                    return updatedTask;
                                } else {
                                    return item;
                                }
                            })
                        );
                    }}
                />
            );
        }) ?? [];

    const body =
        taskList?.map((task) => {
            return [
                <Typography key="title" variant="body2">
                    {task.title}
                </Typography>,
                <Typography key="unit" variant="body2">
                    {task.unit}
                </Typography>,
                <Typography key="quantity" variant="body2">
                    {convertToUiValue(task.quantity)}
                </Typography>,
                <Typography key="unit_price" variant="body2">
                    {convertToUiValue(task.unit_price)}
                </Typography>
            ];
        }) ?? [];

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
        }, 3000);
    };

    function success(): React.ReactElement {
        return (
            <SuccessAlert
                open={successModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToNoticePredefined')}
            />
        );
    }
    const DeleteLot = async (): Promise<void> => {
        await deleteLot(lot.id);
        onLotDelete(lot.id);
        setDeleteModal(false);
        openSuccessModal();
    };
    function deleteLotModal(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="392px"
                title={t('doYouWantToDeleteLot')}
                subtitle={t('deleteLotDescription')}
                open={deleteModal}
                onClick={DeleteLot}
                onClose={(): void => setDeleteModal(false)}
                onSecondaryButtonClick={(): void => {
                    setDeleteModal(false);
                }}
                primaryButton={t('remove')}
                primaryButtonType="error"
                secondaryButton={t('cancelButtonTitle')}
            />
        );
    }
    const DeleteTask = async (): Promise<void> => {
        await deleteTask(selectedRowId);
        setDeleteTaskModal(false);
        const filteredList = taskList.filter((item) => item.id !== selectedRowId);
        updateTaskOrder(filteredList.map((item) => item.id));
        setTaskList(filteredList);
        openSuccessModal();
    };
    function removeTaskModal(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="392px"
                title={t('doYouWantToDeleteTask')}
                subtitle={t('deleteTaskDescription')}
                open={deleteTaskModal}
                onClick={DeleteTask}
                onClose={(): void => setDeleteTaskModal(false)}
                onSecondaryButtonClick={(): void => {
                    setDeleteTaskModal(false);
                }}
                primaryButton={t('remove')}
                primaryButtonType="error"
                secondaryButton={t('cancelButtonTitle')}
            />
        );
    }

    return (
        <React.Fragment key={lot.id}>
            <Stack direction={'row'} justifyContent="space-between" alignItems={'center'}>
                <Stack direction="row" spacing={2}>
                    <Stack sx={{ margin: 'auto 0' }}>
                        <Typography variant="h5">{lot.title}</Typography>
                    </Stack>
                    {isEditable && (
                        <Stack direction={'row'}>
                            <Button
                                sx={{
                                    padding: '0',
                                    minWidth: '0',
                                    height: 'fit-content'
                                }}
                                onClick={(): void => {
                                    onUpButtonClick();
                                }}>
                                <ChevronUp size={30} />
                            </Button>
                            <Button
                                sx={{
                                    padding: '0',
                                    minWidth: '0',
                                    height: 'fit-content'
                                }}
                                onClick={(): void => {
                                    onDownButtonClick();
                                }}>
                                <ChevronDown size={30} />
                            </Button>
                        </Stack>
                    )}
                </Stack>
                {isEditable && (
                    <Stack direction={'row'} spacing={2}>
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
                                    priority: taskList.length,
                                    id: '',
                                    materials: false,
                                    lot_id: lot.id
                                };
                                setTaskList([...taskList, tempTask]);
                            }}
                            sx={{ width: '214px' }}>
                            <Plus /> <Box sx={{ width: '10px' }}></Box>
                            {t('addTask')}
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={(): void => {
                                setDeleteModal(true);
                            }}>
                            {t('remove')}
                        </Button>
                    </Stack>
                )}
            </Stack>
            <Box height="24px" />

            {isEditable ? (
                <WRTable marginTop="0px" headers={headers} row={rows} maxHeight={'unset'} />
            ) : (
                <WRTable marginTop="0px" headers={headers} body={body} maxHeight={'unset'} />
            )}

            <Box height="48px" />
            {deleteLotModal()}
            {removeTaskModal()}
            {success()}
        </React.Fragment>
    );
};
