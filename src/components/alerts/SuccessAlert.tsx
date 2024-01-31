import React, { useEffect, useState } from 'react';
import { Box, Modal, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { NEUTRAL } from '../../theme/palette';
import successIcon from '../../assets/successIcon.svg';

interface SuccessAlertProps {
    title?: string;
    subtitle?: string;
    children?: React.ReactElement;
    button?: string;
    buttonEnabled?: boolean;
    onClick?: () => void;
    onClose?: () => void;
    open: boolean;
}

export function SuccessAlert({
    title,
    subtitle,
    children,
    button,
    buttonEnabled = true,
    onClick = (): void => {},
    onClose = (): void => {},
    open
}: SuccessAlertProps): React.ReactElement {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const matches = useMediaQuery('(min-width:900px)');

    useEffect(() => {
        return (): void => {
            setLoading(false);
        };
    }, []);

    const AlertButtonsComponent = (): React.ReactElement => {
        return (
            <div style={{ width: '100%' }}>
                <LoadingButton
                    loading={loading}
                    color={'primary'}
                    variant={'contained'}
                    sx={{
                        marginTop: matches ? theme.spacing(5) : '40px',
                        display: button ? 'block' : 'none',
                        marginBottom: matches ? '0px' : '40px'
                    }}
                    disabled={!buttonEnabled}
                    fullWidth
                    onClick={async (): Promise<void> => {
                        setLoading(true);
                        await onClick();
                        setLoading(false);
                    }}>
                    {button}
                </LoadingButton>
            </div>
        );
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    background: 'white',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 'min(440px, calc(100% - 32px))',
                    maxHeight: '100vh',
                    transform: 'translate(-50%, -50%)',
                    overflowY: 'scroll',
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                <Stack
                    sx={{
                        height: '100%',
                        width: '100%',
                        padding: { xs: '16px', md: '40px' },
                        justifyContent: 'center',
                        alignItems: 'center',
                        whiteSpace: 'pre-line'
                    }}>
                    <Box
                        sx={{ marginTop: theme.spacing(2) }}
                        component={'img'}
                        src={successIcon}
                        alt={'success'}
                        height={'60px'}
                        width={'60px'}
                    />
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center">
                        {title ? (
                            <Typography
                                variant={matches ? 'h4' : 'h5'}
                                sx={{
                                    width: matches ? '100%' : '90%',
                                    color: NEUTRAL.darker,
                                    marginBottom: theme.spacing(1),
                                    textAlign: 'center',
                                    marginTop: matches ? theme.spacing(5) : theme.spacing(2)
                                }}>
                                {title}
                            </Typography>
                        ) : null}
                        {subtitle ? (
                            <Typography
                                variant="body1"
                                sx={{
                                    marginBottom: button ? '0px' : theme.spacing(3),
                                    width: matches ? '100%' : '90%',
                                    color: NEUTRAL.medium,
                                    textAlign: 'center'
                                }}>
                                {subtitle}
                            </Typography>
                        ) : null}
                        {children}
                        <AlertButtonsComponent />
                    </Box>
                </Stack>
            </Box>
        </Modal>
    );
}
