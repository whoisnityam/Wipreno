import React from 'react';
import {
    Box,
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
import { fontWeightSemiBold, FONT_PRIMARY } from '../../../../theme/typography';
import { convertToUiValue } from '../../../../utils';
import { Project } from '../../models/Project';

interface ExportReportProps {
    lots: Lot[];
    companyLogo: string;
    userInfo: User | null;
    clientInfo: User | undefined;
    project: Project | undefined;
    hasCompanyHeader: boolean;
}

export function ExportMaterialPdf({
    lots,
    companyLogo,
    userInfo,
    clientInfo,
    project,
    hasCompanyHeader
}: ExportReportProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();

    const letterHead = (): React.ReactElement => {
        return (
            <Box
                mt={2}
                mb={3}
                sx={{
                    backgroundColor: NEUTRAL.lighter,
                    display: hasCompanyHeader ? 'inline-block' : 'none',
                    width: '100%'
                }}>
                <CompanyHeader
                    bgColor={`${NEUTRAL.white} !important`}
                    companyLogo={companyLogo}
                    logoSize={'100px'}
                    userInfo={userInfo}
                    clientInfo={clientInfo}
                    customFontStyle={{
                        fontSize: '14px !important',
                        fontWeight: fontWeightSemiBold,
                        fontFamily: FONT_PRIMARY
                    }}
                    projectAddress={{
                        address: project?.address,
                        postal_code: project?.postal_code,
                        city: project?.city
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

    const lotHasTaskWithMaterial = (currentLot: Lot): boolean => {
        let hasMaterialTask = false;
        if (currentLot.estimation_tasks) {
            currentLot.estimation_tasks.forEach((task) => {
                if (task.materials) {
                    hasMaterialTask = true;
                }
            });
        }
        return hasMaterialTask;
    };

    const renderInformation = (): React.ReactElement => {
        return (
            <React.Fragment>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <Typography variant="h5">{t('workEstimation')}</Typography>
                </Box>
                {lots &&
                    lots.map((lot, index) => {
                        if (
                            lot.estimation_tasks &&
                            lot.estimation_tasks.length > 0 &&
                            lotHasTaskWithMaterial(lot)
                        ) {
                            return (
                                <Box
                                    key={index}
                                    style={{
                                        display:
                                            lot.estimation_tasks && lot.estimation_tasks.length > 0
                                                ? ''
                                                : 'none'
                                    }}>
                                    <Table style={{ tableLayout: 'fixed' }}>
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
                                                            wordWrap: 'break-word'
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
                                                    if (task.materials) {
                                                        return (
                                                            <TableRow key={taskIndex}>
                                                                <TableCell
                                                                    variant={'body'}
                                                                    sx={{ width: '250px' }}>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        fontWeight={
                                                                            theme.typography
                                                                                .fontWeightBold
                                                                        }
                                                                        sx={{
                                                                            wordBreak: 'break-all'
                                                                        }}
                                                                        color={NEUTRAL.medium}>
                                                                        {task.title}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell variant={'body'}>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        fontWeight={
                                                                            theme.typography
                                                                                .fontWeightBold
                                                                        }
                                                                        color={NEUTRAL.medium}>
                                                                        {task.unit ?? ''}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell variant={'body'}>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        fontWeight={
                                                                            theme.typography
                                                                                .fontWeightBold
                                                                        }
                                                                        color={NEUTRAL.medium}>
                                                                        {convertToUiValue(
                                                                            task.quantity
                                                                        )}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        fontWeight={
                                                                            theme.typography
                                                                                .fontWeightBold
                                                                        }
                                                                        color={NEUTRAL.medium}>
                                                                        {convertToUiValue(
                                                                            task.unit_price
                                                                        )}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        fontWeight={
                                                                            theme.typography
                                                                                .fontWeightBold
                                                                        }
                                                                        color={NEUTRAL.medium}>
                                                                        {convertToUiValue(task.tax)}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell variant={'body'}>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        fontWeight={
                                                                            theme.typography
                                                                                .fontWeightBold
                                                                        }
                                                                        sx={{
                                                                            wordBreak:
                                                                                calculateTotalWithoutTax(
                                                                                    task.unit_price!,
                                                                                    task.quantity!
                                                                                ).toString()
                                                                                    .length > 7
                                                                                    ? 'break-word'
                                                                                    : ''
                                                                        }}
                                                                        color={NEUTRAL.medium}>
                                                                        {task.unit_price &&
                                                                        task.quantity
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
                                                                            theme.typography
                                                                                .fontWeightBold
                                                                        }
                                                                        sx={{
                                                                            wordBreak:
                                                                                calculateTotalWithTax(
                                                                                    task.unit_price!,
                                                                                    task.quantity!,
                                                                                    task.tax!
                                                                                ).toString()
                                                                                    .length > 7
                                                                                    ? 'break-word'
                                                                                    : ''
                                                                        }}
                                                                        color={NEUTRAL.medium}>
                                                                        {task.unit_price &&
                                                                        task.quantity
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
                                                    } else {
                                                        return <></>;
                                                    }
                                                })}
                                        </TableBody>
                                        <TableRow
                                            sx={{
                                                height: '30px',
                                                width: '100%',
                                                borderTop: `1px solid ${NEUTRAL.black}`
                                            }}></TableRow>
                                    </Table>
                                </Box>
                            );
                        } else {
                            return <></>;
                        }
                    })}
            </React.Fragment>
        );
    };

    const reportContents = (): React.ReactElement => {
        return (
            <Box>
                {letterHead()}
                {renderInformation()}
            </Box>
        );
    };
    return <Box>{reportContents()}</Box>;
}
