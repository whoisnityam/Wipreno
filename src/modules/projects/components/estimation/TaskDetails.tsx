import { Box, Checkbox, Stack, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { NEUTRAL } from '../../../../theme/palette';
import { convertToUiValue } from '../../../../utils';
import { EstimationTask } from '../../models/Task';
import { getTaskById } from '../../services/TaskService';

export function TaskDetails(): React.ReactElement {
    const [task, setTask] = useState<EstimationTask>();
    const { id } = useParams();
    const { t } = useTranslation();
    const theme = useTheme();

    const fetchDetails = async (): Promise<void> => {
        if (id) {
            const res = await getTaskById(id);
            setTask(res);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const handelChekbox = (): boolean => {
        if (task?.materials) {
            return true;
        } else {
            return false;
        }
    };

    return (
        <Box sx={{ padding: '15px', width: '100%' }}>
            <Typography variant="h5" color={NEUTRAL.darker} sx={{ marginBottom: '24px' }}>
                {t('detailsOfTask')}
            </Typography>
            <Stack direction={'column'} width={'100%'}>
                <Stack direction={'row'} width={'100%'}>
                    <Typography
                        variant="body2"
                        color={NEUTRAL.darker}
                        fontWeight="500"
                        sx={{ width: '50%' }}>
                        {t('task')}
                    </Typography>
                </Stack>
                <Stack direction={'row'} width={'100%'}>
                    <Typography
                        variant="body2"
                        color={theme.palette.grey[200]}
                        sx={{ width: '100%' }}>
                        {task?.title ?? ''}
                    </Typography>
                </Stack>
                <Stack direction={'row'} width={'100%'} justifyContent={'space-between'} mt={3}>
                    <Typography
                        variant="body2"
                        color={NEUTRAL.darker}
                        fontWeight="500"
                        sx={{ width: '50%' }}>
                        {t('unit')}
                    </Typography>
                    <Typography
                        variant="body2"
                        color={NEUTRAL.darker}
                        fontWeight="500"
                        sx={{ width: '50%', marginLeft: '10px' }}>
                        {t('quantity')}
                    </Typography>
                </Stack>
                <Stack direction={'row'} width={'100%'} justifyContent={'space-between'}>
                    <Typography
                        variant="body2"
                        color={theme.palette.grey[200]}
                        sx={{ width: '50%' }}>
                        {task?.unit ?? ''}
                    </Typography>
                    <Typography
                        variant="body2"
                        color={theme.palette.grey[200]}
                        sx={{ width: '50%', marginLeft: '10px' }}>
                        {convertToUiValue(task?.quantity)}
                    </Typography>
                </Stack>
                <Stack direction={'row'} width={'100%'} mt={3}>
                    <Typography
                        variant="body2"
                        color={NEUTRAL.darker}
                        fontWeight="500"
                        sx={{ width: '50%' }}>
                        {t('pUExcludingTax')}
                    </Typography>
                    <Typography
                        variant="body2"
                        color={NEUTRAL.darker}
                        fontWeight="500"
                        sx={{ width: '50%', marginLeft: '10px' }}>
                        {t('vat')}
                    </Typography>
                </Stack>
                <Stack direction={'row'} width={'100%'}>
                    <Typography
                        variant="body2"
                        color={theme.palette.grey[200]}
                        sx={{ width: '50%', wordBreak: 'break-all' }}>
                        {convertToUiValue(task?.unit_price)}
                    </Typography>
                    <Typography
                        variant="body2"
                        color={theme.palette.grey[200]}
                        sx={{ width: '50%', wordBreak: 'break-all', marginLeft: '10px' }}>
                        {convertToUiValue(task?.tax) + '%'}
                    </Typography>
                </Stack>
                <Stack direction={'row'} width={'100%'} mt={3}>
                    <Typography
                        variant="body2"
                        color={NEUTRAL.darker}
                        fontWeight="500"
                        sx={{ width: '50%' }}>
                        {t('pTotExcludingTax')}
                    </Typography>
                    <Typography
                        variant="body2"
                        color={NEUTRAL.darker}
                        fontWeight="500"
                        sx={{ width: '50%', marginLeft: '10px' }}>
                        {t('pTotIncludingTax')}
                    </Typography>
                </Stack>
                <Stack direction={'row'} width={'100%'}>
                    <Typography
                        variant="body2"
                        color={theme.palette.grey[200]}
                        sx={{ width: '50%', wordBreak: 'break-all' }}>
                        {t('currency', {
                            price:
                                convertToUiValue(task?.unit_price) *
                                convertToUiValue(task?.quantity)
                        })}
                    </Typography>
                    <Typography
                        variant="body2"
                        color={theme.palette.grey[200]}
                        sx={{ width: '50%', wordBreak: 'break-all', marginLeft: '10px' }}>
                        {t('currency', {
                            price:
                                convertToUiValue(task?.unit_price) *
                                    convertToUiValue(task?.quantity) +
                                (convertToUiValue(task?.unit_price) *
                                    convertToUiValue(task?.quantity) *
                                    convertToUiValue(task?.tax)) /
                                    100
                        })}
                    </Typography>
                </Stack>
                <Stack direction={'row'} width={'100%'} mt={3}>
                    <Typography
                        variant="body2"
                        color={NEUTRAL.darker}
                        fontWeight="500"
                        sx={{ width: '50%' }}>
                        {t('materials')}
                    </Typography>
                </Stack>
                <Stack direction={'row'} width={'100%'}>
                    <Checkbox
                        checked={handelChekbox()}
                        color="success"
                        sx={{ marginLeft: '-10px' }}
                    />
                </Stack>
            </Stack>
        </Box>
    );
}
