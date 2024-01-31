import { Box, Button, Modal, Typography, useTheme } from '@mui/material';
import React from 'react';
import { NEUTRAL } from '../../../theme/palette';
import cross from '../../../assets/cross.svg';

interface AlertProps {
    title?: string;
    children?: React.ReactElement;
    primaryButtonType: 'text' | 'outlined' | 'contained' | 'undefined';
    primaryButton: string;
    secondaryButtonType?: 'text' | 'outlined' | 'contained' | 'undefined';
    secondaryButton?: string;
    onSecondaryButtonClick?: () => void;
    onprimaryButtonClick?: () => void;
    onClose?: () => void;
    open: boolean;
    width?: string;
    height?: string;
    onCrossClick?: () => void;
}

export function UserInfoAlert({
    title,
    children,
    primaryButton,
    secondaryButton,
    secondaryButtonType = 'outlined',
    primaryButtonType = 'outlined',
    onClose = (): void => {},
    onSecondaryButtonClick = (): void => {},
    onprimaryButtonClick = (): void => {
        onClose();
    },
    onCrossClick = (): void => {
        onClose();
    },
    open,
    width,
    height
}: AlertProps): React.ReactElement {
    const theme = useTheme();

    const AlertButtonsComponent = (): React.ReactElement => {
        return (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    sx={{
                        width: '48%',
                        marginTop: theme.spacing(3),
                        borderRadius: '4px',
                        borderColor:
                            primaryButtonType === 'contained'
                                ? null
                                : theme.palette.secondary.medium,
                        color:
                            primaryButtonType === 'contained'
                                ? theme.palette.primary.darker
                                : theme.palette.secondary.medium,
                        backgroundColor:
                            primaryButtonType === 'contained'
                                ? theme.palette.secondary.lighter
                                : null
                    }}
                    variant={primaryButtonType === 'contained' ? 'contained' : 'outlined'}
                    fullWidth
                    onClick={onprimaryButtonClick}>
                    {primaryButton}
                </Button>
                <Button
                    sx={{
                        width: '48%',
                        marginTop: theme.spacing(3),
                        borderRadius: '4px',
                        backgroundColor:
                            secondaryButtonType === 'contained'
                                ? theme.palette.secondary.lighter
                                : null
                    }}
                    variant={secondaryButtonType === 'contained' ? 'contained' : 'outlined'}
                    color="error"
                    fullWidth
                    onClick={onSecondaryButtonClick}>
                    {secondaryButton}
                </Button>
            </div>
        );
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    width,
                    height: height ?? 'auto',
                    background: 'white',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    paddingBottom: '40px',
                    whiteSpace: 'pre-line'
                }}>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="baseline">
                    <Box
                        mt={2}
                        sx={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'flex-end',
                            marginLeft: '22px',
                            ':hover': {
                                cursor: 'pointer'
                            }
                        }}>
                        <img
                            src={cross}
                            alt="cross"
                            style={{ objectFit: 'contain' }}
                            onClick={onCrossClick}
                        />
                    </Box>
                    {title ? (
                        <Typography
                            variant="h4"
                            sx={{
                                width: '100%',
                                color: NEUTRAL.darker,
                                marginBottom: theme.spacing(4),
                                textAlign: 'center',
                                marginTop: theme.spacing(1)
                            }}>
                            {title}
                        </Typography>
                    ) : null}
                    {children}
                    <AlertButtonsComponent />
                </Box>
            </Box>
        </Modal>
    );
}
