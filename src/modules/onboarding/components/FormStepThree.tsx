import React from 'react';
import { Box, Grid, TextField, Typography } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { small1 } from '../../../theme/typography';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { FormContainer } from './FormContainer';
import { object } from 'yup';
import * as yup from 'yup';

interface FormStepThreeProps {
    initialValues: {
        companyName: string;
        address: string;
        postalCode: string;
        city: string;
    };
    onSubmit: Function;
    onPreviousClick: Function;
}

export function FormStepThree({
    initialValues,
    onSubmit,
    onPreviousClick
}: FormStepThreeProps): React.ReactElement {
    const { t } = useTranslation();

    const validationSchema = object({
        postalCode: yup
            .string()
            .matches(/^[0-9]+$/, t('invalidPostalCode'))
            .min(4, t('invalidPostalCode'))
            .max(5, t('invalidPostalCode'))
    });

    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            onSubmit(values);
        }
    });

    const { values, errors, handleChange, submitForm, isValid } = form;
    return (
        <FormContainer
            primaryButtonDisabled={
                !isValid || !Boolean(values.address.trim()) || !Boolean(values.city.trim())
            }
            primaryButtonOnClick={submitForm}
            secondaryButtonVisible={true}
            secondaryButtonOnClick={onPreviousClick}>
            <Box>
                <Typography
                    variant="h3"
                    color={NEUTRAL.darker}
                    sx={{ fontFamily: 'Poppins', width: '550px', height: '80px' }}>
                    {t('completeBillingAddress')}
                </Typography>
                <Box height={'40px'} />
                <Typography color={'secondary.medium'} sx={small1} mt={4} mb={4}>
                    {t('requiredFields')}
                </Typography>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="companyName"
                            name="companyName"
                            label={t('companyName')}
                            value={values.companyName}
                            onChange={handleChange}
                            error={Boolean(errors.companyName)}
                            helperText={errors.companyName}
                            sx={{ marginBottom: '8px', width: '100%' }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="address"
                            name="address"
                            label={t('address')}
                            value={values.address}
                            onChange={handleChange}
                            error={Boolean(errors.address)}
                            helperText={errors.address}
                            sx={{ marginBottom: '8px', width: '100%' }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="postalCode"
                            name="postalCode"
                            type={'number'}
                            label={t('postalCode')}
                            value={values.postalCode}
                            onChange={handleChange}
                            error={Boolean(errors.postalCode)}
                            helperText={errors.postalCode}
                            sx={{ marginBottom: '8px', width: '100%' }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="city"
                            name="city"
                            label={t('city')}
                            value={values.city}
                            onChange={handleChange}
                            error={Boolean(errors.city)}
                            helperText={errors.city}
                            sx={{ marginBottom: '8px', width: '100%' }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </FormContainer>
    );
}
