import {
    Typography,
    Box,
    Button,
    Grid,
    Stack,
    TextField,
    useTheme,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    useMediaQuery
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { NEUTRAL } from '../../../../theme/palette';
import { DashboardCards } from '../../../dashboard/components/DashboardCards';
import { createBudget, getLotsForBudget } from '../../services/BudgetService';
import { WorkTable } from './WorkTable';
import { convertToUiValue, convertToDbValue } from '../../../../utils';
import { Plus } from 'react-feather';
import { Alert } from '../../../../components/alerts/Alert';
import { small2 } from '../../../../theme/typography';
import { Lot } from '../../models/Lot';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { WRTextField } from '../../../../components/textfield/WRTextField';

export function BudgetDetails(): React.ReactElement {
    const { t } = useTranslation();
    const projectContext = useContext(ProjectContext);
    const project = projectContext.project;
    const notice = project?.notices?.at(0);
    const [lotList, setLotList] = React.useState<Lot[]>([]);
    const [HT, setHT] = useState(0);
    const [TTC, setTTC] = useState(0);
    const [addLotModal, setAddLotModal] = useState(false);
    const [onAdd, setOnAdd] = useState(true);
    const [amountWithoutTax, setAmountWithoutTax] = useState<number | undefined>();
    const [amountWithTax, setAmountWithTax] = useState<number | undefined>();
    const [entitled, setEntitled] = useState('');
    const [type, setType] = useState('');
    const [lotId, setLotId] = useState('');
    const [dataChanged, setDataChanged] = useState(false);
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    const fetchLotsByNoticeId = useCallback(async () => {
        const lots = await getLotsForBudget(notice!.id);
        setLotList(lots);
        let totalTTC = 0;
        let totalHT = 0;
        for (const lot of lots) {
            totalHT = totalHT + convertToUiValue(lot.amount_HT);
            totalTTC = totalTTC + convertToUiValue(lot.amount_TTC);
            if (lot.budgets) {
                for (const budget of lot.budgets) {
                    if (budget.value_type === 'POSITIVE') {
                        totalHT = totalHT + convertToUiValue(budget.unit_price);
                        totalTTC = totalTTC + convertToUiValue(budget.unit_price_with_tax);
                    } else {
                        totalHT = totalHT - convertToUiValue(budget.unit_price);
                        totalTTC = totalTTC - convertToUiValue(budget.unit_price_with_tax);
                    }
                }
            }
        }
        setTTC(totalTTC);
        setHT(totalHT);
    }, []);

    useEffect(() => {
        if (notice) {
            fetchLotsByNoticeId();
        }
    }, [onAdd]);

    const reset = (): void => {
        setLotId('');
        setType('');
        setAmountWithTax(undefined);
        setAmountWithoutTax(undefined);
        setEntitled('');
        setAddLotModal(false);
    };

    useEffect(() => {
        const isChanged =
            lotId !== '' &&
            type !== '' &&
            entitled !== '' &&
            amountWithTax !== undefined &&
            amountWithoutTax !== undefined &&
            entitled.trim().length > 0 &&
            amountWithTax >= amountWithoutTax;
        setDataChanged(isChanged);
    }, [lotId, entitled, type, amountWithTax, amountWithoutTax]);

    function addLot(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="700px"
                title={t('addBudgetButton')}
                subtitle={t('addBudgetLotDescription')}
                open={addLotModal}
                onClick={async (): Promise<void> => {
                    const data = {
                        id: '',
                        project_id: project!.id,
                        lot_id: lotId,
                        value_type: type,
                        entitled,
                        unit_price: convertToDbValue(amountWithoutTax!),
                        unit_price_with_tax: convertToDbValue(amountWithTax!),
                        is_deleted: false
                    };
                    try {
                        await createBudget(data);
                        reset();
                        setOnAdd(!onAdd);
                    } catch (e) {
                        console.log(e);
                    }
                }}
                onClose={(): void => {
                    reset();
                }}
                onSecondaryButtonClick={(): void => {
                    reset();
                }}
                primaryButtonEnabled={dataChanged}
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

                    <FormControl sx={{ marginTop: '16px' }} fullWidth>
                        <InputLabel required id="inTheBundle">
                            {t('inTheBundle')}
                        </InputLabel>
                        <Select
                            required
                            labelId="inTheBundle"
                            label={t('inTheBundle')}
                            fullWidth
                            value={lotId}
                            onChange={(e): void => {
                                setLotId(e.target.value);
                            }}>
                            {lotList.map((lot, index) => {
                                return (
                                    <MenuItem key={index} value={lot.id}>
                                        <Typography variant="body2">{lot.title}</Typography>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ marginTop: '16px' }} fullWidth>
                        <InputLabel required id="type">
                            {t('typeOfValue')}
                        </InputLabel>
                        <Select
                            required
                            labelId="type"
                            label={t('typeOfValue')}
                            fullWidth
                            value={type}
                            onChange={(e): void => {
                                setType(e.target.value);
                            }}>
                            <MenuItem value={'POSITIVE'}>
                                <Typography variant="body2">+ value</Typography>
                            </MenuItem>
                            <MenuItem value={'NEGITIVE'}>
                                <Typography variant="body2">- value</Typography>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        type={'tel'}
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'timeSpent'}
                        value={entitled}
                        onChange={(event): void => {
                            setEntitled(event.target.value);
                        }}
                        label={t('entitled')}
                    />

                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={amountWithoutTax}
                        onValueChange={(value: number | undefined): void => {
                            setAmountWithoutTax(value);
                        }}
                        fullWidth
                        label={t('amountWithoutTax')}
                    />

                    <WRTextField
                        margin="16px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={amountWithTax}
                        onValueChange={(value: number | undefined): void => {
                            setAmountWithTax(value);
                        }}
                        fullWidth
                        label={t('amountWithTax')}
                    />
                    {(amountWithTax ?? 0) < (amountWithoutTax ?? 0) ? (
                        <Typography
                            mt={1}
                            sx={{
                                color: theme.palette.error.main,
                                fontSize: '12px',
                                fontFamily: 'Poppins'
                            }}>
                            {t('taxErrorMessage')}
                        </Typography>
                    ) : null}
                </>
            </Alert>
        );
    }

    return (
        <Box>
            <DashboardCards noPadding direction={'column'} sx={{ width: '100%' }}>
                <Grid container>
                    <Grid item xs={12} sm={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                height: '88px'
                            }}>
                            <Box sx={{ width: '100%' }}>
                                <Typography
                                    variant={isLarge ? 'h5' : 'h6'}
                                    sx={{ color: NEUTRAL.dark, padding: '0% 2%' }}>
                                    {t('budgetWithoutTax')}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: NEUTRAL.medium,
                                        padding: '8px 2% 0'
                                    }}>
                                    {t('ht', { price: HT })}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                height: '88px'
                            }}>
                            <Box sx={{ width: '100%' }}>
                                <Typography
                                    variant={isLarge ? 'h5' : 'h6'}
                                    sx={{ color: NEUTRAL.dark, padding: '0% 2%' }}>
                                    {t('budgetWithTax')}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: NEUTRAL.medium,
                                        padding: '8px 2% 0'
                                    }}>
                                    {t('ttc', { price: TTC })}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DashboardCards>

            <Box marginTop={'48px'}>
                <Stack direction="row" justifyContent="space-between">
                    <Typography alignSelf={'center'} variant="h5">
                        {t('budgetTableHeader')}
                    </Typography>
                    {isLarge ? (
                        <Button
                            variant="outlined"
                            onClick={(): void => {
                                setAddLotModal(true);
                            }}>
                            <Plus />
                            <Typography variant="button" sx={{ paddingLeft: '15px' }}>
                                {t('addBudgetButton')}
                            </Typography>
                        </Button>
                    ) : (
                        <></>
                    )}
                </Stack>
                {lotList.length > 0 && (
                    <WorkTable
                        lots={lotList}
                        onSave={(): void => {
                            setOnAdd(!onAdd);
                        }}
                    />
                )}
            </Box>
            {isLarge ? addLot() : <></>}
        </Box>
    );
}
