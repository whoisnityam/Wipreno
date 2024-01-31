import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Avatar,
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup,
    Stack,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import GoldenEdit from '../../../../assets/GoldenEdit.svg';
import { body3, button2, small2 } from '../../../../theme/typography';
import { Eye, X, ChevronDown, ChevronUp } from 'react-feather';
import { ACCENT_SUNSET, NEUTRAL } from '../../../../theme/palette';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { Report, ReportItem } from '../../models/Report';
import { ModalContainer } from '../../../../components/ModalContainer';
import { getFileURL, stringAvatar } from '../../../../utils';
import { SystemStyleObject, Theme } from '@mui/system';
import { deleteReport, sendReport } from '../../services/ReportService';
import { LotViewDataForReport } from '../../models/Lot';
import { Alert } from '../../../../components/alerts/Alert';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { CreateReportForm } from './CreateReportForm';
import { PdfComponent } from './PdfComponent';
import { UserContext } from '../../../../provider/UserProvider';
import { getLots } from '../../services/LotService';
import { useNavigate } from 'react-router-dom';

export function ReportList(): React.ReactElement {
    const projectContext = useContext(ProjectContext);
    const user = useContext(UserContext);
    const reportData = projectContext?.report;
    const project = projectContext?.project;
    const notice = projectContext?.project?.notices?.at(0);
    const { t } = useTranslation();
    const theme = useTheme();
    const [reportList, setReportList] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report>();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openModifyModal, setOpenModifyModal] = useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
    const [openDeleteSuccess, setOpenDeleteSuccess] = useState<boolean>(false);
    const [lotList, setLotList] = useState<LotViewDataForReport[]>([]);
    const [currentLot, setCurrentLot] = useState<LotViewDataForReport>();
    const [currentComment, setCurrentComment] = useState<ReportItem>();
    const [exportReportModal, setExportReportModal] = useState<boolean>(false);
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [sendReportMail, setSendReportMail] = useState<boolean>(false);
    const [projectClient, setProjectClient] = useState<string>('');
    const [projectArtisans, setProjectArtisans] = useState<string[]>([]);
    const [mailTo, setMailTo] = useState<string>('');
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const navigate = useNavigate();

    const [exportReportOptionModal, setExportReportOptionModal] = useState<boolean>(false);
    const [value, setValue] = React.useState('');

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

    const formatDate = (startDate: Date): string => {
        const date = new Date(startDate);
        const formatedDate = date.toLocaleDateString();
        return formatedDate;
    };

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setValue((event.target as HTMLInputElement).value);
    };

    const handleSendMailTo = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setMailTo((event.target as HTMLInputElement).value);
    };

    const fetchReports = async (): Promise<void> => {
        if (reportData && reportData.length > 0) {
            setReportList([...reportData]);
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
        if (reportData && reportData.length > 0) {
            fetchReports();
        }
    }, [reportData]);

    useEffect(() => {
        if (project) {
            setProjectClient(project.client_id?.email ?? '');
            fetchArtisans();
        }
    }, [project]);

    const openSuccessModal = (): void => {
        setOpenModal(false);
        setSendReportMail(false);
        if (!openModifyModal) {
            setSuccessModalOpen(true);
            setTimeout(async () => {
                setSuccessModalOpen(false);
                projectContext?.refreshData(true);
            }, 3000);
        } else {
            projectContext?.refreshData();
        }
    };

    const handleDelete = async (): Promise<void> => {
        if (selectedReport) {
            const res = await deleteReport(selectedReport?.id);
            if (res) {
                setOpenModal(false);
                setOpenDeleteModal(false);
                setOpenDeleteSuccess(true);
                setTimeout(() => {
                    setOpenDeleteSuccess(false);
                    projectContext?.refreshData();
                }, 3000);
            }
        }
    };

    const renderCards = (): React.ReactElement => {
        return (
            <Box pb={4}>
                <Grid
                    container
                    rowSpacing={2}
                    columnSpacing={{ xs: 1, sm: 3, md: 5 }}
                    sx={{ width: isLargeLandscape ? '70%' : '100%' }}>
                    {reportList?.map((item, index) => (
                        <Grid key={index} item xs={12} md={isLargeLandscape ? 4 : 12}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                onClick={(): void => {
                                    if (isLargeLandscape) {
                                        setSelectedReport(item);
                                        setOpenModal(true);
                                    } else {
                                        navigate(`/project/report/details/${item.id}`);
                                    }
                                }}
                                sx={{
                                    cursor: 'pointer',
                                    maxWidth: isLargeLandscape ? '100%' : '320px'
                                }}>
                                <img
                                    src={GoldenEdit}
                                    alt="GoldenEditIcon"
                                    style={{ height: '56px', width: '56px' }}
                                />
                                <Box sx={{ width: '100%' }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ color: NEUTRAL.darker, padding: '0% 2%' }}>
                                        {t('minutesOfThe')} {formatDate(item.created_at)}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            ...body3,
                                            color: NEUTRAL.darker,
                                            padding: '0% 2%'
                                        }}>
                                        {t('createdBy')}{' '}
                                        {`${item.created_by.first_name} ${item.created_by.last_name}`}
                                    </Typography>
                                </Box>
                                <Eye
                                    style={{
                                        float: 'right',
                                        color: NEUTRAL.darker,
                                        height: '24px',
                                        width: '24px'
                                    }}
                                />
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
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

    const reportDetails = (): React.ReactElement => {
        return (
            <Box>
                <Stack direction="row" justifyContent="flex-end">
                    <X onClick={(): void => setOpenModal(false)} style={{ cursor: 'pointer' }} />
                </Stack>
                <Typography
                    variant="h4"
                    color={NEUTRAL.darker}
                    sx={{ textAlign: 'center', marginBottom: '40px' }}>
                    {t('reportDetails')}
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                    <Box sx={{ width: '50%' }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
                            {t('minutesOfThe')}
                        </Typography>
                        <Typography variant="body2" color={NEUTRAL.medium}>
                            {selectedReport ? formatDate(selectedReport.created_at) : ''}
                        </Typography>
                    </Box>
                    <Box sx={{ width: '50%' }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
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
                                        <Typography variant="h6">{lot.title}</Typography>
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
                                                    <Typography
                                                        sx={{ ...small2 }}
                                                        color={NEUTRAL.dark}>
                                                        {t('remark')}
                                                    </Typography>
                                                    {currentComment &&
                                                    currentComment.id === item.id ? (
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
                        sx={(): SystemStyleObject<Theme> => ({
                            ...button2,
                            fontWeight: 'bold',
                            margin: '1% 0%',
                            textTransform: 'none'
                        })}>
                        {t('sendReport')}
                    </Typography>
                </Button>
                <Button
                    fullWidth
                    variant={'contained'}
                    color={'secondary'}
                    onClick={(): void => {
                        setExportReportOptionModal(true);
                        setOpenModal(false);
                    }}>
                    {t('exportButton')}
                </Button>
                <Stack direction="row" justifyContent="space-between">
                    <Button
                        variant={'outlined'}
                        color={'secondary'}
                        sx={{ width: '45%', marginTop: '20px' }}
                        onClick={(): void => {
                            setOpenModal(false);
                            setOpenModifyModal(true);
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
                        sx={(): SystemStyleObject<Theme> => ({
                            ...button2,
                            fontWeight: 'bold',
                            margin: '1% 0%',
                            textTransform: 'none'
                        })}>
                        {t('send')}
                    </Typography>
                </Button>
                <Button fullWidth variant="outlined" onClick={(): void => setSendReportMail(false)}>
                    {t('cancelButtonTitle')}
                </Button>
            </Box>
        );
    };

    const renderDetails = (): React.ReactElement => {
        return (
            <ModalContainer
                content={reportDetails()}
                isModalOpen={openModal}
                onClose={(): void => setOpenModal(false)}
            />
        );
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

    const renderModifyReport = (): React.ReactElement => {
        return (
            <CreateReportForm
                handleOpenSuccess={(): void => {
                    openSuccessModal();
                }}
                handleCloseForm={(): void => {
                    setOpenModifyModal(false);
                    setOpenModal(true);
                }}
                reportData={selectedReport}
                isModify={true}
                lots={lotList}
            />
        );
    };

    const exportReportContent = (): React.ReactElement => {
        if (selectedReport) {
            return (
                <PdfComponent
                    reportDetails={selectedReport}
                    lots={lotList}
                    companyLogo={user.user?.enterprises.at(0)?.enterprise_id?.image?.id ?? ''}
                    userInfo={user.user!}
                    clientInfo={projectContext.project?.client_id ?? undefined}
                    project={project}
                    hasCompanyHeader={value === 'withCompanyName'}
                />
            );
        } else {
            return <></>;
        }
    };

    const exportReportContentOption = (): React.ReactElement => {
        return (
            <Box>
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
                        disabled={value === ''}
                        fullWidth
                        variant={'contained'}
                        color={'primary'}
                        onClick={(): void => {
                            setExportReportModal(true);
                            setExportReportOptionModal(false);
                            setOpenModal(false);
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
                        setOpenModal(true);
                    }}
                    sx={{ marginTop: '20px' }}>
                    {t('return')}
                </Button>
            </Box>
        );
    };

    return (
        <Box>
            {renderCards()}
            {!openDeleteModal && !sendReportMail ? renderDetails() : null}
            {renderDeleteModal()}
            {renderDeleteSuccess()}
            <ModalContainer
                height="auto"
                isModalOpen={openModifyModal}
                content={renderModifyReport()}
                onClose={(): void => {
                    setOpenModifyModal(false);
                    setOpenModal(true);
                }}
            />
            <ModalContainer
                isModalOpen={exportReportModal}
                onClose={(): void => setExportReportModal(false)}
                content={exportReportContent()}
                height={'90%'}
                width={'90%'}
            />
            <ModalContainer
                isModalOpen={sendReportMail}
                onClose={(): void => setSendReportMail(false)}
                content={sendReportMailContent()}
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
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('yourRequestBeenAccounted')}
                subtitle={t('youWillBeRedirectedToProjectsCreated')}
            />
        </Box>
    );
}
