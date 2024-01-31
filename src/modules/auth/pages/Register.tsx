import React, { useEffect, useState } from 'react';
import { Box, Link, TextField, Typography, Stack, useMediaQuery, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { PasswordTextField } from '../components/PasswordTextField';
import { LoadingButton } from '@mui/lab';
import { object, string } from 'yup';
import { body3, small1, small2 } from '../../../theme/typography';
import { confirmEmail, register } from '../services/AuthService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage, passwordValidationSchema } from '../../../utils';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { DirectusError } from '../../error/models/ErrorCode';

export function Register(): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(
        Boolean(searchParams.get('confirmEmail')) ?? false
    );
    const [successAlertOpen, setSuccessAlertOpen] = useState(
        Boolean(searchParams.get('successOpen')) ?? false
    );

    useEffect(() => {
        if (Boolean(searchParams.get('successOpen'))) {
            const id = searchParams.get('id');
            if (id) {
                confirmEmail(id);
            }
        }
        return (): void => {
            setLoading(false);
        };
    }, []);

    const validationSchema = object({
        email: string().email(t('invalidEmailErrorMessage')),
        password: passwordValidationSchema(t('passwordRulesMessage'))
    });

    const registerForm = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            register(values.email, values.password, values.firstName, values.lastName)
                .then(() => {
                    setRegisterSuccess(true);
                })
                .catch((error: DirectusError) => {
                    registerForm.setErrors({ password: getErrorMessage(error.extensions.code, t) });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    });

    const { values, errors, handleChange, submitForm, isValid } = registerForm;

    return (
        <>
            <SuccessAlert
                title={t('registerConfirmationTitle')}
                subtitle={t('registrationConfirmationSubtitle')}
                button={t('registrationConfirmationButtonTitle')}
                open={successAlertOpen}
                onClick={(): void => navigate('/auth/login')}
                onClose={(): void => setSuccessAlertOpen(false)}
            />
            <SuccessAlert
                title={isLarge ? t('registerSuccessTitle') : t('registerSuccessTitleMobile')}
                subtitle={t('registerSuccessSubtitle')}
                open={registerSuccess}
                onClose={(): void => setRegisterSuccess(false)}
            />
            {!isLarge && (
                <>
                    <Stack height="100%" width="100%" justifyContent="space-between">
                        <Stack>
                            <Typography variant="h4" color={NEUTRAL.darker}>
                                {t('registerTitleMobile')}
                            </Typography>
                            <Box height="24px" />
                            <Typography
                                sx={{ color: 'secondary.medium', ...small2, fontWeight: '700' }}>
                                {t('requiredFieldsMessage')}
                            </Typography>
                            <Box height={'12px'} />
                            <Stack direction="row" justifyContent="space-between">
                                <TextField
                                    required
                                    id="lastName"
                                    name="lastName"
                                    label={t('lastNameTextFieldLabel')}
                                    value={values.lastName}
                                    onChange={handleChange}
                                    error={Boolean(errors.lastName)}
                                    helperText={errors.lastName}
                                    sx={{ width: 'calc(50% - 6px)' }}
                                    onKeyDown={async (event): Promise<void> => {
                                        if (
                                            event.key === 'Enter' &&
                                            values.lastName !== '' &&
                                            values.firstName !== '' &&
                                            values.email !== '' &&
                                            values.password !== ''
                                        ) {
                                            await submitForm();
                                        }
                                    }}
                                />
                                <TextField
                                    required
                                    id="firstName"
                                    name="firstName"
                                    label={t('firstNameTextFieldLabel')}
                                    value={values.firstName}
                                    onChange={handleChange}
                                    error={Boolean(errors.firstName)}
                                    helperText={errors.firstName}
                                    sx={{ width: 'calc(50% - 6px)' }}
                                    onKeyDown={async (event): Promise<void> => {
                                        if (
                                            event.key === 'Enter' &&
                                            values.lastName !== '' &&
                                            values.firstName !== '' &&
                                            values.email !== '' &&
                                            values.password !== ''
                                        ) {
                                            await submitForm();
                                        }
                                    }}
                                />
                            </Stack>
                            <Box height="20px" />
                            <TextField
                                required
                                id="email"
                                name="email"
                                label={t('emailFieldLabel')}
                                value={values.email}
                                onChange={handleChange}
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                                onKeyDown={async (event): Promise<void> => {
                                    if (
                                        event.key === 'Enter' &&
                                        values.lastName !== '' &&
                                        values.firstName !== '' &&
                                        values.email !== '' &&
                                        values.password !== ''
                                    ) {
                                        await submitForm();
                                    }
                                }}
                            />
                            <Box height="20px" />
                            <PasswordTextField
                                required
                                id="password"
                                name="password"
                                label={t('passwordFieldLabel')}
                                value={values.password}
                                onChange={handleChange}
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                                onKeyDown={async (event): Promise<void> => {
                                    if (
                                        event.key === 'Enter' &&
                                        values.lastName !== '' &&
                                        values.firstName !== '' &&
                                        values.email !== '' &&
                                        values.password !== ''
                                    ) {
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
                                disabled={
                                    !isValid ||
                                    !Boolean(values.email) ||
                                    !Boolean(values.password) ||
                                    !Boolean(values.firstName.trim()) ||
                                    !Boolean(values.lastName.trim())
                                }
                                type="submit"
                                variant={'contained'}
                                onClick={async (e): Promise<void> => {
                                    e.preventDefault();
                                    await submitForm();
                                }}>
                                <Typography variant="button">{t('registerButtonTitle')}</Typography>
                            </LoadingButton>
                            <Box height="16px" />
                            <Stack direction="row" justifyContent="center" marginX="5% auto">
                                <Typography sx={{ color: NEUTRAL.medium, ...body3 }}>
                                    {t('loginMessage')}
                                </Typography>
                                <Link
                                    href="/auth/login"
                                    sx={{
                                        paddingLeft: '5px',
                                        textDecoration: 'none'
                                    }}>
                                    <Typography
                                        sx={{
                                            ...small2,
                                            fontWeight: theme.typography.fontWeightBold
                                        }}>
                                        {t('loginButtonTitle')}
                                    </Typography>
                                </Link>
                            </Stack>
                            <Box height="40px" />
                        </Stack>
                    </Stack>
                </>
            )}
            {isLarge && (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '75vh',
                            width: '100%',
                            justifyContent: 'center'
                        }}>
                        <Typography variant={'h3'} color={NEUTRAL.darker}>
                            {t('registerTitle')}
                        </Typography>

                        <Box display={'flex'} flexDirection={'column'}>
                            <Typography
                                sx={{ color: 'secondary.medium', ...small1, fontWeight: '700' }}>
                                {t('requiredFieldsMessage')}
                            </Typography>
                            <Box height={'12px'} />
                            <TextField
                                required
                                id="lastName"
                                name="lastName"
                                label={t('lastNameTextFieldLabel')}
                                value={values.lastName}
                                onChange={handleChange}
                                error={Boolean(errors.lastName)}
                                helperText={errors.lastName}
                                sx={{ marginBottom: '8px' }}
                                onKeyDown={async (event): Promise<void> => {
                                    if (
                                        event.key === 'Enter' &&
                                        values.lastName !== '' &&
                                        values.firstName !== '' &&
                                        values.email !== '' &&
                                        values.password !== ''
                                    ) {
                                        await submitForm();
                                    }
                                }}
                            />
                            <Box height={'12px'} />
                            <TextField
                                required
                                id="firstName"
                                name="firstName"
                                label={t('firstNameTextFieldLabel')}
                                value={values.firstName}
                                onChange={handleChange}
                                error={Boolean(errors.firstName)}
                                helperText={errors.firstName}
                                sx={{ marginBottom: '8px' }}
                                onKeyDown={async (event): Promise<void> => {
                                    if (
                                        event.key === 'Enter' &&
                                        values.lastName !== '' &&
                                        values.firstName !== '' &&
                                        values.email !== '' &&
                                        values.password !== ''
                                    ) {
                                        await submitForm();
                                    }
                                }}
                            />
                            <Box height={'12px'} />
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
                                    if (
                                        event.key === 'Enter' &&
                                        values.lastName !== '' &&
                                        values.firstName !== '' &&
                                        values.email !== '' &&
                                        values.password !== ''
                                    ) {
                                        await submitForm();
                                    }
                                }}
                            />
                            <Box height={'12px'} />
                            <PasswordTextField
                                required
                                id="password"
                                name="password"
                                label={t('passwordFieldLabel')}
                                value={values.password}
                                onChange={handleChange}
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                                sx={{ marginBottom: '8px' }}
                                onKeyDown={async (event): Promise<void> => {
                                    if (
                                        event.key === 'Enter' &&
                                        values.lastName !== '' &&
                                        values.firstName !== '' &&
                                        values.email !== '' &&
                                        values.password !== ''
                                    ) {
                                        await submitForm();
                                    }
                                }}
                            />
                        </Box>
                        <Box display={'flex'} flexDirection={'column'}>
                            <LoadingButton
                                loading={loading}
                                fullWidth
                                disabled={
                                    !isValid ||
                                    !Boolean(values.email) ||
                                    !Boolean(values.password) ||
                                    !Boolean(values.firstName.trim()) ||
                                    !Boolean(values.lastName.trim())
                                }
                                type="submit"
                                variant={'contained'}
                                onClick={async (e): Promise<void> => {
                                    e.preventDefault();
                                    await submitForm();
                                }}
                                sx={{ padding: 2 }}>
                                <Typography variant="button">{t('registerButtonTitle')}</Typography>
                            </LoadingButton>
                            <Box display="flex" justifyContent="center" sx={{ margin: '5% auto' }}>
                                <Typography variant="body2" sx={{ color: NEUTRAL.medium }}>
                                    {t('loginMessage')}
                                </Typography>
                                <Link
                                    href="/auth/login"
                                    sx={{
                                        paddingLeft: '5px',
                                        textDecoration: 'none'
                                    }}>
                                    <Typography
                                        sx={{
                                            ...small1,
                                            fontWeight: theme.typography.fontWeightBold
                                        }}>
                                        {t('loginButtonTitle')}
                                    </Typography>
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                </>
            )}
        </>
    );
}
