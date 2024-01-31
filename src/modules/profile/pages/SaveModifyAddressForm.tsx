import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { UserContextProps } from '../models/User';
import { UserContext } from '../../../provider/UserProvider';
import { MofifyAddressForm } from '../components/ModifyAddressForm';
import { updateAddress } from '../services/SubscriptionService';
import { postalCheck } from '../../../utils';

interface ModifyFormsProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
}

export function SaveModifyAddressForm({
    handleCloseForm,
    handleOpenSuccess
}: ModifyFormsProps): React.ReactElement {
    const currentUser: UserContextProps = useContext(UserContext);
    const [loading, setloading] = useState<boolean>(false);

    const openSuccessModal = (): void => {
        handleCloseForm();
        handleOpenSuccess();
    };

    const [formData, setFormData] = useState({
        companyName: currentUser.user?.company_name ?? '',
        address: currentUser.user?.address ?? '',
        city: currentUser.user?.city ?? '',
        postalCode: postalCheck(currentUser.user?.postal_code ?? '') ?? ''
    });

    const getCompanyName = (): string => {
        if (currentUser && currentUser.user?.company_name !== null) {
            return currentUser.user!.company_name;
        } else {
            return '';
        }
    };

    const sameData = (): boolean => {
        return (
            formData.address === currentUser.user?.address &&
            formData.city === currentUser.user?.city &&
            formData.companyName === getCompanyName() &&
            formData.postalCode === postalCheck(currentUser.user?.postal_code ?? '')
        );
    };

    const submitForm = async (): Promise<void> => {
        setloading(true);
        if (currentUser.user && formData) {
            const { companyName, address, city, postalCode } = formData;
            const res = await updateAddress(
                companyName,
                address,
                city,
                postalCode,
                currentUser.user.stripe_customer_id
            );
            if (res) {
                setloading(false);
                openSuccessModal();
            }
        }
        currentUser.refreshData();
    };

    useEffect(() => {
        const response = sameData();

        if (!response && formData.city !== '') {
            submitForm();
        }
    }, [formData]);

    const CurrentForm = (): React.ReactElement => {
        return (
            <MofifyAddressForm
                initialValues={formData}
                onSubmit={(data: {
                    companyName: string;
                    address: string;
                    city: string;
                    postalCode: string;
                }): void => {
                    setFormData(data);
                }}
                closeForm={handleCloseForm}
                loading={loading}
            />
        );
    };
    return <Box>{CurrentForm()}</Box>;
}
