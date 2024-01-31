import { LoadingButton } from '@mui/lab';
import {
    Box,
    Button,
    InputLabel,
    Select,
    Stack,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import { TaskStatus } from '../../../../constants';
import { NEUTRAL } from '../../../../theme/palette';
import { small1 } from '../../../../theme/typography';
import { updatePlanningTaskStatus } from '../../services/TaskService';
import { StyledFormControl } from '../documents/StyledFormControl';
import { StyledMenuItem } from '../documents/StyledMenuItem';
import { PlanningTask } from '../../models/Task';

export interface ModifyStatus {
    id: string;
    title: string;
    status: string | undefined;
}

interface RenderTaskStatusModalProps {
    modifyTask: ModifyStatus | undefined;
    setTaskStatusModal: Function;
    setModifyTask: Function;
    onStatusUpdated: (task: PlanningTask) => void;
}

export const RenderTaskStatusModal = ({
    modifyTask,
    setTaskStatusModal,
    setModifyTask,
    onStatusUpdated
}: RenderTaskStatusModalProps): React.ReactElement => {
    if (modifyTask) {
        const theme = useTheme();
        const isLarge = useMediaQuery(theme.breakpoints.up('md'));
        const [buttonLoading, setButtonLoading] = useState(false);
        const [selectedStatus, setSelectedStatus] = useState(modifyTask.status ?? 'Non démarré');

        return (
            <Stack justifyContent={isLarge ? 'normal' : 'space-between'} minHeight="100%">
                <Stack>
                    <Typography
                        variant={isLarge ? 'h4' : 'h5'}
                        textAlign="center"
                        color={NEUTRAL.darker}>
                        {t('modifyTask')}
                    </Typography>
                    <Box height={isLarge ? '16px' : '16px'} />
                    <Typography
                        variant={isLarge ? 'body1' : 'body2'}
                        textAlign="center"
                        color={NEUTRAL.darker}>
                        {t('changeTaskStatus')}
                    </Typography>
                    <Box height={isLarge ? '32px' : '32px'} />
                    <Typography sx={isLarge ? {} : { small1 }} variant={isLarge ? 'h6' : undefined}>
                        {modifyTask.title}
                    </Typography>
                    <Box height={isLarge ? '16px' : '16px'} />
                    <StyledFormControl>
                        <InputLabel>{t('status')}</InputLabel>
                        <Select
                            required
                            value={selectedStatus}
                            onChange={(e): void => {
                                setSelectedStatus(e.target.value);
                            }}>
                            {TaskStatus.map((status) => (
                                <StyledMenuItem key={status} value={status}>
                                    <Typography variant="body2">{status}</Typography>
                                </StyledMenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                </Stack>
                {<Box minHeight={isLarge ? '48px' : '20px'} />}
                <Stack>
                    <LoadingButton
                        loading={buttonLoading}
                        variant="contained"
                        disabled={
                            modifyTask.status === selectedStatus ||
                            (selectedStatus === 'Non démarré' && !modifyTask.status)
                        }
                        onClick={(): void => {
                            setButtonLoading(true);
                            if (selectedStatus !== '') {
                                updatePlanningTaskStatus(modifyTask.id, selectedStatus)
                                    .then((task) => {
                                        setButtonLoading(false);
                                        onStatusUpdated(task);
                                        setTaskStatusModal(false);
                                        setModifyTask(undefined);
                                    })
                                    .catch(() => {
                                        setButtonLoading(false);
                                        setTaskStatusModal(false);
                                        setModifyTask(undefined);
                                    });
                            }
                        }}>
                        {t('modifyButtonTitle')}
                    </LoadingButton>
                    <Box height={isLarge ? '20px' : '12px'} />
                    <Button
                        variant="outlined"
                        onClick={(): void => {
                            setSelectedStatus('');
                            setTaskStatusModal(false);
                            setModifyTask(undefined);
                        }}>
                        {t('return')}
                    </Button>
                </Stack>
            </Stack>
        );
    } else {
        return <></>;
    }
};
