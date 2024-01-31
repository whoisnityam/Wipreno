import React, { useEffect, useState } from 'react';
import { Box, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { object } from 'yup';
import { useFormik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';
import { button2 } from '../../../theme/typography';
import { FormContainer } from './FormContainer';
import { makeStyles } from '@mui/styles';
import { GetUserByEmail } from '../../../services/DirectusService';

interface AddUserFormProps {
    initialValues: {
        nameOfTheContact: string;
        contactFirstName: string;
        emailFieldLabel: string;
    };
    onSubmit: Function;
    closeForm: Function;
    loading: boolean;
    isModify?: boolean;
}

export function AddUserForm({
    initialValues,
    onSubmit,
    closeForm,
    loading,
    isModify = false
}: AddUserFormProps): React.ReactElement {
    const { t } = useTranslation();
    const [validUser, setValidUser] = useState<boolean>(false);
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    const useStyles = makeStyles(() => ({
        helperTextError: {
            '& .MuiFormHelperText-root': {
                color: theme.palette.error.main
            }
        }
    }));
    const classes = useStyles();

    const validationSchema = object({
        nameOfTheContact: yup.string(),
        contactFirstName: yup.string(),
        emailFieldLabel: yup.string().email(t('invalidEmailErrorMessage'))
    });

    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            const user = await GetUserByEmail(values.emailFieldLabel);
            if (user && !isModify) {
                setValidUser(false);
            } else if (isModify) {
                setValidUser(false);
                onSubmit(values);
            } else {
                setValidUser(false);
                onSubmit(values);
            }
        }
    });

    const { values, errors, handleChange, submitForm, isValid } = form;

    useEffect(() => {
        if (values.emailFieldLabel !== '') {
            setValidUser(true);
        }
    }, [values.emailFieldLabel]);

    return (
        <FormContainer
            primaryButtonDisabled={
                !isValid ||
                !Boolean(values.nameOfTheContact.trim()) ||
                !Boolean(values.contactFirstName.trim()) ||
                !Boolean(values.emailFieldLabel.trim())
            }
            primaryButtonOnClick={submitForm}
            secondaryButtonVisible={true}
            secondaryButtonOnClick={closeForm}
            loading={loading}
            isModify={isModify}>
            <Box
                sx={{
                    paddingLeft: isLargeLandscape ? '' : '12px',
                    paddingRight: isLargeLandscape ? '' : '12px'
                }}>
                <Typography
                    variant={isLargeLandscape ? 'h4' : 'h5'}
                    sx={{ color: NEUTRAL.darker, textAlign: 'center', fontFamily: 'Poppins' }}>
                    {isModify ? t('modifyUserTitle') : t('addUserButtonTitle')}
                </Typography>
                <Typography
                    variant={isLargeLandscape ? 'body1' : 'body2'}
                    sx={{ textAlign: 'center', marginTop: '16px', color: NEUTRAL.medium }}>
                    {isModify ? t('modifyUserSubtitle') : t('addUserFormInfo')}
                </Typography>
                <Typography
                    color={theme.palette.secondary.main}
                    sx={{
                        ...button2,
                        display: isModify ? 'none' : '',
                        fontWeight: 'bold',
                        marginTop: '32px',
                        marginBottom: '16px'
                    }}>
                    {t('requiredFields')}
                </Typography>

                <Stack
                    direction={'row'}
                    justifyContent={'space-between'}
                    mt={isModify ? '32px' : '12px'}>
                    <TextField
                        fullWidth
                        sx={{ width: '49%' }}
                        type="text"
                        value={values.nameOfTheContact}
                        onChange={handleChange}
                        required
                        placeholder={t('nameOfTheContact')}
                        label={t('nameOfTheContact')}
                        id={'nameOfTheContact'}
                        error={Boolean(errors.nameOfTheContact)}
                        helperText={errors.nameOfTheContact}
                    />
                    <TextField
                        fullWidth
                        sx={{ width: '49%' }}
                        type="text"
                        value={values.contactFirstName}
                        onChange={handleChange}
                        required
                        placeholder={t('contactFirstName')}
                        label={t('contactFirstName')}
                        id={'contactFirstName'}
                        error={Boolean(errors.contactFirstName)}
                        helperText={errors.contactFirstName}
                    />
                </Stack>
                <TextField
                    fullWidth
                    sx={{ marginTop: '12px' }}
                    type="email"
                    required
                    disabled={isModify}
                    value={values.emailFieldLabel}
                    onChange={handleChange}
                    placeholder={t('emailFieldLabel')}
                    label={t('emailFieldLabel')}
                    id={'emailFieldLabel'}
                    className={
                        !validUser && values.emailFieldLabel !== '' ? classes.helperTextError : ''
                    }
                    error={
                        !isModify
                            ? Boolean(errors.emailFieldLabel) ||
                              (!validUser && values.emailFieldLabel !== '')
                            : Boolean(errors.emailFieldLabel)
                    }
                    helperText={
                        !isModify
                            ? !validUser && values.emailFieldLabel !== ''
                                ? t('userAlreadyExistsError')
                                : errors.emailFieldLabel
                            : errors.emailFieldLabel
                    }
                />
            </Box>
        </FormContainer>
    );
}
