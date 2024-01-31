import React, { ChangeEvent, useState, useRef, useEffect } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Button,
    TextField,
    Typography,
    useTheme,
    Checkbox,
    ListItemText,
    OutlinedInput,
    SelectChangeEvent
} from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { object } from 'yup';
import { useFormik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';
import { createStyles, makeStyles } from '@mui/styles';
import { SystemStyleObject, Theme } from '@mui/system';
import { button2 } from '../../../theme/typography';
import { FormContainer } from './FormContainer';
import { Upload } from 'react-feather';
import { artisanProfession, departmentList } from '../../../constants';
import { uploadFile } from '../../../services/DirectusService';
import { ArtisanFormData } from '../models/ArtisanFormData';

interface FormStepOneProps {
    initialValues: ArtisanFormData;
    error: boolean;
    onSubmit: Function;
    closeForm: Function;
    loading: boolean;
    isModify?: boolean;
}

export function FormStepOne({
    initialValues,
    error,
    onSubmit,
    closeForm,
    loading,
    isModify = false
}: FormStepOneProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const [artisanProfessionList, setArtisanProfessionList] = useState<string[]>([]);
    const [professionListButton, setProfessionListButton] = useState<boolean>(false);
    const inputDecennialInsuranceFile = useRef<HTMLInputElement>(null);
    const inputRibFile = useRef<HTMLInputElement>(null);
    const [decennialInsuranceDocument, setDecennialInsuranceDocument] = useState<File | null>(null);
    const [ribDocument, setRibDocument] = useState<File | null>(null);
    const [validArtisan, setValidArtisan] = useState<boolean>(!error);
    const [ribErr, setRibErr] = useState<string>('');
    const [DecennialInsuranceErr, setDecennialInsuranceErr] = useState<string>('');

    const handleProfessionChange = (
        event: SelectChangeEvent<typeof artisanProfessionList>
    ): void => {
        const {
            target: { value }
        } = event;
        setArtisanProfessionList(typeof value === 'string' ? value.split(',') : value);
        if (artisanProfessionList) {
            setProfessionListButton(true);
        }
    };
    useEffect(() => {
        if (artisanProfessionList.length === 0) {
            setProfessionListButton(false);
        }
    }, [artisanProfessionList]);

    const getDecennialInsuranceTitle = (): string => {
        if (decennialInsuranceDocument?.name) {
            return decennialInsuranceDocument.name;
        } else if (initialValues.decennialInsurance) {
            return initialValues.decennialInsurance.title;
        } else {
            return t('decennialInsurance');
        }
    };

    const getRibTitle = (): string => {
        if (ribDocument?.name) {
            return ribDocument.name;
        } else if (initialValues.rib) {
            return initialValues.rib.title;
        } else {
            return t('rib');
        }
    };

    useEffect(() => {
        if (initialValues.professionList) {
            setArtisanProfessionList(initialValues.professionList);
            setProfessionListButton(true);
        }
    }, []);

    const triggerFileUpload = (): void => {
        if (inputDecennialInsuranceFile && inputDecennialInsuranceFile.current) {
            inputDecennialInsuranceFile.current.click();
        }
    };
    const triggerRibFileUpload = (): void => {
        if (inputRibFile && inputRibFile.current) {
            inputRibFile.current.click();
        }
    };

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
            rowLayout: {
                display: 'flex',
                flexDirection: 'row'
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
        companyName: yup.string(),
        department: yup.string(),
        nameOfTheContact: yup.string(),
        contactFirstName: yup.string(),
        email_id: yup.string().email(t('invalidEmailErrorMessage')),
        address: yup.string(),
        remark: yup.string(),
        phoneNumber: yup.string().phone('FR', false, t('enterValidPhoneNumber'))
    });

    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            if (ribDocument) {
                const res = await uploadFile(ribDocument);
                values.rib = res ?? null;
            }
            if (decennialInsuranceDocument) {
                const res = await uploadFile(decennialInsuranceDocument);
                values.decennialInsurance = res ?? null;
            }
            if (isModify) {
                values.professionList = artisanProfessionList;
                if (values.phoneNumber.startsWith('0')) {
                    onSubmit(values);
                } else {
                    values.phoneNumber = 0 + values.phoneNumber;
                    onSubmit(values);
                }
            } else {
                values.professionList = artisanProfessionList;
                if (values.phoneNumber.startsWith('0')) {
                    onSubmit(values);
                } else {
                    values.phoneNumber = 0 + values.phoneNumber;
                    onSubmit(values);
                }
            }
        }
    });

    const handelRibErr = (): void => {
        setRibErr(t('uploadPdfFile'));
        setTimeout(async () => {
            setRibErr('');
        }, 5000);
    };

    const handelDecennialErr = (): void => {
        setDecennialInsuranceErr(t('uploadPdfFile'));
        setTimeout(async () => {
            setDecennialInsuranceErr('');
        }, 5000);
    };
    const { values, errors, handleChange, submitForm, isValid } = form;

    useEffect(() => {
        if (initialValues.email_id !== values.email_id && !validArtisan) {
            setValidArtisan(true);
        }
    }, [values.email_id]);

    return (
        <FormContainer
            primaryButtonDisabled={
                !isValid ||
                !Boolean(values.companyName.trim()) ||
                !Boolean(values.department.trim()) ||
                !Boolean(values.nameOfTheContact.trim()) ||
                !Boolean(values.contactFirstName.trim()) ||
                !Boolean(values.email_id.trim()) ||
                !professionListButton ||
                loading
            }
            primaryButtonOnClick={submitForm}
            secondaryButtonVisible={true}
            secondaryButtonOnClick={closeForm}
            isModify={isModify}
            loading={loading}>
            <Box>
                <Typography
                    variant="h4"
                    sx={{ color: NEUTRAL.darker, textAlign: 'center', fontFamily: 'Poppins' }}>
                    {isModify ? t('editArtisan') : t('addArtisan')}
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
                    {t('companyAndContact')}
                </Typography>
                <TextField
                    fullWidth
                    sx={{ marginTop: '16px' }}
                    type="text"
                    value={values.companyName}
                    onChange={handleChange}
                    required
                    placeholder={t('companyNameTableHeader')}
                    label={t('companyNameTableHeader')}
                    id={'companyName'}
                    error={Boolean(errors.companyName)}
                    helperText={errors.companyName}
                />
                <TextField
                    fullWidth
                    sx={{ marginTop: '12px' }}
                    type="text"
                    value={values.address}
                    onChange={handleChange}
                    placeholder={t('address')}
                    label={t('address')}
                    id={'address'}
                    error={Boolean(errors.address)}
                    helperText={errors.address}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <FormControl style={{ width: '49%' }}>
                        <InputLabel required id="department">
                            {t('Department')}
                        </InputLabel>
                        <Select
                            fullWidth
                            labelId="department"
                            id="department"
                            value={values.department}
                            label={t('Department')}
                            name="department"
                            className={classes.textColor}
                            onChange={handleChange}>
                            {departmentList.map((item, index) => (
                                <MenuItem key={index} value={item}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        sx={{ width: '49%' }}
                        type="text"
                        value={values.city}
                        onChange={handleChange}
                        placeholder={t('city')}
                        label={t('city')}
                        id={'city'}
                        error={Boolean(errors.city)}
                        helperText={errors.city}
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
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
                </Box>

                <TextField
                    fullWidth
                    sx={{ marginTop: '12px' }}
                    type="email"
                    required
                    disabled={isModify}
                    value={values.email_id}
                    onChange={handleChange}
                    placeholder={t('emailFieldLabel')}
                    label={t('emailFieldLabel')}
                    id={'email_id'}
                    error={
                        !isModify
                            ? Boolean(errors.email_id) || (!validArtisan && values.email_id !== '')
                            : Boolean(errors.email_id)
                    }
                    helperText={
                        !isModify
                            ? !validArtisan && values.email_id !== ''
                                ? t('userAlreadyExistsError')
                                : errors.email_id
                            : errors.email_id
                    }
                />
                <TextField
                    fullWidth
                    sx={{ marginTop: '12px' }}
                    type="text"
                    required
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
                    error={Boolean(errors.phoneNumber) && Boolean(values.phoneNumber)}
                    helperText={
                        Boolean(errors.phoneNumber) && Boolean(values.phoneNumber)
                            ? errors.phoneNumber
                            : null
                    }
                />

                <FormControl style={{ marginTop: '12px', width: '100%' }}>
                    <InputLabel required id="profession-label">
                        {t('professions')}
                    </InputLabel>
                    <Select
                        labelId="profession-label"
                        id="professions"
                        multiple
                        value={artisanProfessionList}
                        onChange={handleProfessionChange}
                        input={<OutlinedInput label={t('professions')} />}
                        renderValue={(selected): string => selected.join(', ')}
                        className={classes.selectMenuStyle}>
                        {artisanProfession.map((item, index) => (
                            <MenuItem key={index} value={item}>
                                <Checkbox checked={artisanProfessionList.indexOf(item) > -1} />
                                <ListItemText primary={item} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography
                    variant="body1"
                    color={theme.palette.primary.main}
                    fontWeight="fontWeightBold"
                    sx={{ fontFamily: 'Poppins', marginTop: '32px' }}>
                    {t('documents')}
                </Typography>

                <Box
                    sx={{
                        marginTop: '16px',
                        border: '1px solid',
                        borderColor: theme.palette.grey[100],
                        width: '100%',
                        borderRadius: '4px'
                    }}>
                    <input
                        type="file"
                        name="decennialInsuranceDocument"
                        id="decennialInsuranceDocument"
                        ref={inputDecennialInsuranceFile}
                        accept="application/pdf"
                        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                            if (event.target.files && event.target.files[0] !== null) {
                                const fileType = event.target.files[0].name.substring(
                                    event.target.files[0].name.lastIndexOf('.') + 1
                                );
                                if (fileType === 'pdf') {
                                    setDecennialInsuranceDocument(event.target.files[0]);
                                } else {
                                    handelDecennialErr();
                                }
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                    <Button
                        onClick={(): void => triggerFileUpload()}
                        fullWidth
                        className={classes.rowLayout}
                        style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Typography
                            variant="body2"
                            sx={{
                                width: '80%',
                                display: 'flex',
                                color:
                                    decennialInsuranceDocument || initialValues.decennialInsurance
                                        ? theme.palette.grey[200]
                                        : theme.palette.grey[100],
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                            {getDecennialInsuranceTitle()}
                        </Typography>
                        <Upload
                            style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '10px',
                                color:
                                    decennialInsuranceDocument || initialValues.decennialInsurance
                                        ? theme.palette.grey[200]
                                        : theme.palette.grey[100]
                            }}
                        />
                    </Button>
                </Box>
                {DecennialInsuranceErr !== '' ? (
                    <>
                        <Typography
                            mt={1}
                            sx={{
                                color: theme.palette.error.main,
                                fontSize: '12px',
                                fontFamily: 'Poppins'
                            }}>
                            {DecennialInsuranceErr}
                        </Typography>
                    </>
                ) : null}
                <Box
                    sx={{
                        marginTop: '12px',
                        border: '1px solid',
                        borderColor: theme.palette.grey[100],
                        width: '100%',
                        borderRadius: '4px'
                    }}>
                    <input
                        type="file"
                        name="document"
                        id="document"
                        ref={inputRibFile}
                        accept="application/pdf"
                        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                            if (event.target.files && event.target.files[0] !== null) {
                                const fileType = event.target.files[0].name.substring(
                                    event.target.files[0].name.lastIndexOf('.') + 1
                                );
                                if (fileType === 'pdf') {
                                    setRibDocument(event.target.files[0]);
                                } else {
                                    handelRibErr();
                                }
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                    <Button
                        onClick={(): void => triggerRibFileUpload()}
                        fullWidth
                        className={classes.rowLayout}
                        style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Typography
                            variant="body2"
                            sx={{
                                width: '80%',
                                display: 'flex',
                                color:
                                    ribDocument || initialValues.rib
                                        ? theme.palette.grey[200]
                                        : theme.palette.grey[100],
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                            {getRibTitle()}
                        </Typography>
                        <Upload
                            style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '10px',
                                color:
                                    ribDocument || initialValues.rib
                                        ? theme.palette.grey[200]
                                        : theme.palette.grey[100]
                            }}
                        />
                    </Button>
                </Box>
                {ribErr !== '' ? (
                    <>
                        <Typography
                            mt={1}
                            sx={{
                                color: theme.palette.error.main,
                                fontSize: '12px',
                                fontFamily: 'Poppins'
                            }}>
                            {ribErr}
                        </Typography>
                    </>
                ) : null}
                <Typography
                    variant="body1"
                    color={theme.palette.primary.main}
                    fontWeight="fontWeightBold"
                    sx={{ fontFamily: 'Poppins', marginTop: '32px' }}>
                    {t('remark')}
                </Typography>

                <TextField
                    fullWidth
                    sx={{ marginTop: '16px' }}
                    type="text"
                    multiline
                    rows={4}
                    value={values.remark}
                    onChange={handleChange}
                    className={classes.multilineText}
                    placeholder={t('addComment')}
                    label={t('addComment')}
                    id={'remark'}
                    error={Boolean(errors.remark)}
                    helperText={errors.remark}
                />
            </Box>
        </FormContainer>
    );
}
