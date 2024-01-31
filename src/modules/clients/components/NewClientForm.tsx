import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import { small2 } from '../../../theme/typography';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { StatusOfClient } from '../../../constants';
import { createStyles, makeStyles } from '@mui/styles';
import { AdditionalContactsForm } from './AdditionalContactForm';
import { Plus } from 'react-feather';
import { addClient, addClientContacts } from '../services/ClientService';
import { UserContext } from '../../../provider/UserProvider';
import { LoadingButton } from '@mui/lab';
import { DirectusError, ErrorCode } from '../../error/models/ErrorCode';

export interface AddtionalContactDataInterface {
    lastName: string;
    firstName: string;
    email: string;
    telephone: string;
}

export interface AddtionalContactDataErrorsInterface {
    email: boolean;
    telephone: boolean;
    firstName: boolean;
    lastName: boolean;
}

interface NewClientFormProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
    appendNewClient: Function;
}

export function NewClientForm({
    handleCloseForm,
    handleOpenSuccess,
    appendNewClient
}: NewClientFormProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const user = useContext(UserContext);

    const useStyles = makeStyles(() =>
        createStyles({
            textColor: {
                color: theme.palette.grey[200]
            },
            labelColor: {
                color: theme.palette.primary.main
            }
        })
    );

    const classes = useStyles();
    const [validClient, setValidClient] = useState<boolean>(true);
    const [isEmailUnique, setIsEmailUnique] = useState<boolean>(false);
    const [additionalContactData, setAdditionalContactData] = useState<
        AddtionalContactDataInterface[]
    >([]);
    const [additionalContactDataErrors, setAdditionalContactDataErrors] = useState<
        AddtionalContactDataErrorsInterface[]
    >([]);
    const [loading, setLoading] = useState<boolean>(false);

    const openSuccessModal = (): void => {
        handleCloseForm();
        handleOpenSuccess();
    };

    const validationSchema = yup.object({
        clientFirstName: yup.string(),
        clientLastName: yup.string(),
        email: yup.string().email(t('invalidEmailErrorMessage')),
        phoneNumber: yup.string().phone('FR', t('enterValidPhoneNumber')),
        status: yup.string(),
        address: yup.string(),
        postalCode: yup
            .string()
            .matches(/^[0-9]+$/, t('invalidPostalCode'))
            .min(4, t('invalidPostalCode'))
            .max(5, t('invalidPostalCode')),
        city: yup.string(),
        enterprise: yup.string()
    });

    const addClientForm = useFormik({
        initialValues: {
            clientLastName: '',
            clientFirstName: '',
            email: '',
            phoneNumber: '',
            status: '',
            address: '',
            postalCode: '',
            city: '',
            enterprise: ''
        },
        validationSchema,
        onSubmit: () => {}
    });

    // Add new empty contact
    const handleAddContact = (): void => {
        const newContactData: AddtionalContactDataInterface = {
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
        setAdditionalContactData([...additionalContactData, newContactData]);
        setAdditionalContactDataErrors([...additionalContactDataErrors, newContactDataError]);
    };

    const { values, errors, handleChange, isValid } = addClientForm;

    useEffect(() => {
        if (values.email !== '') {
            setIsEmailUnique(
                additionalContactData.findIndex((val) => val.email === values.email) === -1
            );
        }
    }, [values.email]);

    // To enable/disable submit button
    const handleSubmitButtonEnable = (): boolean => {
        let isError = false;

        // For main Contact
        isError =
            isError ||
            !isValid ||
            !Boolean(values.address.trim()) ||
            !Boolean(values.city.trim()) ||
            !Boolean(values.clientFirstName.trim()) ||
            !Boolean(values.clientLastName.trim()) ||
            !Boolean(values.email.trim()) ||
            !Boolean(values.postalCode) ||
            !Boolean(values.status.trim());

        // If status is enterprise
        if (values.status === StatusOfClient[1]) {
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

    // onClick handler of form submit button
    const handleSubmit = async (): Promise<void> => {
        const isError = handleSubmitButtonEnable();
        setLoading(true);
        if (user.user && !isError && validClient) {
            setValidClient(true);
            if (values.phoneNumber.startsWith('0')) {
                await addClient(
                    values.address,
                    values.postalCode,
                    values.city,
                    values.status,
                    values.clientLastName,
                    values.clientFirstName,
                    values.email,
                    values.phoneNumber,
                    user.user,
                    values.enterprise
                )
                    .then((client) => {
                        if (client && user.user) {
                            appendNewClient(client);
                            additionalContactData.forEach(async (clientData) => {
                                await addClientContacts(
                                    client,
                                    clientData.lastName,
                                    clientData.firstName,
                                    clientData.email,
                                    clientData.telephone
                                );
                            });
                        }
                        setLoading(false);
                        openSuccessModal();
                    })
                    .catch((error: DirectusError) => {
                        if (error.extensions.code === ErrorCode.RECORD_NOTUNIQUE) {
                            setIsEmailUnique(false);
                        }
                        setLoading(false);
                    });
            } else {
                values.phoneNumber = 0 + values.phoneNumber;
                await addClient(
                    values.address,
                    values.postalCode,
                    values.city,
                    values.status,
                    values.clientLastName,
                    values.clientFirstName,
                    values.email,
                    values.phoneNumber,
                    user.user,
                    values.enterprise
                )
                    .then((client) => {
                        if (client && user.user) {
                            appendNewClient(client);
                            additionalContactData.forEach(async (clientData) => {
                                await addClientContacts(
                                    client,
                                    clientData.lastName,
                                    clientData.firstName,
                                    clientData.email,
                                    clientData.telephone
                                );
                            });
                        }
                        setLoading(false);
                        openSuccessModal();
                    })
                    .catch((error: DirectusError) => {
                        if (error.extensions.code === ErrorCode.RECORD_NOTUNIQUE) {
                            setIsEmailUnique(false);
                        }
                        setLoading(false);
                    });
            }
        }
    };

    return (
        <Stack>
            <Typography variant="h4" textAlign="center">
                {t('addClient')}
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
                    type={'number'}
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
            <FormControl required fullWidth style={{ marginTop: '12px' }}>
                <InputLabel
                    id="demo-simple-select-label"
                    className={values.status === '' ? '' : classes.labelColor}>
                    {t('status')}
                </InputLabel>
                <Select
                    fullWidth
                    labelId="demo-simple-select-label"
                    id="status"
                    value={values.status}
                    label={t('status')}
                    name="status"
                    className={classes.textColor}
                    onChange={handleChange}>
                    {StatusOfClient.map((value, index) => (
                        <MenuItem key={index} value={value}>
                            {value}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box height="12px" />
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
                    display:
                        values.status === '' || values.status === StatusOfClient[0] ? 'none' : '',
                    marginTop: '12px'
                }}
                error={Boolean(errors.enterprise)}
                helperText={errors.enterprise}
            />
            <Box height="12px" />
            <TextField
                required
                fullWidth
                id="email"
                name="email"
                placeholder={t('emailFieldLabel')}
                label={t('emailFieldLabel')}
                value={values.email}
                onChange={handleChange}
                error={(Boolean(errors.email) || !isEmailUnique) && values.email !== ''}
                helperText={
                    !isEmailUnique && values.email !== ''
                        ? t('userAlreadyExistsError')
                        : errors.email
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
            {additionalContactData.map((_, index) => (
                <Stack key={index}>
                    <Box height="32px" />
                    <Typography variant="h6">{`${t('contact')} ${index + 2}`}</Typography>
                    <AdditionalContactsForm
                        clientIndex={index}
                        values={additionalContactData}
                        errors={additionalContactDataErrors}
                        setValues={(items: AddtionalContactDataInterface[]): void =>
                            setAdditionalContactData(items)
                        }
                        setErrors={(errorItems: AddtionalContactDataErrorsInterface[]): void =>
                            setAdditionalContactDataErrors(errorItems)
                        }
                    />
                </Stack>
            ))}
            <Box height="24px" />
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
            <Box height="48px" />
            <LoadingButton
                loading={loading}
                variant="contained"
                disabled={handleSubmitButtonEnable()}
                onClick={(): void => {
                    handleSubmit();
                }}>
                {t('add')}
            </LoadingButton>
            <Box height="20px" />
            <Button
                variant="outlined"
                color="secondary"
                onClick={(): void => {
                    handleCloseForm();
                }}>
                {t('return')}
            </Button>
        </Stack>
    );
}
