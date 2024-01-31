import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { EstimationTask } from '../../models/Task';
import { NEUTRAL } from '../../../../theme/palette';
import { body3, button2, small1, small2 } from '../../../../theme/typography';
import { useTranslation } from 'react-i18next';
import { convertToUiValue } from '../../../../utils';
import { useNavigate } from 'react-router-dom';

interface LotItemMobileProps {
    task: EstimationTask;
}
export function LotItemMobile({ task }: LotItemMobileProps): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const ht = convertToUiValue(task.unit_price) * convertToUiValue(task.quantity);
    const ttc = ht + (ht * convertToUiValue(task.tax)) / 100;
    return (
        <Stack
            width={'100%'}
            spacing={'4px'}
            sx={{ border: `1px solid ${NEUTRAL.light}`, borderRadius: '4px', padding: '12px' }}>
            <Stack
                direction={'row'}
                justifyContent={'space-between'}
                marginBottom={'4px'}
                spacing={'2px'}>
                <Typography sx={{ ...small1 }} color={NEUTRAL.darker}>
                    {task.title}
                </Typography>
                <Button
                    color={'secondary'}
                    onClick={(): void => {
                        navigate(`/project/taskDetails/${task.id}`);
                    }}
                    sx={{
                        ...button2,
                        height: 'fit-content',
                        width: '95px',
                        padding: 0,
                        marginTop: '2px'
                    }}>
                    {t('seeMore')}
                </Button>
            </Stack>
            <Stack
                direction={'row'}
                justifyContent={'space-between'}
                spacing={'2px'}
                flexWrap={'wrap'}>
                <Stack direction={'row'} justifyContent={'space-between'} spacing={'4px'}>
                    <Typography sx={{ ...small2 }} color={NEUTRAL.medium}>
                        {t('unit')}:
                    </Typography>
                    <Typography sx={{ ...body3 }} color={NEUTRAL.medium}>
                        {task.unit}
                    </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'} spacing={'4px'}>
                    <Typography sx={{ ...small2 }} color={NEUTRAL.medium}>
                        {t('quantity')}:
                    </Typography>
                    <Typography sx={{ ...body3 }} color={NEUTRAL.medium}>
                        {t('numberFormat', { value: convertToUiValue(task.quantity) })}
                    </Typography>
                </Stack>
            </Stack>
            <Stack direction={'row'} justifyContent={'space-between'} flexWrap={'wrap'}>
                <Stack direction={'row'} justifyContent={'space-between'} spacing={'4px'}>
                    <Typography sx={{ ...small2 }} color={NEUTRAL.medium}>
                        {t('pTotExcludingTax')}:
                    </Typography>
                    <Typography sx={{ ...body3 }} color={NEUTRAL.medium}>
                        {t('currency', { price: ht })}
                    </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'} spacing={'4px'}>
                    <Typography sx={{ ...small2 }} color={NEUTRAL.medium}>
                        {t('pTotIncludingTax')}:
                    </Typography>
                    <Typography sx={{ ...body3 }} color={NEUTRAL.medium}>
                        {t('currency', { price: ttc })}
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
}
