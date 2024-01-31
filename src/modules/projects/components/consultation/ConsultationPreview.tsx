import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { FONT_PRIMARY, small1 } from '../../../../theme/typography';
import { createStyles, makeStyles } from '@mui/styles';
import { DatePicker } from '../../../../components/DatePicker';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    getConsultation,
    modifyConsultation,
    selectConsultationSlot
} from '../../services/ConsultationServices';
import { formatDate, getFileURL } from '../../../../utils';
import { createNotification } from '../../../dashboard/services/DashboardService';
import { User } from '../../../profile/models/User';
import { CompanyHeader } from '../../../../components/CompanyHeader';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { SlotSelectModal } from './SlotSelectModal';
import { Enterprise } from '../../models/Enterprise';
import { Slot } from '../../models/Slot';
import { Project } from '../../models/Project';

export const makeTwoDigits = (item: string): string => {
    if (item.length < 2) {
        return '0' + item;
    } else {
        return item;
    }
};

interface PreviewData {
    id: string;
    projectName: string;
    phone: string;
    clientName: string;
    address: string;
    postal_code: string;
    city: string;
    description: string;
    project_id: Project;
    startDate: Date;
    documents: string[] | File[];
    artisanId?: User;
    enterpriseId: Enterprise | null;
    documentName?: string | Promise<string>;
    selectedSlotId?: string;
    selectedSlotTime?: string;
    has_response?: boolean;
    has_visited?: boolean;
}

interface ConsultationPreviewProps {
    handleClose?: Function;
    documentUploaded?: File;
}

export function ConsultationPreview({
    handleClose = (): void => {},
    documentUploaded
}: ConsultationPreviewProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const projectData = useContext(ProjectContext)?.project;
    const [searchParams] = useSearchParams();
    const id = searchParams.get('consultationId');
    const isPreview = !id;
    const [consultation, setConsultation] = useState<PreviewData>();
    const [slotDate, setSlotDate] = useState<Slot[]>();
    const [values, setValues] = useState({
        respondToConsultation: '',
        comeToSite: ''
    });
    const [slotSelectModalOpen, setSlotSelectModalOpen] = useState<boolean>(false);
    const [slotModalDetails, setSlotModalDetails] = useState<{
        id: string;
        index: number;
        title: string;
    }>();
    const [projectManagerInfo, setProjectManagerInfo] = useState<User | null>(null);
    const [openSuccess, setOpenSuccess] = useState<boolean>(false);
    const [selectedSlotId, setSelectedSlotId] = useState<string>();
    const [selectedSlotTimeSlot, setSelectedSlotTimeSlot] = useState<string>();

    const openSuccessModal = (): void => {
        setOpenSuccess(true);
        setTimeout(async () => {
            setOpenSuccess(false);
            navigate('/auth/login', { replace: true });
        }, 3000);
    };

    const handleChange = (value: string, field: 'respondToConsultation' | 'comeToSite'): void => {
        setValues({ ...values, [field]: value });
    };

    const fetchData = useCallback(async () => {
        const response = await getConsultation(id!);
        setProjectManagerInfo(response?.project_id?.manager_id);
        const slots = response.slots;
        setSlotDate([...slots]);
        setConsultation({
            id: response.id,
            projectName: response.project_id.name,
            phone: response.project_id.manager_id.phone,
            clientName:
                response.project_id.client_id?.first_name +
                ' ' +
                response.project_id.client_id?.last_name,
            address: response.project_id.address,
            postal_code: response.project_id.postal_code,
            city: response.project_id.city,
            description: response.description,
            startDate: response.project_id.start_date,
            documents: response.documents.map((item) => item.file) ?? [],
            artisanId: response.artisian_id,
            enterpriseId: response.project_id.enterprise_id,
            selectedSlotId: response?.selected_slot?.id ?? '',
            selectedSlotTime: response?.selected_slot_time ?? '',
            has_response: response?.has_response,
            has_visited: response?.has_visited,
            project_id: response.project_id
        });
        setSelectedSlotId(response.selected_slot?.id ?? '');
        setSelectedSlotTimeSlot(response?.selected_slot_time ?? '');
        setValues({
            respondToConsultation: response.has_response ? t('yes') : t('no'),
            comeToSite: response.has_visited ? t('yes') : t('no')
        });
    }, []);

    useEffect(() => {
        if (isPreview && projectData) {
            setConsultation({
                id: '',
                projectName: projectData.name,
                phone: projectData.manager_id.phone,
                clientName:
                    projectData?.client_id?.first_name + ' ' + projectData?.client_id?.last_name,
                address: projectData?.address,
                postal_code: projectData?.postal_code,
                city: projectData?.city,
                description: projectData?.description,
                startDate: projectData?.start_date,
                documents: documentUploaded ? [documentUploaded] : [],
                artisanId: undefined,
                enterpriseId: null,
                documentName: documentUploaded ? documentUploaded?.name : '',
                project_id: projectData
            });
            setProjectManagerInfo(projectData.manager_id);
        } else {
            fetchData();
        }
    }, [documentUploaded]);

    const useStyles = makeStyles(() =>
        createStyles({
            textColor: {
                color: theme.palette.grey[200]
            }
        })
    );
    const classes = useStyles();

    const onButtonClick = async (): Promise<void> => {
        if (isPreview) {
            handleClose();
        } else {
            const isSameConsultationSelected =
                consultation !== undefined && consultation.selectedSlotId === selectedSlotId;
            const isSameTimeSlotSelected =
                consultation !== undefined &&
                consultation.selectedSlotTime === selectedSlotTimeSlot;

            const isOnSiteChoiceUnchanged =
                consultation !== undefined &&
                values.comeToSite !== '' &&
                ((consultation.has_visited && values.comeToSite === t('yes')) ||
                    (!consultation.has_visited && values.comeToSite === t('no')));
            const isResponseChoiceUnchanged =
                consultation !== undefined &&
                values.respondToConsultation !== '' &&
                ((consultation.has_response && values.respondToConsultation === t('yes')) ||
                    (!consultation.has_response && values.respondToConsultation === t('no')));

            if (!isOnSiteChoiceUnchanged || !isResponseChoiceUnchanged) {
                await modifyConsultation(
                    consultation!.id,
                    values.respondToConsultation === t('yes'),
                    values.comeToSite === t('yes')
                );
                await createNotification(
                    consultation!.project_id!.manager_id!.enterprises!.at(0)!.enterprise_id.id!,
                    consultation!.artisanId!.id,
                    id,
                    null
                );
            }

            if (
                selectedSlotId &&
                id &&
                selectedSlotTimeSlot &&
                (!isSameConsultationSelected || !isSameTimeSlotSelected)
            ) {
                await selectConsultationSlot(id, selectedSlotId, selectedSlotTimeSlot);
            }
            openSuccessModal();
        }
    };
    const handleSelectSlot = (slotId: string, slotOption: string): void => {
        if (id) {
            const formattedTimeSlot = slotOption.replace('h', ':');
            setSelectedSlotId(slotId);
            setSelectedSlotTimeSlot(formattedTimeSlot);
        }
    };

    const getSlotCards = (): React.ReactElement => {
        return (
            <Stack
                direction={'row'}
                justifyContent="space-between"
                sx={{ marginBottom: '16px', flexWrap: 'wrap' }}>
                {values.comeToSite === t('yes') && slotDate && slotDate.length > 0 ? (
                    slotDate.map((slot, index) => {
                        const title = `${t('slotTableHeader')} ${index + 1}`;
                        return (
                            <Box
                                key={index}
                                sx={{
                                    border: '1px solid',
                                    borderColor:
                                        selectedSlotId === slot.id
                                            ? theme.palette.primary.medium
                                            : NEUTRAL.light,
                                    width: index % 2 === 0 ? '49%' : '49%',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginTop: '12px'
                                }}
                                onClick={(): void => {
                                    setSlotModalDetails({
                                        id: slot.id,
                                        index,
                                        title
                                    });
                                    setSlotSelectModalOpen(true);
                                }}>
                                <Typography p={1} variant="h6">
                                    {title}
                                </Typography>
                                <Stack
                                    direction={'row'}
                                    justifyContent="flex-start"
                                    sx={{ width: '70%' }}>
                                    <Typography p={1} variant="body2" color={NEUTRAL.medium}>
                                        {t('dateOfVisit')}
                                        {` :`}
                                    </Typography>
                                    <Typography p={1} sx={{ ...small1 }} color={NEUTRAL.medium}>
                                        {slot.visit_date
                                            ? `${formatDate(new Date(slot.visit_date)).getDate()}.${
                                                  formatDate(new Date(slot.visit_date)).getMonth() +
                                                  1
                                              }.${formatDate(
                                                  new Date(slot.visit_date)
                                              ).getUTCFullYear()}`
                                            : ''}
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction={'row'}
                                    justifyContent="flex-start"
                                    sx={{ width: '50%' }}>
                                    <Typography p={1} variant="body2" color={NEUTRAL.medium}>
                                        {t('timeSlots')}
                                        {` :`}
                                    </Typography>
                                    <Typography p={1} sx={{ ...small1 }} color={NEUTRAL.medium}>
                                        {slot.start_time && slot.end_time
                                            ? `${makeTwoDigits(
                                                  formatDate(new Date(slot.start_time))
                                                      .getHours()
                                                      .toString()
                                              )}h${makeTwoDigits(
                                                  formatDate(new Date(slot.start_time))
                                                      .getMinutes()
                                                      .toString()
                                              )} - ${makeTwoDigits(
                                                  formatDate(new Date(slot.end_time))
                                                      .getHours()
                                                      .toString()
                                              )}h${makeTwoDigits(
                                                  formatDate(new Date(slot.end_time))
                                                      .getMinutes()
                                                      .toString()
                                              )}`
                                            : ''}
                                    </Typography>
                                </Stack>
                            </Box>
                        );
                    })
                ) : (
                    <></>
                )}
            </Stack>
        );
    };

    const isSameConsultationSelected =
        consultation !== undefined && consultation.selectedSlotId === selectedSlotId;
    const isSameTimeSlotSelected =
        consultation !== undefined && consultation.selectedSlotTime === selectedSlotTimeSlot;

    const isOnSiteChoiceUnchanged =
        consultation !== undefined &&
        values.comeToSite !== '' &&
        ((consultation.has_visited && values.comeToSite === t('yes')) ||
            (!consultation.has_visited && values.comeToSite === t('no')));
    const isResponseChoiceUnchanged =
        consultation !== undefined &&
        values.respondToConsultation !== '' &&
        ((consultation.has_response && values.respondToConsultation === t('yes')) ||
            (!consultation.has_response && values.respondToConsultation === t('no')));

    const isDisabled =
        !isPreview &&
        values.comeToSite === t('yes') &&
        (selectedSlotId === undefined ||
            selectedSlotId === '' ||
            selectedSlotTimeSlot === undefined ||
            selectedSlotTimeSlot === '' ||
            (isSameConsultationSelected &&
                isSameTimeSlotSelected &&
                isOnSiteChoiceUnchanged &&
                isResponseChoiceUnchanged));

    return (
        <Container sx={{ margin: 'auto', padding: '5vh' }}>
            <Box
                p={5}
                sx={{
                    backgroundColor: NEUTRAL.white,
                    minHeight: '90vh',
                    paddingTop: '5%',
                    overflowY: 'auto',
                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)'
                }}>
                <Typography variant={'h4'} color={NEUTRAL.darker} textAlign={'center'}>
                    {consultation?.projectName}
                </Typography>
                <CompanyHeader
                    bgColor={`${NEUTRAL.white} !important`}
                    companyLogo={
                        projectManagerInfo?.enterprises.at(0)?.enterprise_id.image?.id ?? ''
                    }
                    logoSize={'100px'}
                    userInfo={projectManagerInfo}
                    clientInfo={consultation?.project_id.client_id}
                    projectAddress={{
                        address: consultation?.address,
                        postal_code: consultation?.postal_code,
                        city: consultation?.city
                    }}
                    customFontStyle={{
                        fontSize: '12px !important',
                        fontWeight: 'fontWeightBold !important',
                        fontFamily: FONT_PRIMARY
                    }}
                    outerBoxStyle={{
                        paddingLeft: '0px !important',
                        paddingRight: '0px !important'
                    }}
                />
                <Box>
                    <Typography
                        pt={1}
                        pb={1}
                        variant="subtitle1"
                        fontWeight="fontWeightBold"
                        color={NEUTRAL.darker}
                        sx={{ width: '100%', borderBottom: '1px solid black' }}>
                        {t('workDescription')}
                    </Typography>
                    <Typography
                        pt={1}
                        variant="body2"
                        color={NEUTRAL.medium}
                        sx={{ wordBreak: 'break-word' }}>
                        {consultation?.description}
                    </Typography>
                </Box>
                <Box>
                    <Typography
                        pt={1}
                        pb={1}
                        variant="subtitle1"
                        fontWeight="fontWeightBold"
                        color={NEUTRAL.darker}
                        sx={{ width: '100%', borderBottom: '1px solid black' }}>
                        {t('expectedWorkStartDate')}
                    </Typography>
                    <DatePicker
                        disabled
                        required={true}
                        sx={{ width: '49%', marginTop: '2%' }}
                        value={consultation?.startDate ?? null}
                        onDateChange={(): void => {}}
                        label={t('constructionStart')}
                    />
                </Box>
                <Box>
                    <Typography
                        pt={1}
                        pb={1}
                        mb={1}
                        variant="subtitle1"
                        fontWeight="fontWeightBold"
                        color={NEUTRAL.darker}
                        sx={{ width: '100%', borderBottom: '1px solid black' }}>
                        {t('consultationDocuments')}
                    </Typography>
                    <Stack
                        direction={'row'}
                        alignItems="center"
                        sx={{ marginTop: '10px', justifyContent: 'space-between' }}>
                        {consultation?.documents.map((item, index) => {
                            let url = '';
                            if (isPreview) {
                                url = URL.createObjectURL(item as File).substring(5);
                            } else {
                                url = getFileURL(item as string);
                            }
                            return (
                                <Stack
                                    sx={{ width: '100%' }}
                                    direction="row"
                                    key={index}
                                    justifyContent="space-between">
                                    <Typography
                                        color={NEUTRAL.medium}
                                        sx={{ ...small1, paddingRight: '10px' }}>
                                        {t('documentNo')}
                                        {index + 1}
                                    </Typography>
                                    <Typography
                                        color={NEUTRAL.medium}
                                        sx={{ ...small1, marginRight: '10px' }}>
                                        {consultation.documentName}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer">
                                        {t('seeDocument')}
                                    </Button>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Box>
                <Box pt={1} pb={1} sx={{ marginTop: '38px' }}>
                    <Typography variant="h6" fontWeight="fontWeightMedium" color={NEUTRAL.darker}>
                        {t('wantToRespondConsultation')}
                    </Typography>
                    <FormControl sx={{ width: '100%', marginTop: '5px' }}>
                        <InputLabel required id="respondConsultation">
                            {t('wantToRespondConsultation')}
                        </InputLabel>
                        <Select
                            labelId="respondConsultation"
                            id="respondConsultation"
                            value={values.respondToConsultation}
                            label={t('Department')}
                            name="Department"
                            className={classes.textColor}
                            onChange={(event): void =>
                                handleChange(event.target.value, 'respondToConsultation')
                            }
                            sx={{ width: '49%' }}>
                            <MenuItem key={'yes'} value={t('yes')}>
                                {t('yes')}
                            </MenuItem>
                            <MenuItem key={'no'} value={t('no')}>
                                {t('no')}
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box pt={1} pb={1}>
                    <Typography variant="h6" fontWeight="fontWeightMedium" color={NEUTRAL.darker}>
                        {t('wantToComeToSiteForEstimation')}
                    </Typography>
                    <FormControl sx={{ width: '100%', marginTop: '5px' }}>
                        <InputLabel required id="respondConsultation">
                            {t('wantToComeToSiteForEstimation')}
                        </InputLabel>
                        <Select
                            labelId="respondConsultation"
                            id="respondConsultation"
                            value={values.comeToSite}
                            label={t('Department')}
                            name="Department"
                            className={classes.textColor}
                            onChange={(event): void =>
                                handleChange(event.target.value, 'comeToSite')
                            }
                            sx={{ width: '49%' }}>
                            <MenuItem key={'yes'} value={t('yes')}>
                                {t('yes')}
                            </MenuItem>
                            <MenuItem key={'no'} value={t('no')}>
                                {t('no')}
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                {id ? getSlotCards() : null}
                <Button
                    disabled={isDisabled}
                    variant="contained"
                    sx={{
                        float: 'right'
                    }}
                    onClick={onButtonClick}>
                    {isPreview ? t('return') : t('sendMyResponse')}
                </Button>
                <SuccessAlert
                    open={openSuccess}
                    title={t('yourConsultationHasBeenCommunicated')}
                    subtitle={t('yourResponseHasBeenCommunicated')}
                />
                {slotDate && slotModalDetails && consultation && (
                    <SlotSelectModal
                        isModalOpen={slotSelectModalOpen}
                        enterpriseName={consultation.enterpriseId?.name!}
                        title={slotModalDetails.title}
                        singleSlotDate={slotDate[slotModalDetails.index]}
                        handleSelectedSlot={handleSelectSlot}
                        onClose={(): void => {
                            setSlotSelectModalOpen(false);
                            setSlotModalDetails(undefined);
                        }}
                        timeSlot={
                            slotModalDetails.id === consultation.selectedSlotId
                                ? selectedSlotTimeSlot
                                : undefined
                        }
                    />
                )}
            </Box>
        </Container>
    );
}
