import { Box, Stack, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../theme/palette';
import { User } from '../../profile/models/User';
import { getSubscribedUsers } from '../services/DashboardService';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { CircularBackground } from './CircularBackground';

export function AdminDashboardStats(): React.ReactElement {
    const { t } = useTranslation();
    const mountedRef = useRef(true);
    const [allSubscribedUsers, setAllSubscribedUsers] = useState<User[]>();
    const [countOfTrial, setCountOfTrial] = useState<number>();
    const [individualUsers, setIndividualUsers] = useState<number>();
    const [countOfTeam, setCountOfTeam] = useState<number>();
    const [loading, setLoading] = useState<boolean>();

    const prepareData = async (): Promise<void> => {
        setLoading(true);
        if (mountedRef.current) {
            const subscribedUsers = await getSubscribedUsers();
            setAllSubscribedUsers(subscribedUsers);
        }
    };

    useEffect(() => {
        if (
            countOfTeam !== undefined &&
            countOfTrial !== undefined &&
            individualUsers !== undefined
        ) {
            setLoading(false);
        }
    }, [countOfTeam, countOfTrial, individualUsers]);

    useEffect(() => {
        if (mountedRef.current) {
            prepareData();
        }
        return (): void => {
            setLoading(false);
        };
    }, [mountedRef.current]);

    useEffect(() => {
        if (allSubscribedUsers) {
            const count = allSubscribedUsers.filter(
                (user) => user.subscription_plan_id && user.subscription_plan_id.is_trial
            ).length;
            setCountOfTrial(count);
        }
    }, [allSubscribedUsers]);

    useEffect(() => {
        if (allSubscribedUsers) {
            const nonTrialUsers = allSubscribedUsers.filter(
                (user) => user.subscription_plan_id && !user.subscription_plan_id.is_trial
            );
            const proNonTrialUsers: User[] = [];
            const nonProNonTrialUsers: User[] = [];

            nonTrialUsers.map((user) => {
                if (user.subscription_plan_id && user.subscription_plan_id.is_pro) {
                    proNonTrialUsers.push(user);
                } else if (user.subscription_plan_id && !user.subscription_plan_id.is_pro) {
                    nonProNonTrialUsers.push(user);
                }
            });

            setIndividualUsers(nonProNonTrialUsers.length);
            setCountOfTeam(proNonTrialUsers.length);
        }
        return (): void => {
            mountedRef.current = false;
        };
    }, [allSubscribedUsers]);

    const RenderAdminDashboardStats = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return (
                <Stack
                    height="100%"
                    width="100%"
                    direction="row"
                    paddingLeft="36px"
                    alignItems="center">
                    <Stack>
                        <Stack direction="row" alignItems="center">
                            {CircularBackground(`${countOfTrial}`)}
                            <Box width="15px" />
                            <Typography color={NEUTRAL.medium} variant="body2">
                                {t('clientsInTrial')}
                            </Typography>
                        </Stack>
                        <Box height="24px" />
                        <Stack direction="row" alignItems="center">
                            {CircularBackground(`${countOfTeam}`)}
                            <Box width="15px" />
                            <Typography color={NEUTRAL.medium} variant="body2">
                                {t('teamSubscriptionDashboard')}
                            </Typography>
                        </Stack>
                    </Stack>
                    <Box width="74px" />
                    <Stack>
                        <Stack direction="row" alignItems="center">
                            {CircularBackground(`${individualUsers}`)}
                            <Box width="15px" />
                            <Typography color={NEUTRAL.medium} variant="body2">
                                {t('independentSubscriptionDashboard')}
                            </Typography>
                        </Stack>
                        <Box height="24px" />
                        <Stack direction="row" alignItems="center">
                            {CircularBackground('0%')}
                            <Box width="15px" />
                            <Typography color={NEUTRAL.medium} variant="body2">
                                {t('TrialToSubConversions')}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            );
        }
    };

    return <RenderAdminDashboardStats />;
}
