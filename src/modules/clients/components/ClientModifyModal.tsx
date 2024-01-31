import { Box, Button, IconButton, Stack, TextField, Typography, useTheme } from '@mui/material';
import React, { useContext, useState } from 'react';
import * as yup from 'yup';
import { ModalContainer } from '../../../components/ModalContainer';
import { small2 } from '../../../theme/typography';
import { User } from '../../profile/models/User';
import { AddtionalContactDataErrorsInterface } from './NewClientForm';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { StatusOfClient } from '../../../constants';
import { Plus, X } from 'react-feather';
import { LoadingButton } from '@mui/lab';
import {
    addClient,
    addClientContacts,
    deleteContact,
    patchClientContact
} from '../services/ClientService';
import { UserContext } from '../../../provider/UserProvider';
import { AdditionalContactsForm } from './AdditionalContactForm';
import { DirectusError, ErrorCode } from '../../error/models/ErrorCode';
import { postalCheck } from '../../../utils';

export interface ClientContactData {
    id: string | undefined;
    lastName: string;
    firstName: string;
    email: string;
    telephone: string;
}

interface ClientModifyModalProps {
    client: User;
    isOpen: boolean;
    onClose: Function;
    onSuccess: Function;
    setModifiedClient: Function;
    clientContactData: ClientContactData[];
    clientContactErrorData: AddtionalContactDataErrorsInterface[];
}

export function ClientModifyModal({
    client,
    isOpen,
    onClose,
    onSuccess,
    setModifiedClient,
    clientContactData,
    clientContactErrorData
}: ClientModifyModalProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const user = useContext(UserContext);

    // Additional contacts useState
    const [additionalContactData, setAdditionalContactData] =
        useState<ClientContactData[]>(clientContactData);
    const [additionalContactDataErrors, setAdditionalContactDataErrors] =
        useState<AddtionalContactDataErrorsInterface[]>(clientContactErrorData);
    // Primary email validity useState
    const [isEmailUnique, setIsEmailUnique] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);

    const [deletedContactList, setDeletedContactList] = useState<(string | undefined)[]>([]);

    const validationSchema = yup.object({
        clientFirstName: yup.string(),
        clientLastName: yup.string(),
        email: yup.string().email(t('invalidEmailErrorMessage')),
        phoneNumber: yup.string().phone('FR', t('enterValidPhoneNumber')),
        address: yup.string(),
        postalCode: yup
            .string()
            .matches(/^[0-9]+$/, t('invalidPostalCode'))
            .min(4, t('invalidPostalCode'))
            .max(5, t('invalidPostalCode')),
        city: yup.string(),
        enterprise: yup.string()
    });

    const formik = useFormik({
        initialValues: {
            clientLastName: client.last_name ?? '',
            clientFirstName: client.first_name ?? '',
            email: client.email,
            phoneNumber: client.phone ?? '',
            address: client.address ?? '',
            postalCode: postalCheck(client.postal_code ?? '') ?? '',
            city: client.city ?? '',
            enterprise: client.company_name ?? ''
        },
        validationSchema,
        onSubmit: () => {}
    });

    const { values, errors, handleChange, isValid } = formik;

    const newContactData: ClientContactData = {
        id: undefined,
        lastName: '',
        firstName: '',
        email: '',
        telephone: ''
    };
    const newContactDataError: AddtionalContactDataErrorsInterface = {
        email: false,
        telephone: false,
        firstName: false,
        lastName: false
    };
    const handleAddContact = (): void => {
        setAdditionalContactData([...additionalContactData, newContactData]);
        setAdditionalContactDataErrors([...additionalContactDataErrors, newContactDataError]);
    };

    const handleSubmitButtonEnable = (): boolean => {
        let isError = false;
        isError =
            isError ||
            !isValid ||
            !Boolean(values.address.trim()) ||
            !Boolean(values.city.trim()) ||
            !Boolean(values.clientFirstName.trim()) ||
            !Boolean(values.clientLastName.trim()) ||
            !Boolean(values.email.trim()) ||
            !Boolean(values.phoneNumber) ||
            !Boolean(values.postalCode);

        if (client.client_status === StatusOfClient[1]) {
            isError = isError || !Boolean(values.enterprise.trim());
        }

        // For additional contacts
        let isAditionalContactError = false;
        additionalContactDataErrors.map((error) => {
            isAditionalContactError =
                isAditionalContactError ||
                error.email ||
                error.telephone ||
                error.firstName ||
                error.lastName;
        });

        isError = isAditionalContactError || isError;

        if (!isAditionalContactError) {
            let isAditionalFormEmpty = false;
            additionalContactData.map((data) => {
                isAditionalFormEmpty =
                    isAditionalFormEmpty ||
                    data.email === '' ||
                    data.firstName === '' ||
                    data.lastName === '' ||
                    data.telephone === '';
            });

            isError = isAditionalFormEmpty || isError;
        }

        return isError;
    };

    const isClientChanged = (): boolean => {
        return (
            values.address !== client.address ||
            values.postalCode !== client.postal_code ||
            values.city !== client.city ||
            values.clientLastName !== client.last_name ||
            values.clientFirstName !== client.first_name ||
            values.email !== client.email ||
            values.phoneNumber !== client.phone ||
            (client.client_status === StatusOfClient[1] &&
                values.enterprise !== client.company_name)
        );
    };

    const isContactChanged = (contactId: string): boolean => {
        const ogContact = clientContactData.find((item) => item.id === contactId);
        const newContact = additionalContactData.find((item) => item.id === contactId);
        if (ogContact === undefined || newContact === undefined) {
            return true;
        } else {
            return (
                ogContact.lastName !== newContact.lastName ||
                ogContact.firstName !== newContact.firstName ||
                ogContact.email !== newContact.email ||
                ogContact.telephone !== newContact.telephone
            );
        }
    };

    const handleSubmit = async (): Promise<void> => {
        const isError = handleSubmitButtonEnable();
        let modifiedClient;
        setLoading(true);
        if (user.user) {
            if (!isError && isClientChanged()) {
                if (values.phoneNumber.startsWith('0')) {
                    modifiedClient = await addClient(
                        values.address,
                        values.postalCode,
                        values.city,
                        client.client_status,
                        values.clientLastName,
                        values.clientFirstName,
                        values.email,
                        values.phoneNumber,
                        user.user,
                        values.enterprise
                    ).catch((error: DirectusError) => {
                        if (error.extensions.code === ErrorCode.RECORD_NOTUNIQUE) {
                            setIsEmailUnique(false);
                        }
                        return;
                    });
                } else {
                    values.phoneNumber = 0 + values.phoneNumber;
                    modifiedClient = await addClient(
                        values.address,
                        values.postalCode,
                        values.city,
                        client.client_status,
                        values.clientLastName,
                        values.clientFirstName,
                        values.email,
                        values.phoneNumber,
                        user.user,
                        values.enterprise
                    ).catch((error: DirectusError) => {
                        if (error.extensions.code === ErrorCode.RECORD_NOTUNIQUE) {
                            setIsEmailUnique(false);
                        }
                        return;
                    });
                }
            } else {
                modifiedClient = client;
            }
            additionalContactData.forEach(async (clientData) => {
                if (clientData.id && isContactChanged(clientData.id)) {
                    await patchClientContact(
                        clientData.id,
                        clientData.lastName,
                        clientData.firstName,
                        clientData.email,
                        clientData.telephone
                    );
                } else if (!clientData.id) {
                    await addClientContacts(
                        client,
                        clientData.lastName,
                        clientData.firstName,
                        clientData.email,
                        clientData.telephone
                    );
                }
            });
            deletedContactList.forEach(async (contactId) => {
                if (contactId) {
                    deleteContact(contactId);
                }
            });

            setModifiedClient(modifiedClient);
        }
    };

    const AddContactButton = (): React.ReactElement => {
        return (
            <Button
                variant="outlined"
                color="secondary"
                onClick={(): void => handleAddContact()}
                sx={{
                    width: '220px'
                }}>
                <Plus />
                <Box width="15px" />
                {t('addContact')}
            </Button>
        );
    };

    const ButtonSection = (): React.ReactElement => {
        return (
            <React.Fragment>
                <LoadingButton
                    loading={loading}
                    variant="contained"
                    disabled={handleSubmitButtonEnable()}
                    onClick={(): void => {
                        handleSubmit()
                            .then(() => {
                                setLoading(false);
                                onSuccess();
                            })
                            .catch(() => setLoading(false));
                    }}>
                    {t('modifyButtonTitle')}
                </LoadingButton>
                <Box height="20px" />
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={(): void => {
                        onClose();
                    }}>
                    {t('return')}
                </Button>
            </React.Fragment>
        );
    };

    const renderClientModifyModal = (): React.ReactElement => {
        return (
            <Stack>
                <Typography variant="h4" textAlign="center">
                    {t('modifyClient')}
                </Typography>
                <Box height="32px" />
                <Typography
                    sx={{
                        ...small2,
                        color: theme.palette.secondary.medium
                    }}>
                    {t('requiredFields')}
                </Typography>
                <Box height="16px" />
                <Typography variant="h6">{t('address')}</Typography>
                <Box height="16px" />
                <TextField
                    fullWidth
                    type="text"
                    required
                    value={values.address}
                    onChange={handleChange}
                    placeholder={t('address')}
                    label={t('address')}
                    id="address"
                    error={Boolean(errors.address)}
                    helperText={errors.address}
                />
                <Box height="12px" />
                <Stack direction="row" justifyContent="space-between">
                    <TextField
                        sx={{ width: '49%' }}
                        type="number"
                        required
                        value={values.postalCode}
                        onChange={handleChange}
                        placeholder={t('postalCode')}
                        label={t('postalCode')}
                        id={'postalCode'}
                        error={Boolean(errors.postalCode)}
                        helperText={errors.postalCode}
                    />
                    <TextField
                        sx={{ width: '49%' }}
                        required
                        value={values.city}
                        onChange={handleChange}
                        placeholder={t('city')}
                        label={t('city')}
                        id={'city'}
                        error={Boolean(errors.city)}
                        helperText={errors.city}
                    />
                </Stack>
                <Box height="32px" />
                <Typography variant="h6">{t('client')}</Typography>
                <Box height="16px" />
                <Stack direction="row" justifyContent="space-between">
                    <TextField
                        sx={{ width: '49%' }}
                        type="text"
                        required
                        value={values.clientLastName}
                        onChange={handleChange}
                        placeholder={t('nameOfContact')}
                        label={t('nameOfContact')}
                        id={'clientLastName'}
                        error={Boolean(errors.clientLastName)}
                        helperText={errors.clientLastName}
                    />
                    <TextField
                        sx={{ width: '49%' }}
                        required
                        value={values.clientFirstName}
                        onChange={handleChange}
                        placeholder={t('firstnameOfContact')}
                        label={t('firstnameOfContact')}
                        id={'clientFirstName'}
                        error={Boolean(errors.clientFirstName)}
                        helperText={errors.clientFirstName}
                    />
                </Stack>
                {client.client_status === StatusOfClient[1] ? (
                    <TextField
                        fullWidth
                        type="text"
                        value={values.enterprise}
                        onChange={handleChange}
                        required
                        placeholder={t('enterprise')}
                        label={t('enterprise')}
                        id="enterprise"
                        sx={{
                            marginTop: '12px'
                        }}
                        error={Boolean(errors.enterprise)}
                        helperText={errors.enterprise}
                    />
                ) : (
                    <React.Fragment />
                )}
                <Box height="12px" />
                <TextField
                    required
                    fullWidth
                    id="email"
                    name="email"
                    disabled={true}
                    placeholder={t('emailFieldLabel')}
                    label={t('emailFieldLabel')}
                    value={values.email}
                    onChange={handleChange}
                    error={Boolean(errors.email) && values.email !== ''}
                    helperText={
                        (Boolean(errors.email) || !isEmailUnique) && values.email !== ''
                            ? errors.email
                            : ''
                    }
                />
                <Box height="12px" />
                <TextField
                    required
                    fullWidth
                    type={'text'}
                    value={values.phoneNumber}
                    onChange={(e): void => {
                        const ASCIICode = e.target.value.charCodeAt(e.target.value.length - 1);

                        if (!(ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))) {
                            handleChange(e);
                        }
                    }}
                    placeholder={t('phoneNumber')}
                    label={t('phoneNumber')}
                    id={'phoneNumber'}
                    error={Boolean(errors.phoneNumber) && values.phoneNumber !== ''}
                    helperText={
                        Boolean(errors.phoneNumber) && values.phoneNumber !== ''
                            ? t('enterValidPhoneNumber')
                            : ''
                    }
                />
                {additionalContactData.map((contact, index) => (
                    <Stack key={index}>
                        <Box height="32px" />
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h6">{`${t('contact')} ${index + 2}`}</Typography>
                            <IconButton
                                sx={{ padding: '0px' }}
                                onClick={(): void => {
                                    setDeletedContactList([...deletedContactList, contact.id]);
                                    const tempAdditionalContactData = [...additionalContactData];
                                    const tempAdditionalContactDataErrors = [
                                        ...additionalContactDataErrors
                                    ];

                                    tempAdditionalContactData.splice(index, 1);
                                    tempAdditionalContactDataErrors.splice(index, 1);

                                    setAdditionalContactData(tempAdditionalContactData);
                                    setAdditionalContactDataErrors(tempAdditionalContactDataErrors);
                                }}>
                                <X />
                            </IconButton>
                        </Stack>
                        <AdditionalContactsForm
                            clientIndex={index}
                            values={additionalContactData}
                            errors={additionalContactDataErrors}
                            setValues={(items: ClientContactData[]): void =>
                                setAdditionalContactData(items)
                            }
                            setErrors={(errorItems: AddtionalContactDataErrorsInterface[]): void =>
                                setAdditionalContactDataErrors(errorItems)
                            }
                        />
                    </Stack>
                ))}
                <Box height="24px" />
                <AddContactButton />
                <Box height="48px" />
                <ButtonSection />
            </Stack>
        );
    };

    return (
        <ModalContainer
            onClose={(): void => {
                onClose();
            }}
            isModalOpen={isOpen}
            content={renderClientModifyModal()}
        />
    );
}
