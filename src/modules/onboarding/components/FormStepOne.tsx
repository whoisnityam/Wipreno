import React, { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { small1 } from '../../../theme/typography';
import { JobTitles } from '../../../constants';
import { useTranslation } from 'react-i18next';
import { object } from 'yup';
import { useFormik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';
import { FormContainer } from './FormContainer';
import { createStyles, makeStyles } from '@mui/styles';
import { Camera } from 'react-feather';
import { UserContext } from '../../../provider/UserProvider';
import { getFileURL } from '../../../utils';
import { FileData } from '../../projects/models/FileData';

interface FormStepOneProps {
    initialValues: {
        enterpriseName: string;
        profession: string;
        phoneNumber: string;
        logo: FileData | null;
        logoFile: File | null;
    };
    onSubmit: Function;
}

export function FormStepOne({ initialValues, onSubmit }: FormStepOneProps): React.ReactElement {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const inputFile = useRef<HTMLInputElement>(null);
    const [document, setDocument] = useState<File | null>(null);
    const themes = useTheme();

    const useStyles = makeStyles(() =>
        createStyles({
            selectMenuStyle: {
                '& .MuiPopover-paper': {
                    boxShadow: 'none !important',
                    border: '1px solid',
                    marginTop: '10px',
                    borderColor: '#23308F'
                }
            },
            select: {
                '&:before': {
                    borderwidth: '1px !important'
                },
                '&:after': {
                    borderWidth: '1px !important'
                }
            }
        })
    );
    const classes = useStyles();

    const validationSchema = object({
        phoneNumber: yup.string().phone('FR', false, t('enterValidPhoneNumber'))
    });

    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            values.logo = user.user?.enterprises.at(0)?.enterprise_id.image ?? null;
            values.logoFile = document;
            if (values.phoneNumber.startsWith('0')) {
                onSubmit(values);
            } else {
                values.phoneNumber = 0 + values.phoneNumber;
                onSubmit(values);
            }
        }
    });

    const triggerFileUpload = (): void => {
        if (inputFile && inputFile.current) {
            inputFile.current.click();
        }
    };

    const getDocumentURL = (doc: File): string => {
        if (document) {
            return window.URL.createObjectURL(doc);
        }
        return '';
    };

    useEffect(() => {
        setDocument(initialValues.logoFile);
    }, [initialValues]);

    const { values, errors, handleChange, submitForm, isValid } = form;
    return (
        <FormContainer
            primaryButtonDisabled={
                !isValid ||
                !Boolean(values.enterpriseName.trim()) ||
                !Boolean(values.profession.trim())
            }
            primaryButtonOnClick={submitForm}
            secondaryButtonVisible={false}>
            <Box>
                <Typography variant="h3" color={NEUTRAL.darker}>
                    {t('completeBelowInformation')}
                </Typography>
                <Box height={'40px'} />
                <Typography color={'secondary'} mb={4} sx={small1}>
                    {t('requiredFields')}
                </Typography>
                <Grid item xs={12} sm={6}>
                    <Box
                        mb={2}
                        sx={{
                            border: '1px solid',
                            borderColor: themes.palette.grey[100],
                            width: '150px',
                            height: '150px',
                            borderRadius: '4px'
                        }}>
                        <input
                            type="file"
                            name="document"
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
                        <Button
                            onClick={(): void => triggerFileUpload()}
                            fullWidth
                            style={{
                                justifyContent: 'center',
                                height: '100%',
                                width: '100%'
                            }}>
                            {document || user.user?.enterprises.at(0)?.enterprise_id.image ? (
                                <>
                                    <Box sx={{ width: '100%', height: '100%' }}>
                                        <img
                                            src={
                                                document
                                                    ? getDocumentURL(document)
                                                    : getFileURL(
                                                          user.user!.enterprises.at(0)!
                                                              .enterprise_id.image!.id
                                                      )
                                            }
                                            height={'100%'}
                                            width={'100%'}
                                            id={'logo'}
                                        />
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Stack display={'flex'} alignItems={'center'}>
                                        <Box
                                            sx={{
                                                height: '45px',
                                                width: '45px',
                                                backgroundColor: '#d9d9d92e',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                            <Camera
                                                style={{
                                                    color: themes.palette.grey[200],
                                                    width: '24px',
                                                    height: '24px'
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            mt={2}
                                            variant="body2"
                                            color={(theme): string => theme.palette.grey[100]}>
                                            {t('logo')}
                                        </Typography>
                                    </Stack>
                                </>
                            )}
                        </Button>
                    </Box>
                </Grid>

                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="enterpriseName"
                            name="enterpriseName"
                            label={t('companyName')}
                            value={values.enterpriseName}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={Boolean(errors.profession)}>
                            <InputLabel id="profession-label">{t('profession')}</InputLabel>
                            <Select
                                fullWidth
                                labelId="profession-label"
                                id="profession"
                                sx={{ color: NEUTRAL.medium, marginBottom: '8px', width: '100%' }}
                                value={values.profession}
                                label={t('profession')}
                                className={classes.select}
                                MenuProps={{ className: classes.selectMenuStyle }}
                                name="profession"
                                onChange={handleChange}>
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
                                            color={(theme): string => theme.palette.grey[200]}>
                                            {value}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            type={'text'}
                            id="phoneNumber"
                            name="phoneNumber"
                            label={t('phoneNumber')}
                            value={values.phoneNumber}
                            onChange={(e): void => {
                                const ASCIICode = e.target.value.charCodeAt(
                                    e.target.value.length - 1
                                );

                                if (!(ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))) {
                                    handleChange(e);
                                }
                            }}
                            error={Boolean(errors.phoneNumber) && Boolean(values.phoneNumber)}
                            helperText={
                                Boolean(errors.phoneNumber) && Boolean(values.phoneNumber)
                                    ? errors.phoneNumber
                                    : null
                            }
                            sx={{ marginBottom: '8px', width: '100%' }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </FormContainer>
    );
}
