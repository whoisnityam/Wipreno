import React from 'react';
import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../../theme/palette';
import { Lot } from '../../models/Lot';
import { User } from '../../../profile/models/User';
import { CompanyHeader } from '../../../../components/CompanyHeader';
import { SelectedOption } from '../../models/ExportSelectOption';
import { fontWeightSemiBold, FONT_PRIMARY } from '../../../../theme/typography';
import { convertToUiValue } from '../../../../utils';
import { Project } from '../../models/Project';

interface ExportEstimationProps {
    lots: Lot[];
    companyLogo: string;
    userInfo: User | null;
    clientInfo: User | undefined;
    project: Project | undefined;
    selectedChoice: string;
}

export function ExportWorkEstimation({
    lots,
    companyLogo,
    userInfo,
    clientInfo,
    project,
    selectedChoice
}: ExportEstimationProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();

    const letterHead = (): React.ReactElement => {
        return (
            <Box
                mb={3}
                sx={{
                    backgroundColor: NEUTRAL.lighter,
                    width: '100%'
                }}>
                <CompanyHeader
                    bgColor={`${NEUTRAL.white} !important`}
                    companyLogo={companyLogo}
                    logoSize={'100px'}
                    userInfo={userInfo}
                    clientInfo={clientInfo}
                    projectAddress={{
                        address: project?.address,
                        postal_code: project?.postal_code,
                        city: project?.city
                    }}
                    customFontStyle={{
                        fontSize: '14px !important',
                        fontWeight: fontWeightSemiBold,
                        fontFamily: FONT_PRIMARY
                    }}
                    outerBoxStyle={{
                        paddingLeft: '0px !important',
                        paddingRight: '0px !important'
                    }}
                />
            </Box>
        );
    };

    const calculateTotalWithoutTax = (unitPrice: number, quantity: number): number => {
        return convertToUiValue(unitPrice) * convertToUiValue(quantity);
    };

    const calculateTotalWithTax = (unitPrice: number, quantity: number, tax: number): number => {
        return (
            convertToUiValue(unitPrice) * convertToUiValue(quantity) +
            (convertToUiValue(unitPrice) * convertToUiValue(quantity) * convertToUiValue(tax)) / 100
        );
    };

    const calculateLotWithoutTax = (lot: Lot): number => {
        let totalHT = 0;
        if (lot.estimation_tasks && lot.estimation_tasks?.length > 0) {
            lot.estimation_tasks?.map((task) => {
                if (task.unit_price && task.quantity) {
                    totalHT = totalHT + calculateTotalWithoutTax(task.unit_price, task.quantity);
                }
            });
        }
        return totalHT;
    };

    const calculateLotWithTax = (lot: Lot): number => {
        let totalTTC = 0;
        if (lot.estimation_tasks && lot.estimation_tasks?.length > 0) {
            lot.estimation_tasks?.map((task) => {
                if (task.unit_price && task.quantity) {
                    totalTTC =
                        totalTTC + calculateTotalWithTax(task.unit_price, task.quantity, task.tax);
                }
            });
        }
        return totalTTC;
    };

    const taskWithPrice = (): React.ReactElement => {
        return (
            <React.Fragment>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <Typography variant="h5">{t('workEstimation')}</Typography>
                </Box>
                {lots &&
                    lots.map((lot, index) => {
                        return (
                            <React.Fragment key={index}>
                                <Table aria-label="task table" style={{ tableLayout: 'fixed' }}>
                                    <TableHead
                                        sx={{
                                            marginBottom: '8px'
                                        }}>
                                        <TableRow
                                            sx={{ borderBottom: `1px solid ${NEUTRAL.black}` }}>
                                            <TableCell variant={'body'} sx={{ width: '250px' }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight="fontWeightBold"
                                                    sx={{
                                                        color: NEUTRAL.darker,
                                                        wordWrap: 'break-all'
                                                    }}>
                                                    {lot.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell variant={'body'}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight="fontWeightBold"
                                                    sx={{ color: NEUTRAL.darker }}>
                                                    {t('unit')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell variant={'body'}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight="fontWeightBold"
                                                    sx={{ color: NEUTRAL.darker }}>
                                                    {t('quantity')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell variant={'body'}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight="fontWeightBold"
                                                    sx={{ color: NEUTRAL.darker }}>
                                                    {t('pUExcludingTax')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell variant={'body'}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight="fontWeightBold"
                                                    sx={{ color: NEUTRAL.darker }}>
                                                    {t('vat')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell variant={'body'}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight="fontWeightBold"
                                                    sx={{ color: NEUTRAL.darker }}>
                                                    {t('pTotExcludingTax')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell variant={'body'}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight="fontWeightBold"
                                                    sx={{ color: NEUTRAL.darker }}>
                                                    {t('pTotIncludingTax')}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {lot &&
                                            lot.estimation_tasks &&
                                            lot.estimation_tasks.map((task, taskIndex) => {
                                                return (
                                                    <TableRow
                                                        key={taskIndex}
                                                        sx={{
                                                            borderBottom:
                                                                lot.estimation_tasks &&
                                                                taskIndex + 1 ===
                                                                    lot.estimation_tasks.length
                                                                    ? `1px solid ${NEUTRAL.darker}`
                                                                    : ''
                                                        }}>
                                                        <TableCell
                                                            variant={'body'}
                                                            sx={{ width: '250px' }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight={
                                                                    theme.typography.fontWeightBold
                                                                }
                                                                sx={{ wordBreak: 'break-all' }}
                                                                color={NEUTRAL.medium}>
                                                                {task.title}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell variant={'body'}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight={
                                                                    theme.typography.fontWeightBold
                                                                }
                                                                color={NEUTRAL.medium}>
                                                                {task.unit ?? ''}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell variant={'body'}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight={
                                                                    theme.typography.fontWeightBold
                                                                }
                                                                color={NEUTRAL.medium}>
                                                                {convertToUiValue(task.quantity)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight={
                                                                    theme.typography.fontWeightBold
                                                                }
                                                                color={NEUTRAL.medium}>
                                                                {convertToUiValue(task.unit_price)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight={
                                                                    theme.typography.fontWeightBold
                                                                }
                                                                color={NEUTRAL.medium}>
                                                                {convertToUiValue(task.tax)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell variant={'body'}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight={
                                                                    theme.typography.fontWeightBold
                                                                }
                                                                sx={{
                                                                    wordBreak:
                                                                        calculateTotalWithoutTax(
                                                                            task.unit_price!,
                                                                            task.quantity!
                                                                        ).toString().length > 7
                                                                            ? 'break-word'
                                                                            : ''
                                                                }}
                                                                color={NEUTRAL.medium}>
                                                                {task.unit_price && task.quantity
                                                                    ? calculateTotalWithoutTax(
                                                                          task.unit_price,
                                                                          task.quantity
                                                                      )
                                                                    : ''}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell variant={'body'}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight={
                                                                    theme.typography.fontWeightBold
                                                                }
                                                                sx={{
                                                                    wordBreak:
                                                                        calculateTotalWithTax(
                                                                            task.unit_price!,
                                                                            task.quantity!,
                                                                            task.tax!
                                                                        ).toString().length > 7
                                                                            ? 'break-word'
                                                                            : ''
                                                                }}
                                                                color={NEUTRAL.medium}>
                                                                {task.unit_price && task.quantity
                                                                    ? calculateTotalWithTax(
                                                                          task.unit_price,
                                                                          task.quantity,
                                                                          task.tax
                                                                      )
                                                                    : ''}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        <TableRow>
                                            <TableCell variant={'body'}></TableCell>
                                            <TableCell variant={'body'}></TableCell>
                                            <TableCell variant={'body'}></TableCell>
                                            <TableCell variant={'body'}></TableCell>
                                            <TableCell variant={'body'}></TableCell>
                                            <TableCell variant={'body'} sx={{ width: '200px' }}>
                                                <Box sx={{ marginLeft: '30px' }}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight={theme.typography.fontWeightBold}
                                                        sx={{
                                                            wordBreak:
                                                                calculateLotWithoutTax(
                                                                    lot
                                                                ).toString().length > 7
                                                                    ? 'break-all'
                                                                    : '',
                                                            width: '200px'
                                                        }}
                                                        color={NEUTRAL.darker}>
                                                        {`${calculateLotWithoutTax(lot)} ${t(
                                                            'euroIcon'
                                                        )} ${'HT'}`}
                                                    </Typography>
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight={theme.typography.fontWeightBold}
                                                        sx={{
                                                            wordBreak:
                                                                calculateLotWithTax(lot).toString()
                                                                    .length > 7
                                                                    ? 'break-all'
                                                                    : '',
                                                            width: '200px'
                                                        }}
                                                        color={NEUTRAL.darker}>
                                                        {`${calculateLotWithTax(lot)} ${t(
                                                            'euroIcon'
                                                        )} ${'TTC'}`}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell variant={'body'}></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </React.Fragment>
                        );
                    })}
            </React.Fragment>
        );
    };

    const lotWithPrice = (): React.ReactElement => {
        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <Typography variant="h5">{t('workEstimation')}</Typography>
                </Box>
                {lots &&
                    lots.map((lot, index) => {
                        return (
                            <Table
                                aria-label="lots table"
                                key={index}
                                style={{ tableLayout: 'fixed' }}>
                                <TableHead
                                    sx={{
                                        marginBottom: '8px'
                                    }}>
                                    <TableRow sx={{ borderBottom: `1px solid ${NEUTRAL.black}` }}>
                                        <TableCell variant={'body'} sx={{ width: '470px' }}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="fontWeightBold"
                                                sx={{
                                                    color: NEUTRAL.darker,
                                                    wordWrap: 'break-all'
                                                }}>
                                                {lot.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell variant={'body'}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="fontWeightBold"
                                                sx={{ color: NEUTRAL.darker }}>
                                                {t('unit')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell variant={'body'}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="fontWeightBold"
                                                sx={{ color: NEUTRAL.darker }}>
                                                {t('quantity')}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lot &&
                                        lot.estimation_tasks &&
                                        lot.estimation_tasks.map((task, taskIndex) => {
                                            return (
                                                <TableRow
                                                    key={taskIndex}
                                                    sx={{
                                                        borderBottom:
                                                            lot.estimation_tasks &&
                                                            taskIndex + 1 ===
                                                                lot.estimation_tasks.length
                                                                ? `1px solid ${NEUTRAL.black}`
                                                                : ''
                                                    }}>
                                                    <TableCell
                                                        variant={'body'}
                                                        sx={{ width: '470px' }}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            fontWeight={
                                                                theme.typography.fontWeightBold
                                                            }
                                                            sx={{ wordBreak: 'break-all' }}
                                                            color={NEUTRAL.medium}>
                                                            {task.title}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell variant={'body'}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            fontWeight={
                                                                theme.typography.fontWeightBold
                                                            }
                                                            color={NEUTRAL.medium}>
                                                            {task.unit ?? ''}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell variant={'body'}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            fontWeight={
                                                                theme.typography.fontWeightBold
                                                            }
                                                            color={NEUTRAL.medium}>
                                                            {convertToUiValue(task.quantity)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    <TableRow>
                                        <TableCell variant={'body'}></TableCell>
                                        <TableCell variant={'body'}></TableCell>
                                        <TableCell variant={'body'}>
                                            <Box
                                                sx={{
                                                    display:
                                                        selectedChoice ===
                                                        SelectedOption.withoutPrices
                                                            ? 'none'
                                                            : 'block'
                                                }}>
                                                <Stack alignItems="flex-end">
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight={theme.typography.fontWeightBold}
                                                        color={NEUTRAL.darker}>
                                                        {`${calculateLotWithoutTax(lot)} ${t(
                                                            'euroIcon'
                                                        )} ${'HT'}`}
                                                    </Typography>
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight={theme.typography.fontWeightBold}
                                                        color={NEUTRAL.darker}>
                                                        {`${calculateLotWithTax(lot)} ${t(
                                                            'euroIcon'
                                                        )} ${'TTC'}`}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        );
                    })}
            </Box>
        );
    };

    const displayData = (): React.ReactElement => {
        if (selectedChoice === SelectedOption.withPriceDisplayedByTask) {
            return taskWithPrice();
        } else {
            return lotWithPrice();
        }
    };

    const reportContents = (): React.ReactElement => {
        return (
            <Box>
                {letterHead()}
                {displayData()}
            </Box>
        );
    };
    return <Box>{reportContents()}</Box>;
}
