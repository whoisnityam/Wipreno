import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../../theme/palette';
import { WorkTableRow } from './WorkTableRow';
import { Lot } from '../../models/Lot';
import { body3, small1, small2 } from '../../../../theme/typography';
import { convertToUiValue } from '../../../../utils';

interface WorkTableProps {
    lots: Lot[];
    onSave: Function;
}

export const WorkTable = ({
    lots,
    onSave = (): void => {}
}: WorkTableProps): React.ReactElement => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    const labelField = (label: string, value: string): React.ReactElement => {
        return (
            <Stack direction={'row'}>
                <Typography sx={{ ...small2 }} color={NEUTRAL.medium}>
                    {label}:{' '}
                </Typography>
                <Typography sx={{ ...body3 }} color={NEUTRAL.medium}>
                    {value}
                </Typography>
            </Stack>
        );
    };

    const responsive = (): React.ReactElement => {
        return (
            <Stack sx={{ marginTop: '24px' }} spacing={'16px'}>
                {lots.map((lot) => {
                    return (
                        <Box
                            key={lot.id}
                            sx={{
                                border: `1px solid ${theme.palette.grey['100']}`,
                                borderRadius: '4px',
                                padding: '12px'
                            }}>
                            <Typography sx={{ ...small1 }} color={NEUTRAL.darker}>
                                {lot.title}
                            </Typography>
                            <Typography
                                sx={{ ...body3, marginBottom: '8px' }}
                                color={NEUTRAL.medium}>
                                {lot.artisan_id?.company_name}
                            </Typography>
                            {labelField(
                                t('amountWithoutTax'),
                                t('currency', { price: convertToUiValue(lot.amount_HT) })
                            )}
                            {labelField(
                                t('amountWithTax'),
                                t('currency', { price: convertToUiValue(lot.amount_TTC) })
                            )}
                        </Box>
                    );
                })}
            </Stack>
        );
    };
    const desktop = (): React.ReactElement => {
        return (
            <>
                {lots && lots.length > 0 && (
                    <Box marginTop={'32px'}>
                        <Table
                            sx={{
                                border: `1px solid ${NEUTRAL.light}`,
                                borderRadius: '4px',
                                borderCollapse: 'unset'
                            }}
                            aria-label="artisans table">
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>{t('lotTableHeader')}</TableCell>
                                    <TableCell>{t('craftsmen')}</TableCell>
                                    <TableCell>{t('amountWithoutTax')}</TableCell>
                                    <TableCell>{t('amountWithTax')}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lots?.map((lot) => {
                                    return <WorkTableRow lot={lot} key={lot.id} onSave={onSave} />;
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                )}
            </>
        );
    };

    return <>{isLarge ? desktop() : responsive()}</>;
};
