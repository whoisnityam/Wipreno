import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { object } from 'yup';
import { NEUTRAL } from '../../../theme/palette';
import { User } from '../../profile/models/User';
import { updatePassword } from '../../profile/services/ProfileService';
import { passwordValidationSchema } from '../../../utils';
import { UpdateAdmin } from '../models/UpdateAdmin';
import { updateUserData } from '../services/AdminProfileService';
import { logout } from '../../auth/services/AuthService';
import { useNavigate } from 'react-router-dom';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { Alert } from '../../../components/alerts/Alert';
import { PasswordTextField } from '../../auth/components/PasswordTextField';
import { small1 } from '../../../theme/typography';
import { makeStyles } from '@mui/styles';
import { GetCurrentUser } from '../../../services/DirectusService';

export const AdminProfile = (): ReactElement => {
    const mountedRef = useRef(true);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [isModify, setIsModify] = useState<boolean>(false);
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [isPasswordSame, setIsPasswordSame] = useState<boolean>(false);
    const [openChangePasswordAlert, setOpenChangePasswordAlert] = useState<boolean>(false);
    const [successChangePasswordModalOpen, setSuccessChangePasswordModalOpen] =
        useState<boolean>(false);
    const [profileData, setProfileData] = useState<UpdateAdmin>({
        id: user?.id ?? '',
        lastName: user?.last_name ?? '',
        firstName: user?.first_name ?? '',
        emailFieldLabel: user?.email ?? '',
        confirmPassword: '',
        newPassword: ''
    });

    const useStyles = makeStyles(() => ({
        helperTextError: {
            '& .MuiFormHelperText-root': {
                color: '#C22A29'
            }
        }
    }));
    const classes = useStyles();

    const setUserData = async (): Promise<void> => {
        const updatedUser = await GetCurrentUser();
        setUser(updatedUser);
    };

    const closeSuccessModal = (): void => {
        if (isModify) {
            setSuccessModalOpen(false);
            setUserData();
            setIsModify(false);
        }
    };

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            closeSuccessModal();
        }, 3000);
    };

    const closeChangePasswordModal = (): void => {
        setSuccessChangePasswordModalOpen(false);
        logout();
        location.reload();
        navigate('/auth/login');
    };

    const changePasswordModalOpen = (): void => {
        setOpenChangePasswordAlert(false);
        setSuccessChangePasswordModalOpen(true);
        setTimeout(async () => {
            closeChangePasswordModal();
        }, 3000);
    };

    useEffect(() => {
        if (mountedRef.current) {
            setUserData();
        }
    }, [mountedRef]);

    const isSameData = (): boolean => {
        if (
            profileData.firstName === user?.first_name &&
            profileData.lastName === user?.last_name
        ) {
            return true;
        } else {
            return false;
        }
    };

    const validationSchema = object({
        lastName: yup.string(),
        firstName: yup.string(),
        emailFieldLabel: yup.string().email(t('invalidEmailErrorMessage')),
        newPassword: passwordValidationSchema(t('passwordRulesMessage')),
        confirmPassword: yup.string()
    });

    const profileForm = useFormik({
        initialValues: profileData,
        validationSchema,
        onSubmit: async (values) => {
            const res = isSameData();
            if (!res) {
                const response = await updateUserData(values);
                if (response) {
                    openSuccessModal();
                }
            }
        }
    });

    const { values, errors, handleChange, submitForm, isValid, setFieldValue } = profileForm;

    useEffect(() => {
        if (user) {
            setProfileData({
                id: user.id,
                lastName: user.last_name,
                firstName: user.first_name,
                emailFieldLabel: user.email,
                confirmPassword: '',
                newPassword: ''
            });
            setFieldValue('id', user.id);
            setFieldValue('lastName', user.last_name);
            setFieldValue('firstName', user.first_name);
            setFieldValue('emailFieldLabel', user.email);
        }
    }, [user]);

    const validatePassword = (): void => {
        if (values.newPassword === values.confirmPassword) {
            setIsPasswordSame(true);
        } else {
            setIsPasswordSame(false);
        }
    };

    const validateSamePassword = (): boolean => {
        if (
            values.confirmPassword.match(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%])(?=.{8,})/
            ) &&
            values.newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%])(?=.{8,})/)
        ) {
            return true;
        }
        return false;
    };

    useEffect(() => {
        if (values.confirmPassword !== '') {
            validatePassword();
        }
    }, [values.confirmPassword, values.newPassword, validateSamePassword()]);

    useEffect(() => {
        if (user) {
            setProfileData({
                id: user.id,
                lastName: values.lastName,
                firstName: values.firstName,
                emailFieldLabel: values.emailFieldLabel,
                confirmPassword: values.confirmPassword,
                newPassword: values.newPassword
            });
        }
    }, [values, user]);

    const TitleAndModifyButtonSection = (): ReactElement => {
        return (
            <Stack direction="row" justifyContent="space-between">
                <Typography variant={'h3'} color={NEUTRAL.darker}>
                    {t('myProfile')}
                </Typography>
                {isModify ? (
                    <Stack direction="row">
                        <Button
                            variant="outlined"
                            onClick={(): void => {
                                setIsModify(false);
                                setFieldValue('lastName', user?.last_name);
                                setFieldValue('firstName', user?.first_name);
                                setFieldValue('emailFieldLabel', user?.email);
                            }}>
                            {t('return')}
                        </Button>
                        <Box width="20px" />
                        <Button
                            sx={{ whiteSpace: 'nowrap' }}
                            disabled={
                                isSameData() ||
                                !isValid ||
                                !Boolean(values.firstName.trim()) ||
                                !Boolean(values.lastName.trim())
                            }
                            variant="contained"
                            color="primary"
                            onClick={(): void => {
                                submitForm();
                            }}>
                            {t('saveChanges')}
                        </Button>
                    </Stack>
                ) : (
                    <Stack direction="row">
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={(): void => {
                                setOpenChangePasswordAlert(true);
                            }}>
                            {t('changePassword')}
                        </Button>
                        <Box width="20px" />
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={(): void => setIsModify(true)}>
                            {t('modifyButtonTitle')}
                        </Button>
                    </Stack>
                )}
            </Stack>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        return (
            <>
                <Stack>
                    <TitleAndModifyButtonSection />
                    <Box height="52px" />
                    <Stack>
                        <Typography variant="h5" color={'primary'}>
                            {t('profile')}
                        </Typography>
                        <Box height="16px" />
                        <Stack direction="row">
                            <TextField
                                sx={{ width: '20%' }}
                                disabled={!isModify}
                                id="lastName"
                                required
                                value={values.lastName}
                                name="lastName"
                                label={t('lastNameTextFieldLabel')}
                                onChange={handleChange}
                                error={Boolean(errors.lastName)}
                                helperText={errors.lastName}
                            />
                            <Box width="16px" />
                            <TextField
                                sx={{ width: '20%' }}
                                disabled={!isModify}
                                id="firstName"
                                name="firstName"
                                required
                                label={t('firstNameTextFieldLabel')}
                                value={values.firstName}
                                onChange={handleChange}
                                error={Boolean(errors.firstName)}
                                helperText={errors.firstName}
                            />
                        </Stack>
                        <Box height="16px" />
                        <TextField
                            sx={{ width: '30%' }}
                            type="email"
                            disabled
                            required
                            value={values.emailFieldLabel}
                            placeholder={t('emailFieldLabel')}
                            label={t('emailFieldLabel')}
                            id={'emailFieldLabel'}
                            onChange={handleChange}
                            error={Boolean(errors.emailFieldLabel)}
                            helperText={errors.emailFieldLabel}
                        />
                    </Stack>
                </Stack>
                <SuccessAlert
                    onClose={(): void => closeSuccessModal()}
                    open={successModalOpen}
                    title={t('yourRequestBeenAccounted')}
                    subtitle={t('youWillBeRedirectedToAccount')}
                />
                <SuccessAlert
                    onClose={(): void => closeChangePasswordModal()}
                    open={successChangePasswordModalOpen}
                    title={t('yourPasswordHasBeenChanged')}
                    subtitle={t('youWillBeRedirectedToLogin')}
                />
                <Alert
                    onClose={(): void => {
                        setFieldValue('newPassword', '');
                        setFieldValue('confirmPassword', '');
                        setOpenChangePasswordAlert(false);
                    }}
                    width="440px"
                    title={t('changeMyPassword')}
                    open={openChangePasswordAlert}
                    onClick={async (): Promise<void> => {
                        if (isPasswordSame) {
                            if (user) {
                                const resposne = await updatePassword(user.id, values.newPassword);
                                if (resposne) {
                                    changePasswordModalOpen();
                                }
                            }
                        }
                    }}
                    onSecondaryButtonClick={(): void => {
                        setOpenChangePasswordAlert(false);
                    }}
                    primaryButton={t('changeMyPassword')}
                    primaryButtonEnabled={isPasswordSame && validateSamePassword()}
                    primaryButtonType="primary"
                    secondaryButton={t('return')}
                    secondaryButtonType={'text'}>
                    <Box display={'flex'} flexDirection={'column'} width={'100%'}>
                        <Typography
                            sx={{ color: 'secondary.medium', ...small1, fontWeight: '700' }}>
                            {t('requiredFieldsMessage')}
                        </Typography>
                        <Box height="16px" />
                        <PasswordTextField
                            required
                            fullWidth
                            id="newPassword"
                            name="newPassword"
                            label={t('newPassword')}
                            value={values.newPassword}
                            onChange={handleChange}
                            error={Boolean(errors.newPassword)}
                            helperText={errors.newPassword}
                        />
                        <Box height="16px" />
                        <PasswordTextField
                            required
                            fullWidth
                            id="confirmPassword"
                            name="confirmPassword"
                            label={t('confirmPassword')}
                            value={values.confirmPassword}
                            className={
                                !isPasswordSame && values.confirmPassword !== ''
                                    ? classes.helperTextError
                                    : ''
                            }
                            onChange={handleChange}
                            error={Boolean(errors.confirmPassword)}
                            helperText={
                                !isPasswordSame && values.confirmPassword !== ''
                                    ? t('passwordDoesNotMatch')
                                    : errors.confirmPassword
                            }
                        />
                    </Box>
                </Alert>
            </>
        );
    };

    return RenderComponents();
};
