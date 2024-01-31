import { LoadingButton } from '@mui/lab';
import {
    Box,
    Button,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../../../components/alerts/Alert';
import { NEUTRAL } from '../../../../theme/palette';
import { Project } from '../../models/Project';
import { exportPlanning, sendPlanningViaEmail } from '../../services/ExportService';
import { getLotsByProjectId } from '../../services/ReportService';

export function PlanningButtons({
    noticeId,
    enterpriseName,
    project
}: {
    noticeId: string;
    enterpriseName: string;
    project: Project;
}): React.ReactElement {
    const theme = useTheme();
    const [showCompanyName, setShowCompanyName] = useState<string>('');
    const [showTasks, setShowTasks] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [whomToSend, setWhomToSend] = useState<string>('');
    const [isChanged, setIsChanged] = useState(false);
    const [checkReview, setCheckReview] = useState(false);
    const [artisanEmails, setArtisanEmail] = useState<string[]>([]);

    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const isShareEmpty = showTasks === '' || showCompanyName === '' || whomToSend === '';
        const isReviewEmpty = showTasks === '' || showCompanyName === '';
        setIsChanged(!isShareEmpty);
        setCheckReview(!isReviewEmpty);
    }, [showTasks, showCompanyName, whomToSend]);

    async function fetchLotData(): Promise<void> {
        const emails: string[] = [];
        const data = await getLotsByProjectId(project.id);
        data.map((lot) => {
            if (lot.artisan_id) {
                emails.push(lot.artisan_id.email);
            }
        });
        setArtisanEmail(emails);
    }

    useEffect(() => {
        fetchLotData();
    }, []);

    function reset(): void {
        setIsChanged(false);
        setShowTasks('');
        setShowCompanyName('');
        setWhomToSend('');
        setOpen(false);
    }

    function ExportModel(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="742px"
                title={t('shareSchedule')}
                subtitle={t('sharePlanningDescription')}
                primaryButton={t('send')}
                secondaryButton={t('return')}
                additionalButton={t('review')}
                primaryButtonEnabled={isChanged}
                additionalButtonEnabled={checkReview}
                open={open}
                onClick={async (): Promise<void> => {
                    let companyName: boolean;
                    let task: boolean;
                    let requiredEmails: string[] = [];
                    if (showTasks === 'withLotsAndTasks') {
                        task = true;
                    } else if (showTasks === 'onlyLots') {
                        task = false;
                    }

                    if (showCompanyName === 'withCompanyName') {
                        companyName = true;
                    } else if (showCompanyName === 'withoutCompanyName') {
                        companyName = false;
                    }

                    if (whomToSend === 'allClients') {
                        requiredEmails.push(project.client_id?.email!);
                    } else if (whomToSend === 'allArtisans') {
                        requiredEmails = artisanEmails;
                    } else if (whomToSend === 'both') {
                        requiredEmails = artisanEmails;
                        requiredEmails.push(project.client_id?.email!);
                    }

                    await sendPlanningViaEmail(
                        noticeId,
                        companyName!,
                        task!,
                        enterpriseName,
                        project.name,
                        requiredEmails
                    );
                    reset();
                }}
                onClose={(): void => {
                    reset();
                }}
                onSecondaryButtonClick={(): void => {
                    reset();
                }}
                onAdditionalButtonClick={async (): Promise<void> => {
                    let companyName: boolean;
                    let task: boolean;
                    if (showTasks === 'withLotsAndTasks') {
                        task = true;
                    } else if (showTasks === 'onlyLots') {
                        task = false;
                    }

                    if (showCompanyName === 'withCompanyName') {
                        companyName = true;
                    } else if (showCompanyName === 'withoutCompanyName') {
                        companyName = false;
                    }

                    await exportPlanning(noticeId, companyName!, task!);
                }}>
                <Stack>
                    <Stack pb={2}>
                        <Typography variant="h5">{t('header')}</Typography>
                        <RadioGroup
                            value={showCompanyName}
                            onChange={(event): void => {
                                setShowCompanyName((event.target as HTMLInputElement).value);
                            }}>
                            <FormControlLabel
                                sx={{ color: NEUTRAL.medium }}
                                value="withCompanyName"
                                control={
                                    <Radio
                                        sx={{
                                            '& .MuiSvgIcon-root + .MuiSvgIcon-root': {
                                                color: theme.palette.primary.lighter
                                            }
                                        }}
                                    />
                                }
                                label={t('withCompanyName')}
                            />
                            <FormControlLabel
                                sx={{ color: NEUTRAL.medium }}
                                value="withoutCompanyName"
                                control={
                                    <Radio
                                        sx={{
                                            '& .MuiSvgIcon-root + .MuiSvgIcon-root': {
                                                color: theme.palette.primary.lighter
                                            }
                                        }}
                                    />
                                }
                                label={t('withoutCompanyName')}
                            />
                        </RadioGroup>
                    </Stack>
                    <Stack pb={2}>
                        <Typography variant="h5">{t('planningDetails')}</Typography>
                        <RadioGroup
                            value={showTasks}
                            onChange={(event): void => {
                                setShowTasks((event.target as HTMLInputElement).value);
                            }}>
                            <FormControlLabel
                                sx={{ color: NEUTRAL.medium }}
                                value="onlyLots"
                                control={
                                    <Radio
                                        sx={{
                                            '& .MuiSvgIcon-root + .MuiSvgIcon-root': {
                                                color: theme.palette.primary.lighter
                                            }
                                        }}
                                    />
                                }
                                label={t('onlyLots')}
                            />
                            <FormControlLabel
                                sx={{ color: NEUTRAL.medium }}
                                value="withLotsAndTasks"
                                control={
                                    <Radio
                                        sx={{
                                            '& .MuiSvgIcon-root + .MuiSvgIcon-root': {
                                                color: theme.palette.primary.lighter
                                            }
                                        }}
                                    />
                                }
                                label={t('withLotsAndTasks')}
                            />
                        </RadioGroup>
                    </Stack>
                    <Stack>
                        <Typography variant="h5">{t('whomToSend')}</Typography>
                        <RadioGroup
                            value={whomToSend}
                            onChange={(event): void => {
                                setWhomToSend((event.target as HTMLInputElement).value);
                            }}>
                            <FormControlLabel
                                disabled={artisanEmails && artisanEmails.length > 0 ? false : true}
                                sx={{ color: NEUTRAL.medium }}
                                value="allArtisans"
                                control={
                                    <Radio
                                        sx={{
                                            '& .MuiSvgIcon-root + .MuiSvgIcon-root': {
                                                color: theme.palette.primary.lighter
                                            }
                                        }}
                                    />
                                }
                                label={t('allArtisans')}
                            />
                            <FormControlLabel
                                sx={{ color: NEUTRAL.medium }}
                                value="allClients"
                                control={
                                    <Radio
                                        sx={{
                                            '& .MuiSvgIcon-root + .MuiSvgIcon-root': {
                                                color: theme.palette.primary.lighter
                                            }
                                        }}
                                    />
                                }
                                label={t('allClients')}
                            />
                            <FormControlLabel
                                disabled={artisanEmails && artisanEmails.length > 0 ? false : true}
                                sx={{ color: NEUTRAL.medium }}
                                value="both"
                                control={
                                    <Radio
                                        sx={{
                                            '& .MuiSvgIcon-root + .MuiSvgIcon-root': {
                                                color: theme.palette.primary.lighter
                                            }
                                        }}
                                    />
                                }
                                label={t('both')}
                            />
                        </RadioGroup>
                    </Stack>
                </Stack>
            </Alert>
        );
    }

    return (
        <Stack direction="row">
            {ExportModel()}
            <Button
                variant="contained"
                onClick={(): void => {
                    setOpen(true);
                }}>
                {t('shareSchedule')}
            </Button>
            <Box width="20px" />
            <LoadingButton
                loading={loading}
                variant="contained"
                color="secondary"
                onClick={async (): Promise<void> => {
                    setLoading(true);
                    await exportPlanning(noticeId);
                    setLoading(false);
                }}>
                {t('exportButton')}
            </LoadingButton>
        </Stack>
    );
}
