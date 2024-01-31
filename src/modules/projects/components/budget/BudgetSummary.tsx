import { Typography, Box, useTheme, useMediaQuery, Stack } from '@mui/material';
import euroGolden from '../../../../assets/euroGolden.svg';
import GoldenHike from '../../../../assets/GoldenHike.svg';
import PinkClock from '../../../../assets/PinkClock.svg';
import BlueLogistics from '../../../../assets/BlueLogistics.svg';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { NEUTRAL } from '../../../../theme/palette';
import { DashboardCards } from '../../../dashboard/components/DashboardCards';
import {
    createProfit,
    getProfitabilityByProjectId,
    updateProfit
} from '../../services/ProfitabilityService';
import { Profitability } from '../../models/Profitablity';
import { convertToUiValue, convertToDbValue } from '../../../../utils';
import { EmptyState } from '../../../../components/emptyState/EmptyState';
import { Alert } from '../../../../components/alerts/Alert';
import { small2 } from '../../../../theme/typography';
import { WRTextField } from '../../../../components/textfield/WRTextField';

export function BudgetSummary(projectId: string): React.ReactElement {
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const { t } = useTranslation();
    const [profitDetails, setProfitDetails] = React.useState<Profitability | null>();
    const [isAddCostOpen, setIsAddCostOpen] = useState(false);
    const [modifyCost, setModifyCost] = useState(false);
    const [amount, setAmount] = useState<number | undefined>();
    const [hourlyCost, setHourlyCost] = useState<number | undefined>();
    const [moves, setMoves] = useState<number | undefined>();
    const [time, setTime] = useState<number | undefined>();
    const [isChanged, setIsChanged] = useState(false);
    const [costId, setCostId] = useState('');
    const [travelCost, setTravelCost] = useState<number | undefined>();
    const [onSave, setOnSave] = useState(true);

    useEffect(() => {
        const isEmpty =
            amount === undefined ||
            hourlyCost === undefined ||
            moves === undefined ||
            time === undefined ||
            travelCost === undefined;
        let isModified = false;
        if (profitDetails) {
            isModified =
                amount !== convertToUiValue(profitDetails.fees) ||
                hourlyCost !== convertToUiValue(profitDetails.hourly_cost) ||
                travelCost !== convertToUiValue(profitDetails.travel_cost) ||
                moves !== profitDetails.number_of_trips ||
                time !== profitDetails.time_spent;
        }
        if (!isEmpty && !profitDetails) {
            setIsChanged(true);
        } else if (!isEmpty && profitDetails) {
            if (isModified) {
                setIsChanged(true);
            } else {
                setIsChanged(false);
            }
        } else {
            setIsChanged(false);
        }
    }, [amount, travelCost, hourlyCost, moves, time]);

    const fetchProfitabilityByProjectId = useCallback(async () => {
        const profit = await getProfitabilityByProjectId(projectId);
        setProfitDetails(profit);
    }, []);

    useEffect(() => {
        if (profitDetails) {
            setAmount(convertToUiValue(profitDetails.fees));
            setHourlyCost(convertToUiValue(profitDetails.hourly_cost));
            setTravelCost(convertToUiValue(profitDetails.travel_cost));
            setMoves(profitDetails.number_of_trips);
            setTime(profitDetails.time_spent);
            setCostId(profitDetails.id);
        }
    }, [profitDetails]);

    useEffect(() => {
        fetchProfitabilityByProjectId();
    }, [onSave]);

    function CalculateEstimate(): number {
        const marginEstimate =
            convertToUiValue(profitDetails!.fees) -
            convertToUiValue(profitDetails!.hourly_cost) * profitDetails!.time_spent -
            convertToUiValue(profitDetails!.travel_cost) * profitDetails!.number_of_trips;
        return marginEstimate;
    }

    function reset(): void {
        setAmount(
            profitDetails?.fees ? convertToUiValue(profitDetails?.fees) : profitDetails?.fees
        );
        setHourlyCost(
            profitDetails?.hourly_cost
                ? convertToUiValue(profitDetails?.hourly_cost)
                : profitDetails?.hourly_cost
        );
        setTravelCost(
            profitDetails?.travel_cost
                ? convertToUiValue(profitDetails?.travel_cost)
                : profitDetails?.travel_cost
        );
        setMoves(profitDetails?.number_of_trips);
        setTime(profitDetails?.time_spent);
    }

    function createCost(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="700px"
                title={t('addCostTitle')}
                subtitle={t('addCostDescription')}
                open={isAddCostOpen}
                onClick={async (): Promise<void> => {
                    const cost = {
                        id: '',
                        fees: convertToDbValue(amount!),
                        hourly_cost: convertToDbValue(hourlyCost!),
                        time_spent: time!,
                        travel_cost: convertToDbValue(travelCost!),
                        number_of_trips: moves!,
                        project_id: projectId
                    };

                    await createProfit(cost);
                    setIsAddCostOpen(false);
                    setOnSave(!onSave);
                    setIsChanged(false);
                }}
                onClose={(): void => {
                    reset();
                    setIsAddCostOpen(false);
                }}
                onSecondaryButtonClick={(): void => {
                    reset();
                    setIsAddCostOpen(false);
                }}
                primaryButtonEnabled={isChanged}
                primaryButton={t('add')}
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
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={amount}
                        onValueChange={(value: number | undefined): void => {
                            setAmount(value);
                        }}
                        fullWidth
                        label={t('amountOfFees')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        suffix={t('euroPerHour')}
                        float
                        requiredValue={hourlyCost}
                        onValueChange={(value: number | undefined): void => {
                            setHourlyCost(value);
                        }}
                        fullWidth
                        label={t('hourlyCostTitle')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        requiredValue={time}
                        onValueChange={(value: number | undefined): void => {
                            setTime(value);
                        }}
                        fullWidth
                        label={t('timeSpentTitle')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={travelCost}
                        onValueChange={(value: number | undefined): void => {
                            setTravelCost(value);
                        }}
                        fullWidth
                        label={t('travelCost')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        requiredValue={moves}
                        onValueChange={(value: number | undefined): void => {
                            setMoves(value);
                        }}
                        label={t('numberOfMoves')}
                        fullWidth
                    />
                </>
            </Alert>
        );
    }

    function updateCost(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="700px"
                title={t('modifyCostTitle')}
                subtitle={t('modifyCostDescription')}
                open={modifyCost}
                onClick={async (): Promise<void> => {
                    const cost = {
                        id: costId,
                        fees: convertToDbValue(amount!),
                        hourly_cost: convertToDbValue(hourlyCost!),
                        time_spent: time!,
                        travel_cost: convertToDbValue(travelCost!),
                        number_of_trips: moves!,
                        project_id: projectId
                    };

                    await updateProfit(cost);
                    setModifyCost(false);
                    setOnSave(!onSave);
                    setIsChanged(false);
                }}
                onClose={(): void => {
                    reset();
                    setModifyCost(false);
                }}
                onSecondaryButtonClick={(): void => {
                    reset();
                    setModifyCost(false);
                }}
                primaryButtonEnabled={isChanged}
                primaryButton={t('modifyButtonTitle')}
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
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={amount}
                        onValueChange={(value: number | undefined): void => {
                            setAmount(value);
                        }}
                        fullWidth
                        label={t('amountOfFees')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        suffix={t('euroPerHour')}
                        float
                        requiredValue={hourlyCost}
                        onValueChange={(value: number | undefined): void => {
                            setHourlyCost(value);
                        }}
                        fullWidth
                        label={t('hourlyCostTitle')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        requiredValue={time}
                        onValueChange={(value: number | undefined): void => {
                            setTime(value);
                        }}
                        fullWidth
                        label={t('timeSpentTitle')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={travelCost}
                        onValueChange={(value: number | undefined): void => {
                            setTravelCost(value);
                        }}
                        fullWidth
                        label={t('travelCost')}
                    />
                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        requiredValue={moves}
                        onValueChange={(value: number | undefined): void => {
                            setMoves(value);
                        }}
                        label={t('numberOfMoves')}
                        fullWidth
                    />
                </>
            </Alert>
        );
    }

    const getItem = (img: string, label: string, value: string): React.ReactElement => {
        return (
            <Stack direction={'row'} spacing={'12px'}>
                <img src={img} alt="emptyBlueFolder" style={{ width: '50px', height: '50px' }} />
                <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ color: NEUTRAL.medium, padding: '0% 2%' }}>
                        {label}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: NEUTRAL.dark,
                            padding: '0% 2%',
                            width: '100%',
                            overflowWrap: 'anywhere'
                        }}>
                        {value}
                    </Typography>
                </Box>
            </Stack>
        );
    };

    if (profitDetails) {
        return (
            <>
                <DashboardCards
                    direction={'column'}
                    sx={{
                        width: '100%',
                        marginTop: { xs: '32px', md: '48px' },
                        padding: { xs: '16px', md: '32px' }
                    }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} width={'100%'} spacing={'48px'}>
                        <Stack spacing={'25px'} flexGrow={1}>
                            <Stack direction={'row'}>
                                <Typography variant={'h5'} sx={{ color: NEUTRAL.darker }}>
                                    {t('projectManagerProfitability')}
                                </Typography>
                                {isLarge ? (
                                    <Box
                                        sx={{ margin: 'auto 35px', cursor: 'pointer' }}
                                        onClick={(): void => {
                                            setModifyCost(true);
                                        }}>
                                        <Typography
                                            sx={{
                                                fontWeight: '700',
                                                color: theme.palette.secondary.medium
                                            }}>
                                            {t('modifyButtonTitle')}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <></>
                                )}
                            </Stack>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                width={'100%'}
                                spacing={'38px'}
                                flexGrow={1}>
                                <Stack spacing={'32px'} flexGrow={1}>
                                    {getItem(
                                        euroGolden,
                                        t('amountOfFees'),
                                        t('currency', {
                                            price: convertToUiValue(profitDetails.fees)
                                        })
                                    )}
                                </Stack>
                                <Stack spacing={'32px'} flexGrow={1}>
                                    {getItem(
                                        PinkClock,
                                        t('hourlyCost'),
                                        `${t('currency', {
                                            price: convertToUiValue(profitDetails.hourly_cost)
                                        })} /h`
                                    )}
                                    {getItem(
                                        PinkClock,
                                        t('timeSpent'),
                                        `${profitDetails.time_spent}h`
                                    )}
                                </Stack>
                                <Stack spacing={'32px'} flexGrow={1}>
                                    {getItem(
                                        BlueLogistics,
                                        t('travelCost'),
                                        t('currency', {
                                            price: convertToUiValue(profitDetails.travel_cost)
                                        })
                                    )}
                                    {getItem(
                                        BlueLogistics,
                                        t('numberOfMoves'),
                                        `${profitDetails.number_of_trips}`
                                    )}
                                </Stack>
                            </Stack>
                        </Stack>
                        {isLarge ? (
                            <Stack spacing={'25px'}>
                                <Typography variant={'h5'} sx={{ color: NEUTRAL.darker }}>
                                    {t('margin')}
                                </Typography>
                                {getItem(
                                    GoldenHike,
                                    t('marginEstimate'),
                                    t('currency', { price: CalculateEstimate() })
                                )}
                            </Stack>
                        ) : (
                            <></>
                        )}
                    </Stack>
                    {isLarge ? updateCost() : <></>}
                </DashboardCards>
                {!isLarge ? (
                    <DashboardCards
                        direction={'column'}
                        sx={{
                            width: '100%',
                            marginTop: { xs: '32px', md: '48px' },
                            padding: { xs: '16px', md: '32px' }
                        }}>
                        <Stack spacing={'25px'}>
                            <Typography variant={'h5'} sx={{ color: NEUTRAL.darker }}>
                                {t('margin')}
                            </Typography>
                            {getItem(
                                GoldenHike,
                                t('marginEstimate'),
                                t('currency', { price: CalculateEstimate() })
                            )}
                        </Stack>
                    </DashboardCards>
                ) : (
                    <></>
                )}
            </>
        );
    } else {
        return (
            <DashboardCards
                noPadding
                direction={'column'}
                sx={{ width: '100%', marginTop: '48px' }}>
                <Typography variant={'h5'} sx={{ color: NEUTRAL.darker, marginBottom: '48px' }}>
                    {t('projectManagerProfitability')}
                </Typography>
                <EmptyState
                    title={''}
                    subtitle={isLarge ? t('profitabilityEmptyStateTitle') : ''}
                    description={
                        isLarge
                            ? t('profitabilityEmptyStateDescription')
                            : t('profitabilityEmptyStateTitle')
                    }
                    buttonTitle={isLarge ? t('addCostTitle') : undefined}
                    buttonType={'contained'}
                    buttonOnClick={(): void => {
                        setIsAddCostOpen(true);
                    }}
                />
                {isLarge ? createCost() : <></>}
            </DashboardCards>
        );
    }
}
