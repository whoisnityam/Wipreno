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
import { Report } from '../../models/Report';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../../theme/palette';
import { LotViewDataForReport } from '../../models/Lot';
import { User } from '../../../profile/models/User';
import { CompanyHeader } from '../../../../components/CompanyHeader';
import '../PrintPdf/toPrint.css';
import { fontWeightSemiBold, FONT_PRIMARY } from '../../../../theme/typography';
import { Project } from '../../models/Project';
import { getFileURL } from '../../../../utils';

interface ExportReportProps {
    reportDetails: Report;
    lots: LotViewDataForReport[];
    companyLogo: string;
    userInfo: User | null;
    clientInfo: User | undefined;
    project: Project | undefined;
    hasCompanyHeader: boolean;
}

export function ExportReport({
    reportDetails,
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
                pb={2}
                mb={3}
                sx={{
                    display: hasCompanyHeader ? 'inline-block' : 'none',
                    width: '100%'
                }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="h5">{t('siteReport')}</Typography>
                </Box>
                <CompanyHeader
                    bgColor={NEUTRAL.white}
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

    const details = (): React.ReactElement => {
        return (
            <Table aria-label="projects table">
                <TableHead
                    sx={{
                        border: `2px solid ${NEUTRAL.darker}`,
                        borderRadius: '4px',
                        borderCollapse: 'unset',
                        marginBottom: '8px'
                    }}>
                    <TableRow>
                        <TableCell variant={'head'}>{t('lotTableHeader')}</TableCell>
                        <TableCell variant={'head'}>{t('enterprise')}</TableCell>
                        <TableCell variant={'head'}>{t('mail')}</TableCell>
                        <TableCell variant={'head'}>{t('number')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {lots &&
                        lots.map((lot, index) => {
                            return (
                                <TableRow
                                    key={index}
                                    sx={{
                                        borderBottom:
                                            index + 1 < lots.length
                                                ? `2px solid ${NEUTRAL.darker}`
                                                : ''
                                    }}>
                                    <TableCell variant={'body'}>
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight={theme.typography.fontWeightBold}
                                            color={NEUTRAL.darker}>
                                            {lot.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell variant={'body'}>
                                        {lot.artisan_id?.company_name ?? ''}
                                    </TableCell>
                                    <TableCell variant={'body'}>
                                        {lot.artisan_id?.email ?? ''}
                                    </TableCell>
                                    <TableCell variant={'body'}>
                                        {lot.artisan_id?.phone ?? ''}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        );
    };

    const renderInformation = (): React.ReactElement => {
        return (
            <Box p={2}>
                {lots &&
                    lots.map((lot, index) => {
                        return (
                            <Box
                                pb={2}
                                key={index}
                                sx={{
                                    borderBottom:
                                        index + 1 < lots.length ? `2px solid ${NEUTRAL.darker}` : ''
                                }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={theme.typography.fontWeightBold}
                                    color={NEUTRAL.darker}>
                                    {lot.title}
                                </Typography>
                                {reportDetails.items.map((item, reportItemIndex) => {
                                    return (
                                        <Box
                                            key={reportItemIndex}
                                            sx={{
                                                display: item.lot_id === lot.id ? 'block' : 'none'
                                            }}>
                                            <Stack
                                                direction="row"
                                                flexWrap="wrap"
                                                sx={{
                                                    marginTop: '1rem',
                                                    display: 'block',
                                                    pageBreakBefore: 'auto',
                                                    pageBreakAfter: 'auto',
                                                    pageBreakInside: 'avoid'
                                                }}>
                                                <Typography
                                                    mb={2}
                                                    variant="subtitle2"
                                                    color={NEUTRAL.darker}
                                                    sx={{
                                                        marginTop: '30px',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                    {item.comment}
                                                </Typography>
                                                {item.attachments.map((attachment) => {
                                                    return (
                                                        <Box
                                                            key={attachment.id}
                                                            sx={{
                                                                pageBreakBefore: 'auto',
                                                                pageBreakAfter: 'auto',
                                                                pageBreakInside: 'avoid',
                                                                display: 'inline-flex'
                                                            }}>
                                                            <img
                                                                alt="Attachment"
                                                                src={getFileURL(attachment.file.id)}
                                                                style={{
                                                                    marginRight: '10px',
                                                                    maxHeight: '500px',
                                                                    maxWidth: '300px'
                                                                }}
                                                            />
                                                        </Box>
                                                    );
                                                })}
                                            </Stack>
                                        </Box>
                                    );
                                })}
                            </Box>
                        );
                    })}
            </Box>
        );
    };

    const reportContents = (): React.ReactElement => {
        return (
            <Box>
                {!hasCompanyHeader ? (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginBottom: '60px'
                            }}>
                            <Box sx={{ display: 'inline-block' }}>
                                <Typography variant="h5">{t('siteReport')}</Typography>
                            </Box>
                        </Box>
                    </>
                ) : (
                    <></>
                )}

                {letterHead()}
                {details()}
                {renderInformation()}
            </Box>
        );
    };
    return <Box>{reportContents()}</Box>;
}
