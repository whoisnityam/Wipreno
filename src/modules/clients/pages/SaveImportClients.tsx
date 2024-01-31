import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { UserContext } from '../../../provider/UserProvider';
import { ImportClientForm } from '../components/ImportClientForm';
import { importClient } from '../services/ClientService';
import { useTranslation } from 'react-i18next';
import { DirectusError, ErrorCode } from '../../error/models/ErrorCode';

interface ArtisanFormsProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
}

export function SaveImportClients({
    handleCloseForm,
    handleOpenSuccess
}: ArtisanFormsProps): React.ReactElement {
    const currentUser = useContext(UserContext);
    const { t } = useTranslation();
    const [loading, setloading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [clientDocument, setclientDocument] = useState<File | null>(null);

    const openSuccessModal = (): void => {
        handleCloseForm();
        handleOpenSuccess();
    };

    const submitForm = (): void => {
        setloading(true);
        if (currentUser.user && clientDocument) {
            setloading(true);
            importClient(clientDocument, currentUser.user.enterprises.at(0)!.enterprise_id)
                .then(() => {
                    setErrorMessage('');
                    setloading(false);
                    openSuccessModal();
                })
                .catch((error: DirectusError) => {
                    if (error.extensions?.code === ErrorCode.RECORD_NOTUNIQUE) {
                        setErrorMessage(t('userAlreadyExistsError'));
                    } else {
                        setErrorMessage(t('invalidFileFormat'));
                    }
                    setloading(false);
                });
        }
    };

    useEffect(() => {
        if (clientDocument !== null) {
            submitForm();
        }
    }, [clientDocument]);

    const CurrentForm = (): React.ReactElement => {
        return (
            <ImportClientForm
                initialValues={{
                    clientDocument: null
                }}
                onSubmit={(data: { clientDocument: File | null }): void => {
                    setclientDocument(data.clientDocument);
                }}
                closeForm={handleCloseForm}
                loading={loading}
                errorMessage={errorMessage}
            />
        );
    };
    return (
        <Box>
            <CurrentForm />
        </Box>
    );
}
