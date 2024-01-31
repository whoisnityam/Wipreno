import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { PlanType } from '../../../constants';
import { useTranslation } from 'react-i18next';
import { FormContainer } from './FormContainer';
import { SwitchWithLabel } from './SwitchWithLabel';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { getSubscriptionPlans } from '../services/OnboardingService';
import { SubscriptionCard } from './SubscriptionCard';

interface FormStepTwoProps {
    initialPlan?: SubscriptionPlan | undefined;
    onSubmit: Function;
    onPreviousClick: Function;
}

export function FormStepTwo({
    initialPlan,
    onSubmit,
    onPreviousClick
}: FormStepTwoProps): React.ReactElement {
    const { t } = useTranslation();

    const [planType, setPlanType] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [filteredPlans, setFilteredPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>(initialPlan);

    const getData = async (): Promise<void> => {
        const subscriptionPlans = await getSubscriptionPlans();
        setPlans(subscriptionPlans);
        setFilteredPlans(subscriptionPlans.filter((item) => item.type === 'MONTHLY'));
    };

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        setFilteredPlans(plans.filter((item) => item.type === planType));
    }, [planType]);

    return (
        <FormContainer
            primaryButtonDisabled={!selectedPlan}
            primaryButtonOnClick={(): void => onSubmit(selectedPlan)}
            secondaryButtonVisible={true}
            secondaryButtonOnClick={onPreviousClick}>
            <Box>
                <Typography variant="h3" color={NEUTRAL.darker}>
                    {t('chooseSubscription')}
                </Typography>
                <Stack alignItems={'center'} mt={4}>
                    <SwitchWithLabel
                        rightValue={PlanType.annual}
                        leftValue={PlanType.monthly}
                        backgroungColor={NEUTRAL.dark}
                        selected={planType === 'YEARLY' ? PlanType.annual : PlanType.monthly}
                        handleToggle={(): void => {
                            if (planType === 'MONTHLY') {
                                setPlanType('YEARLY');
                            } else {
                                setPlanType('MONTHLY');
                            }
                        }}
                    />
                </Stack>
                <Stack direction={'row'} spacing={'30px'}>
                    {filteredPlans.map((plan) => (
                        <SubscriptionCard
                            key={plan.id}
                            title={plan.name}
                            subtitle={plan.base_price}
                            isSelected={plan.id === selectedPlan?.id}
                            isWhiteBackground={!selectedPlan}
                            features={plan.features}
                            onClick={(): void => {
                                setSelectedPlan(plan);
                            }}
                        />
                    ))}
                </Stack>
            </Box>
        </FormContainer>
    );
}
