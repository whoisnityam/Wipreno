import { Box, MenuItem, Select, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import euroIcon from '../../../../assets/euroGolden.svg';
import { NEUTRAL } from '../../../../theme/palette';
import percentIcon from '../../../../assets/percentageGolden.svg';
import { updateLotTax } from '../../services/LotService';
import { updateTask } from '../../services/TaskService';
import { DashboardCards } from '../../../dashboard/components/DashboardCards';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EstimationTask } from '../../models/Task';
import { small1 } from '../../../../theme/typography';
import { convertToUiValue } from '../../../../utils';

interface LotSummaryProps {
    id: string;
    tax: number;
    totalAmountWithoutTax: number;
    totalAmountWithTax: number;
    setTax: React.Dispatch<React.SetStateAction<number>>;
    taskList: EstimationTask[];
    setTaskList: React.Dispatch<React.SetStateAction<EstimationTask[]>>;
}
export function LotSummary({
    id,
    tax,
    setTax,
    totalAmountWithoutTax,
    totalAmountWithTax,
    taskList,
    setTaskList
}: LotSummaryProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    const taxDropdown = (): React.ReactElement => {
        return (
            <Select
                required
                variant="standard"
                disableUnderline
                sx={{
                    display: 'flex',
                    height: '22px',
                    color: NEUTRAL.dark,
                    padding: '0% 5%',
                    '& .MuiOutlinedInput-input': {
                        marginTop: '-13px'
                    },
                    '& .MuiSvgIcon-root': {
                        marginTop: '-2px'
                    }
                }}
                value={tax}
                onChange={async (e): Promise<void> => {
                    setTax(parseFloat(e.target.value.toString()));
                    await updateLotTax(id, parseFloat(e.target.value.toString()));

                    taskList.map(async (task) => {
                        task.tax = parseFloat(e.target.value.toString());
                        await updateTask(task);
                    });
                    setTaskList([...taskList]);
                }}>
                <MenuItem value={'0'}>
                    <Typography sx={{ color: NEUTRAL.dark, padding: '0% 2%' }} variant="h6">
                        0%
                    </Typography>
                </MenuItem>
                <MenuItem value={'55000'}>
                    <Typography sx={{ color: NEUTRAL.dark, padding: '0% 2%' }} variant="h6">
                        5,5%
                    </Typography>
                </MenuItem>
                <MenuItem value={'100000'}>
                    <Typography sx={{ color: NEUTRAL.dark, padding: '0% 2%' }} variant="h6">
                        10%
                    </Typography>
                </MenuItem>
                <MenuItem value={'200000'}>
                    <Typography sx={{ color: NEUTRAL.dark, padding: '0% 2%' }} variant="h6">
                        20%
                    </Typography>
                </MenuItem>
            </Select>
        );
    };
    return (
        <DashboardCards
            noPadding
            sx={{
                width: '100%',
                alignItems: 'center'
            }}>
            <Stack
                width={'100%'}
                direction={isLarge ? 'row' : 'column'}
                paddingTop={'8px'}
                paddingLeft={'6px'}
                spacing={'16px'}>
                <Stack
                    direction={'row'}
                    alignItems={'center'}
                    spacing={'12px'}
                    sx={{ overflowWrap: 'anywhere' }}>
                    <img
                        src={euroIcon}
                        alt="emptyBlueFolder"
                        style={{ width: '50px', height: '50px' }}
                    />
                    <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" sx={{ color: NEUTRAL.medium }}>
                            {t('batchPrice')}
                        </Typography>
                        {isLarge ? (
                            <Typography
                                variant="h6"
                                sx={{
                                    color: NEUTRAL.dark
                                }}>
                                {`${t('ht', { price: totalAmountWithoutTax })} / ${t('ttc', {
                                    price: totalAmountWithTax
                                })}`}
                            </Typography>
                        ) : (
                            <Typography
                                sx={{
                                    ...small1,
                                    color: NEUTRAL.dark
                                }}>
                                {`${t('ht', { price: totalAmountWithoutTax })} / ${t('ttc', {
                                    price: totalAmountWithTax
                                })}`}
                            </Typography>
                        )}
                    </Box>
                </Stack>
                <Stack direction={'row'} alignItems={'center'} spacing={'12px'}>
                    <img
                        src={percentIcon}
                        alt="emptyBlueFolder"
                        style={{ width: '50px', height: '50px' }}
                    />
                    <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" sx={{ color: NEUTRAL.medium }}>
                            {t('batchVAT')}
                        </Typography>
                        {isLarge ? (
                            taxDropdown()
                        ) : (
                            <Typography sx={{ ...small1 }} color={NEUTRAL.dark}>
                                {convertToUiValue(tax)}%
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </Stack>
        </DashboardCards>
    );
}
