import React from 'react';
import { Box, MenuItem, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { object } from 'yup';
import { useFormik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';
import { createStyles, makeStyles } from '@mui/styles';
import { small1 } from '../../../../theme/typography';
import { TypeOfGuest } from '../../../../constants';
import { Info } from 'react-feather';
import { WRSwitch } from '../../../../components/switch/WRSwitch';
import { ModifyFormContainer } from './ModifyFormContainer';
import { WRSelect } from '../../../../components/select/WRSelect';

interface FormProps {
    initialValues: {
        typeOfGuest: string;
        lastName: string;
        firstName: string;
        email: string;
        planning: boolean;
        reports: boolean;
        discussion: boolean;
        documents: boolean;
    };
    onSubmit: Function;
    closeForm: Function;
    loading: boolean;
}

export function ModifyUserFormFields({
    initialValues,
    onSubmit,
    closeForm,
    loading
}: FormProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();

    const useStyles = makeStyles(() =>
        createStyles({
            arrow: {
                color: NEUTRAL.white
            },
            tooltip: {
                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                maxWidth: '300px',
                backgroundColor: theme.palette.info.light,
                color: theme.palette.info.dark
            }
        })
    );
    const classes = useStyles();

    const validationSchema = object({
        firstName: yup.string(),
        lastName: yup.string(),
        email: yup.string().email(t('invalidEmailErrorMessage'))
    });

    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            onSubmit(values);
        }
    });

    const { values, errors, handleChange, submitForm, setFieldValue } = form;

    const premissionToggle = (value: boolean, lable: string, field: string): React.ReactElement => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                <WRSwitch
                    value={value}
                    color={value ? theme.palette.success.main : theme.palette.grey[100]}
                    handleToggle={(): void => {
                        setFieldValue(field, !value);
                    }}
                />
                <Typography variant="body2" color={NEUTRAL.medium} fontWeight={'400'}>
                    {lable}
                </Typography>
            </Box>
        );
    };

    return (
        <ModifyFormContainer
            primaryButtonDisabled={
                !Boolean(values.typeOfGuest) ||
                !Boolean(values.lastName) ||
                !Boolean(values.firstName) ||
                !Boolean(values.email) ||
                loading
            }
            primaryButtonOnClick={submitForm}
            secondaryButtonVisible={true}
            secondaryButtonOnClick={closeForm}
            loading={loading}>
            <>
                <Box>
                    <Typography variant="h4" sx={{ color: NEUTRAL.darker, textAlign: 'center' }}>
                        {t('modifyAccess')}
                    </Typography>
                    <Typography
                        variant="h6"
                        color={theme.palette.primary.main}
                        fontWeight="fontWeightBold"
                        sx={{ marginTop: '32px' }}>
                        {t('user')}
                    </Typography>
                    <WRSelect
                        sx={{
                            marginTop: '16px',
                            width: '100%'
                        }}
                        disabled
                        name={'typeOfGuest'}
                        label={t('typeOfGuest')}
                        value={values.typeOfGuest}
                        onChange={handleChange}>
                        {TypeOfGuest.map((item, index) => (
                            <MenuItem key={index} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </WRSelect>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '12px'
                        }}>
                        <TextField
                            sx={{ width: '49%' }}
                            type="text"
                            value={values.lastName}
                            onChange={handleChange}
                            required
                            placeholder={t('lastName')}
                            label={t('lastName')}
                            id={'lastName'}
                            error={Boolean(errors.lastName)}
                            helperText={errors.lastName}
                        />
                        <TextField
                            sx={{ width: '49%' }}
                            type="text"
                            required
                            value={values.firstName}
                            onChange={handleChange}
                            placeholder={t('firstName')}
                            label={t('firstName')}
                            id={'firstName'}
                            error={Boolean(errors.firstName)}
                            helperText={errors.firstName}
                        />
                    </Box>
                    <TextField
                        fullWidth
                        id="email"
                        name="email"
                        required
                        disabled
                        placeholder={t('emailFieldLabel')}
                        label={t('emailFieldLabel')}
                        value={values.email}
                        onChange={handleChange}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        sx={{ marginTop: '12px' }}
                    />
                </Box>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Typography
                            variant="h6"
                            color={theme.palette.primary.main}
                            fontWeight="fontWeightBold"
                            sx={{ marginTop: '32px' }}>
                            {t('accessRights')}
                        </Typography>
                        <Tooltip
                            classes={{ arrow: classes.arrow, tooltip: classes.tooltip }}
                            arrow
                            title={
                                <React.Fragment>
                                    <Box sx={{ width: '280px', marginLeft: '5px' }}>
                                        <Typography
                                            sx={{ ...small1 }}
                                            color={theme.palette.info.dark}
                                            fontWeight={'700'}>
                                            {t('addUSerAccessInfoTitle')}
                                        </Typography>
                                        <Box sx={{ padding: '0 6px' }}>
                                            <Typography
                                                variant="body2"
                                                color={theme.palette.info.dark}>
                                                {t('addUSerAccessInfoSubtitle1')}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color={theme.palette.info.dark}>
                                                {t('addUSerAccessInfoSubtitle2')}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color={theme.palette.info.dark}>
                                                {t('addUSerAccessInfoSubtitle3')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </React.Fragment>
                            }>
                            <Info
                                style={{ color: theme.palette.primary.main, marginLeft: '10px' }}
                            />
                        </Tooltip>
                    </Box>
                    {premissionToggle(values.planning, t('planning'), 'planning')}
                    {premissionToggle(values.reports, t('reports'), 'reports')}
                    {premissionToggle(values.discussion, t('discussion'), 'discussion')}
                    {premissionToggle(values.documents, t('documents'), 'documents')}
                </Box>
            </>
        </ModifyFormContainer>
    );
}
