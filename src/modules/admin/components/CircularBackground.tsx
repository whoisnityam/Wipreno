import { Stack, Typography } from '@mui/material';
import React from 'react';
import { ACCENT_SUNSET } from '../../../theme/palette';

export const CircularBackground = (text: string | undefined): React.ReactElement => {
    const val = text === undefined ? '0' : text;
    return (
        <Stack
            color={ACCENT_SUNSET.darker}
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="70px"
            width="70px"
            bgcolor={ACCENT_SUNSET.lighter}
            borderRadius="50%">
            <Typography variant="h5">{val}</Typography>
        </Stack>
    );
};
