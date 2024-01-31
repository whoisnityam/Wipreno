import { Box, Button, Stack, TextField, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../../components/alerts/Alert';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { WRTextField } from '../../../components/textfield/WRTextField';
import { WRTable } from '../../../components/WRTable';
import { small2 } from '../../../theme/typography';
import { convertToUiValue, convertToDbValue } from '../../../utils';
import { Lot } from '../../projects/models/Lot';
import { EstimationTask } from '../../projects/models/Task';
import {
    createTask,
    deleteTask,
    updateTask,
    updateTaskOrder
} from '../../projects/services/TaskService';

interface PredefinedNoticeLotTableProps {
    lotData: Lot;
    reload: Function;
}

export const PredefinedNoticeLotTable = ({
    lotData,
    reload = (): void => {}
}: PredefinedNoticeLotTableProps): React.ReactElement => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [deleteModal, setDeleteModal] = useState(false);
    const [modifyModal, setModifyModal] = useState(false);
    const [taskList, setTaskList] = useState<EstimationTask[]>(
        lotData.estimation_tasks ? lotData.estimation_tasks : []
    );
    const [selectedRowId, setSelectedRowId] = useState('');
    const [selectedTask, setSelectedTask] = useState<EstimationTask>();
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [quantity, setQuantity] = useState<number | undefined>();
    const [unitPrice, setUnitPrice] = useState<number | undefined>();
    const [totalPrice, setTotalPrice] = useState<number | undefined>();
    const [addTaskModal, setAddTaskModal] = useState(false);
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        const isEmpty = title === '' || unitPrice === undefined || quantity === undefined;
        let isModified = false;
        if (selectedTask) {
            isModified =
                quantity?.toString() !== convertToUiValue(selectedTask.quantity).toString() ||
                unitPrice?.toString() !== convertToUiValue(selectedTask.unit_price).toString() ||
                title !== selectedTask.title.toString();
        }

        if (!isEmpty && selectedRowId === '') {
            setIsChanged(true);
        } else if (!isEmpty && selectedRowId !== '') {
            if (isModified) {
                setIsChanged(true);
            } else {
                setIsChanged(false);
            }
        } else {
            setIsChanged(false);
        }
    }, [title, unitPrice, quantity]);

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            reload();
        }, 3000);
    };

    const deleteRow = async (): Promise<void> => {
        await deleteTask(selectedRowId);
        const filteredList = taskList.filter((item) => item.id !== selectedRowId);
        updateTaskOrder(filteredList.map((item) => item.id));
        setTaskList(filteredList);
        setDeleteModal(false);
        openSuccessModal();
    };

    useEffect(() => {
        const total = (unitPrice ?? 0) * (quantity ?? 0);
        setTotalPrice(total);
    }, [quantity, unitPrice]);

    useEffect(() => {
        const selectedRowTask = taskList.find((element) => element.id === selectedRowId);
        if (selectedRowTask) {
            setSelectedTask(selectedRowTask);
            setTitle(selectedRowTask.title);
            setQuantity(convertToUiValue(selectedRowTask.quantity));
            setUnitPrice(convertToUiValue(selectedRowTask.unit_price));
            const totalAmount =
                convertToUiValue(selectedRowTask.unit_price) * selectedRowTask.quantity!;
            setTotalPrice(totalAmount);
        }
    }, [selectedRowId]);

    function handleModalClose(): void {
        setTitle('');
        setQuantity(undefined);
        setUnitPrice(undefined);
    }

    function success(): React.ReactElement {
        return (
            <SuccessAlert
                onClose={(): void => {
                    reload();
                }}
                open={successModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToNoticePredefined')}
            />
        );
    }
    function deleteLotTask(): React.ReactElement {
        return (
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
                secondaryButton={t('cancelButtonTitle')}
            />
        );
    }

    function addLotTask(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height={'620px'}
                title={t('addTask')}
                subtitle={t('modifyTaskDescription')}
                open={addTaskModal}
                onClick={async (): Promise<void> => {
                    try {
                        const data = {
                            id: '',
                            title: title.trim(),
                            quantity: convertToDbValue(quantity!),
                            unit_price: convertToDbValue(unitPrice!),
                            unit: 'ENS',
                            lot_id: lotData.id,
                            materials: false,
                            tax: 200000,
                            priority: taskList.length + 1
                        };

                        await createTask(data);
                        openSuccessModal();
                    } catch (e) {
                        console.log(e);
                    }

                    setAddTaskModal(false);
                    handleModalClose();
                }}
                onClose={(): void => {
                    setAddTaskModal(false);
                    handleModalClose();
                }}
                onSecondaryButtonClick={(): void => {
                    setAddTaskModal(false);
                    handleModalClose();
                }}
                primaryButton={t('add')}
                primaryButtonEnabled={isChanged}
                primaryButtonType="primary"
                secondaryButton={t('return')}>
                <>
                    <Typography
                        sx={{
                            ...small2,
                            color: theme.palette.secondary.medium
                        }}>
                        {t('requiredFields')}
                    </Typography>
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'taskTitle'}
                        value={title}
                        onChange={(event): void => setTitle(event.target.value)}
                        label={t('taskTitle')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        requiredValue={quantity}
                        onValueChange={(value: number | undefined): void => {
                            setQuantity(value);
                        }}
                        label={t('quantity')}
                        fullWidth
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={unitPrice}
                        onValueChange={(value: number | undefined): void => {
                            setUnitPrice(value);
                        }}
                        fullWidth
                        label={t('unitPrice')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        readonly
                        isMoney
                        float
                        requiredValue={totalPrice}
                        fullWidth
                        label={t('totalPrice')}
                    />
                </>
            </Alert>
        );
    }

    function modifyLotTask(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="600px"
                title={t('modifyTask')}
                subtitle={t('modifyTaskDescription')}
                open={modifyModal}
                onClick={async (): Promise<void> => {
                    try {
                        const data = {
                            id: selectedTask?.id!,
                            title: title.trim(),
                            quantity: convertToDbValue(quantity!),
                            unit_price: convertToDbValue(unitPrice!),
                            unit: selectedTask?.unit!,
                            lot_id: lotData.id,
                            materials: selectedTask?.materials!,
                            tax: convertToDbValue(selectedTask?.tax!),
                            priority: selectedTask?.priority!
                        };

                        await updateTask(data);
                        openSuccessModal();
                    } catch (e) {
                        console.log(e);
                    }

                    setModifyModal(false);
                }}
                onClose={(): void => setModifyModal(false)}
                onSecondaryButtonClick={(): void => {
                    setModifyModal(false);
                }}
                primaryButton={t('modifyButtonTitle')}
                primaryButtonEnabled={isChanged}
                primaryButtonType="primary"
                secondaryButton={t('return')}>
                <>
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'title'}
                        value={title}
                        onChange={(event): void => setTitle(event.target.value)}
                        label={t('taskTitle')}
                    />

                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        requiredValue={quantity}
                        onValueChange={(value: number | undefined): void => {
                            setQuantity(value);
                        }}
                        label={t('quantity')}
                        fullWidth
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={unitPrice}
                        onValueChange={(value: number | undefined): void => {
                            setUnitPrice(value);
                        }}
                        fullWidth
                        label={t('unitPrice')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={totalPrice}
                        fullWidth
                        readonly
                        label={t('totalPrice')}
                    />
                </>
            </Alert>
        );
    }
    const headers = [t('task'), t('quantity'), t('pUExcludingTax'), t('pTotExcludingTax'), ''];

    const body =
        taskList?.map((task) => {
            return [
                <Typography key={task.id + task.title} variant="body2">
                    {task.title}
                </Typography>,
                <Typography key={task.id + task.quantity} variant="body2">
                    {convertToUiValue(task.quantity)}
                </Typography>,
                <Typography key={task.id + task.unit_price} variant="body2">
                    {convertToUiValue(task.unit_price)}€
                </Typography>,
                <Typography key={task.id + task.unit_price + task.quantity} variant="body2">
                    {convertToUiValue(task.unit_price) * task.quantity!}€
                </Typography>,
                <Stack direction="row" key={task.id} justifyContent={'center'} spacing={2}>
                    <Button
                        sx={{ width: '35%' }}
                        variant={'outlined'}
                        color={'secondary'}
                        onClick={(): void => {
                            setSelectedRowId(task.id);
                            setModifyModal(true);
                        }}>
                        {t('modifyButtonTitle')}
                    </Button>
                    <Button
                        sx={{ width: '35%' }}
                        variant={'outlined'}
                        color={'error'}
                        onClick={(): void => {
                            setSelectedRowId(task.id);
                            setDeleteModal(true);
                        }}>
                        {t('deleteButtonTitle')}
                    </Button>
                </Stack>
            ];
        }) ?? [];

    return (
        <>
            {deleteLotTask()}
            {modifyLotTask()}
            {addLotTask()}
            {success()}
            {lotData.estimation_tasks && lotData.estimation_tasks.length > 0 ? (
                <WRTable marginBottom="16px" marginTop="0" headers={headers} body={body} />
            ) : (
                <Button
                    variant={'outlined'}
                    color={'secondary'}
                    onClick={(): void => {
                        setAddTaskModal(true);
                    }}
                    sx={{ width: '214px' }}>
                    <Plus /> <Box sx={{ width: '10px' }}></Box>
                    {t('addTask')}
                </Button>
            )}
        </>
    );
};
