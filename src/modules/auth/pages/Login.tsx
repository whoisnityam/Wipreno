import React, { useEffect, useState } from 'react';
import {
    Box,
    styled,
    Link,
    TextField,
    Typography,
    Stack,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { PasswordTextField } from '../components/PasswordTextField';
import { LoadingButton } from '@mui/lab';
import { object, string } from 'yup';
import { body3, small1, small2 } from '../../../theme/typography';
import { login } from '../services/AuthService';
import { getErrorMessage } from '../../../utils';
import { DirectusError } from '../../error/models/ErrorCode';

const StyledLink = styled(Link)(({ theme }) => ({
    color: theme.palette.secondary.medium,
    width: '100%'
}));

export function Login(): React.ReactElement {
    const { t } = useTranslation();
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

    const loginForm = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            login(values.email, values.password)
                .then(() => window.location.reload())
                .catch((error: DirectusError) => {
                    loginForm.setErrors({ password: getErrorMessage(error.extensions.code, t) });
                });
            setLoading(false);
        }
    });

    const { values, errors, handleChange, submitForm, isValid } = loginForm;

    return (
        <>
            {!isLarge && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        width: '100%',
                        justifyContent: 'space-between'
                    }}>
                    <Stack>
                        <Typography variant={'h4'} color={NEUTRAL.darker}>
                            {t('loginTitleMobile')}
                        </Typography>
                        <Box height="32px" />
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
                                    values.email !== '' &&
                                    values.password !== ''
                                ) {
                                    await submitForm();
                                }
                            }}
                        />
                        <StyledLink href="/auth/forgot-password">
                            <Typography
                                sx={{
                                    ...small2,
                                    float: 'right',
                                    textDecorationLine: 'none',
                                    textTransform: 'none'
                                }}>
                                {t('forgotPasswordButtonTitle')}
                            </Typography>
                        </StyledLink>
                        <Box height="20px" />
                    </Stack>
                    <Stack>
                        <LoadingButton
                            loading={loading}
                            fullWidth
                            disabled={
                                !isValid || !Boolean(values.email) || !Boolean(values.password)
                            }
                            type="submit"
                            variant={'contained'}
                            onClick={async (e): Promise<void> => {
                                e.preventDefault();
                                await submitForm();
                            }}
                            sx={{ padding: 2 }}>
                            <Typography variant="button">{t('loginButtonTitle')}</Typography>
                        </LoadingButton>
                        <Box display="flex" justifyContent="center" sx={{ margin: '5% auto' }}>
                            <Typography sx={{ ...body3, color: NEUTRAL.medium }}>
                                {t('createAccountMessage')}
                            </Typography>
                            <Link
                                href="/auth/register"
                                sx={{
                                    paddingLeft: '5px',
                                    textDecoration: 'none'
                                }}>
                                <Typography
                                    sx={{
                                        ...small2,
                                        fontWeight: theme.typography.fontWeightBold
                                    }}>
                                    {t('createAccountButtonTitle')}
                                </Typography>
                            </Link>
                        </Box>
                        <Box height="40px" />
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
                        justifyContent: 'space-between'
                    }}>
                    <Typography variant={'h3'} color={NEUTRAL.darker}>
                        {t('loginTitle')}
                    </Typography>
                    <Box display={'flex'} flexDirection={'column'}>
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
                                    values.email !== '' &&
                                    values.password !== ''
                                ) {
                                    await submitForm();
                                }
                            }}
                        />
                        <StyledLink href="/auth/forgot-password">
                            <Typography
                                sx={{
                                    float: 'right',
                                    textDecorationLine: 'none',
                                    textTransform: 'none'
                                }}
                                variant="button">
                                {t('forgotPasswordButtonTitle')}
                            </Typography>
                        </StyledLink>
                    </Box>
                    <Box display={'flex'} flexDirection={'column'}>
                        <LoadingButton
                            loading={loading}
                            fullWidth
                            disabled={
                                !isValid || !Boolean(values.email) || !Boolean(values.password)
                            }
                            type="submit"
                            variant={'contained'}
                            onClick={async (e): Promise<void> => {
                                e.preventDefault();
                                await submitForm();
                            }}
                            sx={{ padding: 2 }}>
                            <Typography variant="button">{t('loginButtonTitle')}</Typography>
                        </LoadingButton>
                        <Box display="flex" justifyContent="center" sx={{ margin: '5% auto' }}>
                            <Typography variant="body2" sx={{ color: NEUTRAL.medium }}>
                                {t('createAccountMessage')}
                            </Typography>
                            <Link
                                href="/auth/register"
                                sx={{
                                    paddingLeft: '5px',
                                    textDecoration: 'none'
                                }}>
                                <Typography
                                    sx={{
                                        ...small1,
                                        fontWeight: theme.typography.fontWeightBold
                                    }}>
                                    {t('createAccountButtonTitle')}
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </Box>
            )}
        </>
    );
}
