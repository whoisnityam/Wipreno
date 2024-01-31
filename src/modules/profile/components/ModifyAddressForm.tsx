import React from 'react';
import { Box, TextField, Typography, Stack } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { object } from 'yup';
import { useFormik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';
import { FormContainer } from './FormContainer';

interface FormProps {
    initialValues: {
        companyName: string;
        address: string;
        city: string;
        postalCode: string;
    };
    onSubmit: Function;
    closeForm: Function;
    loading: boolean;
}

export function MofifyAddressForm({
    initialValues,
    onSubmit,
    closeForm,
    loading
}: FormProps): React.ReactElement {
    const { t } = useTranslation();

    const validationSchema = object({
        companyName: yup.string(),
        address: yup.string(),
        postalCode: yup
            .string()
            .matches(/^[0-9]+$/, t('invalidPostalCode'))
            .min(4, t('invalidPostalCode'))
            .max(5, t('invalidPostalCode')),
        city: yup.string()
    });

    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            onSubmit(values);
        }
    });

    const { values, errors, handleChange, submitForm, isValid } = form;

    return (
        <FormContainer
            primaryButtonDisabled={
                !isValid ||
                !Boolean(values.companyName.trim()) ||
                !Boolean(values.address.trim()) ||
                !Boolean(values.city.trim()) ||
                loading
            }
            primaryButtonOnClick={submitForm}
            secondaryButtonVisible={true}
            secondaryButtonOnClick={closeForm}
            isModify={true}
            loading={loading}>
            <Box>
                <Typography
                    mb={'32px'}
                    variant="h4"
                    sx={{ color: NEUTRAL.darker, textAlign: 'center', fontFamily: 'Poppins' }}>
                    {t('changeBillingAddress')}
                </Typography>
                <Stack spacing={'12px'}>
                    <TextField
                        type="text"
                        required
                        id="companyName"
                        name="companyName"
                        label={t('companyName')}
                        onChange={handleChange}
                        value={values.companyName}
                        error={Boolean(errors.companyName)}
                        helperText={errors.companyName}
                    />
                    <TextField
                        required
                        type="text"
                        id="address"
                        name="address"
                        label={t('address')}
                        value={values.address}
                        onChange={handleChange}
                        error={Boolean(errors.address)}
                        helperText={errors.address}
                    />
                    <Stack direction={'row'} spacing={'12px'} justifyContent={'space-between'}>
                        <TextField
                            required
                            type="number"
                            id="postalCode"
                            sx={{ width: '49%' }}
                            name="postalCode"
                            label={t('postalCode')}
                            value={values.postalCode}
                            onChange={handleChange}
                            error={Boolean(errors.postalCode)}
                            helperText={errors.postalCode}
                        />
                        <TextField
                            required
                            type="text"
                            id="city"
                            name="city"
                            label={t('city')}
                            sx={{ width: '49%' }}
                            value={values.city}
                            onChange={handleChange}
                            error={Boolean(errors.city)}
                            helperText={errors.city}
                        />
                    </Stack>
                </Stack>
            </Box>
        </FormContainer>
    );
}
