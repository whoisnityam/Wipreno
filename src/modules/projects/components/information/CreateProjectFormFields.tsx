import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { object } from 'yup';
import { useFormik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';
import { createStyles, makeStyles } from '@mui/styles';
import { SystemStyleObject, Theme } from '@mui/system';
import { button2, small2 } from '../../../../theme/typography';
import { Priorities, StatusOfClient } from '../../../../constants';
import { User } from '../../../profile/models/User';
import { ProjectStatus } from '../../models/ProjectStatus';
import { FormContainer } from './FormContainer';
import { DatePicker } from '../../../../components/DatePicker';
import { WRTextField } from '../../../../components/textfield/WRTextField';
import { isValidPhone, mailformat } from '../../../../utils';
import { GetUserByEmail } from '../../../../services/DirectusService';
import { ProjectFormData } from '../../models/ProjectFormData';
import { Role } from '../../../profile/models/Role';

interface FormStepOneProps {
    initialValues: ProjectFormData;
    onSubmit: Function;
    closeForm: Function;
    nextStep: Function;
    currentStep: number;
    previousStep: Function;
    isModify?: boolean;
    managerList: User[];
    clientList: User[];
    statusList: ProjectStatus[];
}

export function CreateProjectFormFields({
    initialValues,
    onSubmit,
    closeForm,
    currentStep,
    nextStep,
    previousStep,
    isModify = false,
    managerList,
    clientList,
    statusList
}: FormStepOneProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const [startOfWork, setStartOfWork] = useState<Date | undefined>();
    const [validClient, setValidClient] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(true);

    useEffect(() => {
        if (initialValues.startOfWork) {
            setStartOfWork(initialValues.startOfWork);
        }
    }, [initialValues.startOfWork]);

    const useStyles = makeStyles(() =>
        createStyles({
            selectMenuStyle: {
                '& .MuiPopover-paper': {
                    boxShadow: 'none !important',
                    border: '1px solid',
                    marginTop: '10px',
                    borderColor: theme.palette.primary.light
                }
            },
            multilineText: {
                '& .MuiOutlinedInput-root': {
                    height: 'auto'
                },
                '& .MuiOutlinedInput-input': {
                    paddingTop: '4px'
                }
            },
            textColor: {
                color: theme.palette.grey[200]
            },
            labelColor: {
                color: theme.palette.primary.main
            }
        })
    );
    const classes = useStyles();

    const validationSchema = object({
        name: yup.string(),
        description: yup.string(),
        progressStatus: yup.string(),
        clientFirstName: yup.string(),
        clientLastName: yup.string(),
        email: yup.string().email(t('invalidEmailErrorMessage')),
        phoneNumber: yup.string().phone('FR', false, t('enterValidPhoneNumber')),
        postalCode: yup
            .string()
            .matches(/^[0-9]+$/, t('invalidPostalCode'))
            .min(4, t('invalidPostalCode'))
            .max(5, t('invalidPostalCode')),
        status: yup.string(),
        address: yup.string(),
        budget: yup.string()
    });

    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            onSubmit(values);
        }
    });

    const { values, errors, handleChange, setFieldValue } = form;

    useEffect(() => {
        setValidClient(true);
    }, [values.email]);

    const handlePrimaryButtonClick = async (): Promise<void> => {
        if (currentStep === 0 && !isModify) {
            onSubmit(values);
            nextStep();
        } else if (currentStep === 0 && isModify) {
            setValidClient(true);
            if (values.phoneNumber.startsWith('0')) {
                onSubmit(values);
                nextStep();
            } else {
                values.phoneNumber = 0 + values.phoneNumber;
                onSubmit(values);
                nextStep();
            }
        } else if (currentStep === 1 && values.client) {
            setValidClient(true);
            onSubmit(values);
            nextStep();
        } else if (currentStep === 1 && !values.client) {
            const user = await GetUserByEmail(values.email);
            if (user && user.role.name !== Role.client && !isModify) {
                setValidClient(false);
            } else {
                setValidClient(true);
                if (values.phoneNumber.startsWith('0')) {
                    onSubmit(values);
                    nextStep();
                } else {
                    values.phoneNumber = 0 + values.phoneNumber;
                    onSubmit(values);
                    nextStep();
                }
            }
        } else if (currentStep === 2) {
            onSubmit(values);
        }
    };
    const today = new Date();

    const handelprimarybutton = useCallback(async () => {
        const isEnterpriseValid =
            values.status === StatusOfClient[0] ? false : values.enterprise === '';

        const isEmpty =
            values.clientFirstName === '' ||
            values.clientLastName === '' ||
            values.email === '' ||
            values.status === '' ||
            values.phoneNumber === '' ||
            isEnterpriseValid;

        const isError = values.address === '' || values.postalCode === '' || values.city === '';

        const validCheck =
            values.email.trim().match(mailformat) !== null &&
            (await isValidPhone(values.phoneNumber)) &&
            (values.postalCode.toString().length === 4 ||
                values.postalCode.toString().length === 5);

        if (values.client) {
            if (validCheck) {
                setError(isEmpty || isError);
            } else {
                setError(true);
            }
        } else {
            if (
                values.postalCode.toString().length === 4 ||
                values.postalCode.toString().length === 5
            ) {
                setError(isError);
            } else {
                setError(true);
            }
        }
    }, [values]);

    useEffect(() => {
        handelprimarybutton();
    }, [values]);

    const handlePrimaryButtonDisable = (): boolean => {
        if (currentStep === 0) {
            return (
                !Boolean(values.name) ||
                !Boolean(values.progressStatus) ||
                !Boolean(values.projectManager) ||
                !Boolean(values.progressStatus)
            );
        } else if (currentStep === 1) {
            return error || !validClient;
        } else {
            return (
                Boolean(
                    new Date(startOfWork ? startOfWork : Date.now()).setHours(0, 0, 0, 0) <
                        today.setHours(0, 0, 0, 0) && !isModify
                ) || Boolean(startOfWork?.toDateString() === 'Invalid Date')
            );
        }
    };

    const handleSecondaryButtonClick = (): void => {
        if (currentStep === 0) {
            closeForm();
        } else if (currentStep === 1 || currentStep === 2) {
            previousStep();
        }
    };
    useEffect(() => {
        if (!isModify) {
            if (
                values.clientFirstName !== '' ||
                values.clientLastName !== '' ||
                values.email !== '' ||
                values.phoneNumber !== '' ||
                values.status !== ''
            ) {
                setFieldValue('client', '');
            }
        }
    }, [
        values.clientFirstName,
        values.clientLastName,
        values.email,
        values.phoneNumber,
        values.status
    ]);
    useEffect(() => {
        if (!isModify) {
            if (values.client) {
                setFieldValue('clientFirstName', '');
                setFieldValue('clientLastName', '');
                setFieldValue('email', '');
                setFieldValue('phoneNumber', '');
                setFieldValue('status', '');
            }
        }
    }, [values.client]);

    const onChangeProjectManager = (event: SelectChangeEvent): void => {
        const id = event.target.value;
        form.setValues({
            ...values,
            projectManager: managerList.find((user) => user.id === id)!
        });
    };

    const onChangeClient = (event: SelectChangeEvent): void => {
        const id = event.target.value;
        form.setValues({
            ...values,
            client: clientList.find((user) => user.id === id)!
        });
    };
    const onChangeProjectStatus = (event: SelectChangeEvent): void => {
        const id = event.target.value;
        form.setValues({
            ...values,
            progressStatus: statusList.find((status) => status.id === id)!
        });
    };
    return (
        <FormContainer
            currentStep={currentStep}
            primaryButtonDisabled={handlePrimaryButtonDisable()}
            primaryButtonOnClick={handlePrimaryButtonClick}
            secondaryButtonVisible={true}
            secondaryButtonOnClick={handleSecondaryButtonClick}
            isModify={isModify}>
            <>
                <Box sx={{ display: currentStep === 0 || isModify ? 'block' : 'none' }}>
                    <Typography variant="h4" sx={{ color: NEUTRAL.darker, textAlign: 'center' }}>
                        {isModify ? t('editAProject') : `${t('createAProject')} 1/3`}
                    </Typography>
                    <Typography
                        color={theme.palette.secondary.main}
                        sx={(): SystemStyleObject<Theme> => ({
                            ...button2,
                            display: isModify ? 'none' : '',
                            fontWeight: 'bold',
                            marginTop: '32px',
                            marginBottom: '16px'
                        })}>
                        {t('requiredFields')}
                    </Typography>
                    <Typography
                        variant="h6"
                        color={theme.palette.primary.main}
                        fontWeight="fontWeightBold"
                        sx={{ marginTop: isModify ? '32px' : '' }}>
                        {t('projectDetails')}
                    </Typography>
                    <TextField
                        fullWidth
                        sx={{ marginTop: '16px' }}
                        type="text"
                        value={values.name}
                        onChange={handleChange}
                        required
                        placeholder={t('projectName')}
                        label={t('projectName')}
                        id={'name'}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '12px'
                        }}>
                        <FormControl required style={{ width: '49%' }}>
                            <InputLabel
                                id="projectManagerLabel"
                                className={
                                    values.projectManager !== null ? '' : classes.labelColor
                                }>
                                {t('projectManager')}
                            </InputLabel>
                            <Select
                                fullWidth
                                labelId="projectManagerLabel"
                                id="projectManager"
                                value={values.projectManager?.id ?? ''}
                                label={t('projectManager')}
                                name="projectManager"
                                className={classes.textColor}
                                onChange={onChangeProjectManager}>
                                {managerList.map((item, index) => (
                                    <MenuItem key={index} value={item.id}>
                                        {`${item.first_name} ${item.last_name}`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl style={{ width: '49%' }}>
                            <InputLabel
                                id="priorityLabel"
                                className={values.priority === '' ? '' : classes.labelColor}>
                                {t('priority')}
                            </InputLabel>
                            <Select
                                fullWidth
                                labelId="priorityLabel"
                                id="priority"
                                value={values.priority}
                                label={t('priority')}
                                name="priority"
                                className={classes.textColor}
                                onChange={handleChange}>
                                {Priorities.map((value) => (
                                    <MenuItem key={value} value={value}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <FormControl required fullWidth style={{ marginTop: '12px' }}>
                        <InputLabel
                            id="progressStatusLabel"
                            className={values.progressStatus !== null ? '' : classes.labelColor}>
                            {t('progressStatus')}
                        </InputLabel>
                        <Select
                            fullWidth
                            required
                            labelId="progressStatusLabel"
                            id="progressStatus"
                            value={values.progressStatus?.id ?? ''}
                            label={t('progressStatus')}
                            name="progressStatus"
                            className={classes.textColor}
                            onChange={onChangeProjectStatus}>
                            {statusList.map((item, index) => (
                                <MenuItem key={index} value={item.id}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        sx={{ marginTop: '12px' }}
                        type="text"
                        multiline
                        minRows={4}
                        value={values.description}
                        onChange={handleChange}
                        className={classes.multilineText}
                        placeholder={t('workDescription')}
                        label={t('workDescription')}
                        id={'description'}
                        error={Boolean(errors.description)}
                        helperText={errors.description}
                    />
                </Box>
                <Box sx={{ display: currentStep === 1 || isModify ? 'block' : 'none' }}>
                    <Typography
                        variant="h4"
                        sx={{
                            display: isModify ? 'none' : '',
                            color: NEUTRAL.darker,
                            textAlign: 'center'
                        }}>
                        {t('createAProject')} {'2/3'}
                    </Typography>
                    <Typography
                        color={theme.palette.secondary.main}
                        sx={(): SystemStyleObject<Theme> => ({
                            ...button2,
                            display: isModify ? 'none' : '',
                            fontWeight: 'bold',
                            marginTop: '32px',
                            marginBottom: '16px'
                        })}>
                        {t('requiredFields')}
                    </Typography>
                    <Typography
                        variant="h6"
                        color={theme.palette.primary.main}
                        fontWeight="fontWeightBold"
                        sx={{ marginTop: isModify ? '32px' : '' }}>
                        {t('client')}
                    </Typography>
                    <FormControl
                        required={
                            !values.email &&
                            !values.clientLastName &&
                            !values.clientFirstName &&
                            !values.phoneNumber &&
                            !values.status
                        }
                        fullWidth
                        style={{ marginTop: '12px', display: isModify ? 'none' : '' }}>
                        <InputLabel
                            id="clientLabel"
                            className={values.client !== null ? '' : classes.labelColor}>
                            {t('selectACustomer')}
                        </InputLabel>
                        <Select
                            fullWidth
                            labelId="clientLabel"
                            id="client"
                            value={values.client?.id ?? ''}
                            label={t('selectACustomer')}
                            name="client"
                            className={classes.textColor}
                            onChange={onChangeClient}>
                            {clientList.map((item, index) => (
                                <MenuItem key={index} value={item.id}>
                                    {`${item.first_name} ${item.last_name}`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Divider
                        orientation={'horizontal'}
                        textAlign="center"
                        sx={{
                            borderWidth: `1px solid ${NEUTRAL.light}`,
                            marginTop: '15px',
                            marginBottom: '21px',
                            display: isModify ? 'none' : ''
                        }}>
                        <Typography
                            sx={{
                                ...small2,
                                color: NEUTRAL.light
                            }}>
                            {t('orCreateNewCustomer')}
                        </Typography>
                    </Divider>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '12px'
                        }}>
                        <TextField
                            sx={{ width: '49%' }}
                            type="text"
                            value={values.clientLastName}
                            onChange={handleChange}
                            required={!values.client}
                            placeholder={t('lastName')}
                            label={t('lastName')}
                            id={'clientLastName'}
                            error={Boolean(errors.clientLastName)}
                            helperText={errors.clientLastName}
                        />
                        <TextField
                            sx={{ width: '49%' }}
                            type="text"
                            required={!values.client}
                            value={values.clientFirstName}
                            onChange={handleChange}
                            placeholder={t('firstName')}
                            label={t('firstName')}
                            id={'clientFirstName'}
                            error={Boolean(errors.clientFirstName)}
                            helperText={errors.clientFirstName}
                        />
                    </Box>
                    <TextField
                        fullWidth
                        id="email"
                        name="email"
                        required={!values.client}
                        disabled={isModify}
                        placeholder={t('emailFieldLabel')}
                        label={t('emailFieldLabel')}
                        value={values.email}
                        onChange={handleChange}
                        error={
                            !isModify
                                ? Boolean(errors.email) || (!validClient && values.email !== '')
                                : Boolean(errors.email)
                        }
                        helperText={
                            !isModify
                                ? !validClient && values.email !== ''
                                    ? t('userAlreadyExistsError')
                                    : errors.email
                                : errors.email
                        }
                        sx={{ marginTop: '12px' }}
                    />
                    <TextField
                        fullWidth
                        required={!values.client}
                        type={'text'}
                        sx={{ marginTop: '12px' }}
                        value={values.phoneNumber}
                        onChange={(e): void => {
                            const ASCIICode = e.target.value.charCodeAt(e.target.value.length - 1);

                            if (!(ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))) {
                                handleChange(e);
                            }
                        }}
                        placeholder={t('phoneNumber')}
                        label={t('phoneNumber')}
                        id={'phoneNumber'}
                        error={Boolean(errors.phoneNumber) && values.phoneNumber !== ''}
                        helperText={
                            Boolean(errors.phoneNumber) && values.phoneNumber !== ''
                                ? t('enterValidPhoneNumber')
                                : ''
                        }
                    />
                    <FormControl
                        required={!values.client}
                        fullWidth
                        style={{ marginTop: '12px', display: isModify ? 'none' : '' }}>
                        <InputLabel
                            id="statusLabel"
                            className={values.status === '' ? '' : classes.labelColor}>
                            {t('status')}
                        </InputLabel>
                        <Select
                            fullWidth
                            required={!values.client}
                            labelId="statusLabel"
                            id="status"
                            value={values.status}
                            label={t('status')}
                            name="status"
                            className={classes.textColor}
                            onChange={handleChange}>
                            {StatusOfClient.map((value, index) => (
                                <MenuItem key={index} value={value}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        type="text"
                        value={values.enterprise}
                        onChange={handleChange}
                        required={!values.client}
                        placeholder={t('enterprise')}
                        label={t('enterprise')}
                        id={'enterprise'}
                        sx={{
                            display:
                                values.status === '' ||
                                values.status === StatusOfClient[0] ||
                                isModify
                                    ? 'none'
                                    : '',
                            marginTop: '12px'
                        }}
                        error={Boolean(errors.enterprise)}
                        helperText={errors.enterprise}
                    />
                    <Typography
                        variant="h6"
                        color={theme.palette.primary.main}
                        fontWeight="fontWeightBold"
                        sx={{ marginTop: '32px', marginBottom: '16px' }}>
                        {t('projectAddress')}
                    </Typography>
                    <TextField
                        fullWidth
                        type="text"
                        required
                        value={values.address}
                        onChange={handleChange}
                        placeholder={t('address')}
                        label={t('address')}
                        id={'address'}
                        error={Boolean(errors.address)}
                        helperText={errors.address}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '12px'
                        }}>
                        <TextField
                            sx={{ width: '49%' }}
                            type="number"
                            required
                            value={values.postalCode}
                            onChange={handleChange}
                            placeholder={t('postalCode')}
                            label={t('postalCode')}
                            id={'postalCode'}
                            error={Boolean(errors.postalCode)}
                            helperText={errors.postalCode}
                        />
                        <TextField
                            sx={{ width: '49%' }}
                            required
                            value={values.city}
                            onChange={handleChange}
                            placeholder={t('city')}
                            label={t('city')}
                            id={'city'}
                            error={Boolean(errors.city)}
                            helperText={errors.city}
                        />
                    </Box>
                </Box>
                <Box sx={{ display: currentStep === 2 || isModify ? 'block' : 'none' }}>
                    <Typography
                        variant="h4"
                        sx={{
                            color: NEUTRAL.darker,
                            textAlign: 'center',
                            display: isModify ? 'none' : ''
                        }}>
                        {t('createAProject')} {'3/3'}
                    </Typography>
                    <Typography
                        variant="h6"
                        color={theme.palette.primary.main}
                        fontWeight={700}
                        sx={{ marginTop: '32px' }}>
                        {t('estimate')}
                    </Typography>
                    <WRTextField
                        margin="12px 0 0 0"
                        requiredValue={parseInt(values.budget)}
                        isMoney
                        float
                        onValueChange={(value: number | undefined): void => {
                            if (value) {
                                values.budget = value?.toString();
                            } else {
                                values.budget = '0';
                            }
                        }}
                        fullWidth
                        label={t('budget')}
                    />
                    <DatePicker
                        required={false}
                        startFromToday={!isModify}
                        sx={{ width: '100%', marginTop: '12px' }}
                        onDateChange={(value: Date | null): void => {
                            if (value) {
                                setStartOfWork(value);
                                values.startOfWork = value;
                            }
                        }}
                        value={startOfWork ?? null}
                        label={t('startOfWork')}
                    />
                </Box>
            </>
        </FormContainer>
    );
}
