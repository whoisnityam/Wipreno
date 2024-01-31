import React, { useContext, useState } from 'react';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { FormStepOne } from '../components/FormStepOne';
import { OnboardingForm } from '../models/OnboardingForm';
import { FormStepTwo } from '../components/FormStepTwo';
import { FormStepThree } from '../components/FormStepThree';
import { UserContext } from '../../../provider/UserProvider';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { useTranslation } from 'react-i18next';
import { ModalContainer } from '../../../components/ModalContainer';
import { Stack, Typography } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { redirectToCheckout, saveOnboardingData } from '../services/OnboardingService';
import { FileData } from '../../projects/models/FileData';
import { uploadFile } from '../../../services/DirectusService';

interface OnboardingFormProps {
    currentStep: number;
    nextStep: Function;
    previousStep: Function;
    openSuccess: boolean;
}

export function OnboardingForms({
    currentStep,
    nextStep,
    previousStep,
    openSuccess = false
}: OnboardingFormProps): React.ReactElement {
    const user = useContext(UserContext);
    const { t } = useTranslation();
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openSuccessModel, setOpenSuccessModal] = useState(openSuccess);
    const [formData, setFormData] = useState<OnboardingForm>({
        enterpriseName: user.user?.enterprises?.at(0)?.enterprise_id.name ?? '',
        phoneNumber: user.user?.phone ?? '',
        profession: user.user?.manager_profession ?? '',
        selectedPlan: undefined,
        companyName: user.user?.company_name ?? '',
        postalCode: user.user?.postal_code ?? '',
        address: user.user?.address ?? '',
        city: user.user?.city ?? '',
        logo: null,
        logoFile: null
    });

    if (openSuccess) {
        setTimeout(async () => {
            window.location.reload();
        }, 3000);
    }

    const checkout = async (data: OnboardingForm): Promise<void> => {
        if (data.selectedPlan?.is_trial) {
            if (formData.logoFile) {
                const logoFile = await uploadFile(formData.logoFile);
                const obj = {
                    ...data,
                    logo: logoFile ?? null
                };
                saveOnboardingData(obj).then(async (): Promise<void> => {
                    setOpenModal(true);
                    const plan = data.selectedPlan!;
                    redirectToCheckout(
                        plan.price_id,
                        user.user!.email,
                        user.user!.id,
                        plan.is_trial,
                        data.address,
                        data.postalCode,
                        data.city
                    ).then((url: string) => {
                        setOpenModal(false);
                        window.location.replace(url);
                    });
                });
            } else {
                const obj = {
                    ...data,
                    logo: data.logo
                };
                saveOnboardingData(obj).then(async (): Promise<void> => {
                    setOpenModal(true);
                    const plan = data.selectedPlan!;
                    redirectToCheckout(
                        plan.price_id,
                        user.user!.email,
                        user.user!.id,
                        plan.is_trial,
                        data.address,
                        data.postalCode,
                        data.city
                    ).then((url: string) => {
                        setOpenModal(false);
                        window.location.replace(url);
                    });
                });
            }
        } else {
            setOpenPaymentModal(true);
            if (formData.logoFile) {
                const logoFile = await uploadFile(formData.logoFile);
                const obj = {
                    ...data,
                    logo: logoFile ?? null
                };
                saveOnboardingData(obj).then(async (): Promise<void> => {
                    const plan = data.selectedPlan!;
                    redirectToCheckout(
                        plan.price_id,
                        user.user!.email,
                        user.user!.id,
                        plan.is_trial,
                        data.address,
                        data.postalCode,
                        data.city
                    ).then((url: string) => {
                        setOpenPaymentModal(false);
                        window.location.replace(url);
                    });
                });
            } else {
                setOpenPaymentModal(true);
                const obj = {
                    ...data,
                    logo: data.logo
                };
                saveOnboardingData(obj).then(async (): Promise<void> => {
                    const plan = data.selectedPlan!;
                    redirectToCheckout(
                        plan.price_id,
                        user.user!.email,
                        user.user!.id,
                        plan.is_trial,
                        data.address,
                        data.postalCode,
                        data.city
                    ).then((url: string) => {
                        setOpenPaymentModal(false);
                        window.location.replace(url);
                    });
                });
            }
        }
    };

    const save = (data: OnboardingForm): void => {
        if (
            data.enterpriseName &&
            data.phoneNumber &&
            data.profession &&
            data.selectedPlan &&
            data.companyName &&
            data.postalCode &&
            data.address &&
            data.city
        ) {
            checkout(data);
        }
    };

    const CurrentForm = (): React.ReactElement => {
        switch (currentStep) {
            case 0:
                return (
                    <FormStepOne
                        initialValues={{
                            enterpriseName: formData.enterpriseName,
                            profession: formData.profession,
                            phoneNumber: formData.phoneNumber,
                            logo: formData.logo,
                            logoFile: formData.logoFile
                        }}
                        onSubmit={(data: {
                            enterpriseName: string;
                            profession: string;
                            phoneNumber: string;
                            logo: FileData | null;
                            logoFile: File | null;
                        }): void => {
                            setFormData({
                                ...formData,
                                enterpriseName: data.enterpriseName,
                                profession: data.profession,
                                phoneNumber: data.phoneNumber,
                                logo: data.logo,
                                logoFile: data.logoFile
                            });
                            nextStep();
                        }}
                    />
                );
            case 1:
                return (
                    <FormStepTwo
                        initialPlan={formData.selectedPlan}
                        onSubmit={(selectedPlan: SubscriptionPlan): void => {
                            setFormData({ ...formData, selectedPlan });
                            nextStep();
                        }}
                        onPreviousClick={previousStep}
                    />
                );
            case 2:
                return (
                    <FormStepThree
                        initialValues={{
                            companyName:
                                formData.companyName === ''
                                    ? formData.enterpriseName
                                    : formData.companyName,
                            address: formData.address,
                            postalCode: `${formData.postalCode}`,
                            city: formData.city
                        }}
                        onSubmit={(data: {
                            companyName: string;
                            address: string;
                            postalCode: string;
                            city: string;
                        }): void => {
                            const values = {
                                ...formData,
                                companyName: data.companyName,
                                address: data.address,
                                postalCode: data.postalCode,
                                city: data.city
                            };
                            setFormData(values);
                            save(values);
                        }}
                        onPreviousClick={previousStep}
                    />
                );
            default:
                return <></>;
        }
    };

    return (
        <>
            <SuccessAlert
                open={openSuccessModel || openModal}
                title={t('subscriptionSuccessTitle')}
                subtitle={t('subscriptionSuccessSubtitle')}
                onClose={(): void => setOpenSuccessModal(false)}
            />
            <ModalContainer
                isModalOpen={openPaymentModal}
                onClose={(): void => {
                    setOpenSuccessModal(false);
                }}
                content={
                    <Stack textAlign={'center'} alignItems={'center'}>
                        <Typography
                            variant={'body1'}
                            color={NEUTRAL.medium}
                            marginTop={'40px'}
                            marginBottom={'32px'}>
                            {t('goToPaymentsModalDescription')}
                        </Typography>
                        <LoadingIndicator sx={{ marginBottom: '40px' }} />
                    </Stack>
                }
            />
            {CurrentForm()}
        </>
    );
}
