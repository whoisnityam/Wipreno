import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ModalContainer } from '../../../components/ModalContainer';
import { User } from '../../profile/models/User';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { X } from 'react-feather';
import { HighlightBox } from '../../clients/components/HighlightBox';
import { getProjectManagerCountByEnterpriseId } from '../services/DashboardService';

interface ClientDetailsModalProps {
    client: User;
    subscriptionType: string;
    isOpen: boolean;
    onClose: Function;
}

const teamPlanMonthlyBasePrice = 45;
const teamPlanMonthlyPerAdditionalUserPrice = 15;

const teamPlanYearlyBasePrice = 540;
const teamPlanYearlyPerAdditionalUserPrice = 180;

// eslint-disable-next-line no-unused-vars
const individualPlanMonthlyPrice = 15;
// eslint-disable-next-line no-unused-vars
const individualPlanYearlyPrice = 180;

export function ClientDetailsModal({
    client,
    subscriptionType,
    isOpen,
    onClose
}: ClientDetailsModalProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const mountedRef = useRef(true);

    const [userCount, setUserCount] = useState<number>(0);

    const prepareData = useCallback(async () => {
        if (mountedRef.current && client.enterprises.at(0)?.enterprise_id) {
            const count = await getProjectManagerCountByEnterpriseId(
                client.enterprises.at(0)!.enterprise_id.id
            );
            setUserCount(count);
        }
    }, [client]);

    useEffect(() => {
        prepareData();
    }, []);

    const TitleCloseSection = (): React.ReactElement => {
        return (
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="h4" color={NEUTRAL.dark} textAlign="center">
                    {t('customerDetails')}
                </Typography>
                <IconButton sx={{ padding: '0px' }} onClick={(): void => onClose()}>
                    <X color={theme.palette.primary.medium} />
                </IconButton>
            </Stack>
        );
    };

    const ProfileSection = (): React.ReactElement => {
        return (
            <React.Fragment>
                <Typography variant="h6">{t('profile')}</Typography>
                <Box height="16px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.dark} variant="subtitle2">
                            {t('lastName')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {`${client.first_name} ${client.last_name}`}
                        </Typography>
                    </Stack>
                    <Stack width="49%">
                        <Typography variant="subtitle2" color={NEUTRAL.dark}>
                            {t('enterprise')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {client.enterprises.at(0)?.enterprise_id.name ?? ''}
                        </Typography>
                    </Stack>
                </Stack>
                <Box height="20px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.dark} variant="subtitle2">
                            {t('profession')}
                        </Typography>
                        <Box height="4px" />
                        {client.manager_profession ? (
                            <HighlightBox
                                text={client.manager_profession}
                                fontColour={PINK.darker}
                                backgroundColour={PINK.lighter}
                            />
                        ) : (
                            <React.Fragment />
                        )}
                    </Stack>
                    <Stack width="49%" />
                </Stack>
            </React.Fragment>
        );
    };

    const SubscriptionSection = (): React.ReactElement => {
        const computeBaseType = (): string => {
            if (client.subscription_plan_id) {
                if (client.subscription_plan_id.is_trial) {
                    return t('freeFor30Days');
                } else if (!client.subscription_plan_id.is_pro) {
                    return `${client.subscription_plan_id.base_price}`;
                } else {
                    if (client.subscription_plan_id.type === 'MONTHLY') {
                        const price =
                            teamPlanMonthlyBasePrice +
                            teamPlanMonthlyPerAdditionalUserPrice * (userCount - 1);
                        return `${price}€ HT/mois (${userCount} utilisateurs)`;
                    } else {
                        const price =
                            teamPlanYearlyBasePrice +
                            teamPlanYearlyPerAdditionalUserPrice * (userCount - 1);
                        return `${price}€ HT/an (${userCount} utilisateurs)`;
                    }
                }
            } else {
                return '';
            }
        };

        return (
            <React.Fragment>
                <Typography variant="h6">{t('actualSubscription')}</Typography>
                <Box height="16px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.dark} variant="subtitle2">
                            {t('subscriptionType')}
                        </Typography>
                        <Box height="4px" />
                        {client.subscription_plan_id && (
                            <HighlightBox
                                text={subscriptionType}
                                fontColour={
                                    client.subscription_plan_id.is_trial
                                        ? theme.palette.secondary.darker!
                                        : PINK.darker
                                }
                                backgroundColour={
                                    client.subscription_plan_id.is_trial
                                        ? theme.palette.secondary.lighter!
                                        : PINK.lighter
                                }
                            />
                        )}
                    </Stack>
                    <Stack width="49%">
                        <Typography variant="subtitle2" color={NEUTRAL.dark}>
                            {t('amountAndUsers')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {computeBaseType()}
                        </Typography>
                    </Stack>
                </Stack>
            </React.Fragment>
        );
    };

    const ContactSection = (): React.ReactElement => {
        return (
            <React.Fragment>
                <Typography variant="h6">{t('contactInformation')}</Typography>
                <Box height="18px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.dark} variant="subtitle2">
                            {t('emailFieldLabel')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {client.email}
                        </Typography>
                    </Stack>
                    <Stack width="49%">
                        <Typography variant="subtitle2" color={NEUTRAL.dark}>
                            {t('phoneNumber')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {client.phone}
                        </Typography>
                    </Stack>
                </Stack>
                <Box height="20px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.dark} variant="subtitle2">
                            {t('billingAddress')}
                        </Typography>
                        {client.company_name && (
                            <Typography
                                sx={{ wordWrap: 'break-word' }}
                                variant="body2"
                                color={NEUTRAL.dark}>
                                {`${client.company_name},`}
                            </Typography>
                        )}
                        {client.address ? (
                            <Typography
                                sx={{ wordWrap: 'break-word' }}
                                variant="body2"
                                color={NEUTRAL.dark}>
                                {`${client.address}, ${
                                    client.postal_code
                                }, ${client.city.toUpperCase()}`}
                            </Typography>
                        ) : (
                            <></>
                        )}
                    </Stack>
                    <Stack width="49%" />
                </Stack>
            </React.Fragment>
        );
    };

    const renderClientDetailsModal = (): React.ReactElement => {
        return (
            <Stack>
                <TitleCloseSection />
                <Box height="40px" />
                <ProfileSection />
                <Box height="42px" />
                <SubscriptionSection />
                <Box height="42px" />
                <ContactSection />
            </Stack>
        );
    };

    return (
        <ModalContainer
            width="550px"
            onClose={(): void => {
                onClose();
            }}
            isModalOpen={isOpen}
            content={renderClientDetailsModal()}
        />
    );
}
