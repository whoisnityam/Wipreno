import { Box, Button, MenuItem, Stack, Typography, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { WRTable } from '../../../components/WRTable';
import { JobTitles } from '../../../constants';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { HighlightBox } from '../../clients/components/HighlightBox';
import { getSubscribedUsers } from '../services/DashboardService';
import { User } from '../../profile/models/User';
import { Filter } from '../../projects/components/Filter';
import { CircularBackground } from '../components/CircularBackground';
import { ClientDetailsModal } from '../components/ClientDetailsModal';
import { fontWeightSemiBold, small2 } from '../../../theme/typography';

interface ClientFilters {
    subscriptionType: string;
    job: string;
}

export const AdminClients = (): React.ReactElement => {
    const { t } = useTranslation();
    const theme = useTheme();
    const mountedRef = useRef(true);
    const [allSubscribedUsers, setAllSubscribedUsers] = useState<User[]>();
    const [filteredUsers, setFilteredUsers] = useState<User[]>();
    const [countOfTrial, setCountOfTrial] = useState<number>();
    const [individualUsers, setIndividualUsers] = useState<User[]>();
    const [teamUsers, setTeamUsers] = useState<User[]>();
    const [loading, setLoading] = useState<boolean>(false);
    const all = 'Tous';
    const [filters, setFilters] = useState<ClientFilters>({
        subscriptionType: all,
        job: all
    });

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<User>();

    const updateFilters = (field: 'subscriptionType' | 'job', value: string): void => {
        if (field === 'subscriptionType') {
            setFilters({ subscriptionType: value, job: filters.job });
        } else if (field === 'job') {
            setFilters({ subscriptionType: filters.subscriptionType, job: value });
        }
    };

    const prepareData = async (): Promise<void> => {
        setLoading(true);
        if (mountedRef.current) {
            const subscribedUsers = await getSubscribedUsers();
            setAllSubscribedUsers(subscribedUsers);
        }
    };

    useEffect(() => {
        prepareData();
        return (): void => {
            setLoading(false);
        };
    }, [mountedRef.current]);

    useEffect(() => {
        if (
            countOfTrial !== undefined &&
            teamUsers !== undefined &&
            individualUsers !== undefined
        ) {
            setLoading(false);
        }
    }, [countOfTrial, teamUsers, individualUsers]);

    useEffect(() => {
        if (allSubscribedUsers) {
            const count = allSubscribedUsers.filter(
                (user) => user.subscription_plan_id && user.subscription_plan_id.is_trial
            ).length;
            setCountOfTrial(count);
        }
        return (): void => {
            mountedRef.current = false;
            setLoading(false);
        };
    }, [allSubscribedUsers]);

    // Stats logic
    useEffect(() => {
        if (allSubscribedUsers) {
            const nonTrialUsers = allSubscribedUsers.filter(
                (user) => user.subscription_plan_id && !user.subscription_plan_id.is_trial
            );

            const proNonTrialUsers: User[] = [];
            const nonProNonTrialUsers: User[] = [];

            nonTrialUsers.map((user) => {
                if (user.subscription_plan_id.is_pro) {
                    proNonTrialUsers.push(user);
                } else if (!user.subscription_plan_id.is_pro) {
                    nonProNonTrialUsers.push(user);
                }
            });

            setIndividualUsers(nonProNonTrialUsers);
            setTeamUsers(proNonTrialUsers);
        }
        return (): void => {
            mountedRef.current = false;
        };
    }, [allSubscribedUsers]);

    // Filter logic
    useEffect(() => {
        if (allSubscribedUsers && individualUsers && teamUsers) {
            let filteredList: User[] = [];

            // Subscription type filter
            if (filters.subscriptionType === all) {
                filteredList = [...allSubscribedUsers];
            } else if (filters.subscriptionType === t('independentSubscription')) {
                filteredList = [...individualUsers];
            } else if (filters.subscriptionType === t('teamSubscription')) {
                filteredList = [...teamUsers];
            } else if (filters.subscriptionType === t('trialPeriod')) {
                filteredList = allSubscribedUsers.filter(
                    (user) => user.subscription_plan_id.is_trial
                );
            }

            // Job filter
            if (filters.job !== all) {
                filteredList = filteredList.filter(
                    (user) => user.manager_profession === filters.job
                );
            }

            // Set filtered user list
            setFilteredUsers(filteredList);
        }
    }, [filters, allSubscribedUsers, individualUsers, teamUsers]);

    // Components
    const TitleComponent = (): React.ReactElement => {
        return (
            <Stack direction="row" alignItems="baseline">
                <Typography variant="h3">{t('clients')}</Typography>
                <Box width="4px" />
                <Typography
                    color={NEUTRAL.dark}
                    variant="h5">{`(${allSubscribedUsers?.length})`}</Typography>
            </Stack>
        );
    };

    const StatsComponent = (): React.ReactElement => {
        return (
            <Stack direction="row">
                <Stack direction="row" alignItems="center" width="265px">
                    {CircularBackground(`${countOfTrial}`)}
                    <Box width="15px" />
                    <Typography color={NEUTRAL.medium} variant="body2">
                        {t('clientsInTrial')}
                    </Typography>
                </Stack>
                <Box width="20px" />
                <Stack direction="row" alignItems="center" width="265px">
                    {CircularBackground(`${teamUsers ? teamUsers.length : undefined}`)}
                    <Box width="15px" />
                    <Typography color={NEUTRAL.medium} variant="body2">
                        {t('adminTeamSubscription')}
                    </Typography>
                </Stack>
                <Box width="20px" />
                <Stack direction="row" alignItems="center" width="265px">
                    {CircularBackground(`${individualUsers ? individualUsers.length : undefined}`)}
                    <Box width="15px" />
                    <Typography color={NEUTRAL.medium} variant="body2">
                        {t('adminIndependentSubscription')}
                    </Typography>
                </Stack>
            </Stack>
        );
    };

    const SubscriptionTypeFilter = (): React.ReactElement => {
        return (
            <Stack direction="row" alignItems={'center'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {`${t('subscriptionType')}: `}
                </Typography>
                <Filter
                    selected={filters.subscriptionType}
                    onChange={(value: string): void => updateFilters('subscriptionType', value)}>
                    <MenuItem value={all}>{all}</MenuItem>
                    <MenuItem value={t('trialPeriod')}>{t('trialPeriod')}</MenuItem>
                    <MenuItem value={t('independentSubscription')}>
                        {t('independentSubscription')}
                    </MenuItem>
                    <MenuItem value={t('teamSubscription')}>{t('teamSubscription')}</MenuItem>
                </Filter>
            </Stack>
        );
    };

    const JobFilter = (): React.ReactElement => {
        return (
            <Stack direction="row" alignItems={'center'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {`${t('profession')}: `}
                </Typography>
                <Filter
                    selected={filters.job}
                    onChange={(value: string): void => updateFilters('job', value)}>
                    <MenuItem value={all}>{all}</MenuItem>
                    {JobTitles.map((jobTitle) => (
                        <MenuItem key={jobTitle} value={jobTitle}>
                            {jobTitle}
                        </MenuItem>
                    ))}
                </Filter>
            </Stack>
        );
    };

    const FilterComponent = (): React.ReactElement => {
        return (
            <Stack direction="row">
                <SubscriptionTypeFilter />
                <Box width={'32px'} />
                <JobFilter />
            </Stack>
        );
    };

    const ProjectManagerTableComponent = (): React.ReactElement => {
        const users = filteredUsers !== undefined ? filteredUsers : [];
        const headers = [
            t('enterprise'),
            t('lastNameTextFieldLabel'),
            t('firstNameTextFieldLabel'),
            t('profession'),
            t('subscriptionType'),
            ''
        ];
        const body = users.map((user) => {
            const profession = user.manager_profession ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: PINK.lighter,
                        width: 'fit-content'
                    }}>
                    <Typography
                        sx={{
                            ...small2,
                            color: PINK.darker,
                            padding: '4px 8px',
                            fontWeight: fontWeightSemiBold
                        }}>
                        {user.manager_profession}
                    </Typography>
                </Box>
            ) : (
                <React.Fragment />
            );

            const subscriptionTextAssign = (): string => {
                if (user.subscription_plan_id) {
                    if (user.subscription_plan_id.is_trial) {
                        return t('trialPeriod');
                    } else if (individualUsers !== undefined && teamUsers !== undefined) {
                        if (individualUsers.find((item) => item.id === user.id)) {
                            return t('independentSubscription');
                        } else {
                            return t('teamSubscription');
                        }
                    } else {
                        return '';
                    }
                } else {
                    return '';
                }
            };

            const subscriptionType = user.subscription_plan_id ? (
                <HighlightBox
                    key="job"
                    text={subscriptionTextAssign()}
                    fontColour={
                        user.subscription_plan_id.is_trial
                            ? theme.palette.secondary.darker!
                            : PINK.darker
                    }
                    backgroundColour={
                        user.subscription_plan_id.is_trial
                            ? theme.palette.secondary.lighter!
                            : PINK.lighter
                    }
                />
            ) : (
                <React.Fragment />
            );

            return [
                <Typography key="enterprise" variant="body2">
                    {user.enterprises?.at(0)?.enterprise_id.name ?? ''}
                </Typography>,
                <Typography key="lastName" variant="body2">
                    {user.last_name}
                </Typography>,
                <Typography key="firstName" variant="body2">
                    {user.first_name}
                </Typography>,
                profession,
                subscriptionType,
                <Button
                    key={user.id}
                    variant={'outlined'}
                    color={'secondary'}
                    onClick={(): void => {
                        setSelectedClient(user);
                        setDetailsOpen(true);
                    }}
                    sx={{ width: '147px' }}>
                    {t('seeNoticeButtonTitle')}
                </Button>
            ];
        });

        return <WRTable headers={headers} body={body} marginTop={'16px'} />;
    };

    const AdminClientsComponent = (): React.ReactElement => {
        return (
            <Stack>
                <TitleComponent />
                <Box height="16px" />
                <StatsComponent />
                <Box height="16px" />
                <FilterComponent />
                <ProjectManagerTableComponent />
            </Stack>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return (
                <>
                    {selectedClient && teamUsers && (
                        <ClientDetailsModal
                            client={selectedClient}
                            subscriptionType={
                                selectedClient.subscription_plan_id
                                    ? selectedClient.subscription_plan_id.is_trial
                                        ? t('trialPeriod')
                                        : teamUsers.find((user) => user.id === selectedClient.id)
                                        ? t('teamSubscription')
                                        : t('independentSubscription')
                                    : ''
                            }
                            isOpen={detailsOpen}
                            onClose={(): void => {
                                setDetailsOpen(false);
                                setSelectedClient(undefined);
                            }}
                        />
                    )}
                    <AdminClientsComponent />
                </>
            );
        }
    };

    return <>{RenderComponents()}</>;
};
