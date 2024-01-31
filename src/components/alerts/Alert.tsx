import { LoadingButton } from '@mui/lab';
import { Box, Button, IconButton, Modal, Stack, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { X } from 'react-feather';
import { NEUTRAL } from '../../theme/palette';

interface AlertProps {
    title?: string;
    subtitle?: string;
    children?: React.ReactElement;
    primaryButton?: string;
    additionalButton?: string;
    primaryButtonType?:
        | 'inherit'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'error'
        | 'info'
        | 'warning';
    secondaryButtonType?: 'text' | 'outlined' | 'contained' | undefined;
    additionalButtonType?: 'secondary' | 'error' | undefined;
    primaryButtonEnabled?: boolean;
    additionalButtonEnabled?: boolean;
    secondaryButton?: string;
    onClick?: () => void | Promise<void>;
    onSecondaryButtonClick?: () => void;
    onAdditionalButtonClick?: () => void;
    onClose?: () => void;
    open: boolean;
    width?: string;
    height?: string;
    showCloseIcon?: boolean;
}

export function Alert({
    title,
    subtitle,
    children,
    secondaryButton,
    primaryButton,
    primaryButtonType = 'primary',
    additionalButton,
    secondaryButtonType = 'outlined',
    primaryButtonEnabled = true,
    additionalButtonEnabled = true,
    additionalButtonType = 'secondary',
    onClose = (): void => {},
    onClick = (): void => {},
    onSecondaryButtonClick = (): void => {
        onClose();
    },
    onAdditionalButtonClick = (): void => {},
    open,
    width,
    height,
    showCloseIcon
}: AlertProps): React.ReactElement {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [additionalButtonLoading, setAdditionalButtonLoading] = useState(false);

    useEffect(() => {
        return (): void => {
            setLoading(false);
        };
    }, []);

    const AlertButtonsComponent = (): React.ReactElement => {
        return (
            <div style={{ width: '100%' }}>
                {additionalButton && primaryButton && (
                    <Stack direction="row" justifyContent={'space-between'}>
                        <Stack sx={{ width: '48%' }}>
                            <LoadingButton
                                loading={loading}
                                color={primaryButtonType}
                                variant={'contained'}
                                sx={{
                                    marginTop: theme.spacing(5),
                                    ...(primaryButtonType === 'error' && {
                                        background: theme.palette.error.main,
                                        boxShadow: 'none'
                                    })
                                }}
                                disabled={!primaryButtonEnabled}
                                fullWidth
                                onClick={async (): Promise<void> => {
                                    setLoading(true);
                                    await onClick();
                                    setLoading(false);
                                }}>
                                {primaryButton}
                            </LoadingButton>
                        </Stack>
                        <Stack sx={{ width: '48%' }}>
                            <LoadingButton
                                color={additionalButtonType}
                                loading={additionalButtonLoading}
                                variant={'contained'}
                                sx={{
                                    marginTop: theme.spacing(5)
                                }}
                                disabled={!additionalButtonEnabled}
                                fullWidth
                                onClick={async (): Promise<void> => {
                                    setAdditionalButtonLoading(true);
                                    await onAdditionalButtonClick();
                                    setAdditionalButtonLoading(false);
                                }}>
                                {additionalButton}
                            </LoadingButton>
                        </Stack>
                    </Stack>
                )}
                {primaryButton && !additionalButton && (
                    <LoadingButton
                        loading={loading}
                        color={primaryButtonType}
                        variant={'contained'}
                        sx={{
                            marginTop: theme.spacing(5),
                            ...(primaryButtonType === 'error' && {
                                background: theme.palette.error.main,
                                boxShadow: 'none'
                            })
                        }}
                        disabled={!primaryButtonEnabled}
                        fullWidth
                        onClick={async (): Promise<void> => {
                            setLoading(true);
                            await onClick();
                            setLoading(false);
                        }}>
                        {primaryButton}
                    </LoadingButton>
                )}

                {secondaryButton ? (
                    <Button
                        sx={{
                            marginTop: theme.spacing(2),
                            borderRadius: '4px',
                            borderColor:
                                secondaryButtonType === 'contained'
                                    ? null
                                    : theme.palette.secondary.medium,
                            color:
                                secondaryButtonType === 'contained'
                                    ? theme.palette.primary.darker
                                    : theme.palette.secondary.medium,
                            backgroundColor:
                                secondaryButtonType === 'contained'
                                    ? theme.palette.secondary.lighter
                                    : null
                        }}
                        variant={secondaryButtonType === 'contained' ? 'contained' : 'outlined'}
                        fullWidth
                        onClick={onSecondaryButtonClick}>
                        {secondaryButton}
                    </Button>
                ) : (
                    <></>
                )}
            </div>
        );
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    width,
                    [theme.breakpoints.down('sm')]: {
                        width: 'calc(100% - 32px)'
                    },
                    overflow: 'auto',
                    maxHeight: '90vh',
                    height: height ?? 'auto',
                    background: 'white',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    paddingX: { xs: '16px', md: '40px' },
                    paddingBottom: '40px',
                    whiteSpace: 'pre-line'
                }}>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="baseline">
                    <Stack direction="row" width="100%">
                        {title ? (
                            <Typography
                                variant="h4"
                                sx={{
                                    width: '100%',
                                    color: NEUTRAL.darker,
                                    marginBottom: theme.spacing(3),
                                    textAlign: 'center',
                                    marginTop: theme.spacing(5)
                                }}>
                                {title}
                            </Typography>
                        ) : null}
                        {showCloseIcon ? (
                            <IconButton
                                aria-label="close"
                                onClick={onClose}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    color: theme.palette.primary.medium
                                }}>
                                <X />
                            </IconButton>
                        ) : null}
                    </Stack>
                    {subtitle ? (
                        <Typography
                            variant="body1"
                            sx={{
                                marginBottom: theme.spacing(3),
                                width: '100%',
                                textAlign: 'center',
                                color: NEUTRAL.medium
                            }}>
                            {subtitle}
                        </Typography>
                    ) : null}
                    {children}
                    <AlertButtonsComponent />
                </Box>
            </Box>
        </Modal>
    );
}
