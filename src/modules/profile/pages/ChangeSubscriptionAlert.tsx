import { Alert } from '../../../components/alerts/Alert';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ChangeSubscriptionAlertProps {
    isOpen: boolean;
    onClose: () => void;
}
export function ChangeSubscriptionAlert({
    isOpen,
    onClose
}: ChangeSubscriptionAlertProps): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    return (
        <Alert
            title={t('changeSubscriptionTitle')}
            subtitle={t('changeSubscriptionSubtitle')}
            primaryButton={t('changeSubscription')}
            onClick={(): void => {
                navigate('/profile/change-subscription');
                onClose();
            }}
            secondaryButton={t('return')}
            open={isOpen}
            onClose={onClose}
        />
    );
}
