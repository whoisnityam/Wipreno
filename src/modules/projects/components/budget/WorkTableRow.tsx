import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TableCell,
    TableRow,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../../../components/alerts/Alert';
import { UserContext } from '../../../../provider/UserProvider';
import { fontWeightSemiBold, small2 } from '../../../../theme/typography';
import { convertToUiValue, convertToDbValue } from '../../../../utils';
import { getArtisansForBudget } from '../../../artisans/services/artisanService';
import { User } from '../../../profile/models/User';
import { updateArtisan } from '../../services/LotService';
import { Lot } from '../../models/Lot';
import { WRTextField } from '../../../../components/textfield/WRTextField';
import redCross from '../../../../assets/redCross.svg';
import { deleteValue } from '../../services/BudgetService';
import { addAccess } from '../../services/ProjectService';
import { useParams } from 'react-router-dom';
import { getUserAccessByUserId, removeAccess } from '../../services/UserAccessService';

interface WorkTableRowInterface {
    lot: Lot;
    onSave: Function;
}

export const WorkTableRow = ({
    lot,
    onSave = (): void => {}
}: WorkTableRowInterface): React.ReactElement => {
    const theme = useTheme();
    const { id } = useParams();
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const [isCollapse, setIsCollapse] = useState(false);
    const [modifyLotModal, setModifyLotModal] = useState(false);
    const [enterpriseName, setEnterpriseName] = useState<string | undefined>(
        lot.artisan_id ? lot.artisan_id.id : undefined
    );
    const [artisanData, setArtisanData] = useState<User[]>();
    const [isChanged, setIsChanged] = useState(false);
    const [amountHT, setAmountHT] = useState<number | undefined>(
        lot.amount_HT ? convertToUiValue(lot.amount_HT) : undefined
    );
    const [amountTTC, setAmountTTC] = useState<number | undefined>(
        lot.amount_TTC ? convertToUiValue(lot.amount_TTC) : undefined
    );

    async function getArtisans(): Promise<void> {
        const data = await getArtisansForBudget(user.user!.enterprises.at(0)!.enterprise_id.id);
        setArtisanData(data);
    }

    useEffect(() => {
        const isEmpty =
            enterpriseName === undefined || amountHT === undefined || amountTTC === undefined;
        const isModified =
            (enterpriseName !== lot.artisan_id?.id ||
                amountHT?.toString() !== convertToUiValue(lot.amount_HT).toString() ||
                amountTTC?.toString() !== convertToUiValue(lot.amount_TTC).toString()) &&
            (amountHT ?? 0) <= (amountTTC ?? 0);

        if (isEmpty) setIsChanged(false);
        else {
            if (isModified) {
                setIsChanged(true);
            } else {
                setIsChanged(false);
            }
        }
    }, [enterpriseName, amountHT, amountTTC]);

    useEffect(() => {
        getArtisans();
    }, [user]);

    const colouredBox = (item: string): React.ReactElement => {
        if (item === 'NEGITIVE') {
            return (
                <Stack
                    direction="row"
                    sx={{
                        background: theme.palette.success.light,
                        width: 'fit-content',
                        marginRight: '8px'
                    }}>
                    <Typography
                        sx={{
                            ...small2,
                            color: theme.palette.success.dark,
                            padding: '4px 8px',
                            fontWeight: fontWeightSemiBold
                        }}>
                        {t('negitiveValue')}
                    </Typography>
                </Stack>
            );
        } else {
            return (
                <Stack
                    direction="row"
                    sx={{
                        background: theme.palette.warning.light,
                        width: 'fit-content',
                        marginRight: '8px'
                    }}>
                    <Typography
                        sx={{
                            ...small2,
                            color: theme.palette.warning.dark,
                            padding: '4px 8px',
                            fontWeight: fontWeightSemiBold
                        }}>
                        {t('positiveValue')}
                    </Typography>
                </Stack>
            );
        }
    };

    function handleClose(): void {
        setEnterpriseName(lot.artisan_id ? lot.artisan_id.id : undefined);
        setAmountHT(lot.amount_HT ? convertToUiValue(lot.amount_HT) : undefined);
        setAmountTTC(lot.amount_TTC ? convertToUiValue(lot.amount_TTC) : undefined);
        setModifyLotModal(false);
    }

    function modifyLot(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="606px"
                title={t('modifyLot')}
                subtitle={t('modifyLotDescription')}
                open={modifyLotModal}
                onClick={async (): Promise<void> => {
                    try {
                        {
                            artisanData?.map(async (artisan) => {
                                const res = await getUserAccessByUserId(artisan.id);
                                if (res) {
                                    for (const ele of res) {
                                        await removeAccess(ele.id);
                                    }
                                }
                            });
                        }
                        await updateArtisan(
                            lot.id,
                            enterpriseName!,
                            convertToDbValue(amountHT!),
                            convertToDbValue(amountTTC!)
                        );
                        await addAccess(enterpriseName!, id!, true);
                        setModifyLotModal(false);
                        onSave();
                        setIsChanged(false);
                    } catch (e) {
                        console.log(e);
                        setModifyLotModal(false);
                    }
                }}
                onClose={handleClose}
                onSecondaryButtonClick={handleClose}
                primaryButtonEnabled={isChanged}
                primaryButton={t('modifyButtonTitle')}
                primaryButtonType="primary"
                secondaryButton={t('return')}>
                <>
                    <TextField
                        type={'text'}
                        sx={{ marginTop: '12px' }}
                        fullWidth
                        required={true}
                        value={lot.title}
                        label={t('lotNameLabel')}
                        inputProps={{ readOnly: true }}
                    />
                    <FormControl sx={{ marginTop: '12px' }} fullWidth>
                        <InputLabel required id="enterprise">
                            {t('enterprise')}
                        </InputLabel>
                        <Select
                            required
                            labelId="enterprise"
                            label={t('enterprise')}
                            fullWidth
                            value={enterpriseName ?? ''}
                            onChange={(e): void => {
                                setEnterpriseName(e.target.value);
                            }}>
                            {artisanData?.map((artisan) =>
                                artisan.artisan_profession.map((item) => {
                                    if (item.profession === lot.title) {
                                        return (
                                            <MenuItem key={artisan.id} value={artisan.id}>
                                                <Typography variant="body2">
                                                    {artisan.first_name} {artisan.last_name},{' '}
                                                    {artisan.company_name}
                                                </Typography>
                                            </MenuItem>
                                        );
                                    }
                                })
                            )}
                        </Select>
                    </FormControl>
                    <WRTextField
                        margin="12px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={amountHT}
                        onValueChange={(value: number | undefined): void => {
                            setAmountHT(value);
                        }}
                        fullWidth
                        label={t('amountWithoutTax')}
                    />

                    <WRTextField
                        margin="12px 0 0 0"
                        required
                        isMoney
                        float
                        requiredValue={amountTTC}
                        onValueChange={(value: number | undefined): void => {
                            setAmountTTC(value);
                        }}
                        fullWidth
                        label={t('amountWithTax')}
                    />
                    {(amountTTC ?? 0) < (amountHT ?? 0) ? (
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
        <>
            {modifyLot()}
            <TableRow>
                <TableCell>
                    <Box
                        sx={{ marginTop: '7px' }}
                        width={'0px'}
                        onClick={(): void => {
                            setIsCollapse(!isCollapse);
                        }}>
                        {!isCollapse ? (
                            <ChevronDown color={theme.palette.secondary.medium} />
                        ) : (
                            <ChevronUp color={theme.palette.secondary.medium} />
                        )}
                    </Box>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">{lot.title}</Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: '400px' }}>
                    <Typography variant="body2">{lot.artisan_id?.company_name}</Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">
                        {t('currency', { price: amountHT ?? 0 })}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">
                        {t('currency', { price: amountTTC ?? 0 })}
                    </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: '114px' }}>
                    <Button
                        variant={'outlined'}
                        onClick={(): void => {
                            setModifyLotModal(true);
                        }}
                        sx={{
                            width: '60%'
                        }}>
                        {t('modifyButtonTitle')}
                    </Button>
                </TableCell>
            </TableRow>
            {isCollapse &&
                lot.budgets?.map((budget) => {
                    return (
                        <TableRow key={budget.id}>
                            <TableCell
                                padding="none"
                                sx={{
                                    padding: '4px 16px'
                                }}></TableCell>
                            <TableCell padding="none" sx={{ padding: '4px 16px' }}>
                                <Stack direction="row">
                                    {colouredBox(budget.value_type)}
                                    <Typography variant="body2" sx={{ margin: 'auto 0' }}>
                                        {budget.entitled}
                                    </Typography>
                                </Stack>
                            </TableCell>
                            <TableCell padding="none" sx={{ padding: '4px 16px' }}>
                                <Typography variant="body2">-</Typography>
                            </TableCell>
                            <TableCell padding="none" sx={{ padding: '4px 16px' }}>
                                <Typography variant="body2">
                                    {t('currency', { price: convertToUiValue(budget.unit_price) })}
                                </Typography>
                            </TableCell>
                            <TableCell padding="none" sx={{ padding: '4px 16px' }}>
                                <Typography variant="body2">
                                    {t('currency', {
                                        price: convertToUiValue(budget.unit_price_with_tax)
                                    })}
                                </Typography>
                            </TableCell>
                            <TableCell
                                padding="none"
                                sx={{
                                    minWidth: '114px',
                                    padding: '4px 16px'
                                }}>
                                <img
                                    src={redCross}
                                    alt="redCross"
                                    style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                                    onClick={async (): Promise<void> => {
                                        await deleteValue(budget.id);
                                        onSave();
                                    }}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
        </>
    );
};
