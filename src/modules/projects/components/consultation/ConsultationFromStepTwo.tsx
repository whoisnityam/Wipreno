import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Box, Button, Stack, TextField, Theme, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Plus, Link as LinkIcon, Eye } from 'react-feather';
import { useFormik } from 'formik';
import { ConsultationFormContainer } from './ConsultationFormContainer';
import { DatePicker } from '../../../../components/DatePicker';
import { makeStyles } from '@mui/styles';
import { SystemStyleObject } from '@mui/system';
import { NEUTRAL } from '../../../../theme/palette';
import { button2 } from '../../../../theme/typography';
import { Slot } from '../../models/Slot';
import { ModalContainer } from '../../../../components/ModalContainer';
import { ConsultationPreview } from './ConsultationPreview';
import { DesktopTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import fr from 'date-fns/locale/fr';
import { uploadFile } from '../../../../services/DirectusService';
import { FileData } from '../../models/FileData';

interface FormStepTwoProps {
    initialValues: {
        file: FileData | null;
        description: string;
        slots: Slot[];
    };
    onSubmit: Function;
    onBackClick: Function;
}

export function ConsultationFormStepTwo({
    initialValues,
    onSubmit,
    onBackClick
}: FormStepTwoProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const inputFile = useRef<HTMLInputElement>(null);
    const [document, setDocument] = useState<File | null>(null);
    const [isDisabled, setIsDisabled] = useState<boolean>(true);
    const [slotDate, setSlotDate] = useState<
        { visit_date: Date | null; start_time: Date | null; end_time: Date | null }[]
    >([{ visit_date: null, start_time: null, end_time: null }]);
    const [openPreview, setOpenPreview] = useState<boolean>(false);
    const [fileErr, setFileErr] = useState<string>('');

    const useStyles = makeStyles(() => ({
        labelColor: {
            color: theme.palette.primary.main
        },
        textColor: {
            color: NEUTRAL.medium
        },
        multilineText: {
            '& .MuiOutlinedInput-root': {
                marginTop: '0px !important',
                height: 'auto'
            },
            '& .MuiOutlinedInput-input': {
                paddingTop: '8px'
            }
        }
    }));

    const classes = useStyles();

    const [data, setData] = useState<{
        description: string;
        document: FileData | null;
        slots: { visit_date: Date | null; start_time: Date | null; end_time: Date | null }[];
    }>({
        description: '',
        document: null,
        slots: []
    });

    const handleAddDate = (): void => {
        setSlotDate([...slotDate, { visit_date: null, start_time: null, end_time: null }]);
    };

    const triggerFileUpload = (): void => {
        if (inputFile && inputFile.current) {
            inputFile.current.click();
        }
    };

    const handleDescription = (value: string): void => {
        setData({ ...data, description: value });
    };

    const validateSlots = (): void => {
        if (data.slots && data.slots.length > 0) {
            let validSlots = true;
            data.slots.map(
                (item: {
                    visit_date: Date | null;
                    start_time: Date | null;
                    end_time: Date | null;
                }) => {
                    if (
                        item.visit_date === null ||
                        item.end_time === null ||
                        item.start_time === null
                    ) {
                        validSlots = false;
                    }
                    if (item.end_time && item.start_time) {
                        const startTime = item.start_time;
                        const endTime = item.end_time;
                        if (startTime.getHours() > endTime.getHours()) {
                            validSlots = false;
                        } else if (
                            startTime.getHours() === endTime.getHours() &&
                            startTime.getMinutes() > endTime.getMinutes()
                        ) {
                            validSlots = false;
                        }
                    }
                }
            );
            if (!validSlots) {
                setIsDisabled(true);
            } else {
                setIsDisabled(false);
            }
        }
    };

    const handleTimeChange = (position: number, newValue: Date | null, id: string): void => {
        if (newValue && !isNaN(newValue.getTime())) {
            const mins = newValue?.getMinutes().toString();
            const hours = newValue?.getHours().toString();
            const list = [...slotDate];
            if (id === 'startTime') {
                const start = new Date(list[position].visit_date ?? 0);
                start.setHours(parseInt(hours));
                start.setMinutes(parseInt(mins));
                list[position].start_time = start;
            } else if (id === 'endTime') {
                const end = new Date(list[position].visit_date ?? 0);
                end.setHours(parseInt(hours));
                end.setMinutes(parseInt(mins));
                list[position].end_time = end;
            }
            setSlotDate(list);
            validateSlots();
        } else if (newValue && isNaN(newValue.getTime())) {
            setIsDisabled(true);
        } else if (newValue === null) {
            setIsDisabled(true);
            const list = [...slotDate];
            if (id === 'startTime') {
                list[position].start_time = null;
            } else {
                list[position].end_time = null;
            }
            setSlotDate(list);
            validateSlots();
        }
    };

    const handleDateChange = (index: number, value: Date): void => {
        const list = [...slotDate];
        list[index].visit_date = value;
        setSlotDate(list);
    };

    const sendFile = async (): Promise<void> => {
        if (document) {
            const file = await uploadFile(document);
            setData({ ...data, document: file });
        }
    };

    useEffect(() => {
        if (document) {
            sendFile();
        }
    }, [document]);

    const form = useFormik({
        initialValues,
        onSubmit: async () => {
            onSubmit({
                description: data.description,
                slots: [...data.slots],
                file: data.document
            });
        }
    });

    useEffect(() => {
        setData({ ...data, slots: [...slotDate] });
    }, [slotDate]);

    useEffect(() => {
        validateSlots();
    }, [data.slots]);

    const handleClose = (): void => {
        setOpenPreview(false);
    };

    const handelFileErr = (): void => {
        setFileErr(t('uploadPdfFile'));
        setTimeout(async () => {
            setFileErr('');
        }, 3000);
    };

    const { submitForm } = form;
    return (
        <>
            <ConsultationFormContainer
                currentStep={1}
                primaryButtonDisabled={isDisabled || !Boolean(data.description)}
                primaryButtonOnClick={submitForm}
                secondaryButtonVisible={true}
                secondaryButtonOnClick={onBackClick}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{ color: NEUTRAL.darker, textAlign: 'center', padding: '0px 10px' }}>
                        {t('createConsultation')} {'(2/2)'}
                    </Typography>
                    <Typography
                        color={theme.palette.secondary.main}
                        sx={(): SystemStyleObject<Theme> => ({
                            ...button2,
                            fontWeight: 'bold',
                            marginTop: '32px',
                            marginBottom: '16px'
                        })}>
                        {t('requiredFields')}
                    </Typography>
                    <Stack direction="row" justifyContent={'space-between'} sx={{ width: '100%' }}>
                        <Typography
                            mb={2}
                            variant="h6"
                            color={theme.palette.primary.main}
                            sx={{ width: '30%' }}>
                            {t('description')}
                        </Typography>
                        <Stack
                            direction="row"
                            alignItems={'center'}
                            justifyContent={'space-around'}>
                            <Eye
                                style={{
                                    marginBottom: '16px',
                                    color: theme.palette.primary.main,
                                    cursor: 'pointer'
                                }}
                                onClick={(): void => setOpenPreview(true)}
                            />
                            <Typography
                                mb={2}
                                pl={{ sm: 2 }}
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{ cursor: 'pointer' }}
                                color={theme.palette.primary.medium}
                                onClick={(): void => setOpenPreview(true)}>
                                {t('viewConsultation')}
                            </Typography>
                        </Stack>
                    </Stack>
                    <Box
                        mb={2}
                        sx={{
                            border: '1px solid',
                            borderColor: theme.palette.grey[100],
                            width: '100%'
                        }}>
                        <input
                            type="file"
                            name="document"
                            id="document"
                            ref={inputFile}
                            accept="application/pdf"
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                if (event.target.files && event.target.files[0] !== null) {
                                    const fileType = event.target.files[0].name.substring(
                                        event.target.files[0].name.lastIndexOf('.') + 1
                                    );
                                    if (fileType === 'pdf') {
                                        setDocument(event.target.files[0]);
                                    } else {
                                        handelFileErr();
                                    }
                                }
                            }}
                            style={{ display: 'none' }}
                        />
                        <Stack
                            direction="row"
                            onClick={(): void => triggerFileUpload()}
                            sx={{ width: '100%', padding: '16.5px 14px' }}
                            justifyContent={'space-between'}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color:
                                        data.document !== null
                                            ? NEUTRAL.medium
                                            : theme.palette.grey[100],
                                    borderRadius: '4px'
                                }}>
                                {document?.name ?? t('addDocument')}
                            </Typography>
                            <LinkIcon
                                style={{ color: document?.name ? NEUTRAL.medium : NEUTRAL.light }}
                            />
                        </Stack>
                    </Box>
                    <Box mb={2}>
                        {fileErr !== '' ? (
                            <>
                                <Typography
                                    mt={-1}
                                    sx={{
                                        color: theme.palette.error.main,
                                        fontSize: '12px',
                                        fontFamily: 'Poppins'
                                    }}>
                                    {fileErr}
                                </Typography>
                            </>
                        ) : null}
                    </Box>

                    <TextField
                        type="text"
                        label={t('workDescription')}
                        placeholder={t('workDescription')}
                        required
                        multiline
                        rows={4}
                        fullWidth
                        className={classes.multilineText}
                        value={data.description}
                        onChange={(e): void => handleDescription(e.target.value)}
                    />
                    <Box sx={{ width: '100%' }}>
                        {slotDate.map((slot, index) => (
                            <Box key={index}>
                                <Typography
                                    mt={2}
                                    mb={2}
                                    variant="h6"
                                    color={theme.palette.primary.main}>
                                    {t('slot')}
                                    {` ${index + 1}`}
                                </Typography>
                                <DatePicker
                                    required={true}
                                    startFromToday
                                    sx={{ width: '100%', marginTop: '2%' }}
                                    value={
                                        slot.visit_date && typeof slot.visit_date === 'object'
                                            ? slot.visit_date
                                            : null
                                    }
                                    onDateChange={(value: Date | null): void => {
                                        if (value) {
                                            handleDateChange(index, value);
                                        }
                                    }}
                                    label={t('dateOfVisit')}
                                />
                                <Stack
                                    direction="row"
                                    mt={2}
                                    mb={2}
                                    justifyContent={'space-between'}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} locale={fr}>
                                        <DesktopTimePicker
                                            label={t('startTime')}
                                            value={slot.start_time}
                                            onChange={(value): void => {
                                                handleTimeChange(index, value, 'startTime');
                                            }}
                                            renderInput={(params): React.ReactElement => (
                                                <TextField sx={{ width: '47%' }} {...params} />
                                            )}
                                        />
                                        <DesktopTimePicker
                                            label={t('endTime')}
                                            value={slot.end_time}
                                            onChange={(value): void => {
                                                handleTimeChange(index, value, 'endTime');
                                            }}
                                            renderInput={(params): React.ReactElement => (
                                                <TextField sx={{ width: '47%' }} {...params} />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                    <Button
                        onClick={(): void => handleAddDate()}
                        sx={{
                            width: '224px',
                            border: '1px solid',
                            borderColor: theme.palette.secondary.main,
                            marginTop: '2%',
                            marginBottom: '48px'
                        }}>
                        <Plus style={{ color: theme.palette.secondary.main }} />
                        <Typography
                            variant="button"
                            color={theme.palette.secondary.main}
                            sx={{ marginLeft: '10px' }}>
                            {t('addASlot')}
                        </Typography>
                    </Button>
                </Box>
            </ConsultationFormContainer>
            <ModalContainer
                height="100vh"
                width="100vw"
                isModalOpen={openPreview}
                onClose={(): void => {}}
                content={
                    <ConsultationPreview
                        handleClose={handleClose}
                        documentUploaded={document ?? undefined}
                    />
                }
            />
        </>
    );
}
