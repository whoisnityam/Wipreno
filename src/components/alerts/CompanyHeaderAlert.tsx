import {
    Box,
    Button,
    IconButton,
    Modal,
    Stack,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React from 'react';
import { NEUTRAL } from '../../theme/palette';
import { X } from 'react-feather';

interface AlertProps {
    title?: string;
    children?: React.ReactElement;
    secondaryButtonType: 'text' | 'outlined' | 'contained' | 'undefined';
    secondaryButton: string;
    onSecondaryButtonClick?: () => void;
    onClose?: () => void;
    open: boolean;
    width?: string;
    height?: string;
    onCrossClick?: () => void;
}

export function CompanyHeaderAlert({
    title,
    children,
    secondaryButton,
    secondaryButtonType = 'outlined',
    onClose = (): void => {},
    onSecondaryButtonClick = (): void => {
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
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    const AlertButtonsComponent = (): React.ReactElement => {
        return (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Button
                    sx={{
                        width: '50%',
                        marginTop: theme.spacing(3),
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
                    paddingLeft: isLargeLandscape ? '40px' : '20px',
                    paddingRight: isLargeLandscape ? '40px' : '20px',
                    paddingBottom: isLargeLandscape ? '40px' : '20px',
                    whiteSpace: 'pre-line'
                }}>
                <Box display="flex" flexDirection="column">
                    <Stack alignItems={'flex-end'}>
                        <IconButton
                            onClick={(): void => {
                                onCrossClick();
                            }}>
                            <X
                                style={{
                                    objectFit: 'contain',
                                    marginTop: isLargeLandscape ? '12px' : '8px'
                                }}
                            />
                        </IconButton>
                    </Stack>
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
