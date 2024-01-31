import {
    Box,
    Typography,
    Stack,
    Avatar,
    Button,
    useTheme,
    useMediaQuery,
    Slide,
    Dialog,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../../components/alerts/Alert';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { ModalContainer } from '../../../../components/ModalContainer';
import { UserContext } from '../../../../provider/UserProvider';
import { ACCENT_SUNSET, NEUTRAL } from '../../../../theme/palette';
import { body3, button2, small2 } from '../../../../theme/typography';
import { getFileURL, stringAvatar } from '../../../../utils';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { LotViewDataForReport } from '../../models/Lot';
import { Report, ReportItem } from '../../models/Report';
import { getLots } from '../../services/LotService';
import { deleteReport, getReport, ReportDownload, sendReport } from '../../services/ReportService';
import { CreateReportForm } from './CreateReportForm';

export function ReportDetails(): React.ReactElement {
    const { t } = useTranslation();
    const [selectedReport, setSelectedReport] = useState<Report>();
    const projectContext = useContext(ProjectContext);
    const project = projectContext?.project;
    const [lotList, setLotList] = useState<LotViewDataForReport[]>([]);
    const { id } = useParams();
    const user = useContext(UserContext);
    const notice = projectContext?.project?.notices?.at(0);
    const [currentLot, setCurrentLot] = useState<LotViewDataForReport>();
    const [currentComment, setCurrentComment] = useState<ReportItem>();
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const navigate = useNavigate();
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
    const [openDeleteSuccess, setOpenDeleteSuccess] = useState<boolean>(false);
    const [sendReportMail, setSendReportMail] = useState<boolean>(false);
    const [exportReportOptionModal, setExportReportOptionModal] = useState<boolean>(false);
    const [openReportFormMobile, setOpenReportFormMobile] = useState<boolean>(false);
    const [mailTo, setMailTo] = useState<string>('');
    const [projectClient, setProjectClient] = useState<string>('');
    const [projectArtisans, setProjectArtisans] = useState<string[]>([]);
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [value, setValue] = React.useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const handleClose = (): void => {
        setOpenReportFormMobile(false);
    };
    const handleExport = async (): Promise<void> => {
        if (value === 'withCompanyName') {
            setLoading(true);
            await ReportDownload(
                project?.id ?? '',
                selectedReport?.id ?? '',
                notice?.id ?? '',
                true
            ).then((): void => {
                setLoading(false);
            });
        } else {
            setLoading(true);
            await ReportDownload(
                project?.id ?? '',
                selectedReport?.id ?? '',
                notice?.id ?? '',
                false
            ).then((): void => {
                setLoading(false);
            });
        }
        setExportReportOptionModal(false);
    };

    const openSuccessModal = (): void => {
        setSendReportMail(false);
        if (!openReportFormMobile) {
            setSuccessModalOpen(true);
            setTimeout(async () => {
                setSuccessModalOpen(false);
                projectContext?.refreshData(true);
            }, 3000);
        } else {
            projectContext?.refreshData();
        }
    };

    const fetchReport = async (): Promise<void> => {
        if (id) {
            const res = await getReport(id);
            setSelectedReport(res);
            if (project) {
                const lots: LotViewDataForReport[] = await getLots(project!.notices!.at(0)!.id);
                lots.push({
                    id: null,
                    title: t('various'),
                    artisan_id: undefined
                });
                setLotList([...lots]);
            }
        }
    };

    useEffect(() => {
        if (id) {
            fetchReport();
        }
        if (project) {
            setProjectClient(project.client_id?.email ?? '');
        }
    }, [id]);

    const fetchArtisans = async (): Promise<void> => {
        if (user.user && user.user!.id) {
            const data = await getLots(project!.notices!.at(0)!.id);
            let i = 0;
            const artisanMailList: string[] = [];
            data.forEach((lot) => {
                i++;
                if (lot.artisan_id) {
                    artisanMailList.push(lot.artisan_id.email);
                }
            });
            if (i === data.length) {
                setProjectArtisans([...artisanMailList]);
            }
        }
    };

    useEffect(() => {
        if (user.user!) {
            fetchArtisans();
        }
    }, [user.user!]);

    const formatDate = (startDate: Date): string => {
        const date = new Date(startDate);
        const formatedDate = date.toLocaleDateString();
        return formatedDate;
    };

    const handleCurrentLot = (lot: LotViewDataForReport): void => {
        if (currentLot && currentLot.id === lot.id) {
            setCurrentLot(undefined);
            setCurrentComment(undefined);
        } else {
            setCurrentLot(lot);
            setCurrentComment(undefined);
        }
    };

    const handleCurrentComment = (item: ReportItem): void => {
        if (currentComment && currentComment.id === item.id) {
            setCurrentComment(undefined);
        } else {
            setCurrentComment(item);
        }
    };

    const handleSendMailTo = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setMailTo((event.target as HTMLInputElement).value);
    };

    const renderModifyReport = (): React.ReactElement => {
        return (
            <CreateReportForm
                handleOpenSuccess={(): void => {
                    projectContext?.refreshData();
                }}
                handleCloseForm={(): void => {
                    setOpenReportFormMobile(false);
                }}
                onClose={handleClose}
                reportData={selectedReport}
                isModify={true}
                lots={lotList}
            />
        );
    };

    const renderDeleteSuccess = (): React.ReactElement => {
        return (
            <SuccessAlert
                onClose={(): void => {}}
                open={openDeleteSuccess}
                title={t('requestHasBeenTaken')}
                subtitle={t('addDateSuccessSubtitle')}
            />
        );
    };

    const sendReportMailContent = (): React.ReactElement => {
        return (
            <Box>
                <form encType="multipart/form-data">
                    <Typography variant="h4" color={NEUTRAL.darker} sx={{ textAlign: 'center' }}>
                        {t('sendReport')}
                    </Typography>
                    <Typography variant="body1" color={NEUTRAL.medium} sx={{ textAlign: 'center' }}>
                        {t('wantToEmailReportTo')}
                    </Typography>
                    <FormControl>
                        <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            onChange={handleSendMailTo}
                            name="radio-buttons-group">
                            <FormControlLabel
                                value="Artisan"
                                disabled={projectArtisans.length === 0}
                                control={<Radio />}
                                label={
                                    <Typography variant="body2" color={NEUTRAL.medium}>
                                        {t('toCraftsmen')}
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                value="Client"
                                disabled={projectClient === ''}
                                control={<Radio />}
                                label={
                                    <Typography variant="body2" color={NEUTRAL.medium}>
                                        {t('toClient')}
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                value="both"
                                disabled={projectClient === '' || projectArtisans.length === 0}
                                control={<Radio />}
                                label={
                                    <Typography variant="body2" color={NEUTRAL.medium}>
                                        {t('toBoth')}
                                    </Typography>
                                }
                            />
                        </RadioGroup>
                    </FormControl>
                </form>
                <Button
                    fullWidth
                    type="button"
                    size="medium"
                    disabled={mailTo === ''}
                    sx={{
                        opacity: mailTo === '' ? 0.25 : 1,
                        background: 'linear-gradient(90deg, #3360DB 0%, #DD6789 100%)',
                        marginTop: '48px',
                        marginBottom: '20px'
                    }}
                    onClick={(): void => {
                        sendReport(
                            mailTo,
                            project?.enterprise_id.id ?? '',
                            project?.id ?? '',
                            selectedReport?.id ?? '',
                            notice?.id ?? '',
                            project?.name ?? '',
                            project?.enterprise_id.name ?? ''
                        );
                        openSuccessModal();
                    }}>
                    <Typography
                        color={NEUTRAL.white}
                        sx={{
                            ...button2,
                            fontWeight: 'bold',
                            margin: '1% 0%',
                            textTransform: 'none'
                        }}>
                        {t('send')}
                    </Typography>
                </Button>
                <Button fullWidth variant="outlined" onClick={(): void => setSendReportMail(false)}>
                    {t('cancelButtonTitle')}
                </Button>
            </Box>
        );
    };

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setValue((event.target as HTMLInputElement).value);
    };

    const exportReportContentOption = (): React.ReactElement => {
        return (
            <Box>
                <Stack direction="row" justifyContent="flex-end" sx={{ marginBottom: '12px' }}>
                    <X
                        onClick={(): void => {
                            setExportReportOptionModal(false);
                            setValue('');
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                </Stack>
                <Typography
                    variant="h4"
                    color={NEUTRAL.darker}
                    sx={{ textAlign: 'center', marginBottom: '40px' }}>
                    {t('howToExportPdf')}
                </Typography>
                <FormControl>
                    <RadioGroup
                        aria-labelledby="-radio-buttons-group"
                        name="radio-buttons-group"
                        value={value}
                        onChange={handleRadioChange}>
                        <FormControlLabel
                            value="withCompanyName"
                            control={<Radio />}
                            label={
                                <Typography variant="body2" color={NEUTRAL.medium}>
                                    {t('withCompanyName')}
                                </Typography>
                            }
                        />
                        <FormControlLabel
                            value="withoutCompanyName"
                            control={<Radio />}
                            label={
                                <Typography variant="body2" color={NEUTRAL.medium}>
                                    {t('withoutCompanyName')}
                                </Typography>
                            }
                        />
                    </RadioGroup>
                </FormControl>
                <Stack direction="row" sx={{ marginTop: '40px' }}>
                    <Button
                        disabled={value === '' || loading}
                        fullWidth
                        variant={'contained'}
                        color={'primary'}
                        onClick={(): void => {
                            handleExport();
                        }}>
                        {t('exportButton')}
                    </Button>
                </Stack>
                <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={(): void => {
                        setValue('');
                        setExportReportOptionModal(false);
                    }}
                    sx={{ marginTop: '20px' }}>
                    {t('return')}
                </Button>
            </Box>
        );
    };

    const handleDelete = async (): Promise<void> => {
        if (selectedReport) {
            const res = await deleteReport(selectedReport?.id);
            if (res) {
                setOpenDeleteModal(false);
                setOpenDeleteSuccess(true);
                setTimeout(() => {
                    setOpenDeleteSuccess(false);
                    navigate(-1);
                    projectContext?.refreshData();
                }, 3000);
            }
        }
    };

    const renderDeleteModal = (): React.ReactElement => {
        return (
            <Alert
                title={t('wantToDeleteReport')}
                subtitle={t('reportDeleteDisclaimer')}
                primaryButton={t('remove')}
                primaryButtonType="error"
                secondaryButton={t('cancelButtonTitle')}
                open={openDeleteModal}
                onClick={(): void => {
                    handleDelete();
                }}
                onClose={(): void => {
                    setOpenDeleteModal(false);
                }}
                width={'440px'}
            />
        );
    };

    return (
        <Box sx={{ padding: '15px', width: '100%' }}>
            <Typography variant="h5" color={NEUTRAL.darker} sx={{ marginBottom: '24px' }}>
                {t('reportDetails')}
            </Typography>
            <Stack direction="column" justifyContent="space-between">
                <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" color={NEUTRAL.darker}>
                        {t('minutesOfThe')}
                    </Typography>
                    <Typography variant="body2" color={NEUTRAL.medium}>
                        {selectedReport ? formatDate(selectedReport.created_at) : ''}
                    </Typography>
                </Box>
                <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" color={NEUTRAL.darker} mt={3}>
                        {t('createdBy')}
                    </Typography>
                    <Stack direction="row" alignItems="center">
                        <Avatar
                            sx={{
                                background: ACCENT_SUNSET.lighter,
                                color: ACCENT_SUNSET.darker,
                                width: '32px',
                                height: '32px',
                                marginRight: '8px'
                            }}>
                            <Typography sx={{ ...small2 }}>
                                {stringAvatar(
                                    selectedReport?.created_by.first_name,
                                    selectedReport?.created_by.last_name
                                )}
                            </Typography>
                        </Avatar>
                        <Typography variant="body2" color={NEUTRAL.medium}>
                            {selectedReport
                                ? selectedReport.created_by.first_name +
                                  ' ' +
                                  selectedReport.created_by.last_name
                                : ''}
                        </Typography>
                    </Stack>
                </Box>
            </Stack>
            <Box mt={3}>
                {lotList.map((lot, index) => {
                    return (
                        <Box key={index}>
                            <Box>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    onClick={(): void => {
                                        handleCurrentLot(lot);
                                    }}>
                                    <Typography variant="h6" sx={{ width: '90%' }}>
                                        {lot.title}
                                    </Typography>
                                    {currentLot && currentLot.id === lot.id ? (
                                        <ChevronUp />
                                    ) : (
                                        <ChevronDown />
                                    )}
                                </Stack>
                                {selectedReport?.items.map((item: ReportItem, commentIndex) => {
                                    return (
                                        <Box
                                            p={1}
                                            mt={1}
                                            mb={1}
                                            key={commentIndex}
                                            sx={{
                                                display:
                                                    currentLot?.id === lot.id &&
                                                    item.lot_id === lot.id
                                                        ? 'block'
                                                        : 'none',
                                                border: '1px solid',
                                                borderColor: NEUTRAL.light,
                                                borderRadius: '4px'
                                            }}>
                                            <Stack
                                                direction="row"
                                                justifyContent="flex-start"
                                                alignItems="center"
                                                onClick={(): void => {
                                                    handleCurrentComment(item);
                                                }}>
                                                <Typography sx={{ ...small2 }} color={NEUTRAL.dark}>
                                                    {t('remark')}
                                                </Typography>
                                                {currentComment && currentComment.id === item.id ? (
                                                    <ChevronUp
                                                        style={{
                                                            height: '18px',
                                                            width: '18px',
                                                            color: NEUTRAL.dark
                                                        }}
                                                    />
                                                ) : (
                                                    <ChevronDown
                                                        style={{
                                                            height: '18px',
                                                            width: '18px',
                                                            color: NEUTRAL.dark
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                            <Box
                                                sx={{
                                                    display:
                                                        item.id === currentComment?.id
                                                            ? 'block'
                                                            : 'none'
                                                }}>
                                                <Typography
                                                    mt={1}
                                                    mb={2}
                                                    sx={{ ...body3, wordBreak: 'break-word' }}
                                                    color={NEUTRAL.medium}>
                                                    {item.comment}
                                                </Typography>
                                                <Stack direction="row" flexWrap={'wrap'}>
                                                    {item.attachments.map(
                                                        (attachment, attachmentIndex) => {
                                                            return (
                                                                <img
                                                                    key={attachmentIndex}
                                                                    src={getFileURL(
                                                                        attachment.file.id,
                                                                        'contain',
                                                                        '48',
                                                                        '48'
                                                                    )}
                                                                    style={{
                                                                        marginRight: '8px',
                                                                        marginTop: '8px'
                                                                    }}
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                            <Box
                                mt={2}
                                mb={2}
                                sx={{
                                    display: index + 1 === lotList.length ? 'none' : '',
                                    border: '1px solid #D9D9D9'
                                }}></Box>
                        </Box>
                    );
                })}
            </Box>
            <Box>
                <Button
                    fullWidth
                    type="button"
                    size="medium"
                    sx={{
                        background: 'linear-gradient(90deg, #3360DB 0%, #DD6789 100%)',
                        marginTop: '48px',
                        marginBottom: '20px'
                    }}
                    onClick={(): void => {
                        setSendReportMail(true);
                    }}>
                    <Typography
                        color={NEUTRAL.white}
                        sx={{
                            ...button2,
                            fontWeight: 'bold',
                            margin: '1% 0%',
                            textTransform: 'none'
                        }}>
                        {t('sendReport')}
                    </Typography>
                </Button>
                <Button
                    fullWidth
                    variant={'contained'}
                    color={'secondary'}
                    onClick={(): void => {
                        setExportReportOptionModal(true);
                    }}>
                    {t('exportButton')}
                </Button>
                <Stack direction="row" justifyContent="space-between">
                    <Button
                        variant={'outlined'}
                        color={'secondary'}
                        sx={{ width: '45%', marginTop: '20px' }}
                        onClick={(): void => {
                            setOpenReportFormMobile(true);
                        }}>
                        {t('modifyButtonTitle')}
                    </Button>
                    <Button
                        variant={'outlined'}
                        onClick={(): void => {
                            setOpenDeleteModal(true);
                        }}
                        sx={{
                            color: theme.palette.error.main,
                            borderColor: theme.palette.error.main,
                            ':hover': {
                                borderColor: theme.palette.error.main
                            },
                            width: '45%',
                            marginTop: '20px'
                        }}>
                        {t('deleteButtonTitle')}
                    </Button>
                </Stack>
            </Box>
            {renderDeleteModal()}
            {renderDeleteSuccess()}
            <ModalContainer
                isModalOpen={sendReportMail}
                onClose={(): void => setSendReportMail(false)}
                content={sendReportMailContent()}
            />
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('yourRequestBeenAccounted')}
                subtitle={t('youWillBeRedirectedToProjectsCreated')}
            />
            <ModalContainer
                isModalOpen={exportReportOptionModal}
                onClose={(): void => {
                    setExportReportOptionModal(false);
                    setValue('');
                }}
                content={exportReportContentOption()}
                height="auto"
            />
            {!isLargeLandscape && (
                <>
                    <Slide direction="up" in={openReportFormMobile}>
                        <Dialog
                            open={openReportFormMobile}
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
                            {renderModifyReport()}
                        </Dialog>
                    </Slide>
                </>
            )}
        </Box>
    );
}
