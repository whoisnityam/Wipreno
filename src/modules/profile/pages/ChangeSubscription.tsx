import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Typography, useMediaQuery } from '@mui/material';
import { WRBreadcrumb } from '../../../components/breadcumbs/WRBreadcrumb';
import { NEUTRAL } from '../../../theme/palette';
import { PlanType } from '../../../constants';
import { SwitchWithLabel } from '../../onboarding/components/SwitchWithLabel';
import { SubscriptionCard } from '../../onboarding/components/SubscriptionCard';
import { getSubscriptionPlans } from '../../onboarding/services/OnboardingService';
import { SubscriptionPlan } from '../../onboarding/models/SubscriptionPlan';
import { UserContext } from '../../../provider/UserProvider';
import { getUserCount, updateSubscription } from '../services/SubscriptionService';
import { Alert } from '../../../components/alerts/Alert';
import { useNavigate } from 'react-router-dom';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { LoadingButton } from '@mui/lab';

export function ChangeSubscription(): React.ReactElement {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const [planType, setPlanType] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [filteredPlans, setFilteredPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>();
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const [loading, setLoading] = useState<boolean>(false);

    const [modalData, setModalData] = useState({
        open: false,
        title: '',
        subtitle: '',
        button: '',
        onClick: (): void => {},
        onClose: (): void => {}
    });

    const resetModel = {
        open: false,
        title: '',
        subtitle: '',
        button: '',
        onClick: (): void => {},
        onClose: (): void => {}
    };

    const getData = useCallback(async (): Promise<void> => {
        let subscriptionPlans = await getSubscriptionPlans();
        if (!user.user?.subscription_plan_id.is_trial) {
            subscriptionPlans = subscriptionPlans.filter((plan) => !plan.is_trial);
        } else {
            if (user.user?.subscription_plan_id.type === 'YEARLY') {
                subscriptionPlans = subscriptionPlans.filter(
                    (plan) => !(plan.is_trial && plan.type !== 'MONTHLY')
                );
            } else {
                subscriptionPlans = subscriptionPlans.filter(
                    (plan) => !(plan.is_trial && plan.type === 'YEARLY')
                );
            }
        }
        setPlans(subscriptionPlans);
        setSelectedPlan(user.user?.subscription_plan_id);
        if (user.user?.subscription_plan_id?.type === 'YEARLY') {
            setFilteredPlans(subscriptionPlans.filter((item) => item.type === 'YEARLY'));
            setPlanType('YEARLY');
        } else {
            setFilteredPlans(subscriptionPlans.filter((item) => item.type === 'MONTHLY'));
        }
    }, []);

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        setFilteredPlans(plans.filter((item) => item.type === planType));
    }, [planType]);

    const breadcrumbData: {
        link: string;
        label: string;
    }[] = [
        { link: '/profile/subscription', label: t('subscription') },
        { link: '#', label: t('changeSubscription') }
    ];

    const getNoOfUser = async (): Promise<number> => {
        const res = await getUserCount(user.user!.enterprises.at(0)!.enterprise_id.id);
        return res;
    };

    return (
        <>
            <Alert
                width="440px"
                title={modalData.title}
                subtitle={modalData.subtitle}
                secondaryButton={t('return')}
                primaryButton={modalData.button}
                open={modalData.open}
                onClick={modalData.onClick}
                onClose={modalData.onClose}
            />
            <SuccessAlert
                title={t('subscriptionChangeSuccessTitle')}
                subtitle={t('subscriptionChangeSuccessSubtitle')}
                open={openSuccessModal}
            />
            <Stack width={isLargeLandscape ? 'fit-content' : '100%'}>
                {isLargeLandscape && <WRBreadcrumb links={breadcrumbData} />}
                <Typography
                    variant={isLargeLandscape ? 'h4' : 'h5'}
                    color={NEUTRAL.darker}
                    pt={isLargeLandscape ? '37px' : '12px'}>
                    {t('changeSubscription')}
                </Typography>
                <Stack alignItems={'flex-end'} mt={isLargeLandscape ? '' : '40px'}>
                    <SwitchWithLabel
                        rightValue={PlanType.monthly}
                        leftValue={PlanType.annual}
                        backgroungColor={NEUTRAL.dark}
                        selected={planType === 'MONTHLY' ? PlanType.monthly : PlanType.annual}
                        handleToggle={(): void => {
                            if (planType === 'MONTHLY') {
                                setPlanType('YEARLY');
                            } else {
                                setPlanType('MONTHLY');
                            }
                        }}
                    />
                </Stack>
                <Stack
                    direction={isLargeLandscape ? 'row' : 'column'}
                    spacing={'20px'}
                    alignItems={isLargeLandscape ? '' : 'center'}>
                    {filteredPlans.map((plan) => (
                        <SubscriptionCard
                            key={plan.id}
                            title={plan.name}
                            subtitle={plan.base_price}
                            isSelected={plan.id === selectedPlan?.id}
                            isWhiteBackground={!selectedPlan}
                            features={plan.features}
                            onClick={async (): Promise<void> => {
                                if (isLargeLandscape) {
                                    setSelectedPlan(plan);
                                    if (
                                        user.user?.subscription_plan_id.id !== plan.id ||
                                        !user.user?.stripe_subscription_id
                                    ) {
                                        const userCount = await getNoOfUser();
                                        if (!plan.is_pro && userCount > 1) {
                                            setModalData({
                                                open: true,
                                                title: t('changeSubscriptionModalTitle'),
                                                subtitle: t('changeSubscriptionManageUsers'),
                                                button: t('userManagement'),
                                                onClick: () => navigate('/profile/userManagement'),
                                                onClose: () => setModalData(resetModel)
                                            });
                                        } else {
                                            setModalData({
                                                open: true,
                                                title: t('changeSubscriptionModalTitle'),
                                                subtitle: plan.is_pro
                                                    ? t('changeSubscriptionModalSubtitle')
                                                    : t('subscriptionChangeModelDescription'),
                                                button: t('changeSubscription'),
                                                onClick: async () => {
                                                    const response = await updateSubscription(
                                                        user.user!.stripe_customer_id,
                                                        user.user!.stripe_subscription_id,
                                                        plan.price_id,
                                                        userCount
                                                    );
                                                    if (response?.redirect) {
                                                        window.location.replace(response?.redirect);
                                                    } else {
                                                        setModalData(resetModel);
                                                        setOpenSuccessModal(true);
                                                        setTimeout(async () => {
                                                            setOpenSuccessModal(false);
                                                            location.reload();
                                                        }, 3000);
                                                    }
                                                },
                                                onClose: () => setModalData(resetModel)
                                            });
                                        }
                                    }
                                } else {
                                    setSelectedPlan(plan);
                                    if (
                                        user.user?.subscription_plan_id.id !== plan.id ||
                                        !user.user?.stripe_subscription_id
                                    ) {
                                        const userCount = await getNoOfUser();
                                        if (!plan.is_pro && userCount > 1) {
                                            setModalData({
                                                open: true,
                                                title: t('changeSubscriptionModalTitle'),
                                                subtitle: t('changeSubscriptionManageUsers'),
                                                button: t('userManagement'),
                                                onClick: () =>
                                                    (window.location.href = `/profile/userManagement`),
                                                onClose: () => setModalData(resetModel)
                                            });
                                        }
                                    }
                                }
                            }}
                        />
                    ))}
                </Stack>
                {!isLargeLandscape && (
                    <Stack spacing={'12px'} mt={'40px'}>
                        <LoadingButton
                            loading={loading}
                            variant="contained"
                            onClick={async (): Promise<void> => {
                                if (selectedPlan) {
                                    setLoading(true);
                                    const userCount = await getNoOfUser();
                                    const response = await updateSubscription(
                                        user.user!.stripe_customer_id,
                                        user.user!.stripe_subscription_id,
                                        selectedPlan.price_id,
                                        userCount
                                    );
                                    if (response?.redirect) {
                                        window.location.replace(response?.redirect);
                                    } else {
                                        setModalData(resetModel);
                                        setOpenSuccessModal(true);
                                        setTimeout(async () => {
                                            setOpenSuccessModal(false);
                                            location.reload();
                                        }, 3000);
                                    }
                                }
                            }}>
                            {t('previous')}
                        </LoadingButton>
                        <Button
                            fullWidth
                            variant={'outlined'}
                            color={'secondary'}
                            onClick={(): void => {
                                navigate(-1);
                            }}>
                            {t('previous')}
                        </Button>
                    </Stack>
                )}
            </Stack>
        </>
    );
}
