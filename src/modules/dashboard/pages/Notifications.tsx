import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, Chip, Grid, Stack, Typography } from '@mui/material';
import { ACCENT_SUNSET, BLUE, NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { getNotifications, markAsSeen } from '../services/DashboardService';
import { UserContext } from '../../../provider/UserProvider';
import { Notification } from '../models/Notification';
import { DashboardCards } from '../components/DashboardCards';
import { small2 } from '../../../theme/typography';
import { useNavigate } from 'react-router-dom';

export function Notifications(): React.ReactElement {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const mountedRef = useRef(true);

    const prepareData = useCallback(async () => {
        const data = await getNotifications(user.user!.enterprises.at(0)!.enterprise_id.id);
        if (!mountedRef.current) return null;
        setNotifications(
            data.filter(
                (item) => item.seen.find((obj) => obj.user_id.id === user.user!.id) === undefined
            )
        );
    }, []);

    useEffect(() => {
        if (user.user) {
            prepareData();
            return (): void => {
                mountedRef.current = false;
            };
        }
    }, []);

    const getChip = (notification: Notification): React.ReactElement => {
        if (notification.consultation_id) {
            return (
                <Chip
                    sx={{
                        color: BLUE.darker,
                        backgroundColor: BLUE.lighter,
                        borderRadius: 0,
                        ...small2
                    }}
                    label={t('consultationResponse')}
                />
            );
        } else {
            return (
                <Chip
                    sx={{
                        color: ACCENT_SUNSET.darker,
                        backgroundColor: ACCENT_SUNSET.lighter,
                        borderRadius: 0,
                        ...small2
                    }}
                    label={t('newDocument')}
                />
            );
        }
    };

    const onButtonClick = async (notificationItem: Notification): Promise<void> => {
        await markAsSeen(user.user!.id, notificationItem.id);
        if (notificationItem.consultation_id) {
            navigate(`/project/consultation/${notificationItem.consultation_id.project_id.id}`);
        } else {
            navigate(`/project/compte-rendu/${notificationItem.report_id.project_id.id}`);
        }
    };

    return (
        <Stack spacing={'10px'} width={'100%'} sx={{ paddingRight: { xs: '20px' } }}>
            <Typography variant="h3" sx={{ color: NEUTRAL.darker, paddingLeft: '20px' }}>
                {t('notifications')}
            </Typography>
            <Grid container spacing={'20px'} sx={{ width: '100%' }} justifyContent={'flex-start'}>
                {notifications.map((item) => (
                    <Grid item key={item.id}>
                        <DashboardCards
                            noPadding
                            sx={{
                                height: '136px',
                                width: { xs: '100%', sm: '360px' },
                                paddingLeft: '10px',
                                paddingTop: '10px'
                            }}>
                            <Stack spacing={'10px'}>
                                <Stack
                                    justifyContent={'space-between'}
                                    direction={'row'}
                                    alignItems={'center'}>
                                    {getChip(item)}
                                    <Button
                                        color={'secondary'}
                                        onClick={(): Promise<void> => onButtonClick(item)}>
                                        {t('seeMore')}
                                    </Button>
                                </Stack>
                                <Typography variant={'body2'} color={NEUTRAL.medium}>
                                    {t('notificationDescription', {
                                        type: item.consultation_id
                                            ? t('response')
                                            : t('newDocumentMessage'),
                                        firstName: item.user_id?.first_name,
                                        lastName: item.user_id?.last_name,
                                        objectName: item.consultation_id
                                            ? item.consultation_id.lot_id.title
                                            : ''
                                    })}
                                </Typography>
                            </Stack>
                        </DashboardCards>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    );
}
