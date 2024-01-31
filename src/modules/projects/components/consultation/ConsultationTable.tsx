import React, { useState } from 'react';
import { WRTable } from '../../../../components/WRTable';
import { Consultation } from '../../models/Consultation';
import { useTranslation } from 'react-i18next';
import { WRSwitch } from '../../../../components/switch/WRSwitch';
import { Box, Button, Checkbox, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { modifyConsultation, resendConsultationEmail } from '../../services/ConsultationServices';
import { APP_BASE_URL } from '../../../../services/ApiService';
import { body3, small1, small2 } from '../../../../theme/typography';
import { NEUTRAL, SwitchColor } from '../../../../theme/palette';

interface ConsultationTableProps {
    consultations: Consultation[];
}

export function ConsultationTable({ consultations }: ConsultationTableProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const [consultationList, setConsultationList] = useState(consultations);
    const getUrl = (consultationId: string): string => {
        return APP_BASE_URL + '/consultation-response' + '?consultationId=' + consultationId;
    };

    const formatDate = (inputDate: string): string => {
        if (inputDate) {
            const date = new Date(inputDate);
            const d = date.toString();
            const localDate = new Date(d);
            return `${localDate.getDate()}.${localDate.getMonth() + 1}.${localDate.getFullYear()}`;
        } else {
            return '';
        }
    };

    const handleResendMail = async (consultation: Consultation): Promise<void> => {
        await resendConsultationEmail(
            consultation.artisian_id.email,
            getUrl(consultation.id),
            `${t('consultationForProject')} ${consultation.project_id.name}`,
            consultation.project_id.name,
            consultation.project_id.enterprise_id.name
        );
    };

    const tableHeaders = [
        t('lotTableHeader'),
        t('companyNameTableHeader'),
        t('responseTableHeader'),
        t('visiteTableHeader'),
        t('slotTableHeader'),
        t('quoteReceivedTableHeader'),
        t('relanceTableHeader')
    ];

    const getSlotTime = (consultation: Consultation): string => {
        if (consultation.selected_slot_time && consultation.selected_slot_time !== 'none') {
            let slotTiming = '',
                formattedSlotTime = '';
            formattedSlotTime = consultation.selected_slot_time.replace(':', 'H');
            slotTiming =
                consultation.selected_slot_time && consultation.selected_slot_time !== 'none'
                    ? `${formatDate(consultation.selected_slot?.start_time)} - ${formattedSlotTime}`
                    : formatDate(consultation.selected_slot?.start_time);
            return slotTiming;
        } else if (consultation.selected_slot_time === 'none') {
            return t('notAvailabeCallBack');
        } else {
            return '';
        }
    };

    const getSwitchColor = (response: boolean): string => {
        if (response) {
            return SwitchColor.ON;
        } else if (response === false) {
            return SwitchColor.OFF;
        }
        return theme.palette.grey[100];
    };

    const tableBody = consultationList.map((consultation, index) => {
        return [
            consultation.lot_id.title,
            consultation.artisian_id?.company_name,
            <WRSwitch
                key={index}
                disabled
                value={consultation.has_response}
                color={getSwitchColor(consultation.has_response)}
                handleToggle={(): void => {}}
            />,
            <WRSwitch
                key={index}
                disabled
                value={consultation.has_visited}
                color={getSwitchColor(consultation.has_visited)}
                handleToggle={(): void => {}}
            />,
            getSlotTime(consultation),
            <Checkbox
                key={index}
                checked={consultation.has_received_estimate}
                onChange={async (): Promise<void> => {
                    consultationList[index].has_received_estimate =
                        !consultation.has_received_estimate;
                    setConsultationList([...consultationList]);
                    await modifyConsultation(
                        consultationList[index].id,
                        consultationList[index].has_response,
                        consultationList[index].has_visited,
                        consultationList[index].has_received_estimate
                    );
                }}
            />,
            <Button
                key={index}
                variant={'outlined'}
                color={'secondary'}
                fullWidth
                onClick={(): void => {
                    handleResendMail(consultation);
                }}>
                {t('relanceButtonTitle')}
            </Button>
        ];
    });

    const switchField = (title: string, value: boolean): React.ReactElement => {
        return (
            <Stack direction={'row'} spacing={'9px'} alignItems={'center'}>
                <Typography sx={{ ...small2 }} color={NEUTRAL.medium}>
                    {title}:
                </Typography>
                <WRSwitch
                    disabled
                    value={value}
                    color={getSwitchColor(value)}
                    handleToggle={(): void => {}}
                />
            </Stack>
        );
    };

    const responsiveTable = (): React.ReactElement[] => {
        return consultationList.map((consultation) => {
            return (
                <Stack key={consultation.id} sx={{ marginTop: '24px' }}>
                    <Box
                        sx={{
                            border: `1px solid ${theme.palette.grey['100']}`,
                            borderRadius: '4px',
                            padding: '12px'
                        }}>
                        <Typography sx={{ ...small1 }} color={NEUTRAL.darker}>
                            {consultation.lot_id.title}
                        </Typography>
                        <Typography sx={{ ...body3 }} color={NEUTRAL.medium}>
                            {`${consultation.artisian_id?.first_name ?? ''} ${
                                consultation.artisian_id?.last_name ?? ''
                            }`}
                        </Typography>
                        <Stack direction={'row'} justifyContent={'space-between'}>
                            {switchField(t('responseTableHeader'), consultation.has_response)}
                            {switchField(t('visiteTableHeader'), consultation.has_visited)}
                        </Stack>
                        {switchField(
                            t('quoteReceivedTableHeader'),
                            consultation.has_received_estimate
                        )}
                        <Stack direction={'row'} spacing={'9px'}>
                            <Typography sx={{ ...small2 }} color={NEUTRAL.medium}>
                                {t('slotTableHeader')}:
                            </Typography>
                            <Typography sx={{ ...small2 }} color={NEUTRAL.medium}>
                                {getSlotTime(consultation)}:
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
            );
        });
    };

    return <>{isLarge ? <WRTable headers={tableHeaders} body={tableBody} /> : responsiveTable()}</>;
}
