import { Box, Button, MenuItem, Select, Stack, TableCell, Typography } from '@mui/material';
import redCross from '../../../assets/redCross.svg';
import React, { useEffect, useState } from 'react';
import { TableTextField } from '../../../components/textfield/TableTextField';
import { useTranslation } from 'react-i18next';
import greyUpArrow from '../../../assets/greyUpArrow.svg';
import greyDownArrow from '../../../assets/greyDownArrow.svg';
import { convertToUiValue, convertToDbValue } from '../../../utils';
import { createTask, updateTask } from '../../projects/services/TaskService';
import { EstimationTask } from '../../projects/models/Task';

interface TaskRowProps {
    task: EstimationTask;
    onDeleteButtonClick: () => void;
    onUpButtonClick: Function;
    onDownButtonClick: Function;
    onTaskCreated: (task: EstimationTask) => void;
    onTaskUpdated: (task: EstimationTask) => void;
}

export const EstimationTaskTable = ({
    task,
    onUpButtonClick = (): void => {},
    onDownButtonClick = (): void => {},
    onDeleteButtonClick = (): void => {},
    onTaskCreated,
    onTaskUpdated
}: TaskRowProps): React.ReactElement => {
    const { t } = useTranslation();
    const [taskName, setTaskName] = useState(task.title);
    const [quantity, setQuantity] = useState(
        task.quantity ? convertToUiValue(task.quantity) : task.quantity
    );
    const [unit, setUnit] = useState(task.unit);
    const [unitPrice, setUnitPrice] = useState<number | undefined>(
        task.unit_price ? convertToUiValue(task.unit_price) : task.unit_price
    );
    const [isChanged, setIsChanged] = useState(false);

    const taskObj = {
        id: task.id,
        title: taskName,
        quantity: convertToDbValue(quantity!),
        unit,
        unit_price: convertToDbValue(unitPrice!),
        lot_id: task.lot_id,
        priority: task.priority
    };

    useEffect(() => {
        const isModified =
            taskName !== task.title ||
            quantity?.toString() !== convertToUiValue(task.quantity).toString() ||
            unit !== task.unit ||
            unitPrice?.toString() !== convertToUiValue(task.unit_price).toString();
        const isEmpty =
            taskName === '' ||
            unit === '' ||
            quantity === undefined ||
            unitPrice === undefined ||
            taskName.length === 0 ||
            unit.length === 0 ||
            isNaN(quantity ?? 0) ||
            isNaN(unitPrice ?? 0);

        if (task.saveButton) {
            setIsChanged(true);
        } else {
            if (isEmpty) {
                setIsChanged(false);
            } else if (isModified !== isChanged) setIsChanged(isModified);
        }
    }, [taskName, quantity, unit, unitPrice]);

    const onSave = async (): Promise<void> => {
        const updatedTask = await updateTask({
            id: task.id,
            title: taskName,
            quantity: convertToDbValue(quantity!),
            unit,
            unit_price: convertToDbValue(unitPrice!),
            tax: 200000,
            materials: false,
            lot_id: task.lot_id,
            priority: task.priority
        });
        onTaskUpdated(updatedTask);
    };

    const onCreateTask = async (): Promise<void> => {
        const newTask = await createTask({
            id: task.id,
            title: taskName,
            quantity: convertToDbValue(quantity!),
            unit,
            unit_price: convertToDbValue(unitPrice!),
            tax: 200000,
            materials: false,
            lot_id: task.lot_id,
            priority: task.priority
        });
        onTaskCreated(newTask);
    };

    return (
        <>
            <TableCell>
                <Box sx={{ width: '20px', margin: 'auto' }}>
                    <img
                        src={greyUpArrow}
                        alt="greyUpArrow"
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        onClick={(): void => {
                            onUpButtonClick(taskObj, isChanged);
                        }}
                    />
                    <img
                        src={greyDownArrow}
                        alt="greyDownArrow"
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        onClick={(): void => {
                            onDownButtonClick(taskObj, isChanged);
                        }}
                    />
                </Box>
            </TableCell>
            <TableCell width="60%" sx={{ minWidth: '120px' }}>
                <TableTextField
                    requiredValue={taskName}
                    onChange={(e): void => {
                        setTaskName(e.target.value);
                    }}
                />
            </TableCell>
            <TableCell>
                <Select
                    required
                    variant="outlined"
                    sx={{
                        display: 'flex',
                        height: '42px',
                        width: '120px',
                        '& .MuiOutlinedInput-input': {
                            marginTop: '-12px'
                        },
                        '& .MuiSvgIcon-root': {
                            marginTop: '-2px'
                        }
                    }}
                    value={unit}
                    onChange={(e): void => {
                        setUnit(e.target.value);
                    }}>
                    <MenuItem value={'ENS'}>
                        <Typography variant="body2">ENS</Typography>
                    </MenuItem>
                    <MenuItem value={'U'}>
                        <Typography variant="body2">U</Typography>
                    </MenuItem>
                    <MenuItem value={'FORFAIT'}>
                        <Typography variant="body2">FORFAIT</Typography>
                    </MenuItem>
                    <MenuItem value={'M²'}>
                        <Typography variant="body2">M²</Typography>
                    </MenuItem>
                    <MenuItem value={'M3'}>
                        <Typography variant="body2">M3</Typography>
                    </MenuItem>
                    <MenuItem value={'ML'}>
                        <Typography variant="body2">ML</Typography>
                    </MenuItem>
                </Select>
            </TableCell>

            <TableCell sx={{ minWidth: '120px' }}>
                <TableTextField
                    float
                    numberOnly
                    requiredValue={quantity}
                    onValueChange={(value: number | undefined): void => {
                        setQuantity(value);
                    }}
                />
            </TableCell>
            <TableCell sx={{ minWidth: '120px' }}>
                <TableTextField
                    float
                    isMoney
                    numberOnly
                    requiredValue={unitPrice}
                    onValueChange={(value: number | undefined): void => {
                        setUnitPrice(value);
                    }}
                />
            </TableCell>

            <TableCell>
                <Stack sx={{ width: '95px', alignItems: 'self-end' }}>
                    {task.id === '' ? (
                        isChanged ? (
                            <Button
                                sx={{ height: '45px', marginTop: '-5px' }}
                                onClick={(): void => {
                                    onCreateTask();
                                    setIsChanged(false);
                                }}
                                disabled={!isChanged}
                                variant={'contained'}
                                color={'primary'}
                                fullWidth>
                                {t('add')}
                            </Button>
                        ) : (
                            <img
                                src={redCross}
                                alt="redCross"
                                style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                                onClick={(): void => {
                                    onDeleteButtonClick();
                                }}
                            />
                        )
                    ) : isChanged ? (
                        <Button
                            sx={{ height: '45px', marginTop: '-5px' }}
                            onClick={(): void => {
                                onSave();
                                setIsChanged(false);
                            }}
                            variant={'contained'}
                            color={'primary'}
                            fullWidth>
                            {t('saveButtonTitle')}
                        </Button>
                    ) : (
                        <img
                            src={redCross}
                            alt="redCross"
                            style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                            onClick={(): void => {
                                onDeleteButtonClick();
                            }}
                        />
                    )}
                </Stack>
            </TableCell>
        </>
    );
};
