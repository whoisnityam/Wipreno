import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import euroIcon from '../../../../assets/euroIcon.svg';
import pieChart from '../../../../assets/pieChart.svg';
import { Grid, Stack, Typography, useMediaQuery } from '@mui/material';
import { DashboardCards } from '../../../dashboard/components/DashboardCards';
import { NEUTRAL } from '../../../../theme/palette';
import { convertToUiValue } from '../../../../utils';
import { Lot } from '../../models/Lot';
import { small1 } from '../../../../theme/typography';

export const LotListSummary = ({ lots }: { lots: Lot[] }): React.ReactElement => {
    const isLarge = useMediaQuery('(min-width:920px)');
    const { t } = useTranslation();
    const [totalHT, setTotalHT] = useState(0);
    const [totalTTC, setTotalTTC] = useState(0);
    const [lotList, setLotList] = useState<{ title: string; ht: number; ttc: number }[]>([]);

    useEffect(() => {
        let tHT = 0;
        let tTTC = 0;
        const list = lots?.map((lot): { title: string; ht: number; ttc: number } => {
            let ht = 0;
            let ttc = 0;
            for (const task of lot.estimation_tasks ?? []) {
                if (task.unit_price && task.quantity) {
                    const currentHt =
                        convertToUiValue(task.quantity) * convertToUiValue(task.unit_price);
                    ht += currentHt;
                    tHT += currentHt;
                    ttc += currentHt + currentHt * (convertToUiValue(task.tax) / 100);
                    tTTC += currentHt + currentHt * (convertToUiValue(task.tax) / 100);
                }
            }
            return { title: lot.title, ht, ttc };
        });
        setLotList(list?.slice() ?? []);
        setTotalHT(tHT);
        setTotalTTC(tTTC);
    }, [lots]);

    const ValueTypography = (value: string): React.ReactElement => {
        return (
            <>
                {isLarge ? (
                    <Typography
                        variant="h6"
                        sx={{
                            color: NEUTRAL.dark
                        }}>
                        {value}
                    </Typography>
                ) : (
                    <Typography
                        sx={{
                            ...small1,
                            color: NEUTRAL.dark
                        }}>
                        {value}
                    </Typography>
                )}
            </>
        );
    };

    const batchSummary = (): React.ReactElement => {
        return (
            <Stack marginTop={'32px'}>
                <Typography variant={'h6'} sx={{ color: NEUTRAL.darker, paddingBottom: '12px' }}>
                    {t('summaryOfBatches')}
                </Typography>

                <Grid
                    container
                    direction={isLarge ? 'row' : 'column'}
                    alignItems={isLarge ? 'center' : 'flex-start'}
                    spacing={'16px'}>
                    {lotList.map((lot, index) => {
                        return (
                            <Grid item xs={12} sm={4} key={index}>
                                <Stack
                                    direction={'row'}
                                    spacing={'12px'}
                                    alignItems={'center'}
                                    sx={{ overflowWrap: 'anywhere' }}>
                                    <img
                                        src={pieChart}
                                        alt="emptyBlueFolder"
                                        style={{ width: '50px', height: '50px' }}
                                    />
                                    <Stack sx={{ width: '100%' }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: NEUTRAL.medium
                                            }}>
                                            {lot.title}
                                        </Typography>
                                        {ValueTypography(
                                            `${t('ht', { price: lot.ht })} / ${t('ttc', {
                                                price: lot.ttc
                                            })}`
                                        )}
                                    </Stack>
                                </Stack>
                            </Grid>
                        );
                    })}
                </Grid>
            </Stack>
        );
    };

    return (
        <Stack spacing={'16px'}>
            <DashboardCards direction={'column'} noPadding sx={{ width: '100%' }}>
                <Typography variant={'h6'} sx={{ color: NEUTRAL.darker, paddingBottom: '12px' }}>
                    {t('Total')}
                </Typography>
                <Grid
                    container
                    direction={isLarge ? 'row' : 'column'}
                    alignItems={isLarge ? 'center' : 'flex-start'}
                    spacing={'16px'}>
                    <Grid item>
                        <Stack
                            direction={'row'}
                            spacing={'12px'}
                            alignItems={'center'}
                            sx={{ overflowWrap: 'anywhere' }}>
                            <img
                                src={euroIcon}
                                alt="emptyBlueFolder"
                                style={{ width: '50px', height: '50px' }}
                            />
                            <Stack sx={{ width: '100%' }}>
                                <Typography variant="body2" sx={{ color: NEUTRAL.medium }}>
                                    {t('totalPriceExcludingTax')}
                                </Typography>
                                {ValueTypography(t('ht', { price: totalHT }))}
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Stack
                            direction={'row'}
                            spacing={'12px'}
                            alignItems={'center'}
                            sx={{ overflowWrap: 'anywhere' }}>
                            <img
                                src={euroIcon}
                                alt="emptyBlueFolder"
                                style={{ width: '50px', height: '50px' }}
                            />
                            <Stack sx={{ width: '100%' }}>
                                <Typography variant="body2" sx={{ color: NEUTRAL.medium }}>
                                    {t('totalPriceIncludingTax')}
                                </Typography>
                                {ValueTypography(t('ttc', { price: totalTTC }))}
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
                {isLarge ? batchSummary() : <></>}
            </DashboardCards>
            {isLarge ? (
                <></>
            ) : (
                <DashboardCards direction={'column'} noPadding sx={{ width: '100%' }}>
                    {batchSummary()}
                </DashboardCards>
            )}
        </Stack>
    );
};
