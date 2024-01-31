import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { UserContext } from '../../../provider/UserProvider';
import { ImportArtisanForm } from '../components/ImportArtisanForm';
import { importArtisan } from '../services/artisanService';
import { DirectusError, ErrorCode } from '../../error/models/ErrorCode';
import { useTranslation } from 'react-i18next';

interface ArtisanFormsProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
}

export function SaveImportArtisans({
    handleCloseForm,
    handleOpenSuccess
}: ArtisanFormsProps): React.ReactElement {
    const currentUser = useContext(UserContext);
    const { t } = useTranslation();
    const [loading, setloading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const openSuccessModal = (): void => {
        handleCloseForm();
        handleOpenSuccess();
    };

    const [artisanDocument, setArtisanDocument] = useState<File | null>(null);

    const submitForm = async (): Promise<void> => {
        setloading(true);
        if (currentUser.user && artisanDocument) {
            importArtisan(artisanDocument, currentUser.user.enterprises.at(0)!.enterprise_id)
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
        if (artisanDocument !== null) {
            submitForm();
        }
    }, [artisanDocument]);

    const CurrentForm = (): React.ReactElement => {
        return (
            <ImportArtisanForm
                initialValues={{
                    artisanDocument: null
                }}
                onSubmit={(data: { artisanDocument: File | null }): void => {
                    setArtisanDocument(data.artisanDocument);
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
