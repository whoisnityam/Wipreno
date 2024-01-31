import { Box, Stack, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { File } from 'react-feather';
import { ACCENT_SUNSET, NEUTRAL } from '../../../../theme/palette';
import { body3 } from '../../../../theme/typography';

interface DocumentFileProps {
    title: string;
    addedBy: string;
}

const BlueBorder = styled(Stack)(() => ({
    backgroundColor: ACCENT_SUNSET.lighter,
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '56px',
    minWidth: '56px'
}));

export function DocumentFileComponent({ title, addedBy }: DocumentFileProps): React.ReactElement {
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    const Container = styled(Stack)(() => ({
        alignItems: 'center',
        minWidth: isLarge ? '336px' : 'calc(100vw - 56px)',
        maxWidth: isLarge ? '336px' : 'calc(100vw - 56px)'
    }));

    return (
        <Container direction="row">
            <BlueBorder>
                <File color={ACCENT_SUNSET.darker} />
            </BlueBorder>
            <Box width="12px" />
            <Stack justifyContent="center" maxWidth="calc(100% - 68px)">
                <Typography
                    variant="subtitle2"
                    maxWidth="100%"
                    color={NEUTRAL.darker}
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap">
                    {title}
                </Typography>
                <Box height="4px" />
                <Typography
                    sx={body3}
                    maxWidth="100%"
                    color={NEUTRAL.darker}
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap">
                    {addedBy}
                </Typography>
            </Stack>
        </Container>
    );
}
