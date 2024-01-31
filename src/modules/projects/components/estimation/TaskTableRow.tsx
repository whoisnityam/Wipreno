import { Box, Checkbox, MenuItem, Select, Stack, TableCell, Typography } from '@mui/material';
import redCross from '../../../../assets/redCross.svg';
import greyUpArrow from '../../../../assets/greyUpArrow.svg';
import greyDownArrow from '../../../../assets/greyDownArrow.svg';
import React, { useEffect, useState } from 'react';
import { TableTextField } from '../../../../components/textfield/TableTextField';
import { useTranslation } from 'react-i18next';
import { createTask, updateTask } from '../../services/TaskService';
import { convertToUiValue, convertToDbValue } from '../../../../utils';
import { LoadingButton } from '@mui/lab';
import { EstimationTask } from '../../models/Task';

interface TaskRowProps {
    task: EstimationTask;
    onUpButtonClick: Function;
    onDownButtonClick: Function;
    onDeleteButtonClick: Function;
    onSaveButtonClick: (task: EstimationTask, isNew: boolean) => void;
}

export const TaskTableRow = ({
    task,
    onUpButtonClick = (): void => {},
    onDownButtonClick = (): void => {},
    onDeleteButtonClick = (): void => {},
    onSaveButtonClick = (): void => {}
}: TaskRowProps): React.ReactElement => {
    const { t } = useTranslation();
    const [trackChange, setTrackChange] = useState(0);
    const [taskName, setTaskName] = useState(task.title);
    const [quantity, setQuantity] = useState<number | undefined>(
        task.quantity ? convertToUiValue(task.quantity) : task.quantity
    );
    const [unit, setUnit] = useState(task.unit);
    const [tax, setTax] = useState(task.tax);
    const [unitPrice, setUnitPrice] = useState<number | undefined>(
        task.unit_price ? convertToUiValue(task.unit_price) : task.unit_price
    );
    const [isChanged, setIsChanged] = useState(false);
    const [materials, setMaterial] = useState(task.materials);
    const [loading, setLoading] = useState(false);

    const taskObj = {
        id: task.id,
        title: taskName,
        quantity: convertToDbValue(quantity!),
        unit,
        tax,
        unit_price: convertToDbValue(unitPrice!),
        materials,
        lot_id: task.lot_id,
        priority: task.priority
    };

    const onSave = async (): Promise<EstimationTask> => {
        setLoading(true);
        const updatedTask = await updateTask(taskObj);
        setLoading(false);
        return updatedTask;
    };

    const onCreateTask = async (): Promise<EstimationTask> => {
        setLoading(true);
        const newTask = await createTask(taskObj);
        setLoading(false);
        return newTask;
    };

    useEffect(() => {
        const isModified =
            taskName.trim().toString() !== task.title.trim().toString() ||
            quantity?.toString() !== convertToUiValue(task.quantity).toString() ||
            unit.toString() !== task.unit.toString() ||
            tax.toString() !== task.tax.toString() ||
            unitPrice?.toString() !== convertToUiValue(task.unit_price).toString() ||
            materials.toString() !== task.materials.toString();

        const isEmpty =
            taskName.trim() === '' ||
            unit === '' ||
            quantity === undefined ||
            unitPrice === undefined ||
            taskName.length === 0 ||
            unit.length === 0 ||
            isNaN(tax) ||
            isNaN(quantity) ||
            isNaN(unitPrice);

        if (task.saveButton) {
            setIsChanged(true);
        } else {
            if (isEmpty) setIsChanged(false);
            else {
                if (isModified) {
                    setIsChanged(true);
                } else {
                    setIsChanged(false);
                }
            }
        }
    }, [taskName, quantity, unit, tax, unitPrice, materials]);

    const calculateTotalWithoutTax = (price: number, qty: number): number => {
        return price * qty;
    };

    const calculateTotalWithTax = (price: number, qty: number, vat: number): number => {
        return price * qty + (price * qty * convertToUiValue(vat)) / 100;
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
            <TableCell width={'50%'} sx={{ minWidth: '120px' }}>
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
                        '& .MuiOutlinedInput-input': {
                            marginTop: '-13px'
                        },
                        '& .MuiSvgIcon-root': {
                            marginTop: '-2px'
                        }
                    }}
                    fullWidth
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
            <TableCell width={'5%'}>
                <TableTextField
                    float
                    numberOnly
                    requiredValue={quantity}
                    onValueChange={(value: number | undefined): void => {
                        setQuantity(value);
                        setTrackChange(Math.random());
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
                        setTrackChange(Math.random());
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
                        '& .MuiOutlinedInput-input': {
                            marginTop: '-13px'
                        },
                        '& .MuiSvgIcon-root': {
                            marginTop: '-2px'
                        }
                    }}
                    fullWidth
                    value={tax}
                    onChange={(e): void => {
                        setTrackChange(Math.random());
                        setTax(parseFloat(e.target.value.toString()));
                    }}>
                    <MenuItem value={'0'}>
                        <Typography variant="body2">0%</Typography>
                    </MenuItem>
                    <MenuItem value={'55000'}>
                        <Typography variant="body2">5,5%</Typography>
                    </MenuItem>
                    <MenuItem value={'100000'}>
                        <Typography variant="body2">10%</Typography>
                    </MenuItem>
                    <MenuItem value={'200000'}>
                        <Typography variant="body2">20%</Typography>
                    </MenuItem>
                </Select>
            </TableCell>
            <TableCell sx={{ minWidth: '120px' }}>
                <TableTextField
                    float
                    numberOnly
                    isMoney
                    key={trackChange}
                    requiredValue={
                        isNaN(calculateTotalWithoutTax(unitPrice ?? 0, quantity ?? 0))
                            ? 0
                            : calculateTotalWithoutTax(unitPrice ?? 0, quantity ?? 0)
                    }
                    readonly
                    onChange={(): void => {}}
                />
            </TableCell>
            <TableCell sx={{ minWidth: '120px' }}>
                <TableTextField
                    isMoney
                    float
                    numberOnly
                    key={trackChange}
                    readonly
                    requiredValue={
                        isNaN(calculateTotalWithTax(unitPrice ?? 0, quantity ?? 0, tax))
                            ? 0
                            : calculateTotalWithTax(unitPrice ?? 0, quantity ?? 0, tax)
                    }
                    onChange={(): void => {}}
                />
            </TableCell>
            <TableCell sx={{ justifyContent: 'space-around', textAlign: 'center' }}>
                <Checkbox
                    checked={materials}
                    color="success"
                    onChange={(e): void => {
                        setMaterial(e.target.checked);
                    }}
                />
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
                <Stack sx={{ width: '85px', alignItems: 'center' }}>
                    {isChanged ? (
                        <LoadingButton
                            sx={{ height: '42px' }}
                            loading={loading}
                            onClick={async (): Promise<void> => {
                                setIsChanged(false);
                                task.saveButton = false;
                                if (task.id !== '') {
                                    const updatedTask = await onSave();
                                    onSaveButtonClick(updatedTask, false);
                                } else {
                                    const newTask = await onCreateTask();
                                    onSaveButtonClick(newTask, true);
                                }
                            }}
                            variant={'contained'}
                            color={'primary'}
                            fullWidth>
                            {t(task.id === '' ? 'add' : 'saveButtonTitle')}
                        </LoadingButton>
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
