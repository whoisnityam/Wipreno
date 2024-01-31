import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import {
    Box,
    Button,
    Dialog,
    Slide,
    Stack,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { ReportList } from '../components/report/ReportList';
import { Download, Plus } from 'react-feather';
import { ProjectContext } from '../layout/ProjectDetailLayout';
import { Report } from '../models/Report';
import { ModalContainer } from '../../../components/ModalContainer';
import { CreateReportForm } from '../components/report/CreateReportForm';

export function ProjectReport(): React.ReactElement {
    const reportData = useContext(ProjectContext)?.report;
    const { t } = useTranslation();
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const projectContext = useContext(ProjectContext);
    const [reportList, setReportList] = useState<Report[]>([]);
    const [openReportForm, setOpenReportForm] = useState<boolean>(false);
    const [openReportFormMobile, setOpenReportFormMobile] = useState<boolean>(false);

    const handleClose = (): void => {
        setOpenReportFormMobile(false);
    };

    const fetchReports = async (): Promise<void> => {
        if (reportData && reportData.length > 0) {
            setReportList([...reportData]);
        }
    };

    useEffect(() => {
        if (reportData && reportData.length > 0) {
            fetchReports();
        }
    }, [reportData]);

    const renderReportForm = (): React.ReactElement => {
        return (
            <CreateReportForm
                handleCloseForm={(): void => setOpenReportForm(false)}
                handleOpenSuccess={(): void => {
                    projectContext?.refreshData();
                }}
                onClose={handleClose}
            />
        );
    };

    const DesktopComponent = (): React.ReactElement => {
        return (
            <>
                <Stack
                    width={'100%'}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ marginBottom: '33px', justifyContent: 'space-between' }}>
                    <Typography variant="h5" color={theme.palette.primary.medium}>
                        {t('reportsCreated')}
                    </Typography>
                    <Button
                        variant={'outlined'}
                        color={'secondary'}
                        sx={{
                            borderRadius: '4px',
                            justifyContent: 'space-between'
                        }}
                        startIcon={<Plus />}
                        onClick={(): void => setOpenReportForm(true)}>
                        {t('reportEmptyStateButtonTitle')}
                    </Button>
                </Stack>
            </>
        );
    };

    const MobileComponent = (): React.ReactElement => {
        return (
            <>
                <Stack
                    width={'100%'}
                    direction={'column'}
                    justifyContent="space-between"
                    sx={{ marginBottom: '33px', justifyContent: 'space-between' }}>
                    <Stack
                        width="100%"
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={3}
                        sx={{ marginTop: '12px' }}>
                        <Typography variant={'h6'} color={theme.palette.primary.medium}>
                            {t('reportsCreated')}
                        </Typography>
                        {!isLargeLandscape && (
                            <Button
                                sx={{
                                    padding: '0',
                                    minWidth: '0',
                                    height: 'fit-content'
                                }}
                                onClick={(): void => {}}
                                startIcon={<Download />}></Button>
                        )}
                    </Stack>
                    <Stack>
                        <Button
                            variant={'outlined'}
                            color={'secondary'}
                            fullWidth
                            sx={{
                                borderRadius: '4px',
                                width: '100%'
                            }}
                            startIcon={<Plus style={{ marginRight: '15px' }} />}
                            onClick={(): void => setOpenReportFormMobile(true)}>
                            {t('reportEmptyStateButtonTitle')}
                        </Button>
                    </Stack>
                </Stack>
            </>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (reportList.length === 0) {
            return (
                <>
                    <EmptyState
                        title={''}
                        subtitle={t('reportEmptyStateTitle')}
                        description={t('reportEmptyStateDescription')}
                        buttonTitle={t('reportEmptyStateButtonTitle')}
                        buttonType={'contained'}
                        buttonOnClick={(): void => setOpenReportForm(true)}
                    />
                    <ModalContainer
                        height="auto"
                        isModalOpen={openReportForm}
                        content={renderReportForm()}
                        onClose={(): void => setOpenReportForm(false)}
                    />
                </>
            );
        } else {
            return (
                <Box width="100%">
                    {isLargeLandscape ? DesktopComponent() : MobileComponent()}
                    <ReportList />
                    <ModalContainer
                        height="auto"
                        isModalOpen={openReportForm}
                        content={renderReportForm()}
                        onClose={(): void => setOpenReportForm(false)}
                    />
                </Box>
            );
        }
    };

    return (
        <Box width={'100%'} justifyContent="space-between">
            <RenderComponents />
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
                            {renderReportForm()}
                        </Dialog>
                    </Slide>
                </>
            )}
        </Box>
    );
}
