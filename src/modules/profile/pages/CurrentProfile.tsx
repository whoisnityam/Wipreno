import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slide,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { JobTitles } from '../../../constants';
import * as yup from 'yup';
import 'yup-phone';
import { object } from 'yup';
import { useFormik } from 'formik';
import {
    deleteAccount,
    updateEnterpriseData,
    updatePassword,
    updateUsersData
} from '../services/ProfileService';
import { UpdateUser } from '../models/updateUser';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { CompanyHeaderAlert } from '../../../components/alerts/CompanyHeaderAlert';
import { CompanyHeader } from '../../../components/CompanyHeader';
import { User } from '../models/User';
import { getClients } from '../../clients/services/ClientService';
import { Alert } from '../../../components/alerts/Alert';
import { button2, small1 } from '../../../theme/typography';
import { PasswordTextField } from '../../auth/components/PasswordTextField';
import { getFileURL, passwordValidationSchema, postalCheck } from '../../../utils';
import { makeStyles } from '@mui/styles';
import { logout } from '../../auth/services/AuthService';
import { useNavigate } from 'react-router-dom';
import { FileData } from '../../projects/models/FileData';
import { GetCurrentUser, uploadFile } from '../../../services/DirectusService';
import { SystemStyleObject, Theme } from '@mui/system';
import { LoadingButton } from '@mui/lab';

export function CurrentProfile(): React.ReactElement {
    const [user, setUser] = useState<User | null>(null);
    const [client, setClient] = useState<User>();
    const [isModify, setIsModify] = useState<boolean>(false);
    const inputFile = useRef<HTMLInputElement>(null);
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [successChangePasswordModalOpen, setsuccessChangePasswordModalOpen] =
        useState<boolean>(false);
    const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState<boolean>(false);
    const [document, setDocument] = useState<File | null>(null);
    const [openDeleteAccountAlert, setOpenDeleteAccountAlert] = useState<boolean>(false);
    const [openCompanyHeader, setOpenCompanyHeader] = useState<boolean>(false);
    const [isPasswordSame, setIsPasswordSame] = useState<boolean>(false);
    const [openChangePasswordAlert, setOpenChangePasswordAlert] = useState<boolean>(false);
    const [logo, setLogo] = useState<FileData>();
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const [openChangePassword, setOpenChangePassword] = useState<boolean>(false);
    const [openModifyProfile, setOpenModifyProfile] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        return (): void => {
            setLoading(false);
        };
    }, []);

    const handleClose = (): void => {
        if (openChangePassword) {
            setOpenChangePassword(false);
        }
        if (openModifyProfile) {
            setOpenModifyProfile(false);
        }
    };

    const useStyles = makeStyles(() => ({
        helperTextError: {
            '& .MuiFormHelperText-root': {
                color: '#C22A29'
            }
        }
    }));
    const classes = useStyles();

    const getUserData = useCallback(async (): Promise<void> => {
        const updatedUser = await GetCurrentUser();
        setUser(updatedUser);
    }, [user]);

    useEffect(() => {
        getUserData();
    }, []);

    const triggerFileUpload = (): void => {
        if (inputFile && inputFile.current) {
            inputFile.current.click();
        }
    };

    const sendFile = async (): Promise<void> => {
        if (document) {
            const res = await uploadFile(document);
            setLogo(res);
        }
    };

    const [profileData, setProfileData] = useState<UpdateUser>({
        id: user?.id ?? '',
        lastName: user?.last_name ?? '',
        firstName: user?.first_name ?? '',
        enterprise: user?.enterprises?.at(0)?.enterprise_id.name ?? '',
        emailFieldLabel: user?.email ?? '',
        phoneNumber: user?.phone ?? '',
        address: user?.address ?? '',
        profession: user?.manager_profession ?? '',
        postalCode: postalCheck(user?.postal_code ?? '') ?? '',
        city: user?.city ?? '',
        enterpriseImage: user?.enterprises?.at(0)?.enterprise_id.image ?? null,
        confirmPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        setProfileData({
            ...profileData,
            enterpriseImage: logo ?? null
        });
    }, [logo]);

    useEffect(() => {
        sendFile();
    }, [document]);

    const fetchClients = async (): Promise<User[]> => {
        if (user) {
            return getClients(user!.enterprises.at(0)!.enterprise_id.id);
        } else {
            return [];
        }
    };

    const fetchDetails = async (): Promise<void> => {
        if (user?.enterprises?.at(0)?.enterprise_id.image) {
            setLogo(user!.enterprises.at(0)!.enterprise_id.image);
        }
        const responseClients = await fetchClients();
        if (responseClients) {
            const List: User[] = [];
            for (const element of responseClients) {
                if (element.id !== null) {
                    const item = element;
                    List.push(item);
                }
                setClient(List[0]);
            }
        }
    };

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            if (isModify) {
                setIsModify(false);
            }
            if (openModifyProfile) {
                setOpenModifyProfile(false);
            }
            getUserData();
        }, 3000);
    };
    const changePasswordModalOpen = (): void => {
        setOpenChangePasswordAlert(false);
        setsuccessChangePasswordModalOpen(true);
        setTimeout(async () => {
            setsuccessChangePasswordModalOpen(false);
            logout();
            navigate('/auth/login');
        }, 3000);
    };
    const openDeleteSuccessModal = (): void => {
        setOpenDeleteAccountAlert(false);
        setDeleteSuccessModalOpen(true);
        setTimeout(async () => {
            setDeleteSuccessModalOpen(false);
            logout();
            navigate('/auth/login');
        }, 3000);
    };

    const handleDelete = async (): Promise<void> => {
        if (user) {
            await deleteAccount(user);
            openDeleteSuccessModal();
        }
    };

    const sameData = (): boolean => {
        return (
            profileData.address === user?.address &&
            profileData.city === user?.city &&
            profileData.enterprise === user?.enterprises?.at(0)?.enterprise_id.name &&
            profileData.firstName === user?.first_name &&
            profileData.lastName === user?.last_name &&
            profileData.phoneNumber === user?.phone &&
            profileData.postalCode === postalCheck(user?.postal_code ?? '') &&
            profileData.profession === user?.manager_profession &&
            profileData.enterpriseImage === user?.enterprises?.at(0)?.enterprise_id.image
        );
    };

    const PageTitle = (): ReactElement => {
        return (
            <Typography variant={'h3'} color={NEUTRAL.darker}>
                {t('myProfile')}
            </Typography>
        );
    };

    const validationSchema = object({
        lastName: yup.string(),
        firstName: yup.string(),
        profession: yup.string(),
        companyName: yup.string(),
        emailFieldLabel: yup.string().email(t('invalidEmailErrorMessage')),
        phoneNumber: yup.string().phone('FR', false, t('enterValidPhoneNumber')).required(),
        address: yup.string(),
        postalCode: yup
            .string()
            .matches(/^[0-9]+$/, t('invalidPostalCode'))
            .min(4, t('invalidPostalCode'))
            .max(5, t('invalidPostalCode')),
        city: yup.string(),
        newPassword: passwordValidationSchema(t('passwordRulesMessage')),
        confirmPassword: yup.string()
    });

    const profileForm = useFormik({
        initialValues: profileData,
        validationSchema,
        onSubmit: async (values) => {
            values.enterpriseImage = logo ?? null;
            const res = sameData();
            if (!res) {
                if (values.phoneNumber.startsWith('0')) {
                    const response = await updateUsersData(values);
                    if (response) {
                        const enterpriseResponse = await updateEnterpriseData(
                            user?.enterprises?.at(0)?.enterprise_id.id ?? '',
                            values.enterprise,
                            values.enterpriseImage
                        );
                        if (enterpriseResponse) {
                            setLogo(enterpriseResponse.image);
                            setProfileData({
                                ...profileData,
                                enterpriseImage: enterpriseResponse.image!
                            });
                            openSuccessModal();
                        }
                    }
                } else {
                    values.phoneNumber = 0 + values.phoneNumber;
                    const response = await updateUsersData(values);
                    if (response) {
                        const enterpriseResponse = await updateEnterpriseData(
                            user?.enterprises?.at(0)?.enterprise_id.id ?? '',
                            values.enterprise,
                            values.enterpriseImage
                        );
                        if (enterpriseResponse) {
                            setLogo(enterpriseResponse.image);
                            setProfileData({
                                ...profileData,
                                enterpriseImage: enterpriseResponse.image!
                            });
                            openSuccessModal();
                        }
                    }
                }
            }
        }
    });

    const { values, errors, handleChange, submitForm, isValid, setFieldValue } = profileForm;

    useEffect(() => {
        profileForm.initialValues.id = user?.id ?? '';
        profileForm.initialValues.address = user?.address ?? '';
        profileForm.initialValues.city = user?.city ?? '';
        profileForm.initialValues.emailFieldLabel = user?.email ?? '';
        profileForm.initialValues.enterprise = user?.enterprises?.at(0)?.enterprise_id.name ?? '';
        profileForm.initialValues.enterpriseImage =
            user?.enterprises?.at(0)?.enterprise_id.image ?? null;
        profileForm.initialValues.firstName = user?.first_name ?? '';
        profileForm.initialValues.lastName = user?.last_name ?? '';
        profileForm.initialValues.phoneNumber = user?.phone ?? '';
        profileForm.initialValues.postalCode = postalCheck(user?.postal_code ?? '') ?? '';
        profileForm.initialValues.profession = user?.manager_profession ?? '';
        if (user) {
            fetchDetails();
        }
    }, [user]);

    useEffect(() => {
        setProfileData({
            id: user?.id ?? '',
            lastName: values.lastName,
            firstName: values.firstName,
            enterprise: values.enterprise,
            profession: values.profession,
            emailFieldLabel: values.emailFieldLabel,
            phoneNumber: values.phoneNumber,
            address: values.address,
            postalCode: values.postalCode,
            city: values.city,
            enterpriseImage: logo ?? null,
            confirmPassword: values.confirmPassword,
            newPassword: values.newPassword
        });
    }, [values, user]);

    const validatePassword = (): void => {
        if (values.newPassword === values.confirmPassword) {
            setIsPasswordSame(true);
        } else {
            setIsPasswordSame(false);
        }
    };
    const validateSamePassword = (): boolean => {
        return !!(
            values.confirmPassword.match(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%])(?=.{8,})/
            ) && values.newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%])(?=.{8,})/)
        );
    };

    useEffect(() => {
        if (values.confirmPassword !== '') {
            validatePassword();
        }
    }, [values.confirmPassword, values.newPassword, validateSamePassword()]);

    const ProfileDesktop = (): React.ReactElement => {
        return (
            <Box>
                <Box display={'flex'} justifyContent={'space-between'}>
                    <PageTitle />
                    <Box display={'flex'}>
                        {isModify ? (
                            <>
                                <Button
                                    variant={'outlined'}
                                    color={'secondary'}
                                    onClick={(): void => {
                                        setIsModify(false);
                                        setFieldValue('lastName', user?.last_name);
                                        setFieldValue('firstName', user?.first_name);
                                        setFieldValue('profession', user?.manager_profession);
                                        setFieldValue('phoneNumber', user?.phone);
                                        setFieldValue('address', user?.address);
                                        setFieldValue('postalCode', user?.postal_code);
                                        setFieldValue('city', user?.city);
                                        setFieldValue(
                                            'logo',
                                            user?.enterprises?.at(0)?.enterprise_id.image
                                        );
                                    }}>
                                    {t('cancelButtonTitle')}
                                </Button>
                                <Box width={'20px'} />
                                <Button
                                    disabled={
                                        !isValid ||
                                        !Boolean(values.address.trim()) ||
                                        !Boolean(values.city.trim()) ||
                                        !Boolean(values.enterprise.trim()) ||
                                        !Boolean(values.profession.trim()) ||
                                        !Boolean(values.firstName.trim()) ||
                                        !Boolean(values.lastName.trim()) ||
                                        !Boolean(values.postalCode)
                                    }
                                    variant={'contained'}
                                    color={'primary'}
                                    onClick={(): void => {
                                        submitForm();
                                    }}>
                                    {t('saveChanges')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant={'outlined'}
                                    color={'secondary'}
                                    onClick={(): void => {
                                        setOpenChangePasswordAlert(true);
                                    }}>
                                    {t('changePassword')}
                                </Button>
                                <Box width={'20px'} />
                                <Button
                                    variant={'contained'}
                                    color={'secondary'}
                                    onClick={(): void => setIsModify(true)}>
                                    {t('modifyButtonTitle')}
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
                <Box>
                    <Typography mt={3} mb={3} variant="h5" color={'primary'}>
                        {t('profile')}
                    </Typography>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1, sm: 2, md: 3 }}
                        justifyContent={'flex-start'}>
                        <Box sx={{ width: '25%' }}>
                            <TextField
                                disabled={!isModify}
                                id="lastName"
                                required
                                value={values.lastName}
                                name="lastName"
                                label={t('lastNameTextFieldLabel')}
                                sx={{ marginBottom: '8px', width: '100%' }}
                                onChange={handleChange}
                                error={Boolean(errors.lastName)}
                                helperText={errors.lastName}
                            />
                        </Box>
                        <Box sx={{ width: '25%' }}>
                            <TextField
                                disabled={!isModify}
                                id="firstName"
                                name="firstName"
                                required
                                label={t('firstNameTextFieldLabel')}
                                value={values.firstName}
                                sx={{ marginBottom: '8px', width: '100%' }}
                                onChange={handleChange}
                                error={Boolean(errors.firstName)}
                                helperText={errors.firstName}
                            />
                        </Box>
                        <Box sx={{ width: '40%' }}>
                            <FormControl fullWidth required error={Boolean(errors.profession)}>
                                <InputLabel id="profession-label">{t('profession')}</InputLabel>
                                <Select
                                    fullWidth
                                    disabled={!isModify}
                                    labelId="profession-label"
                                    id="profession"
                                    value={values.profession ?? ''}
                                    onChange={handleChange}
                                    sx={{
                                        color: NEUTRAL.medium,
                                        marginBottom: '8px',
                                        width: '100%'
                                    }}
                                    label={t('profession')}
                                    name="profession">
                                    {JobTitles.map((value) => (
                                        <MenuItem
                                            key={value}
                                            value={value}
                                            sx={{
                                                ':hover': {
                                                    backgroundColor: 'primary.lighter',
                                                    color: NEUTRAL.medium
                                                }
                                            }}>
                                            <Typography
                                                variant="body2"
                                                color={theme.palette.grey[200]}>
                                                {value}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Stack>
                    <Stack
                        mt={1}
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1, sm: 2, md: 3 }}
                        justifyContent={'flex-start'}>
                        <Box sx={{ width: '30%' }}>
                            <TextField
                                type="text"
                                disabled={!isModify}
                                value={values.enterprise}
                                required
                                placeholder={t('companyNameTableHeader')}
                                label={t('companyNameTableHeader')}
                                id={'enterprise'}
                                sx={{ marginBottom: '8px', width: '100%' }}
                                onChange={handleChange}
                                error={Boolean(errors.enterprise)}
                                helperText={errors.enterprise}
                            />
                        </Box>
                        <Box sx={{ width: '30%' }}>
                            <TextField
                                fullWidth
                                type="email"
                                disabled
                                required
                                value={values.emailFieldLabel}
                                placeholder={t('emailFieldLabel')}
                                label={t('emailFieldLabel')}
                                id={'emailFieldLabel'}
                                sx={{ marginBottom: '8px', width: '100%' }}
                                onChange={handleChange}
                                error={Boolean(errors.emailFieldLabel)}
                                helperText={errors.emailFieldLabel}
                            />
                        </Box>
                        <Box sx={{ width: '30%' }}>
                            <TextField
                                fullWidth
                                type="text"
                                disabled={!isModify}
                                required
                                value={values.phoneNumber}
                                placeholder={t('phoneNumber')}
                                label={t('phoneNumber')}
                                id={'phoneNumber'}
                                sx={{ marginBottom: '8px', width: '100%' }}
                                onChange={(e): void => {
                                    const ASCIICode = e.target.value.charCodeAt(
                                        e.target.value.length - 1
                                    );

                                    if (!(ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))) {
                                        handleChange(e);
                                    }
                                }}
                                error={Boolean(errors.phoneNumber)}
                                helperText={errors.phoneNumber}
                            />
                        </Box>
                    </Stack>
                </Box>
                <Stack
                    sx={{ width: '100%' }}
                    spacing={{ xs: 1, sm: 2, md: 3 }}
                    direction={{ xs: 'column', sm: 'row' }}>
                    <Box sx={{ width: '50%' }}>
                        <Typography mt={3} variant="h5" color={'primary'}>
                            {t('address')}
                        </Typography>
                        <Stack
                            mt={3}
                            direction={{ xs: 'column', sm: 'column' }}
                            spacing={{ xs: 1, sm: 2, md: 2 }}
                            justifyContent={'flex-start'}>
                            <Box sx={{ width: '100%' }}>
                                <TextField
                                    required
                                    disabled={!isModify}
                                    sx={{ width: '100%' }}
                                    type="text"
                                    value={values.address}
                                    placeholder={t('address')}
                                    label={t('address')}
                                    id={'address'}
                                    onChange={handleChange}
                                    error={Boolean(errors.address)}
                                    helperText={errors.address}
                                />
                            </Box>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent={'space-between'}
                                sx={{
                                    width: '100%'
                                }}>
                                <TextField
                                    sx={{ width: '48%' }}
                                    type="number"
                                    required
                                    disabled={!isModify}
                                    value={values.postalCode}
                                    placeholder={t('postalCode')}
                                    label={t('postalCode')}
                                    id={'postalCode'}
                                    onChange={handleChange}
                                    error={Boolean(errors.postalCode)}
                                    helperText={errors.postalCode}
                                />
                                <TextField
                                    sx={{ width: '48%' }}
                                    required
                                    disabled={!isModify}
                                    value={values.city}
                                    placeholder={t('city')}
                                    label={t('city')}
                                    id={'city'}
                                    onChange={handleChange}
                                    error={Boolean(errors.city)}
                                    helperText={errors.city}
                                />
                            </Stack>
                        </Stack>
                    </Box>
                    <Box sx={{ width: '30%' }}>
                        <Typography mt={3} variant="h5" color={'primary'}>
                            {t('myCompanyHeader')}
                        </Typography>
                        <Stack
                            mt={2}
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 1, sm: 2, md: 2 }}
                            justifyContent={'flex-start'}>
                            <Box
                                mb={2}
                                sx={{
                                    border: '1px solid',
                                    borderColor: theme.palette.grey[100],
                                    width: '150px',
                                    height: '150px'
                                }}>
                                <input
                                    type="file"
                                    name="document"
                                    disabled={!isModify}
                                    accept="image/png, image/jpeg"
                                    id="document"
                                    ref={inputFile}
                                    onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                        if (event.target.files && event.target.files[0] !== null) {
                                            setDocument(event.target.files[0]);
                                        }
                                    }}
                                    style={{ display: 'none', height: '150px', width: '150px' }}
                                />
                                <Stack
                                    direction="row"
                                    onClick={(): void => triggerFileUpload()}
                                    sx={{ width: '100%', height: '100%' }}
                                    justifyContent={'space-between'}>
                                    <Box mb={2} sx={{ width: '100%', height: '100%' }}>
                                        {logo ? (
                                            <img
                                                src={getFileURL(logo.id, 'contain', '148', '148')}
                                                height={'100%'}
                                                width={'100%'}
                                                id={'logo'}
                                                alt={'logo'}
                                            />
                                        ) : null}
                                    </Box>
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                    <Box sx={{ width: '20%' }}>
                        <Box mt={3} onClick={(): void => setOpenCompanyHeader(true)}>
                            <Button sx={{ boxShadow: 'none' }}>
                                <Typography color={'secondary'} variant="button">
                                    {t('seeHeader')}
                                </Typography>
                            </Button>
                        </Box>
                    </Box>
                </Stack>

                {isModify ? (
                    <>
                        <Button
                            variant={'contained'}
                            color={'error'}
                            type={'button'}
                            onClick={(): void => {
                                setOpenDeleteAccountAlert(true);
                            }}>
                            {t('deleteMyAccount')}
                        </Button>
                    </>
                ) : (
                    <></>
                )}
                <SuccessAlert
                    onClose={(): void => {}}
                    open={successModalOpen}
                    title={t('yourRequestBeenAccounted')}
                    subtitle={t('youWillBeRedirectedToAccount')}
                />
                <SuccessAlert
                    onClose={(): void => {}}
                    open={successChangePasswordModalOpen}
                    title={t('yourPasswordHasBeenChanged')}
                    subtitle={t('youWillBeRedirectedToLogin')}
                />

                <SuccessAlert
                    onClose={(): void => {}}
                    open={deleteSuccessModalOpen}
                    title={t('yourRequestBeenAccounted')}
                    subtitle={t('youWillBeRedirectedToLoginPage')}
                />
                <Alert
                    width="440px"
                    title={t('wantToDeleteAccount')}
                    subtitle={t('accountDeleteDisclaimer')}
                    open={openDeleteAccountAlert}
                    onClick={(): Promise<void> => handleDelete()}
                    onSecondaryButtonClick={(): void => {
                        setOpenDeleteAccountAlert(false);
                    }}
                    primaryButton={t('deleteMyAccount')}
                    primaryButtonType="error"
                    secondaryButton={t('cancelButtonTitle')}
                    secondaryButtonType={'text'}
                />
                <CompanyHeaderAlert
                    width="450px"
                    height="395px"
                    title={t('myCompanyHeader')}
                    open={openCompanyHeader}
                    onSecondaryButtonClick={(): void => {
                        setOpenCompanyHeader(false);
                        setIsModify(true);
                    }}
                    onCrossClick={(): void => {
                        setOpenCompanyHeader(false);
                    }}
                    secondaryButton={t('modifyButtonTitle')}
                    onClose={(): void => {
                        setOpenCompanyHeader(false);
                    }}
                    secondaryButtonType="outlined">
                    <Box mb={2} sx={{ width: '100%' }}>
                        <CompanyHeader
                            companyLogo={logo?.id ?? ''}
                            userInfo={user}
                            clientInfo={client}
                            projectAddress={{
                                address: '1 rue da la Libération du temps',
                                postal_code: '12300',
                                city: 'Ville'
                            }}
                        />
                    </Box>
                </CompanyHeaderAlert>
                <Alert
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
                    onClose={(): void => {
                        setOpenChangePasswordAlert(false);
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
                            mb={'16px'}
                            sx={{ color: 'secondary.medium', ...small1, fontWeight: '700' }}>
                            {t('requiredFieldsMessage')}
                        </Typography>
                        <PasswordTextField
                            required
                            id="newPassword"
                            name="newPassword"
                            label={t('newPassword')}
                            value={values.newPassword}
                            onChange={handleChange}
                            error={Boolean(errors.newPassword)}
                            helperText={errors.newPassword}
                            sx={{ marginBottom: '15px', width: '100%' }}
                        />
                        <PasswordTextField
                            required
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
                            sx={{ marginBottom: '18px', width: '100%' }}
                        />
                    </Box>
                </Alert>
            </Box>
        );
    };

    const ProfileMobile = (): React.ReactElement => {
        return (
            <Stack sx={{ padding: '10px' }}>
                {openModifyProfile ? (
                    <Typography
                        variant="h5"
                        sx={{
                            width: '100%',
                            color: NEUTRAL.darker,
                            textAlign: 'center'
                        }}>
                        {t('modifyMyProfile')}
                    </Typography>
                ) : (
                    <></>
                )}
                <Typography mt={3} mb={3} variant="h6" color={'primary'}>
                    {t('profile')}
                </Typography>
                <Stack direction={'row'} width={'100%'} justifyContent={'space-between'}>
                    <TextField
                        disabled={openModifyProfile ? false : true}
                        id="lastName"
                        required
                        value={values.lastName}
                        name="lastName"
                        label={t('lastNameTextFieldLabel')}
                        sx={{ width: '48%' }}
                        onChange={handleChange}
                        error={Boolean(errors.lastName)}
                        helperText={errors.lastName}
                    />
                    <TextField
                        disabled={openModifyProfile ? false : true}
                        id="firstName"
                        name="firstName"
                        required
                        label={t('firstNameTextFieldLabel')}
                        value={values.firstName}
                        sx={{ width: '48%' }}
                        onChange={handleChange}
                        error={Boolean(errors.firstName)}
                        helperText={errors.firstName}
                    />
                </Stack>
                <FormControl
                    fullWidth
                    required
                    error={Boolean(errors.profession)}
                    sx={{ marginTop: '18px' }}>
                    <InputLabel id="profession-label">{t('profession')}</InputLabel>
                    <Select
                        fullWidth
                        disabled={openModifyProfile ? false : true}
                        labelId="profession-label"
                        id="profession"
                        value={values.profession ?? ''}
                        onChange={handleChange}
                        sx={{
                            color: NEUTRAL.medium,
                            width: '100%'
                        }}
                        label={t('profession')}
                        name="profession">
                        {JobTitles.map((value) => (
                            <MenuItem
                                key={value}
                                value={value}
                                sx={{
                                    ':hover': {
                                        backgroundColor: 'primary.lighter',
                                        color: NEUTRAL.medium
                                    }
                                }}>
                                <Typography variant="body2" color={theme.palette.grey[200]}>
                                    {value}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    type="text"
                    disabled={openModifyProfile ? false : true}
                    value={values.enterprise}
                    required
                    placeholder={t('companyNameTableHeader')}
                    label={t('companyNameTableHeader')}
                    id={'enterprise'}
                    sx={{ marginTop: '18px', width: '100%' }}
                    onChange={handleChange}
                    error={Boolean(errors.enterprise)}
                    helperText={errors.enterprise}
                />
                <TextField
                    fullWidth
                    type="email"
                    disabled
                    required
                    value={values.emailFieldLabel}
                    placeholder={t('emailFieldLabel')}
                    label={t('emailFieldLabel')}
                    id={'emailFieldLabel'}
                    sx={{ marginTop: '18px', width: '100%' }}
                    onChange={handleChange}
                    error={Boolean(errors.emailFieldLabel)}
                    helperText={errors.emailFieldLabel}
                />
                <TextField
                    fullWidth
                    type="text"
                    disabled={openModifyProfile ? false : true}
                    required
                    value={values.phoneNumber}
                    placeholder={t('phoneNumber')}
                    label={t('phoneNumber')}
                    id={'phoneNumber'}
                    sx={{ marginTop: '18px', width: '100%' }}
                    onChange={(e): void => {
                        const ASCIICode = e.target.value.charCodeAt(e.target.value.length - 1);

                        if (!(ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))) {
                            handleChange(e);
                        }
                    }}
                    error={Boolean(errors.phoneNumber)}
                    helperText={errors.phoneNumber}
                />
                <Typography mt={'40px'} mb={3} variant="h6" color={'primary'}>
                    {t('address')}
                </Typography>
                <TextField
                    required
                    disabled={openModifyProfile ? false : true}
                    sx={{ width: '100%' }}
                    type="text"
                    value={values.address}
                    placeholder={t('address')}
                    label={t('address')}
                    id={'address'}
                    onChange={handleChange}
                    error={Boolean(errors.address)}
                    helperText={errors.address}
                />
                <Stack direction={'row'} width={'100%'} justifyContent={'space-between'}>
                    <TextField
                        sx={{ width: '48%', marginTop: '18px' }}
                        type="number"
                        required
                        disabled={openModifyProfile ? false : true}
                        value={values.postalCode}
                        placeholder={t('postalCode')}
                        label={t('postalCode')}
                        id={'postalCode'}
                        onChange={handleChange}
                        error={Boolean(errors.postalCode)}
                        helperText={errors.postalCode}
                    />
                    <TextField
                        sx={{ width: '48%', marginTop: '18px' }}
                        required
                        disabled={openModifyProfile ? false : true}
                        value={values.city}
                        placeholder={t('city')}
                        label={t('city')}
                        id={'city'}
                        onChange={handleChange}
                        error={Boolean(errors.city)}
                        helperText={errors.city}
                    />
                </Stack>
                <Stack
                    direction={'row'}
                    width={'100%'}
                    mt={'40px'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography variant="h6" color={'primary'}>
                        {t('myCompanyHeader')}
                    </Typography>
                    <Box onClick={(): void => setOpenCompanyHeader(true)} mr={4}>
                        <Button sx={{ boxShadow: 'none' }}>
                            <Typography
                                color={'secondary'}
                                sx={(): SystemStyleObject<Theme> => ({
                                    ...button2
                                })}>
                                {t('seeHeader')}
                            </Typography>
                        </Button>
                    </Box>
                </Stack>
                {!openModifyProfile ? (
                    <Box
                        mt={2}
                        mb={4}
                        sx={{
                            border: '1px solid',
                            borderColor: theme.palette.grey[100],
                            width: '150px',
                            height: '150px'
                        }}>
                        <Box sx={{ width: '100%', height: '100%' }}>
                            {logo ? (
                                <img
                                    src={getFileURL(logo.id, 'contain', '148', '148')}
                                    height={'100%'}
                                    width={'100%'}
                                    id={'logo'}
                                    alt={'logo'}
                                />
                            ) : null}
                        </Box>
                    </Box>
                ) : (
                    <Stack
                        mt={2}
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1, sm: 2, md: 2 }}
                        justifyContent={'flex-start'}>
                        <Box
                            mb={2}
                            sx={{
                                border: '1px solid',
                                borderColor: theme.palette.grey[100],
                                width: '150px',
                                height: '150px'
                            }}>
                            <input
                                type="file"
                                name="document"
                                disabled={openModifyProfile ? false : true}
                                accept="image/png, image/jpeg"
                                id="document"
                                ref={inputFile}
                                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                    if (event.target.files && event.target.files[0] !== null) {
                                        setDocument(event.target.files[0]);
                                    }
                                }}
                                style={{ display: 'none', height: '150px', width: '150px' }}
                            />
                            <Stack
                                direction="row"
                                onClick={(): void => triggerFileUpload()}
                                sx={{ width: '100%', height: '100%' }}
                                justifyContent={'space-between'}>
                                <Box mb={2} sx={{ width: '100%', height: '100%' }}>
                                    {logo ? (
                                        <img
                                            src={getFileURL(logo.id, 'contain', '148', '148')}
                                            height={'100%'}
                                            width={'100%'}
                                            id={'logo'}
                                            alt={'logo'}
                                        />
                                    ) : null}
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>
                )}
                {openModifyProfile ? (
                    <>
                        <Button
                            sx={{ marginTop: '12px' }}
                            disabled={
                                !isValid ||
                                !Boolean(values.address.trim()) ||
                                !Boolean(values.city.trim()) ||
                                !Boolean(values.enterprise.trim()) ||
                                !Boolean(values.profession.trim()) ||
                                !Boolean(values.firstName.trim()) ||
                                !Boolean(values.lastName.trim()) ||
                                !Boolean(values.postalCode)
                            }
                            variant={'contained'}
                            color={'primary'}
                            onClick={(): void => {
                                submitForm();
                            }}>
                            {t('saveChanges')}
                        </Button>
                        <Box height={'18px'} />
                        <Button
                            variant={'contained'}
                            color={'error'}
                            type={'button'}
                            onClick={(): void => {
                                setOpenDeleteAccountAlert(true);
                            }}>
                            {t('deleteMyAccount')}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant={'outlined'}
                            color={'secondary'}
                            onClick={(): void => {
                                setOpenChangePassword(true);
                            }}>
                            {t('changePassword')}
                        </Button>
                        <Box height={'18px'} />
                        <Button
                            sx={{ marginBottom: '12px' }}
                            variant={'contained'}
                            color={'secondary'}
                            onClick={(): void => setOpenModifyProfile(true)}>
                            {t('modifyButtonTitle')}
                        </Button>
                    </>
                )}
                <CompanyHeaderAlert
                    width="345px"
                    height="380px"
                    title={t('myCompanyHeader')}
                    open={openCompanyHeader}
                    onSecondaryButtonClick={(): void => {
                        setOpenCompanyHeader(false);
                        setOpenModifyProfile(true);
                    }}
                    onCrossClick={(): void => {
                        setOpenCompanyHeader(false);
                    }}
                    secondaryButton={t('modifyButtonTitle')}
                    onClose={(): void => {
                        setOpenCompanyHeader(false);
                    }}
                    secondaryButtonType="outlined">
                    <Box mb={2} sx={{ width: '100%' }}>
                        <CompanyHeader
                            companyLogo={logo?.id ?? ''}
                            userInfo={user}
                            clientInfo={client}
                            projectAddress={{
                                address: '1 rue da la Libération du temps',
                                postal_code: '12300',
                                city: 'Ville'
                            }}
                        />
                    </Box>
                </CompanyHeaderAlert>
            </Stack>
        );
    };

    return (
        <>
            {isLargeLandscape ? ProfileDesktop() : ProfileMobile()}
            {!isLargeLandscape && (
                <>
                    <Slide direction="up" in={openChangePassword}>
                        <Dialog
                            open={openChangePassword}
                            keepMounted
                            onClose={handleClose}
                            aria-describedby="alert-dialog-history-of-project"
                            sx={{
                                '.MuiDialog-paper': {
                                    minHeight: 'calc(100% - 40px)',
                                    maxHeight: 'calc(100% - 40px)',
                                    minWidth: '100%',
                                    maxWidth: '100%',
                                    margin: 'unset',
                                    marginTop: '40px',
                                    padding: '25px',
                                    overflowY: 'scroll',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }
                            }}>
                            <>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="center"
                                    alignItems="baseline">
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            width: '100%',
                                            color: NEUTRAL.darker,
                                            marginBottom: theme.spacing(3),
                                            textAlign: 'center',
                                            marginTop: theme.spacing(5)
                                        }}>
                                        {t('changeMyPassword')}
                                    </Typography>
                                    <Box display={'flex'} flexDirection={'column'} width={'100%'}>
                                        <Typography
                                            mb={'16px'}
                                            sx={{
                                                color: 'secondary.medium',
                                                ...small1,
                                                fontWeight: '700'
                                            }}>
                                            {t('requiredFieldsMessage')}
                                        </Typography>
                                        <PasswordTextField
                                            required
                                            id="newPassword"
                                            name="newPassword"
                                            label={t('newPassword')}
                                            value={values.newPassword}
                                            onChange={handleChange}
                                            error={Boolean(errors.newPassword)}
                                            helperText={errors.newPassword}
                                            sx={{ marginBottom: '15px', width: '100%' }}
                                        />
                                        <PasswordTextField
                                            required
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
                                            sx={{ marginBottom: '18px', width: '100%' }}
                                        />
                                    </Box>
                                    <Stack
                                        direction="column"
                                        justifyContent={'space-between'}
                                        width={'100%'}
                                        spacing={'12px'}>
                                        <LoadingButton
                                            loading={loading}
                                            fullWidth
                                            disabled={!(isPasswordSame && validateSamePassword())}
                                            type="submit"
                                            variant={'contained'}
                                            onClick={async (): Promise<void> => {
                                                if (isPasswordSame) {
                                                    if (user) {
                                                        const resposne = await updatePassword(
                                                            user.id,
                                                            values.newPassword
                                                        );
                                                        if (resposne) {
                                                            changePasswordModalOpen();
                                                        }
                                                    }
                                                }
                                            }}
                                            sx={{ padding: 2, marginTop: '24px' }}>
                                            <Typography variant="button">
                                                {t('changeMyPassword')}
                                            </Typography>
                                        </LoadingButton>
                                        <Button
                                            variant={'outlined'}
                                            fullWidth
                                            onClick={(): void => {
                                                setOpenChangePassword(false);
                                            }}>
                                            {t('return')}
                                        </Button>
                                    </Stack>
                                </Box>
                            </>
                        </Dialog>
                    </Slide>
                    <Slide direction="up" in={openModifyProfile}>
                        <Dialog
                            open={openModifyProfile}
                            keepMounted
                            onClose={handleClose}
                            aria-describedby="alert-dialog-history-of-project"
                            sx={{
                                '.MuiDialog-paper': {
                                    minHeight: 'calc(100% - 40px)',
                                    maxHeight: 'calc(100% - 40px)',
                                    minWidth: '100%',
                                    maxWidth: '100%',
                                    margin: 'unset',
                                    marginTop: '40px',
                                    padding: '25px',
                                    overflowY: 'scroll',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }
                            }}>
                            <>{ProfileMobile()}</>
                        </Dialog>
                    </Slide>
                    <SuccessAlert
                        onClose={(): void => {}}
                        open={successChangePasswordModalOpen}
                        title={t('yourPasswordHasBeenChanged')}
                        subtitle={t('youWillBeRedirectedToLogin')}
                    />
                    <SuccessAlert
                        onClose={(): void => {}}
                        open={successModalOpen}
                        title={t('yourRequestBeenAccounted')}
                        subtitle={t('youWillBeRedirectedToAccount')}
                    />
                    <SuccessAlert
                        onClose={(): void => {}}
                        open={deleteSuccessModalOpen}
                        title={t('yourRequestBeenAccounted')}
                        subtitle={t('youWillBeRedirectedToLoginPage')}
                    />
                    <Alert
                        width="440px"
                        title={t('wantToDeleteAccount')}
                        subtitle={t('accountDeleteDisclaimer')}
                        open={openDeleteAccountAlert}
                        onClick={(): Promise<void> => handleDelete()}
                        onSecondaryButtonClick={(): void => {
                            setOpenDeleteAccountAlert(false);
                        }}
                        primaryButton={t('deleteMyAccount')}
                        primaryButtonType="error"
                        secondaryButton={t('toCancel')}
                        secondaryButtonType={'text'}
                    />
                </>
            )}
        </>
    );
}
