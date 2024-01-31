import { Box, Button, Stack, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { Folder } from 'react-feather';
import { NEUTRAL } from '../../../../theme/palette';

interface DocumentFolderProps {
    title: string;
    documentOnClick: Function;
    iconImage?: React.ReactElement;
    iconOnClick?: Function;
    fullWidth?: boolean;
}

export const TinyButton = styled(Button)(() => ({
    padding: '0',
    minWidth: '0',
    height: 'fit-content'
}));

const BlueBorder = styled(Stack)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.lighter,
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '48px',
    minWidth: '48px'
}));

export function DocumentFolderComponent({
    title,
    documentOnClick,
    iconImage,
    iconOnClick,
    fullWidth = false
}: DocumentFolderProps): React.ReactElement {
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    const Container = styled(Stack)(() => ({
        alignItems: 'center',
        border: `1px solid ${NEUTRAL.light}`,
        borderRadius: '4px',
        padding: '16px',
        minWidth: isLarge ? '265px' : '100%',
        maxWidth: isLarge ? '265px' : '100%',
        justifyContent: 'space-between'
    }));

    return (
        <>
            <Container direction="row">
                <Stack sx={{ cursor: 'pointer' }} width={fullWidth ? '100%' : 'calc(100% - 40px)'}>
                    <div onClick={(): void => documentOnClick()}>
                        <Stack direction="row" alignItems="center">
                            <BlueBorder>
                                <Folder />
                            </BlueBorder>
                            <Box width="12px" />
                            <Typography
                                maxWidth={fullWidth ? undefined : '66%'}
                                textOverflow={fullWidth ? undefined : 'ellipsis'}
                                overflow={fullWidth ? undefined : 'hidden'}
                                whiteSpace={fullWidth ? undefined : 'nowrap'}
                                variant="body2">
                                {title}
                            </Typography>
                        </Stack>
                    </div>
                </Stack>
                {iconImage && iconOnClick && (
                    <TinyButton
                        sx={{ minWidth: '24px', minHeight: '24px' }}
                        onClick={(): void => {
                            iconOnClick();
                        }}>
                        {iconImage}
                    </TinyButton>
                )}
            </Container>
        </>
    );
}
