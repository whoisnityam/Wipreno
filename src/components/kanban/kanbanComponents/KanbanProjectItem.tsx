import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { stringAvatar } from '../../../utils';
import { ACCENT_SUNSET, NEUTRAL, PINK } from '../../../theme/palette';

interface KanbanProjectItemProps {
    name: string;
    status: string;
    assignee: string;
}

export function KanbanProjectItem({
    name,
    status,
    assignee
}: KanbanProjectItemProps): React.ReactElement {
    return (
        <Stack>
            <Box sx={{ height: '2px', width: '20px', bgcolor: ACCENT_SUNSET.medium }} />
            <Box height="16px" />
            <Typography
                color={NEUTRAL.dark}
                variant="h6"
                fontWeight="fontWeightBold"
                sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                {name}
            </Typography>
            <Box height="10px" />
            <Typography
                variant="subtitle2"
                fontWeight="fontWeightSemiBold"
                color={PINK.darker}
                sx={{
                    width: 'fit-content',
                    padding: '4px 8px',
                    backgroundColor: PINK.lighter,
                    textAlign: 'left'
                }}>
                {status}
            </Typography>
            <Box height="16px" />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}>
                <Typography variant="body2" color={NEUTRAL.medium} fontWeight="fontWeightRegular">
                    {assignee}
                </Typography>
                <Box width="8px" />
                <Box
                    sx={{
                        width: '35px',
                        height: '35px',
                        backgroundColor: ACCENT_SUNSET.lighter,
                        borderRadius: '50%',
                        display: 'flex',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    {/* Below line matches the initials of the asignee name. Example, Test Name will be TN.  */}
                    <Typography
                        variant="subtitle2"
                        fontWeight="fontWeightBold"
                        color={ACCENT_SUNSET.darker}>
                        {stringAvatar(assignee.split(' ')[0], assignee.split(' ')[1])}
                    </Typography>
                </Box>
            </Box>
        </Stack>
    );
}
