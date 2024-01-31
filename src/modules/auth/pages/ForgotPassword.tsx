import React, { useEffect, useState } from 'react';
import { Box, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { object, string } from 'yup';
import { forgotPassword } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../utils';

export function ForgotPassword(): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('lg'));

    useEffect(() => {
        return (): void => {
            setLoading(false);
        };
    }, []);

    const validationSchema = object({
        email: string().email(t('invalidEmailErrorMessage'))
    });

    const forgotPasswordForm = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            forgotPassword(values.email)
                .then(() => navigate('/auth/login'))
                .catch((errors) => {
                    const err = errors.response.data.errors[0].extensions.code;
                    forgotPasswordForm.setErrors({ email: getErrorMessage(err, t) });
                });
            setLoading(false);
        }
    });

    const { values, errors, handleChange, submitForm, isValid } = forgotPasswordForm;

    return (
        <>
            {!isLarge && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100vh',
                        width: '100%',
                        justifyContent: 'space-between'
                    }}>
                    <Stack>
                        <Typography variant={'h4'} color={NEUTRAL.darker}>
                            {t('forgotPasswordTitle')}
                        </Typography>
                        <Box height={'32px'} />
                        <TextField
                            required
                            id="email"
                            name="email"
                            label={t('emailFieldLabel')}
                            value={values.email}
                            onChange={handleChange}
                            error={Boolean(errors.email)}
                            helperText={errors.email}
                            sx={{ marginBottom: '8px' }}
                            onKeyDown={async (event): Promise<void> => {
                                if (event.key === 'Enter' && values.email !== '') {
                                    await submitForm();
                                }
                            }}
                        />
                        <Box height="20px" />
                    </Stack>
                    <Stack>
                        <LoadingButton
                            loading={loading}
                            fullWidth
                            disabled={!isValid || !Boolean(values.email)}
                            type="submit"
                            variant={'contained'}
                            onClick={async (e): Promise<void> => {
                                e.preventDefault();
                                await submitForm();
                            }}
                            sx={{ padding: 2 }}>
                            <Typography variant="button">
                                {t('forgotPasswordScreenButtonTitle')}
                            </Typography>
                        </LoadingButton>
                        <Box height={'40px'} />
                    </Stack>
                </Box>
            )}
            {isLarge && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '75vh',
                        width: '100%',
                        justifyContent: 'center'
                    }}>
                    <Typography variant={'h3'} color={NEUTRAL.darker}>
                        {t('forgotPasswordTitle')}
                    </Typography>
                    <Box height={'40px'} />
                    <TextField
                        required
                        id="email"
                        name="email"
                        label={t('emailFieldLabel')}
                        value={values.email}
                        onChange={handleChange}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        sx={{ marginBottom: '8px' }}
                        onKeyDown={async (event): Promise<void> => {
                            if (event.key === 'Enter' && values.email !== '') {
                                await submitForm();
                            }
                        }}
                    />
                    <Box height={'40px'} />
                    <LoadingButton
                        loading={loading}
                        fullWidth
                        disabled={!isValid || !Boolean(values.email)}
                        type="submit"
                        variant={'contained'}
                        onClick={async (e): Promise<void> => {
                            e.preventDefault();
                            await submitForm();
                        }}
                        sx={{ padding: 2 }}>
                        <Typography variant="button">
                            {t('forgotPasswordScreenButtonTitle')}
                        </Typography>
                    </LoadingButton>
                </Box>
            )}
        </>
    );
}
