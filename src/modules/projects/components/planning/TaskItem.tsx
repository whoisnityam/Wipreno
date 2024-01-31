import React from 'react';
import { Box, Stack, Theme, Typography, useTheme } from '@mui/material';
import { PlanningTask } from '../../models/Task';
import { ACCENT_SUNSET, NEUTRAL } from '../../../../theme/palette';
import { body3, small1, small2 } from '../../../../theme/typography';
import { useTranslation } from 'react-i18next';

interface TaskItemProps {
    task: PlanningTask;
    setTaskStatusModal: Function;
    setModifyTask: Function;
}

export const statusColor = (task: string | undefined, theme: Theme): string => {
    if (task === 'En cours') {
        return theme.palette.secondary.lighter!;
    } else if (task === 'Terminé') {
        return theme.palette.success.light;
    } else {
        return ACCENT_SUNSET.lighter;
    }
};
export const statusTextColor = (task: string | undefined, theme: Theme): string => {
    if (task === 'En cours') {
        return theme.palette.secondary.darker!;
    } else if (task === 'Terminé') {
        return theme.palette.success.dark;
    } else {
        return ACCENT_SUNSET.darker;
    }
};
export function TaskItem({
    task,
    setTaskStatusModal,
    setModifyTask
}: TaskItemProps): React.ReactElement {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <Stack
            width={'100%'}
            spacing={'4px'}
            sx={{ border: `1px solid ${NEUTRAL.light}`, borderRadius: '4px', padding: '12px' }}>
            <Stack justifyContent={'space-between'} marginBottom={'4px'} spacing={'2px'}>
                <Typography sx={{ ...small1 }} color={NEUTRAL.darker}>
                    {task.title}
                </Typography>
                {task.start_date ? (
                    <Typography sx={{ ...body3 }} color={NEUTRAL.medium}>
                        {new Date(task.start_date).toLocaleDateString()} -
                        {new Date(task.end_date!).toLocaleDateString()}
                    </Typography>
                ) : (
                    <></>
                )}
                <Box
                    sx={{
                        marginTop: '20px !important',
                        padding: '4px 8px',
                        background: statusColor(task.status, theme),
                        width: 'fit-content'
                    }}>
                    <div
                        onClick={(): void => {
                            setTaskStatusModal(true);
                            setModifyTask(task);
                        }}>
                        <Typography sx={small2} color={statusTextColor(task.status, theme)}>
                            {task.status ?? t('taskNotStarted')}
                        </Typography>
                    </div>
                </Box>
            </Stack>
        </Stack>
    );
}
