import { Box, Typography } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import React from 'react';

interface EmptyStateProps {
    title: string;
    subtitle: string;
    description: string;
}

export function EmptyStateProject({
    title,
    subtitle,
    description
}: EmptyStateProps): React.ReactElement {
    return (
        <Box
            sx={{
                display: 'flex',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginRight: '80%',
                    paddingLeft: '45%',
                    width: '100%'
                }}>
                <Typography variant={'h2'} color="primary">
                    {title}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                <Typography variant={'h3'} color={NEUTRAL.light}>
                    {subtitle}
                </Typography>
                <Box height={'24px'} />
                <Typography variant={'body1'} color={NEUTRAL.medium}>
                    {description}
                </Typography>
            </Box>
            <Box />
        </Box>
    );
}
