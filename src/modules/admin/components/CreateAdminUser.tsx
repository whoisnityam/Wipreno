import { Box, Button, Stack, TextField, Typography, useTheme } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { object } from 'yup';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ModalContainer } from '../../../components/ModalContainer';
import { button2 } from '../../../theme/typography';
import { CreateAdmin } from '../models/CreateAdmin';
import { NEUTRAL } from '../../../theme/palette';
import { User } from '../../profile/models/User';
import { createAdminInvite, modifyAdmin } from '../services/AdminManagementService';
import { GetUserByEmail } from '../../../services/DirectusService';

interface CreateAdminUserProps {
    openForm: boolean;
    handleClose: Function;
    isModify: boolean;
    selectedAdmin?: User;
    initialValues: {
        email: string;
        first_name: string;
        last_name: string;
    };
    handleSuccess: Function;
}

export const CreateAdminUser = ({
    openForm,
    handleClose,
    isModify,
    selectedAdmin,
    initialValues,
    handleSuccess
}: CreateAdminUserProps): React.ReactElement => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [validAdmin, setValidAdmin] = useState<boolean>(false);

    const validationSchema = object({
        email: yup.string().email(t('invalidEmailErrorMessage')),
        last_name: yup.string(),
        first_name: yup.string()
    });

    const handleSubmit = async (data: CreateAdmin): Promise<void> => {
        if (isModify && selectedAdmin) {
            await modifyAdmin(data, selectedAdmin.id);
        } else {
            await createAdminInvite(data);
        }
        handleSuccess();
    };

    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            handleSubmit(values);
        }
    });

    const { values, errors, handleChange, submitForm } = form;

    useEffect(() => {
        setIsDisabled(false);
        if (
            !Boolean(values.email) ||
            !Boolean(values.first_name) ||
            !Boolean(values.last_name) ||
            !Boolean(form.isValid)
        ) {
            setIsDisabled(true);
        }
        if (
            isModify &&
            values.first_name === initialValues.first_name &&
            values.last_name === initialValues.last_name
        ) {
            setIsDisabled(true);
        }
    }, [values]);

    useEffect(() => {
        if (!validAdmin) {
            setIsDisabled(true);
        }
    }, [validAdmin]);

    const validateAdminInfo = async (email: string): Promise<void> => {
        const user = await GetUserByEmail(email);
        if (user) {
            setValidAdmin(false);
        } else {
            setValidAdmin(true);
        }
    };

    useEffect(() => {
        setValidAdmin(true);
        if (values.email !== '' && !isModify) {
            validateAdminInfo(values.email);
        }
    }, [values.email]);

    useEffect(() => {
        if (selectedAdmin) {
            values.email = selectedAdmin.email;
            values.first_name = selectedAdmin.first_name;
            values.last_name = selectedAdmin.last_name;
        }
    }, [selectedAdmin]);

    const CreateAdminForm = (): React.ReactElement => {
        return (
            <Box>
                <Typography variant="h4" color={NEUTRAL.darker} sx={{ textAlign: 'center' }}>
                    {isModify ? t('modifyAdmin') : t('addAdmin')}
                </Typography>
                <Typography
                    variant="body1"
                    color={NEUTRAL.medium}
                    sx={{
                        display: isModify ? 'none' : '',
                        marginTop: '24px',
                        textAlign: 'center'
                    }}>
                    {t('userWillRecreate')}
                </Typography>
                <Typography
                    color={theme.palette.secondary.main}
                    sx={(): SystemStyleObject<Theme> => ({
                        ...button2,
                        fontWeight: 'bold',
                        marginTop: '32px',
                        marginBottom: '16px',
                        display: isModify ? 'none' : ''
                    })}>
                    {t('requiredFields')}
                </Typography>
                <Stack direction="row">
                    <TextField
                        fullWidth
                        sx={{ marginTop: '16px', marginRight: '20px' }}
                        type="text"
                        value={values.last_name}
                        onChange={handleChange}
                        required
                        placeholder={t('lastName')}
                        label={t('lastName')}
                        id={'last_name'}
                        error={Boolean(errors.last_name)}
                        helperText={errors.last_name}
                    />
                    <TextField
                        fullWidth
                        sx={{ marginTop: '16px' }}
                        type="text"
                        value={values.first_name}
                        onChange={handleChange}
                        required
                        placeholder={t('firstName')}
                        label={t('firstName')}
                        id={'first_name'}
                        error={Boolean(errors.first_name)}
                        helperText={errors.first_name}
                    />
                </Stack>
                <TextField
                    inputProps={{ readOnly: isModify }}
                    sx={{ marginTop: '16px', width: '47%' }}
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    required
                    placeholder={t('Email')}
                    label={t('Email')}
                    id={'email'}
                    error={Boolean(errors.email) || (!validAdmin && values.email !== '')}
                    helperText={
                        !validAdmin && values.email !== ''
                            ? t('invalidEmailErrorMessage')
                            : errors.email
                    }
                />
                <Stack direction="row" sx={{ marginTop: '80px' }}>
                    <Button
                        fullWidth
                        type="button"
                        size="medium"
                        sx={{
                            border: '1px solid',
                            borderColor: theme.palette.secondary.main,
                            borderRadius: '4px',
                            marginRight: '20px'
                        }}
                        onClick={(): void => {
                            handleClose();
                        }}>
                        <Typography
                            color={theme.palette.secondary.main}
                            sx={(): SystemStyleObject<Theme> => ({
                                ...button2,
                                fontWeight: 'bold',
                                margin: '1% 0%',
                                textTransform: 'none'
                            })}>
                            {t('return')}
                        </Typography>
                    </Button>
                    <Button
                        fullWidth
                        disabled={isDisabled}
                        type="button"
                        size="medium"
                        sx={{
                            background: 'linear-gradient(90deg, #3360DB 0%, #DD6789 100%)',
                            opacity: !isDisabled ? 1 : 0.25
                        }}
                        onClick={async (e): Promise<void> => {
                            e.preventDefault();
                            await submitForm();
                        }}>
                        <Typography
                            color={NEUTRAL.white}
                            sx={(): SystemStyleObject<Theme> => ({
                                ...button2,
                                fontWeight: 'bold',
                                margin: '1% 0%',
                                textTransform: 'none'
                            })}>
                            {isModify ? t('modifyButtonTitle') : t('add')}
                        </Typography>
                    </Button>
                </Stack>
            </Box>
        );
    };

    return (
        <ModalContainer
            isModalOpen={openForm}
            onClose={(): void => {
                handleClose();
            }}
            content={CreateAdminForm()}
        />
    );
};
