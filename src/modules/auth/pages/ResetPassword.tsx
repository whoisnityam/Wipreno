import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { resetPassword, setPassword } from '../services/AuthService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage, passwordValidationSchema } from '../../../utils';
import { PasswordTextField } from '../components/PasswordTextField';
import { object } from 'yup';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';

export function ResetPassword(): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('lg'));

    const token = searchParams.get('token');

    const [successAlertOpen, setSuccessAlertOpen] = useState(false);

    useEffect(() => {
        return (): void => {
            setLoading(false);
        };
    }, []);

    const handleSuccessAlert = (): void => {
        setSuccessAlertOpen(true);
        setTimeout(async () => {
            setSuccessAlertOpen(false);
            navigate('/auth/login');
        }, 3000);
    };

    const validationSchema = object({
        password: passwordValidationSchema(t('passwordRulesMessage'))
    });

    const resetPasswordForm = useFormik({
        initialValues: {
            password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            if (location.pathname === '/auth/reset-password') {
                resetPassword(token ?? '', values.password)
                    .then(() => handleSuccessAlert())
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .catch((errors: any) => {
                        const err = errors.response.data.errors[0].extensions.code;
                        resetPasswordForm.setErrors({ password: getErrorMessage(err, t) });
                    });
            } else if (location.pathname === '/auth/set-password') {
                setPassword(token ?? '', values.password)
                    .then(() => navigate('/auth/login'))
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .catch((errors: any) => {
                        const err = errors.response.data.errors[0].extensions.code;
                        resetPasswordForm.setErrors({ password: getErrorMessage(err, t) });
                    });
            }
            setLoading(false);
        }
    });

    const { values, errors, handleChange, submitForm, isValid } = resetPasswordForm;

    return (
        <>
            <SuccessAlert
                title={t('yourPasswordHasBeenChanged')}
                subtitle={t('youWillBeRedirectedToLogin')}
                open={successAlertOpen}
                onClose={(): void => navigate('/auth/login')}
            />
            {!isLarge && (
                <Stack height="100%" width="100%" justifyContent="space-between">
                    <Stack>
                        <Typography variant="h4" color={NEUTRAL.darker}>
                            {t('resetPasswordTitleMobile')}
                        </Typography>
                        <Box height="32px" />
                        <PasswordTextField
                            required
                            id="password"
                            name="password"
                            label={t('newPasswordFieldLabel')}
                            value={values.password}
                            onChange={handleChange}
                            error={Boolean(errors.password)}
                            helperText={errors.password}
                            sx={{ marginBottom: '8px' }}
                            onKeyDown={async (event): Promise<void> => {
                                if (event.key === 'Enter' && values.password !== '') {
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
                            disabled={!isValid || !Boolean(values.password)}
                            type="submit"
                            variant={'contained'}
                            onClick={async (e): Promise<void> => {
                                e.preventDefault();
                                await submitForm();
                            }}>
                            <Typography variant="button">
                                {t('resetPasswordButtonTitle')}
                            </Typography>
                        </LoadingButton>
                        <Box height="40px" />
                    </Stack>
                </Stack>
            )}
            {isLarge && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '75vh',
                        width: '100%',
                        justifyContent: 'center',
                        whiteSpace: 'pre-line'
                    }}>
                    <Typography variant={'h3'} color={NEUTRAL.darker}>
                        {t('resetPasswordTitle')}
                    </Typography>
                    <Box height={'40px'} />
                    <PasswordTextField
                        required
                        id="password"
                        name="password"
                        label={t('newPasswordFieldLabel')}
                        value={values.password}
                        onChange={handleChange}
                        error={Boolean(errors.password)}
                        helperText={errors.password}
                        sx={{ marginBottom: '8px' }}
                        onKeyDown={async (event): Promise<void> => {
                            if (event.key === 'Enter' && values.password !== '') {
                                await submitForm();
                            }
                        }}
                    />
                    <Box height={'40px'} />
                    <LoadingButton
                        loading={loading}
                        fullWidth
                        disabled={!isValid || !Boolean(values.password)}
                        type="submit"
                        variant={'contained'}
                        onClick={async (e): Promise<void> => {
                            e.preventDefault();
                            await submitForm();
                        }}
                        sx={{ padding: 2 }}>
                        <Typography variant="button">{t('resetPasswordButtonTitle')}</Typography>
                    </LoadingButton>
                </Box>
            )}
        </>
    );
}
