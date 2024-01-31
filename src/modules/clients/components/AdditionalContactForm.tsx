import React, { useEffect } from 'react';
import { Box, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
    AddtionalContactDataErrorsInterface,
    AddtionalContactDataInterface
} from './NewClientForm';

interface AdditionalContactsFormProps {
    clientIndex: number;
    values: AddtionalContactDataInterface[];
    errors: AddtionalContactDataErrorsInterface[];
    setValues: Function;
    setErrors: Function;
}

export function AdditionalContactsForm({
    clientIndex,
    values,
    errors,
    setValues,
    setErrors
}: AdditionalContactsFormProps): React.ReactElement {
    const { t } = useTranslation();

    // OnChange handling
    const handleChange =
        (prop: keyof AddtionalContactDataInterface) =>
        (event: React.ChangeEvent<HTMLInputElement>): void => {
            event.preventDefault();
            const tempValues = [...values];
            tempValues[clientIndex] = {
                ...tempValues[clientIndex],
                [prop]: event.target.value
            };
            setValues(tempValues);
        };

    // Phone number error handling
    useEffect(() => {
        yup.string()
            .phone('FR')
            .isValid(values[clientIndex].telephone)
            .then((isValidPhone) => {
                const tempErrors = [...errors];
                tempErrors[clientIndex] = {
                    ...tempErrors[clientIndex],
                    telephone: !isValidPhone
                };
                setErrors(tempErrors);
            });
    }, [values[clientIndex].telephone]);

    useEffect(() => {
        if (values[clientIndex].firstName === '') {
            const tempErrors = [...errors];
            tempErrors[clientIndex] = {
                ...tempErrors[clientIndex],
                firstName: true
            };
            setErrors(tempErrors);
        } else {
            const tempErrors = [...errors];
            tempErrors[clientIndex] = {
                ...tempErrors[clientIndex],
                firstName: false
            };
            setErrors(tempErrors);
        }
    }, [values[clientIndex].firstName]);

    useEffect(() => {
        if (values[clientIndex].lastName === '') {
            const tempErrors = [...errors];
            tempErrors[clientIndex] = {
                ...tempErrors[clientIndex],
                lastName: true
            };
            setErrors(tempErrors);
        } else {
            const tempErrors = [...errors];
            tempErrors[clientIndex] = {
                ...tempErrors[clientIndex],
                lastName: false
            };
            setErrors(tempErrors);
        }
    }, [values[clientIndex].lastName]);

    useEffect(() => {
        yup.string()
            .email()
            .isValid(values[clientIndex].email)
            .then((isValidEmail) => {
                const tempErrors = [...errors];
                tempErrors[clientIndex] = {
                    ...tempErrors[clientIndex],
                    email: !isValidEmail
                };
                setErrors(tempErrors);
            });
    }, [values[clientIndex].email]);

    return (
        <Stack>
            <Box height="16px" />
            <Stack direction="row" justifyContent="space-between">
                <TextField
                    value={values[clientIndex].lastName}
                    sx={{ width: '49%' }}
                    name="lastName"
                    required
                    onChange={handleChange('lastName')}
                    placeholder={t('nameOfContact')}
                    label={t('nameOfContact')}
                />
                <TextField
                    value={values[clientIndex].firstName}
                    sx={{ width: '49%' }}
                    name="firstName"
                    required
                    onChange={handleChange('firstName')}
                    placeholder={t('firstnameOfContact')}
                    label={t('firstnameOfContact')}
                />
            </Stack>
            <Box height="12px" />
            <TextField
                required
                value={values[clientIndex].email}
                fullWidth
                name="email"
                placeholder={t('emailFieldLabel')}
                label={t('emailFieldLabel')}
                onChange={handleChange('email')}
                error={errors[clientIndex].email && values[clientIndex].email !== ''}
                helperText={
                    errors[clientIndex].email && values[clientIndex].email !== ''
                        ? t('invalidEmailErrorMessage')
                        : errors[clientIndex].email
                }
            />
            <Box height="12px" />
            <TextField
                required
                value={values[clientIndex].telephone}
                name="telephone"
                type={'number'}
                fullWidth
                onChange={handleChange('telephone')}
                placeholder={t('phoneNumber')}
                label={t('phoneNumber')}
                error={errors[clientIndex].telephone && values[clientIndex].telephone !== ''}
                helperText={
                    errors[clientIndex].telephone && values[clientIndex].telephone !== ''
                        ? t('enterValidPhoneNumber')
                        : ''
                }
            />
        </Stack>
    );
}
